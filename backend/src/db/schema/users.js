import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { healthcareProviders } from "./providers.js";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerId: uuid("provider_id").references(() => healthcareProviders.id), // nullable — null for platform admins
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 30 }).notNull().default("PROVIDER_STAFF"), // PROVIDER_STAFF, ADMIN
  createdAt: timestamp("created_at").defaultNow(),
});