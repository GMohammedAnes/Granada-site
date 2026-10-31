import { randomUUID } from "node:crypto";
import { desc, eq, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import {
  CreatePreorderBody,
  CreatePreorderResponse,
  GetCampaignStatusResponse,
  ListStaffPreordersResponse,
  TrackPreordersQueryParams,
  TrackPreordersResponse,
  UpdatePreorderStatusBody,
  UpdatePreorderStatusParams,
  UpdatePreorderStatusResponse,
} from "@workspace/api-zod";
import { sendGranadaOrderNotification } from "../lib/granada-order-notifications";
import {
  db,
  granadaCampaignTable,
  granadaPreordersTable,
  type GranadaCampaign,
  type GranadaPreorder,
} from "@workspace/db";
import { requireGranadaStaff } from "../middlewares/requireGranadaStaff";

const router: IRouter = Router();

const preorderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const trackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
});

const CAMPAIGN_ID = 1;
const CAMPAIGN_TOTAL_UNITS = 100;
const CAMPAIGN_INITIAL_RESERVED = 86;
const CAMPAIGN_DURATION_MS = 24 * 60 * 60 * 1000;
const ROYALE_PRICE_DZD = 2_000;
const BLANCHE_PRICE_DZD = 1_200;
const BUNDLE_DISCOUNT_RATE = 0.1;

