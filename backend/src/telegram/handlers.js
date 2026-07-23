import { bot } from "./bot.js";

export function registerHandlers() {

    bot.on("text", async (ctx) => {

        const message = ctx.message.text;

        console.log("Incoming:", message);

        // Ignore commands
        if (message.startsWith("/")) return;

        await ctx.reply(
            `You said:\n${message}`
        );
    });

}