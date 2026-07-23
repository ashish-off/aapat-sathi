import { pgTable, uuid, varchar, boolean, jsonb, timestamp, doublePrecision } from "drizzle-orm/pg-core";

export const healthcareProviders = pgTable("healthcare_providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  providerType: varchar("provider_type", { length: 50 }).notNull(), // hospital, urgent_care_clinic, trauma_center, health_post
  address: varchar("address", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  telegramChatId: varchar("telegram_chat_id", { length: 100 }),
  capabilities: jsonb("capabilities").default([]), // ["icu", "cardiology", ...]
  status: varchar("status", { length: 20 }).default("OPEN"), // OPEN, FULL, LIMITED
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});