function toStaffOrder(order: GranadaPreorder) {
  const isLegacy = order.royaleQuantity === 0 && order.blancheQuantity === 0;
  const royaleQuantity = isLegacy
    ? order.variant === "ivory" ? 0 : 1
    : order.royaleQuantity;
  const blancheQuantity = isLegacy
    ? order.variant === "ivory" ? 1 : 0
    : order.blancheQuantity;
  const subtotalDzd = isLegacy
    ? royaleQuantity * ROYALE_PRICE_DZD + blancheQuantity * BLANCHE_PRICE_DZD
    : order.subtotalDzd;
  const discountDzd = isLegacy ? 0 : order.discountDzd;
  const totalDzd = isLegacy ? subtotalDzd : order.totalDzd;
  const variant = royaleQuantity > 0 && blancheQuantity > 0
    ? "bundle"
    : royaleQuantity > 0
      ? "royal"
      : "ivory";

  return {
    ...order,
    variant,
    royaleQuantity,
    blancheQuantity,
    subtotalDzd,
    discountDzd,
    totalDzd,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

async function ensureCampaign() {
  const startedAt = new Date();
  await db
    .insert(granadaCampaignTable)
    .values({
      id: CAMPAIGN_ID,
      totalUnits: CAMPAIGN_TOTAL_UNITS,
      initialReserved: CAMPAIGN_INITIAL_RESERVED,
      newReservations: 0,
      startedAt,
      endsAt: new Date(startedAt.getTime() + CAMPAIGN_DURATION_MS),
    })
    .onConflictDoNothing();

  const [campaign] = await db
    .select()
    .from(granadaCampaignTable)
    .where(eq(granadaCampaignTable.id, CAMPAIGN_ID))
    .limit(1);
  if (!campaign) throw new Error("Granada launch campaign is unavailable.");
  return campaign;
}

function toCampaignResponse(campaign: GranadaCampaign) {
  const reserved = campaign.initialReserved + campaign.newReservations;
  return GetCampaignStatusResponse.parse({
    totalUnits: campaign.totalUnits,
    reserved,
    remaining: Math.max(0, campaign.totalUnits - reserved),
    progressPercent: Math.min(
      100,
      Math.round((reserved / campaign.totalUnits) * 100),
    ),
    startedAt: campaign.startedAt.toISOString(),
    endsAt: campaign.endsAt.toISOString(),
    serverTime: new Date().toISOString(),
  });
}

router.get("/orders/campaign", async (_req, res): Promise<void> => {
  const campaign = await ensureCampaign();
  res.json(toCampaignResponse(campaign));
});

router.post("/orders", preorderLimiter, async (req, res): Promise<void> => {
  const parsed = CreatePreorderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the pre-order details." });
    return;
  }

  const { royaleQuantity, blancheQuantity } = parsed.data;
  const quantity = royaleQuantity + blancheQuantity;
  if (quantity < 1 || quantity > CAMPAIGN_TOTAL_UNITS) {
    res.status(400).json({ error: "Choose between 1 and 100 bottles." });
    return;
  }
  const isBundle = royaleQuantity > 0 && blancheQuantity > 0;
  const variant = isBundle ? "bundle" : royaleQuantity > 0 ? "royal" : "ivory";
  const subtotalDzd =
    royaleQuantity * ROYALE_PRICE_DZD + blancheQuantity * BLANCHE_PRICE_DZD;
  const discountDzd = isBundle
    ? Math.round(subtotalDzd * BUNDLE_DISCOUNT_RATE)
    : 0;
  const totalDzd = subtotalDzd - discountDzd;

  const orderId = `GP-${randomUUID().replaceAll("-", "").toUpperCase()}`;
  const preorder = await db.transaction(async (tx) => {
    const startedAt = new Date();
    await tx
      .insert(granadaCampaignTable)
      .values({
        id: CAMPAIGN_ID,
        totalUnits: CAMPAIGN_TOTAL_UNITS,
        initialReserved: CAMPAIGN_INITIAL_RESERVED,
        newReservations: 0,
        startedAt,
        endsAt: new Date(startedAt.getTime() + CAMPAIGN_DURATION_MS),
      })
      .onConflictDoNothing();

    const [campaign] = await tx
      .select()
      .from(granadaCampaignTable)
      .where(eq(granadaCampaignTable.id, CAMPAIGN_ID))
      .for("update")
      .limit(1);
    if (!campaign) throw new Error("Granada launch campaign is unavailable.");

    const remaining =
      campaign.totalUnits - campaign.initialReserved - campaign.newReservations;
    if (remaining < quantity) return null;

    const [created] = await tx
      .insert(granadaPreordersTable)
      .values({
        ...parsed.data,
        orderId,
        variant,
        subtotalDzd,
        discountDzd,
        totalDzd,
        status: "pending",
      })
      .returning();

    await tx
      .update(granadaCampaignTable)
      .set({
        newReservations: sql`${granadaCampaignTable.newReservations} + ${quantity}`,
      })
      .where(eq(granadaCampaignTable.id, CAMPAIGN_ID));

    return created;
  });

  if (!preorder) {
    res.status(409).json({ error: "The first launch batch is fully reserved." });
    return;
  }

  try {
    const notification = await sendGranadaOrderNotification({
      orderId: preorder.orderId,
      name: preorder.name,
      phone: preorder.phone,
      wilaya: preorder.wilaya,
      royaleQuantity: preorder.royaleQuantity,
      blancheQuantity: preorder.blancheQuantity,
      subtotalDzd: preorder.subtotalDzd,
      discountDzd: preorder.discountDzd,
      totalDzd: preorder.totalDzd,
    });
    if (notification.sent) {
      req.log.info({ orderId: preorder.orderId }, "Granada admin order email sent");
    } else {
      req.log.warn(
        { orderId: preorder.orderId, missing: notification.missing },
        "Granada admin order email is not configured",
      );
    }
  } catch (error) {
    req.log.error(
      {
        orderId: preorder.orderId,
        error: error instanceof Error ? error.message : "Unknown notification error",
      },
      "Failed to send Granada admin order email",
    );
  }

  res.status(201).json(
    CreatePreorderResponse.parse({
      orderId: preorder.orderId,
      variant: preorder.variant,
      royaleQuantity: preorder.royaleQuantity,
      blancheQuantity: preorder.blancheQuantity,
      subtotalDzd: preorder.subtotalDzd,
      discountDzd: preorder.discountDzd,
      totalDzd: preorder.totalDzd,
      wilaya: preorder.wilaya,
      status: preorder.status,
      createdAt: preorder.createdAt.toISOString(),
    }),
  );
});

router.get("/orders/track", trackingLimiter, async (req, res): Promise<void> => {
  const parsed = TrackPreordersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a valid order ID or phone number." });
    return;
  }

  const { orderId, phone } = parsed.data;
  if (Boolean(orderId) === Boolean(phone)) {
    res.status(400).json({ error: "Search with either an order ID or phone number." });
    return;
  }

  const matches = await db
    .select({
      orderId: granadaPreordersTable.orderId,
      status: granadaPreordersTable.status,
      updatedAt: granadaPreordersTable.updatedAt,
    })
    .from(granadaPreordersTable)
    .where(
      orderId
        ? eq(granadaPreordersTable.orderId, orderId)
        : eq(granadaPreordersTable.phone, phone!),
    )
    .orderBy(desc(granadaPreordersTable.createdAt))
    .limit(20);

  res.json(
    TrackPreordersResponse.parse(
      matches.map((order) => ({
        ...order,
        updatedAt: order.updatedAt.toISOString(),
      })),
    ),
  );
});

router.get(
  "/staff/orders",
  requireGranadaStaff,
  async (req, res): Promise<void> => {
    const orders = await db
      .select()
      .from(granadaPreordersTable)
      .orderBy(desc(granadaPreordersTable.createdAt))
      .limit(500);

    res.json(
      ListStaffPreordersResponse.parse(
        orders.map(toStaffOrder),
      ),
    );
  },
);

router.patch(
  "/staff/orders/:orderId/status",
  requireGranadaStaff,
  async (req, res): Promise<void> => {
    const params = UpdatePreorderStatusParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid order ID." });
      return;
    }

    const body = UpdatePreorderStatusBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Choose a valid order status." });
      return;
    }

    const [updated] = await db
      .update(granadaPreordersTable)
      .set({ status: body.data.status, updatedAt: new Date() })
      .where(eq(granadaPreordersTable.orderId, params.data.orderId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Pre-order not found." });
      return;
    }

    res.json(
      UpdatePreorderStatusResponse.parse({
        ...toStaffOrder(updated),
      }),
    );
  },
);

export default router;
