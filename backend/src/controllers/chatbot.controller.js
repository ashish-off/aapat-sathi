import { extractEmergencyData } from "../services/gemini.service.js";
import { findBestHospital } from "../services/hospitalMatch.service.js";
import { dispatchToNextAmbulance } from "../services/dispatch.service.js";
import { db } from "../db/index.js";
import { emergencyRequests, providerAvailability, healthcareProviders } from "../db/schema/index.js";
import { eq, sql } from "drizzle-orm";

export async function handleChatbotMessage(req, res, next) {
  try {
    const { message, lat, lon } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Step 1: Use AI to extract emergency details from the message
    const aiAnalysis = await extractEmergencyData(message);

    // Step 2: Get location - use provided coordinates or extract from message
    let userLat, userLon;
    
    if (lat && lon) {
      userLat = Number(lat);
      userLon = Number(lon);
    } else {
      // For demo purposes, use default Kathmandu coordinates if not provided
      // In production, you'd want to extract location from the message or use geolocation
      userLat = 27.7172;
      userLon = 85.3240;
    }

    if (Number.isNaN(userLat) || Number.isNaN(userLon)) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    // Step 3: Find best hospital based on AI analysis and location
    const hospitalMatch = await findBestHospital({
      lat: userLat,
      lon: userLon,
      emergencyType: aiAnalysis.isEmergency ? aiAnalysis.emergencyType : "general",
    });

    // Step 4: Create emergency request (only for emergencies)
    let newRequest = null;
    let dispatchResult = null;

    if (aiAnalysis.isEmergency) {
      [newRequest] = await db
        .insert(emergencyRequests)
        .values({
          channel: "web_chatbot",
          urgencyLevel: aiAnalysis.urgency || "high",
          latitude: userLat,
          longitude: userLon,
          rawMessage: message,
          symptomsSummary: `Emergency type: ${aiAnalysis.emergencyType}${aiAnalysis.locationText ? ` at ${aiAnalysis.locationText}` : ""}`,
          requiredCapabilities: aiAnalysis.requiredCapabilities || [],
          providerId: hospitalMatch?.recommended?.hospitalId,
          status: "triaged",
        })
        .returning();

      // Step 5: Increment emergency queue for matched provider
      if (hospitalMatch?.recommended?.hospitalId) {
        await db
          .update(providerAvailability)
          .set({
            emergencyQueue: sql`${providerAvailability.emergencyQueue} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(providerAvailability.providerId, hospitalMatch.recommended.hospitalId));

        // Get hospital details
        const [hospitalDetails] = await db
          .select()
          .from(healthcareProviders)
          .where(eq(healthcareProviders.id, hospitalMatch.recommended.hospitalId));
      }

      // Step 6: Trigger ambulance dispatch (only for emergencies)
      dispatchResult = await dispatchToNextAmbulance(newRequest.id);
    }

    // Step 7: Format response for chatbot
    const chatbotResponse = {
      message: formatChatbotResponse(aiAnalysis, hospitalMatch, dispatchResult),
      analysis: aiAnalysis,
      hospital: hospitalMatch,
      ambulanceDispatch: aiAnalysis.isEmergency
        ? dispatchResult
          ? "Ambulance is being contacted and will arrive shortly."
          : "No available ambulances at the moment. Please call emergency services directly."
        : null,
      emergencyRequestId: newRequest?.id,
    };

    return res.status(200).json(chatbotResponse);
  } catch (err) {
    console.error("Chatbot error:", err);
    next(err);
  }
}

function formatChatbotResponse(aiAnalysis, hospitalMatch, dispatchResult) {
  let response = "";

  if (aiAnalysis.isEmergency) {
    // Emergency response
    response += `🚨 **Emergency Detected:** ${aiAnalysis.emergencyType}\n`;
    response += `⚡ **Urgency:** ${aiAnalysis.urgency?.toUpperCase() || "HIGH"}\n`;
    if (aiAnalysis.locationText) {
      response += `📍 **Location:** ${aiAnalysis.locationText}\n`;
    }
    response += "\n";
  } else {
    // General medical inquiry response
    response += `🏥 **Medical Inquiry:** ${aiAnalysis.medicalCondition || "General consultation"}\n`;
    if (aiAnalysis.locationText) {
      response += `📍 **Location:** ${aiAnalysis.locationText}\n`;
    }
    response += "\n";
  }

  // Add hospital recommendation
  if (hospitalMatch.recommended) {
    response += `🏥 **Recommended Hospital:** ${hospitalMatch.recommended.hospitalName}\n`;
    response += `📍 Distance: ${hospitalMatch.recommended.distanceKm} km away\n`;
    
    if (hospitalMatch.lowConfidence) {
      response += `⚠️ Note: Hospital availability is limited. Consider alternatives below.\n`;
    }
  } else if (hospitalMatch.outOfRange) {
    response += `❌ ${hospitalMatch.message}\n`;
  }

  // Add alternatives if available
  if (hospitalMatch.alternatives && hospitalMatch.alternatives.length > 0) {
    response += `\n**Alternative Hospitals:**\n`;
    hospitalMatch.alternatives.forEach((alt, i) => {
      response += `${i + 1}. ${alt.hospitalName} (${alt.distanceKm} km)\n`;
    });
  }

  // Add ambulance status only for emergencies
  if (aiAnalysis.isEmergency) {
    if (dispatchResult) {
      response += `\n🚑 **Emergency Alert Sent:** An ambulance has been dispatched to your location.`;
    } else {
      response += `\n⚠️ **Ambulance Status:** No ambulances currently available. Please call 102 for emergency services.`;
    }
  } else {
    response += `\n💡 **Note:** For non-emergency medical needs, please contact the hospital directly or visit during regular hours.`;
  }

  return response;
}
