import { bot } from "./bot.js";
import { processEmergencyMessage } from "../services/orchestrationService.js";

// In-memory cache for user locations (for hackathon purposes)
const userLocations = {};

export function registerHandlers() {
  
  // Handle Location sharing
  bot.on("location", async (ctx) => {
    const { latitude, longitude } = ctx.message.location;
    userLocations[ctx.chat.id] = { latitude, longitude };
    await ctx.reply("📍 Location saved! Now, please type or send a voice note describing the emergency.");
  });

  // Handle Text messages
  bot.on("text", async (ctx) => {
    const message = ctx.message.text;
    if (message.startsWith("/")) return; // Ignore commands

    await handleEmergency(ctx, message, null);
  });

  // Handle Voice messages
  bot.on("voice", async (ctx) => {
    try {
      await ctx.reply("🎙️ Processing voice note...");
      
      const fileId = ctx.message.voice.file_id;
      const fileUrl = await ctx.telegram.getFileLink(fileId);
      
      const response = await fetch(fileUrl.href);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString("base64");

      const audioPart = {
        inlineData: {
          data: base64Data,
          mimeType: "audio/ogg",
        },
      };

      await handleEmergency(ctx, "Transcribe this audio and extract the emergency details.", audioPart);
    } catch (error) {
      console.error("Error processing voice:", error);
      ctx.reply("Failed to process the voice note. Please type your emergency.");
    }
  });

  async function handleEmergency(ctx, textContent, audioPart) {
    const chatId = ctx.chat.id;
    // If no exact location is shared, pass null so the AI can extract rough location from text
    const location = userLocations[chatId] || { latitude: null, longitude: null };
    const senderContact = ctx.from.username ? `@${ctx.from.username}` : `Telegram ID: ${chatId}`;

    await ctx.reply("⏳ Triaging emergency and locating nearest capable hospital...");

    try {
      const { triageDetails, matchedProvider, alternativeProviders } = await processEmergencyMessage(
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

      await ctx.reply(replyMessage);

    } catch (error) {
      if (error.message === "LOCATION_REQUIRED") {
        await ctx.reply("⚠️ We couldn't determine your location. Please use the 📎 attachment button to share your exact Location, or mention a city/neighborhood name in your message so we can find nearby hospitals!");
      } else {
        console.error(error);
        await ctx.reply("An error occurred while processing your emergency. Please call local emergency services immediately.");
      }
    }
  }
}