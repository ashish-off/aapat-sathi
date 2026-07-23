import { db } from "./index.js";
import { ambulances } from "./schema/index.js";

async function seedAmbulances() {
  console.log("Seeding ambulances...");

  const mockAmbulances = [
    {
      vehicleNumber: "BA 1 JHA 1234",
      driverName: "Ram Bahadur",
      driverPhone: "9841000001",
      latitude: 27.7175, // Very close to the test coordinates
      longitude: 85.3245,
      status: "available",
    },
    {
      vehicleNumber: "BA 2 JHA 5678",
      driverName: "Hari Khadka",
      driverPhone: "9841000002",
      latitude: 27.7200, // Slightly further
      longitude: 85.3300,
      status: "available",
    },
    {
      vehicleNumber: "BA 3 JHA 9101",
      driverName: "Shyam Thapa",
      driverPhone: "9841000003",
      latitude: 27.6900, // Even further (Patan area)
      longitude: 85.3100,
      status: "available",
    },
    {
      vehicleNumber: "BA 4 JHA 1121",
      driverName: "Gopal Shrestha",
      driverPhone: "9841000004",
      latitude: 27.7173,
      longitude: 85.3241,
      status: "busy", // This one is busy and shouldn't be matched
    }
  ];

  for (const amb of mockAmbulances) {
    await db.insert(ambulances).values(amb);
  }

  console.log("Successfully seeded ambulances!");
  process.exit(0);
}

seedAmbulances().catch((err) => {
  console.error("Error seeding ambulances:", err);
  process.exit(1);
});
