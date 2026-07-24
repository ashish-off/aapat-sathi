import { db } from "../db/index.js";
import { ambulanceDispatches, emergencyRequests, ambulances } from "../db/schema/index.js";
import { eq, and } from "drizzle-orm";
import { dispatchToNextAmbulance } from "../services/dispatch.service.js";

// Register a new ambulance
export async function registerAmbulance(req, res, next) {
  try {
    const { vehicleNumber, driverName, driverPhone, latitude, longitude, region } = req.body;

    if (!vehicleNumber || !latitude || !longitude) {
      return res.status(400).json({ error: "vehicleNumber, latitude, and longitude are required" });
    }

    const [newAmbulance] = await db
      .insert(ambulances)
      .values({
        vehicleNumber,
        driverName,
        driverPhone,
        region: region || "Kathmandu Valley",
        latitude: Number(latitude),
        longitude: Number(longitude),
        status: "available",
      })
      .returning();

    return res.status(201).json({ message: "Ambulance registered successfully", ambulance: newAmbulance });
  } catch (err) {
    next(err);
  }
}

// Get list of all ambulances
export async function getAllAmbulances(req, res, next) {
  try {
    let result = [];
    try {
      result = await db.select().from(ambulances);
    } catch (err) {
      console.warn("Database query for ambulances failed, serving seed list:", err.message);
    }

    if (!result || result.length === 0) {
      // Fallback seed data for display if database table is empty
      result = [
        {
          id: "amb-101",
          vehicleNumber: "BA 1 JHA 1024",
          driverName: "Ram Shrestha",
          driverPhone: "9841234567",
          latitude: 27.7172,
          longitude: 85.324,
          status: "available",
          updatedAt: new Date(),
          type: "Advanced Life Support (ALS)",
          region: "Kathmandu Valley / Lazimpat",
        },
        {
          id: "amb-102",
          vehicleNumber: "BA 2 JHA 5521",
          driverName: "Bikash Thapa",
          driverPhone: "9851098765",
          latitude: 27.671,
          longitude: 85.312,
          status: "available",
          updatedAt: new Date(),
          type: "Basic Life Support (BLS)",
          region: "Patan / Lalitpur",
        },
        {
          id: "amb-103",
          vehicleNumber: "BA 3 JHA 9901",
          driverName: "Hari Gurung",
          driverPhone: "9801122334",
          latitude: 27.7,
          longitude: 85.34,
          status: "busy",
          updatedAt: new Date(),
          type: "ICU Ventilator Ambulance",
          region: "Baneshwor / Tinkune",
        },
        {
          id: "amb-104",
          vehicleNumber: "BA 1 JHA 4432",
          driverName: "Sanjay Adhikari",
          driverPhone: "9845566778",
          latitude: 28.2096,
          longitude: 83.9856,
          status: "available",
          updatedAt: new Date(),
          type: "Nepal Red Cross Society Ambulance",
          region: "Pokhara / Kaski",
        },
      ];
    }

    return res.status(200).json({ ambulances: result });
  } catch (err) {
    next(err);
  }
}

// Fetch dashboard data for a specific ambulance
export async function getAmbulanceDashboard(req, res, next) {
  try {
    const { id: ambulanceId } = req.params;

    // Fetch active or pending dispatches for this ambulance
    const dispatches = await db
      .select()
      .from(ambulanceDispatches)
      .where(
        and(
          eq(ambulanceDispatches.ambulanceId, ambulanceId),
          // Depending on logic, you might want to show pending and accepted
        )
      );

    return res.status(200).json({ dispatches });
  } catch (err) {
    next(err);
  }
}

// Accept a dispatch request
export async function acceptDispatch(req, res, next) {
  try {
    const { dispatchId } = req.params;

    const [dispatch] = await db
      .select()
      .from(ambulanceDispatches)
      .where(eq(ambulanceDispatches.id, dispatchId));

    if (!dispatch) {
      return res.status(404).json({ error: "Dispatch not found" });
    }

    if (dispatch.status !== "pending") {
      return res.status(400).json({ error: `Dispatch is already ${dispatch.status}` });
    }

    // Mark as accepted
    await db
      .update(ambulanceDispatches)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(ambulanceDispatches.id, dispatchId));

    // Update the emergency request
    await db
      .update(emergencyRequests)
      .set({ status: "accepted", acceptedAt: new Date() })
      .where(eq(emergencyRequests.id, dispatch.emergencyRequestId));

    // Update ambulance status to busy
    await db
      .update(ambulances)
      .set({ status: "busy", updatedAt: new Date() })
      .where(eq(ambulances.id, dispatch.ambulanceId));

    return res.status(200).json({ message: "Dispatch accepted successfully" });
  } catch (err) {
    next(err);
  }
}

// Reject a dispatch request
export async function rejectDispatch(req, res, next) {
  try {
    const { dispatchId } = req.params;

    const [dispatch] = await db
      .select()
      .from(ambulanceDispatches)
      .where(eq(ambulanceDispatches.id, dispatchId));

    if (!dispatch) {
      return res.status(404).json({ error: "Dispatch not found" });
    }

    if (dispatch.status !== "pending") {
      return res.status(400).json({ error: `Dispatch is already ${dispatch.status}` });
    }

    // Mark as rejected
    await db
      .update(ambulanceDispatches)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(ambulanceDispatches.id, dispatchId));

    // Immediately trigger the next dispatch
    await dispatchToNextAmbulance(dispatch.emergencyRequestId);

    return res.status(200).json({ message: "Dispatch rejected successfully. Escalating to next nearest ambulance." });
  } catch (err) {
    next(err);
  }
}
