import { db } from "../db/index.js";
import {
  healthcareProviders,
  providerAvailability,
} from "../db/schema/index.js";
import { getDistanceKm } from "../utils/distance.utils.js";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

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
  "CRITICAL",
  "HIGH"
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
    db
      .select()
      .from(healthcareProviders)
      .where(eq(healthcareProviders.isActive, true)),
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

/**
 * Finds the best-matched healthcare providers for an emergency.
 * Uses Haversine formula for distance (km) and JSONB containment for capabilities.
 *
 * @param {number} latitude - patient latitude
 * @param {number} longitude - patient longitude
 * @param {string[]} requiredCapabilities - e.g. ["icu", "cardiology"]
 * @param {number} limit - max results to return (default 5)
 */

export async function findMatchingProviders(
  latitude,
  longitude,
  requiredCapabilities = [],
  limit = 5,
) {
  const capabilitiesJson = JSON.stringify(requiredCapabilities);

  const result = await db.execute(sql`
    SELECT
      id,
      name,
      provider_type,
      address,
      phone,
      latitude,
      longitude,
      telegram_chat_id,
      capabilities,
      status,
      (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))
        )
      ) AS distance_km
    FROM healthcare_providers
    WHERE
      is_active = true
      AND status = 'OPEN'
      AND capabilities @> ${capabilitiesJson}::jsonb
    ORDER BY distance_km ASC
    LIMIT ${limit}
  `);

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    providerType: row.provider_type,
    address: row.address,
    phone: row.phone,
    latitude: row.latitude,
    longitude: row.longitude,
    telegramChatId: row.telegram_chat_id,
    capabilities: row.capabilities,
    status: row.status,
    distanceKm: Math.round(row.distance_km * 100) / 100,
  }));
}

/**
 * Fallback: if no provider has ALL required capabilities, relax to ANY match,
 * so the family still gets *something* rather than nothing.
 */
export async function findFallbackProviders(
  latitude,
  longitude,
  requiredCapabilities = [],
  limit = 5,
) {
  if (requiredCapabilities.length === 0) {
    return findMatchingProviders(latitude, longitude, [], limit);
  }

  const capabilitiesJson = JSON.stringify(requiredCapabilities);

  const result = await db.execute(sql`
    SELECT
      id, name, provider_type, address, phone, latitude, longitude,
      telegram_chat_id, capabilities, status,
      (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))
        )
      ) AS distance_km
    FROM healthcare_providers
    WHERE
      is_active = true
      AND status IN ('OPEN', 'LIMITED')
      AND capabilities ?| ARRAY(SELECT jsonb_array_elements_text(${capabilitiesJson}::jsonb))
    ORDER BY distance_km ASC
    LIMIT ${limit}
  `);

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    providerType: row.provider_type,
    address: row.address,
    phone: row.phone,
    latitude: row.latitude,
    longitude: row.longitude,
    telegramChatId: row.telegram_chat_id,
    capabilities: row.capabilities,
    status: row.status,
    distanceKm: Math.round(row.distance_km * 100) / 100,
  }));
}

/**
 * Finds the nearest available ambulances.
 * Uses Haversine formula for distance (km).
 *
 * @param {number} latitude - patient latitude
 * @param {number} longitude - patient longitude
 * @param {number} limit - max results to return (default 3)
 */
export async function findNearestAmbulances(latitude, longitude, limit = 3) {
  const result = await db.execute(sql`
    SELECT
      id,
      provider_id,
      vehicle_number,
      driver_name,
      driver_phone,
      latitude,
      longitude,
      status,
      (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))
        )
      ) AS distance_km
    FROM ambulances
    WHERE status = 'available'
    ORDER BY distance_km ASC
    LIMIT ${limit}
  `);

  return result.rows.map((row) => ({
    id: row.id,
    providerId: row.provider_id,
    vehicleNumber: row.vehicle_number,
    driverName: row.driver_name,
    driverPhone: row.driver_phone,
    latitude: row.latitude,
    longitude: row.longitude,
    status: row.status,
    distanceKm: Math.round(row.distance_km * 100) / 100,
  }));
}
