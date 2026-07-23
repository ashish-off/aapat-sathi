import { pgTable, uuid, varchar, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { healthcareProviders } from "./providers.js";

export const ambulances = pgTable("ambulances", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerId: uuid("provider_id").references(() => healthcareProviders.id), // nullable — independent ambulances allowed
  vehicleNumber: varchar("vehicle_number", { length: 50 }),
  driverName: varchar("driver_name", { length: 255 }),
  driverPhone: varchar("driver_phone", { length: 20 }),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  status: varchar("status", { length: 20 }).default("available"), // available, busy, maintenance
  updatedAt: timestamp("updated_at").defaultNow(),
});