import { createInsertSchema } from "drizzle-zod";
import { check, integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { z } from "zod/v4";

export const granadaCampaignTable = pgTable(
  "granada_campaign",
  {
    id: integer("id").primaryKey(),
    totalUnits: integer("total_units").notNull(),
    initialReserved: integer("initial_reserved").notNull(),
    newReservations: integer("new_reservations").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    check(
      "granada_campaign_inventory_bounds",
      sql`${table.initialReserved} >= 0 AND ${table.initialReserved} <= ${table.totalUnits} AND ${table.newReservations} >= 0 AND ${table.newReservations} <= ${table.totalUnits} - ${table.initialReserved}`,
    ),
  ],
);

export const insertGranadaCampaignSchema = createInsertSchema(
  granadaCampaignTable,
);

export type InsertGranadaCampaign = z.infer<typeof insertGranadaCampaignSchema>;
export type GranadaCampaign = typeof granadaCampaignTable.$inferSelect;
