import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { ambulances } from "./ambulances.js";
import { emergencyRequests } from "./emergencyRequests.js";

export const ambulanceDispatches = pgTable("ambulance_dispatches", {
  id: uuid("id").defaultRandom().primaryKey(),
  emergencyRequestId: uuid("emergency_request_id")
    .notNull()
    .references(() => emergencyRequests.id),
  ambulanceId: uuid("ambulance_id")
    .notNull()
    .references(() => ambulances.id),
  status: varchar("status", { length: 30 }).default("pending"), // pending, accepted, rejected, timed_out
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
