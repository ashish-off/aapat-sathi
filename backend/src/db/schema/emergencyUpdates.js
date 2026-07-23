import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { emergencyRequests } from "./emergencyRequests.js";

export const emergencyUpdates = pgTable("emergency_updates", {
  id: uuid("id").defaultRandom().primaryKey(),
  emergencyRequestId: uuid("emergency_request_id").notNull().references(() => emergencyRequests.id),
  status: varchar("status", { length: 30 }),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});