import { processEmergencyMessage } from "../services/orchestrationService.js";

/**
 * Controller to handle incoming emergency requests from Telegram.
 * 
 * @param {object} ctx - The Telegraf context object
 * @param {string} textContent - The text of the emergency (or prompt to transcribe)
 * @param {object} [audioPart] - Optional audio data for Gemini transcription
 */
export async function handleEmergency(ctx, textContent, audioPart = null) {
  const chatId = ctx.chat.id;
  
  // Retrieve location from session instead of global memory
  const location = ctx.session.location || { latitude: null, longitude: null };
  const senderContact = ctx.from?.username ? `@${ctx.from.username}` : `Telegram ID: ${chatId}`;

  await ctx.reply("⏳ Triaging emergency and locating nearest capable hospital...");

  try {
    const { triageDetails, matchedProvider, alternativeProviders, ambulances } = await processEmergencyMessage(
      textContent,
      location.latitude,
      location.longitude,
      senderContact,
      "telegram",
      audioPart
    );

    if (!matchedProvider) {
      await ctx.reply(`⚠️ **URGENCY: ${triageDetails.urgency}**\n\nSymptoms: ${triageDetails.symptomsSummary}\n\nWe could not find a hospital matching the required capabilities: ${triageDetails.requiredCapabilities.join(", ")}`);
      return;
    }

    let replyMessage = `🚨 **URGENCY: ${triageDetails.urgency}** 🚨\n\n` +
      `**Symptoms:** ${triageDetails.symptomsSummary}\n\n` +
      `🏥 **Primary Hospital:** ${matchedProvider.name}\n` +
      `📍 **Address:** ${matchedProvider.address} (${matchedProvider.distanceKm.toFixed(1)} km away)\n` +
      `📞 **Contact:** ${matchedProvider.phone}\n\n` +
      `*The primary hospital has been alerted of your arrival.*\n`;

    if (alternativeProviders && alternativeProviders.length > 1) {
      replyMessage += `\n**Alternative Nearby Options:**\n`;
      for (let i = 1; i < alternativeProviders.length; i++) {
        const alt = alternativeProviders[i];
        replyMessage += `- ${alt.name} (${alt.distanceKm.toFixed(1)} km) 📞 ${alt.phone}\n`;
      }
    }

    if (ambulances && ambulances.length > 0) {
      replyMessage += `\n🚑 **Nearest Available Ambulances:**\n`;
      ambulances.forEach((amb) => {
        replyMessage += `- ${amb.vehicleNumber} (${amb.distanceKm.toFixed(1)} km) 📞 ${amb.driverPhone} (${amb.driverName})\n`;
      });
    }

    await ctx.reply(replyMessage);

  } catch (error) {
    if (error.message === "LOCATION_REQUIRED") {
      await ctx.reply("⚠️ We couldn't determine your location. Please use the 📎 attachment button to share your exact Location, or mention a city/neighborhood name in your message so we can find nearby hospitals!");
    } else {
      console.error("[Telegram Controller Error]:", error);
      await ctx.reply("An error occurred while processing your emergency. Please call local emergency services immediately.");
    }
  }
}
