import { bot } from "./bot.js";
import { handleEmergency } from "./controllers.js";

export function registerHandlers() {
  
  // Handle Location sharing
  bot.on("location", async (ctx) => {
    const { latitude, longitude } = ctx.message.location;
    
    // Store in session instead of global memory to prevent cross-user leakage
    ctx.session.location = { latitude, longitude };
    
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

}