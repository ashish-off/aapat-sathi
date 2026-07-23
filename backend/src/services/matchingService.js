import { sql } from "drizzle-orm";
import { db } from "../db/index.js";

/**
 * Finds the best-matched healthcare providers for an emergency.
 * Uses Haversine formula for distance (km) and JSONB containment for capabilities.
 *
 * @param {number} latitude - patient latitude
 * @param {number} longitude - patient longitude
 * @param {string[]} requiredCapabilities - e.g. ["icu", "cardiology"]
 * @param {number} limit - max results to return (default 5)
 */
export async function findMatchingProviders(latitude, longitude, requiredCapabilities = [], limit = 5) {
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
export async function findFallbackProviders(latitude, longitude, requiredCapabilities = [], limit = 5) {
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