import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { ambulances, emergencyRequests, ambulanceDispatches } from "../db/schema/index.js";
import { getDistanceKm } from "../utils/distance.utils.js";

const MAX_VIABLE_AMBULANCE_DISTANCE_KM = 50;

/**
 * Find all available ambulances, sorted by distance to the given location.
 */
export async function findBestAmbulances({ lat, lon }) {
  const allAmbulances = await db
    .select()
    .from(ambulances)
    .where(eq(ambulances.status, "available"));

  const scored = allAmbulances
    .map((amb) => {
      const distanceKm = getDistanceKm(lat, lon, amb.latitude, amb.longitude);
      return {
        ...amb,
        distanceKm: Number(distanceKm.toFixed(2)),
      };
    })
    .filter((amb) => amb.distanceKm <= MAX_VIABLE_AMBULANCE_DISTANCE_KM)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return scored;
}

/**
 * Dispatch an emergency request to the next nearest ambulance that hasn't been contacted yet.
 */
export async function dispatchToNextAmbulance(emergencyRequestId) {
  // Get the request details
  const [request] = await db
    .select()
    .from(emergencyRequests)
    .where(eq(emergencyRequests.id, emergencyRequestId));

  if (!request) throw new Error("Emergency request not found");
  if (["completed", "cancelled", "accepted", "triaged"].includes(request.status)) {
    // Stop dispatching if it's already in a terminal/resolved state
    if (request.status === "accepted") return;
  }

  // Get all previously contacted ambulances for this request
  const pastDispatches = await db
    .select()
    .from(ambulanceDispatches)
    .where(eq(ambulanceDispatches.emergencyRequestId, emergencyRequestId));
  
  const contactedAmbulanceIds = new Set(pastDispatches.map((d) => d.ambulanceId));

  // Find all available ambulances and sort by distance
  const bestAmbulances = await findBestAmbulances({
    lat: request.latitude,
    lon: request.longitude,
  });

  // Find the first one not contacted yet
  const nextAmbulance = bestAmbulances.find(
    (amb) => !contactedAmbulanceIds.has(amb.id)
  );

  if (!nextAmbulance) {
    // No more ambulances to contact
    return null;
  }

  // Create a new dispatch record
  const [newDispatch] = await db
    .insert(ambulanceDispatches)
    .values({
      emergencyRequestId,
      ambulanceId: nextAmbulance.id,
      status: "pending",
    })
    .returning();

  // Update the emergency request status
  await db
    .update(emergencyRequests)
    .set({
      ambulanceId: nextAmbulance.id,
      status: "dispatched",
    })
    .where(eq(emergencyRequests.id, emergencyRequestId));

  return newDispatch;
}
