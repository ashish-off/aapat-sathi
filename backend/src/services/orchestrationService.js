import { extractEmergencyDetails } from "./aiService.js";
import {
  findMatchingProviders,
  findFallbackProviders,
} from "./hospitalMatch.service.js";
import { db } from "../db/index.js";
import { emergencyRequests } from "../db/schema/emergencyRequests.js";
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

  // 2. Match with capabilities (get up to 3 for alternatives)
  let matchedProviders = await findMatchingProviders(
    latitude,
    longitude,
    triageDetails.requiredCapabilities,
    3,
  );

  // 3. Fallback if no exact match (returns hospitals with ANY matching capabilities)
  if (matchedProviders.length === 0) {
    matchedProviders = await findFallbackProviders(
      latitude,
      longitude,
      triageDetails.requiredCapabilities,
      3,
    );
  }

  const bestMatch = matchedProviders[0] || null;
  const providerId = bestMatch ? bestMatch.id : null;

  // 4. Save to Database
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
    alternativeProviders: matchedProviders, // Return the full list
    requestId: requestRecord.id,
  };
}
