import { extractEmergencyDetails } from "./aiService.js";
import { findMatchingProviders, findFallbackProviders } from "./matchingService.js";
import { db } from "../db/index.js";
import { emergencyRequests } from "../db/schema/emergencyRequests.js";

/**
 * The core engine of the system.
 * Takes a raw distress message, asks AI to extract data, finds a matching hospital, and saves to the DB.
 */
export async function processEmergencyMessage(rawMessage, latitude, longitude, senderContact, channel) {
  // 1. Triage using AI
  const triageDetails = await extractEmergencyDetails(rawMessage);
  
  // 2. Match with capabilities
  let matchedProviders = await findMatchingProviders(latitude, longitude, triageDetails.requiredCapabilities, 1);
  
  // 3. Fallback if no exact match (returns hospitals with ANY matching capabilities)
  if (matchedProviders.length === 0) {
    matchedProviders = await findFallbackProviders(latitude, longitude, triageDetails.requiredCapabilities, 1);
  }
  
  const bestMatch = matchedProviders[0] || null;
  const providerId = bestMatch ? bestMatch.id : null;

  // 4. Save to Database
  const [requestRecord] = await db.insert(emergencyRequests).values({
    senderContact,
    channel,
    rawMessage,
    extractedSymptom: triageDetails.symptomsSummary,
    urgencyLevel: triageDetails.urgency,
    requiredCapabilities: triageDetails.requiredCapabilities,
    latitude,
    longitude,
    providerId,
    status: providerId ? "triaged" : "pending"
  }).returning();

  return {
    triageDetails,
    matchedProvider: bestMatch,
    requestId: requestRecord.id
  };
}
