import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { healthcareProviders } from "./providers.js";

export const providerAvailability = pgTable("provider_availability", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerId: uuid("provider_id").notNull().references(() => healthcareProviders.id),
  availableAmbulances: integer("available_ambulances").default(0),
  availableIcuBeds: integer("available_icu_beds").default(0),
  availableEmergencyBeds: integer("available_emergency_beds").default(0),
  emergencyQueue: integer("emergency_queue").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});