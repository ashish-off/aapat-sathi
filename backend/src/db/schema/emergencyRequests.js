import { pgTable, uuid, varchar, text, jsonb, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { healthcareProviders } from "./providers.js";
import { ambulances } from "./ambulances.js";
import { users } from "./users.js";

export const emergencyRequests = pgTable("emergency_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id), // nullable for guest callers

  senderContact: varchar("sender_contact", { length: 100 }),
  channel: varchar("channel", { length: 20 }).notNull(), // telegram_voice, telegram_text, sms

  rawMessage: text("raw_message"),
  extractedSymptom: text("extracted_symptom"),
  urgencyLevel: varchar("urgency_level", { length: 20 }), // critical, high, moderate, low
  requiredCapabilities: jsonb("required_capabilities").default([]),

  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  locationName: varchar("location_name", { length: 255 }),

  providerId: uuid("provider_id").references(() => healthcareProviders.id),
  ambulanceId: uuid("ambulance_id").references(() => ambulances.id),

  status: varchar("status", { length: 30 }).default("pending"),
  // pending, triaged, dispatched, accepted, ambulance_assigned, completed, cancelled

  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
});