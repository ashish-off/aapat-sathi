import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { emergencyRequests } from "./emergencyRequests.js";

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  emergencyRequestId: uuid("emergency_request_id").notNull().references(() => emergencyRequests.id),
  recipientType: varchar("recipient_type", { length: 30 }), // patient, provider_staff, ambulance_driver
  recipient: varchar("recipient", { length: 100 }),
  method: varchar("method", { length: 20 }), // sms, telegram, whatsapp
  messagePayload: text("message_payload"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, sent, failed
  sentAt: timestamp("sent_at"),
});