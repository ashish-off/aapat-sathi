import { bot } from "./bot.js";
import { registerCommands } from "./commands.js";
import { registerHandlers } from "./handlers.js";

export async function startTelegramBot(app) {
    registerCommands();
    registerHandlers();

    // Industry Standard: Use Webhooks for production, Long-polling for development
    if (process.env.NODE_ENV === 'production' && process.env.WEBHOOK_URL) {
        const secretPath = `/telegraf/${bot.secretPathComponent()}`;
        
        // Mount Telegraf webhook middleware onto Express
        app.use(bot.webhookCallback(secretPath));
        
        // Tell Telegram to send updates to this URL
        await bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}${secretPath}`);
        console.log(`[Telegram] Webhook mode enabled at ${process.env.WEBHOOK_URL}${secretPath}`);
    } else {
        // Fallback to Long Polling for development
        await bot.launch();
        console.log("[Telegram] Long-polling mode started");
    }
}