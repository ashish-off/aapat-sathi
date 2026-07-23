import { db } from "./index.js";
import { healthcareProviders } from "./schema/providers.js";
import { providerAvailability } from "./schema/providerAvailability.js";

const pokharaProviders = [
  {
    name: "Manipal Teaching Hospital",
    providerType: "hospital",
    address: "Phulbari, Pokhara",
    phone: "061-526416",
    latitude: 28.2435,
    longitude: 83.9928,
    capabilities: ["icu", "surgery", "cardiology", "orthopedics", "oxygen"],
    status: "OPEN",
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
  },
  {
    name: "Om Hospital Pokhara",
    providerType: "hospital",
    address: "Mahendrapool, Pokhara",
    phone: "061-521666",
    latitude: 28.2110,
    longitude: 83.9805,
    capabilities: ["maternity", "pediatrics", "oxygen"],
    status: "OPEN",
  },
  {
    name: "Lake City Hospital",
    providerType: "hospital",
    address: "Lakeside, Pokhara",
    phone: "061-464522",
    latitude: 28.2000,
    longitude: 83.9600,
    capabilities: ["general", "surgery", "oxygen"],
    status: "OPEN",
  },
];

async function seed() {
  console.log("Seeding Pokhara healthcare providers...");
  try {
    for (const provider of pokharaProviders) {
      // 1. Insert Provider
      const [insertedProvider] = await db
        .insert(healthcareProviders)
        .values(provider)
        .returning();

      // 2. Insert Default Availability
      await db.insert(providerAvailability).values({
        providerId: insertedProvider.id,
        availableAmbulances: Math.floor(Math.random() * 5), // 0 to 4
        availableIcuBeds: provider.capabilities.includes("icu") ? Math.floor(Math.random() * 10) : 0,
        availableEmergencyBeds: Math.floor(Math.random() * 15) + 2, // 2 to 16
        emergencyQueue: Math.floor(Math.random() * 5), // 0 to 4
      });

      console.log(`✅ Seeded: ${insertedProvider.name}`);
    }
    console.log("Seeding complete! ✨");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seed();
