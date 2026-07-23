import { db } from "../db/index.js";
import { healthcareProviders, providerAvailability } from "../db/schema/index.js";
import { getDistanceKm } from "../utils/distance.utils.js";
import { eq } from "drizzle-orm";

const WEIGHTS = {
  distance: 0.35,
  icu: 0.25,
  queue: 0.15,
  ambulance: 0.15,
  open: 0.1,
};
const MAX_VIABLE_DISTANCE_KM = 50;
const DISTANCE_DECAY_KM = 5;
const LOW_CONFIDENCE_THRESHOLD = 0.35;
const CRITICAL_TYPES = new Set([
  "cardiac_arrest",
  "stroke",
  "severe_bleeding",
  "accident",
]);

function scoreHospital(hospital, availability, userLat, userLon) {
  const distanceKm = getDistanceKm(
    userLat,
    userLon,
    hospital.latitude,
    hospital.longitude,
  );

  const distanceScore = 1 / (1 + distanceKm / DISTANCE_DECAY_KM);
  const icuScore = availability.availableIcuBeds > 0 ? 1 : 0;
  const queueScore = Math.max(0, 1 - availability.emergencyQueue / 10);
  const ambulanceScore = availability.availableAmbulances > 0 ? 1 : 0;
  const openScore = 1;

  const score =
    WEIGHTS.distance * distanceScore +
    WEIGHTS.icu * icuScore +
    WEIGHTS.queue * queueScore +
    WEIGHTS.ambulance * ambulanceScore +
    WEIGHTS.open * openScore;

  return {
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    score: Number(score.toFixed(3)),
    distanceKm: Number(distanceKm.toFixed(2)),
    lowConfidence: score < LOW_CONFIDENCE_THRESHOLD,
  };
}

export async function findBestHospital({ lat, lon, emergencyType }) {
  const isCritical = CRITICAL_TYPES.has(emergencyType);
  const effectiveMaxDistance = isCritical
    ? MAX_VIABLE_DISTANCE_KM * 2
    : MAX_VIABLE_DISTANCE_KM;

  const [allProviders, allAvailability] = await Promise.all([
    db.select().from(healthcareProviders).where(eq(healthcareProviders.isActive, true)),
    db.select().from(providerAvailability),
  ]);

  const availabilityMap = new Map(
    allAvailability.map((a) => [a.providerId, a]),
  );

  const scored = allProviders
    .map((h) => {
      const availability = availabilityMap.get(h.id);
      if (!availability) return null;
      return scoreHospital(h, availability, lat, lon);
    })
    .filter((r) => r !== null && r.distanceKm <= effectiveMaxDistance)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      recommended: null,
      alternatives: [],
      outOfRange: true,
      message:
        "No hospital within viable emergency range. Call national emergency services (102) immediately.",
    };
  }

  const [recommended, ...alternatives] = scored;

  return {
    recommended,
    alternatives: alternatives.slice(0, 3),
    outOfRange: false,
    lowConfidence: recommended.lowConfidence,
  };
}
