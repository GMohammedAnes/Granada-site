import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import {
  CreatePreorderBody,
  CreatePreorderResponse,
  ListStaffPreordersResponse,
  TrackPreordersQueryParams,
  TrackPreordersResponse,
  UpdatePreorderStatusBody,
  UpdatePreorderStatusParams,
  UpdatePreorderStatusResponse,
} from "@workspace/api-zod";
import { db, granadaPreordersTable } from "@workspace/db";
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

router.post("/orders", preorderLimiter, async (req, res): Promise<void> => {
  const parsed = CreatePreorderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the pre-order details." });
    return;
  }

  const orderId = `GP-${randomUUID().replaceAll("-", "").toUpperCase()}`;
  const [preorder] = await db
    .insert(granadaPreordersTable)
    .values({
      ...parsed.data,
      orderId,
      status: "pending",
    })
    .returning();

  res.status(201).json(
    CreatePreorderResponse.parse({
      orderId: preorder.orderId,
      variant: preorder.variant,
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
        orders.map((order) => ({
          ...order,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        })),
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
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      }),
    );
  },
);

export default router;
