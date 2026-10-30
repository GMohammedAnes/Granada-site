import { createInsertSchema } from "drizzle-zod";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export type GranadaPreorderVariant = "royal" | "ivory" | "bundle";
export type GranadaPreorderStatus = "pending" | "out_for_delivery" | "delivered";

export const granadaPreordersTable = pgTable(
  "granada_preorders",
  {
    orderId: text("order_id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    variant: text("variant").notNull().$type<GranadaPreorderVariant>(),
    royaleQuantity: integer("royale_quantity").notNull().default(0),
    blancheQuantity: integer("blanche_quantity").notNull().default(0),
    subtotalDzd: integer("subtotal_dzd").notNull().default(0),
    discountDzd: integer("discount_dzd").notNull().default(0),
    totalDzd: integer("total_dzd").notNull().default(0),
    wilaya: text("wilaya").notNull(),
    status: text("status")
      .notNull()
      .default("pending")
      .$type<GranadaPreorderStatus>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("granada_preorders_phone_idx").on(table.phone),
    index("granada_preorders_created_at_idx").on(table.createdAt),
  ],
);

export const insertGranadaPreorderSchema = createInsertSchema(
  granadaPreordersTable,
).omit({ createdAt: true, updatedAt: true });

export type InsertGranadaPreorder = z.infer<typeof insertGranadaPreorderSchema>;
export type GranadaPreorder = typeof granadaPreordersTable.$inferSelect;
