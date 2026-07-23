import { pgTable, text, boolean, integer, uuid } from "drizzle-orm/pg-core";

1export const hospitals = pgTable("hospitals", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    district: text("district").notNull(),
    phone: text("phone"),
    emergencyDepartment: boolean("emergency_department").default(false),
    icu: boolean("icu").default(false),
    nicu: boolean("nicu").default(false),
    traumaCenter: boolean("trauma_center").default(false),
    cardiology: boolean("cardiology").default(false),
    neurology: boolean("neurology").default(false),
    orthopedics: boolean("orthopedics").default(false),
    generalSurgery: boolean("general_surgery").default(false),
    ctScan: boolean("ct_scan").default(false),
    mri: boolean("mri").default(false),
    bloodBank: boolean("blood_bank").default(false),
    laboratory: boolean("laboratory").default(false),
    pharmacy: boolean("pharmacy").default(false),
    distanceKm: integer("distance_km"),
    estimatedTravelTimeMinutes: integer("estimated_travel_time_minutes"),
});
