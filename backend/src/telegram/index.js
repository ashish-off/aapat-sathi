import { bot } from "./bot.js";
import { registerCommands } from "./commands.js";
import { registerHandlers } from "./handlers.js";

export async function startTelegramBot() {

    registerCommands();

    registerHandlers();

    await bot.launch();

    console.log("Telegram bot started");

}