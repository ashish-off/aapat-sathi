import { db } from "./index.js";
import {
  healthcareProviders,
  users,
  ambulances,
  providerAvailability,
  emergencyRequests,
  ambulanceDispatches,
  emergencyUpdates,
  notifications,
} from "./schema/index.js";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log("Clearing existing data...");
    await db.delete(notifications);
    await db.delete(emergencyUpdates);
    await db.delete(ambulanceDispatches);
    await db.delete(emergencyRequests);
    await db.delete(providerAvailability);
    await db.delete(ambulances);
    await db.delete(users);
    await db.delete(healthcareProviders);

    // 1. Providers
    console.log("Inserting providers...");
    const [hospital1, hospital2] = await db
      .insert(healthcareProviders)
      .values([
        {
          name: "Bir Hospital",
          providerType: "hospital",
          address: "Kantipath, Kathmandu",
          phone: "01-4221988",
          latitude: 27.7056,
          longitude: 85.3148,
          capabilities: ["icu", "trauma", "cardiology"],
          status: "OPEN",
          isActive: true,
        },
        {
          name: "Patan Hospital",
          providerType: "hospital",
          address: "Lagankhel, Lalitpur",
          phone: "01-5522278",
          latitude: 27.6681,
          longitude: 85.3206,
          capabilities: ["icu", "pediatrics", "surgery"],
          status: "OPEN",
          isActive: true,
        },
      ])
      .returning();

    // 2. Provider Availability
    console.log("Inserting provider availability...");
    await db.insert(providerAvailability).values([
      {
        providerId: hospital1.id,
        availableAmbulances: 2,
        availableIcuBeds: 5,
        availableEmergencyBeds: 10,
        emergencyQueue: 1,
      },
      {
        providerId: hospital2.id,
        availableAmbulances: 1,
        availableIcuBeds: 2,
        availableEmergencyBeds: 8,
        emergencyQueue: 0,
      },
    ]);

    // 3. Users
    console.log("Inserting users...");
    const passwordHash = await bcrypt.hash("password123", 10);
    const [adminUser, staffUser] = await db
      .insert(users)
      .values([
        {
          name: "System Admin",
          email: "admin@aapatsathi.com",
          passwordHash,
          role: "ADMIN",
        },
        {
          providerId: hospital1.id,
          name: "Bir Hospital Staff",
          email: "staff@birhospital.com",
          passwordHash,
          role: "PROVIDER_STAFF",
        },
      ])
      .returning();

    // 4. Ambulances
    console.log("Inserting ambulances...");
    const [ambulance1, ambulance2] = await db
      .insert(ambulances)
      .values([
        {
          providerId: hospital1.id,
          vehicleNumber: "BA 1 KHA 1234",
          driverName: "Ram Bahadur",
          driverPhone: "9841000001",
          latitude: 27.7056,
          longitude: 85.3148,
          status: "available",
        },
        {
          providerId: hospital2.id,
          vehicleNumber: "BA 2 KHA 5678",
          driverName: "Shyam Kumar",
          driverPhone: "9841000002",
          latitude: 27.6681,
          longitude: 85.3206,
          status: "available",
        },
      ])
      .returning();

    // 5. Emergency Requests
    console.log("Inserting emergency requests...");
    const [request1] = await db
      .insert(emergencyRequests)
      .values([
        {
          senderContact: "9841999999",
          channel: "telegram_text",
          rawMessage: "Need help, severe chest pain at Thamel",
          extractedSymptom: "severe chest pain",
          urgencyLevel: "critical",
          requiredCapabilities: ["cardiology", "icu"],
          latitude: 27.7154,
          longitude: 85.3123,
          locationName: "Thamel, Kathmandu",
          providerId: hospital1.id,
          ambulanceId: ambulance1.id,
          status: "ambulance_assigned",
        },
        {
          senderContact: "9841888888",
          channel: "sms",
          rawMessage: "Bike accident, bleeding leg in Kupondole",
          extractedSymptom: "bleeding leg, accident",
          urgencyLevel: "high",
          requiredCapabilities: ["trauma"],
          latitude: 27.6833,
          longitude: 85.3167,
          locationName: "Kupondole, Lalitpur",
          status: "pending",
        },
      ])
      .returning();

    // 6. Ambulance Dispatches
    console.log("Inserting ambulance dispatches...");
    await db.insert(ambulanceDispatches).values([
      {
        emergencyRequestId: request1.id,
        ambulanceId: ambulance1.id,
        status: "accepted",
      },
    ]);

    // 7. Emergency Updates
    console.log("Inserting emergency updates...");
    await db.insert(emergencyUpdates).values([
      {
        emergencyRequestId: request1.id,
        status: "ambulance_assigned",
        message:
          "Ambulance BA 1 KHA 1234 has been dispatched and is on the way.",
      },
    ]);

    // 8. Notifications
    console.log("Inserting notifications...");
    await db.insert(notifications).values([
      {
        emergencyRequestId: request1.id,
        recipientType: "patient",
        recipient: "9841999999",
        method: "sms",
        messagePayload:
          "Ambulance dispatched. Driver: Ram Bahadur (9841000001)",
        status: "sent",
      },
    ]);

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
