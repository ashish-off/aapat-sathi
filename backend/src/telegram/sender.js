import { bot } from "./bot.js";

export async function sendTelegramMessage(chatId, text) {
    await bot.telegram.sendMessage(chatId, text);
}