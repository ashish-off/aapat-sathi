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
    const [hospital1, hospital2, hospital3, hospital4, h5, h6, h7, h8, h9, h10] = await db
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
        {
          name: "Manipal Teaching Hospital",
          providerType: "hospital",
          address: "Phulbari, Pokhara",
          phone: "061-526416",
          latitude: 28.2435,
          longitude: 83.9928,
          capabilities: ["icu", "surgery", "cardiology", "orthopedics", "oxygen"],
          status: "OPEN",
          isActive: true,
        },
        {
          name: "Western Regional Hospital",
          providerType: "hospital",
          address: "Ramghat, Pokhara",
          phone: "061-520066",
          latitude: 28.2140,
          longitude: 84.0019,
          capabilities: ["icu", "maternity", "pediatrics", "general"],
          status: "OPEN",
          isActive: true,
        },
        {
          name: "Gandaki Medical College",
          providerType: "hospital",
          address: "Prithivi Chowk, Pokhara",
          phone: "061-538595",
          latitude: 28.2045,
          longitude: 83.9877,
          capabilities: ["icu", "surgery", "trauma", "oxygen"],
          status: "OPEN",
          isActive: true,
        },
        {
          name: "Charak Memorial Hospital",
          providerType: "hospital",
          address: "Bagletol, Pokhara",
          phone: "061-528256",
          latitude: 28.2152,
          longitude: 83.9890,
          capabilities: ["icu", "surgery", "cardiology"],
          status: "OPEN",
          isActive: true,
        },
        {
          name: "Fewa City Hospital",
          providerType: "hospital",
          address: "Srijana Chowk, Pokhara",
          phone: "061-528489",
          latitude: 28.2163,
          longitude: 83.9820,
          capabilities: ["icu", "oxygen", "surgery"],
          status: "OPEN",
          isActive: true,
        },
        {
          name: "Metrocity Hospital",
          providerType: "hospital",
          address: "Srijana Chowk, Pokhara",
          phone: "061-524271",
          latitude: 28.2058,
          longitude: 83.9821,
          capabilities: ["trauma", "surgery", "oxygen"],
          status: "OPEN",
          isActive: true,
        },
        {
          name: "Pokhara Academy of Health Sciences",
          providerType: "hospital",
          address: "Ramghat, Pokhara",
          phone: "061-520066",
          latitude: 28.2145,
          longitude: 84.0010,
          capabilities: ["general", "maternity", "pediatrics"],
          status: "OPEN",
          isActive: true,
        },
        {
          name: "Kaski Sewa Hospital",
          providerType: "hospital",
          address: "Zero Kilometer, Pokhara",
          phone: "061-520188",
          latitude: 28.2160,
          longitude: 83.9870,
          capabilities: ["general", "oxygen"],
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
      {
        providerId: hospital3.id,
        availableAmbulances: 3,
        availableIcuBeds: 8,
        availableEmergencyBeds: 15,
        emergencyQueue: 2,
      },
      {
        providerId: hospital4.id,
        availableAmbulances: 4,
        availableIcuBeds: 4,
        availableEmergencyBeds: 20,
        emergencyQueue: 5,
      },
      {
        providerId: h5.id,
        availableAmbulances: 1,
        availableIcuBeds: 6,
        availableEmergencyBeds: 12,
        emergencyQueue: 3,
      },
      {
        providerId: h6.id,
        availableAmbulances: 2,
        availableIcuBeds: 4,
        availableEmergencyBeds: 8,
        emergencyQueue: 1,
      },
      {
        providerId: h7.id,
        availableAmbulances: 1,
        availableIcuBeds: 5,
        availableEmergencyBeds: 10,
        emergencyQueue: 0,
      },
      {
        providerId: h8.id,
        availableAmbulances: 2,
        availableIcuBeds: 0,
        availableEmergencyBeds: 14,
        emergencyQueue: 2,
      },
      {
        providerId: h9.id,
        availableAmbulances: 4,
        availableIcuBeds: 0,
        availableEmergencyBeds: 30,
        emergencyQueue: 8,
      },
      {
        providerId: h10.id,
        availableAmbulances: 0,
        availableIcuBeds: 0,
        availableEmergencyBeds: 5,
        emergencyQueue: 0,
      },
    ]);

    // 3. Users
    console.log("Inserting users...");
    const passwordHash = await bcrypt.hash("password123", 10);
    const [adminUser, staffUser1, staffUser3, staffUser4] = await db
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
        {
          providerId: hospital3.id,
          name: "Manipal Staff",
          email: "staff@manipal.com",
          passwordHash,
          role: "PROVIDER_STAFF",
        },
        {
          providerId: hospital4.id,
          name: "Western Regional Staff",
          email: "staff@westernregional.com",
          passwordHash,
          role: "PROVIDER_STAFF",
        },
      ])
      .returning();

    // 4. Ambulances
    console.log("Inserting ambulances...");
    const [ambulance1, ambulance2, ambulance3, ambulance4] = await db
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
        {
          providerId: hospital3.id,
          vehicleNumber: "GA 1 KHA 1234",
          driverName: "Hari Bahadur",
          driverPhone: "9846000001",
          latitude: 28.2435,
          longitude: 83.9928,
          status: "available",
        },
        {
          providerId: hospital4.id,
          vehicleNumber: "GA 2 KHA 5678",
          driverName: "Krishna Kumar",
          driverPhone: "9846000002",
          latitude: 28.2140,
          longitude: 84.0019,
          status: "available",
        },
      ])
      .returning();

    // 5. Emergency Requests
    console.log("Inserting emergency requests...");
    const [request1, request2, request3] = await db
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
        {
          senderContact: "9846111111",
          channel: "telegram_text",
          rawMessage: "Car crash near Phewa Lake",
          extractedSymptom: "car crash, multiple injuries",
          urgencyLevel: "critical",
          requiredCapabilities: ["trauma", "surgery", "icu"],
          latitude: 28.2096,
          longitude: 83.9856,
          locationName: "Lakeside, Pokhara",
          providerId: hospital3.id,
          ambulanceId: ambulance3.id,
          status: "ambulance_assigned",
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
      {
        emergencyRequestId: request3.id,
        ambulanceId: ambulance3.id,
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
      {
        emergencyRequestId: request3.id,
        status: "ambulance_assigned",
        message:
          "Ambulance GA 1 KHA 1234 has been dispatched and is on the way.",
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
      {
        emergencyRequestId: request3.id,
        recipientType: "patient",
        recipient: "9846111111",
        method: "telegram",
        messagePayload:
          "Ambulance dispatched. Driver: Hari Bahadur (9846000001)",
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
