import { extractEmergencyDetails } from "./aiService.js";
import { findBestHospital } from "./hospitalMatch.service.js";
import { db } from "../db/index.js";
import { emergencyRequests, healthcareProviders } from "../db/schema/index.js";
import { inArray } from "drizzle-orm";
import { sendTelegramMessage } from "../telegram/sender.js";

/**
 * Helper to fetch rough coordinates using OpenStreetMap Nominatim API
 */
async function geocodeLocation(locationString) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationString)}&format=json&limit=1`;
    const response = await fetch(url, { headers: { "User-Agent": "AapatSathi/1.0" } });
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (e) {
    console.error("Geocoding failed:", e);
  }
  return null;
}

/**
 * The core engine of the system.
 * Takes a raw distress message, asks AI to extract data, finds a matching hospital, and saves to the DB.
 */
export async function processEmergencyMessage(
  rawMessage,
  latitude,
  longitude,
  senderContact,
  channel,
  audioPart = null
) {
  // 1. Triage using AI
  const triageDetails = await extractEmergencyDetails(rawMessage, audioPart);

  // 1.5 Extract Rough Location (if GPS coordinates are missing)
  if ((latitude == null || longitude == null) && triageDetails.locationMentioned) {
    const coords = await geocodeLocation(triageDetails.locationMentioned);
    if (coords) {
      latitude = coords.lat;
      longitude = coords.lon;
    }
  }

  if (latitude == null || longitude == null) {
    throw new Error("LOCATION_REQUIRED");
  }

  // 2. Match with best suitable availability (Scoring Engine: Distance, ICU, Queue, Ambulances)
  const matchResult = await findBestHospital({
    lat: latitude,
    lon: longitude,
    emergencyType: triageDetails.urgency,
  });

  let bestMatch = null;
  let alternativeProviders = [];
  const providerId = matchResult.recommended ? matchResult.recommended.hospitalId : null;

  if (providerId) {
    const allIds = [
      matchResult.recommended.hospitalId,
      ...matchResult.alternatives.map(a => a.hospitalId)
    ];

    const providersData = await db
      .select()
      .from(healthcareProviders)
      .where(inArray(healthcareProviders.id, allIds));

    const providerMap = new Map(providersData.map(p => [p.id, p]));
    
    bestMatch = providerMap.get(matchResult.recommended.hospitalId) || null;
    if (bestMatch) bestMatch.distanceKm = matchResult.recommended.distanceKm;

    alternativeProviders = matchResult.alternatives.map(alt => {
      const p = providerMap.get(alt.hospitalId);
      if (p) {
        p.distanceKm = alt.distanceKm;
        return p;
      }
      return null;
    }).filter(Boolean);
  }
  const [requestRecord] = await db
    .insert(emergencyRequests)
    .values({
      senderContact,
      channel,
      rawMessage,
      extractedSymptom: triageDetails.symptomsSummary,
      urgencyLevel: triageDetails.urgency,
      requiredCapabilities: triageDetails.requiredCapabilities,
      latitude,
      longitude,
      providerId,
      status: providerId ? "triaged" : "pending",
    })
    .returning();

  // 5. Notify the Matched Provider (Outbound Telegram Alert)
  if (bestMatch && bestMatch.telegramChatId) {
    try {
      const alertMsg = `🚨 **INCOMING EMERGENCY** 🚨\n\n` +
        `**Urgency:** ${triageDetails.urgency}\n` +
        `**Symptoms:** ${triageDetails.symptomsSummary}\n\n` +
        `**Patient Contact:** ${senderContact}\n` +
        `Please prepare your facilities.`;
      
      await sendTelegramMessage(bestMatch.telegramChatId, alertMsg);
    } catch (e) {
      console.error("Failed to notify provider via Telegram:", e);
    }
  }

  return {
    triageDetails,
    matchedProvider: bestMatch,
    alternativeProviders: alternativeProviders, // Return the full list fetched from DB
    requestId: requestRecord.id,
  };
}
