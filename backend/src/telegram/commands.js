import { bot } from "./bot.js";

export function registerCommands() {

    bot.command("start", async (ctx) => {

        await ctx.reply(
            "👋 Welcome!\n\nUse /help to see commands."
        );

    });

    bot.command("help", async (ctx) => {

        await ctx.reply(
            `Available Commands
/start
/help
/ping`
        );

    });

    bot.command("ping", async (ctx) => {

        await ctx.reply("🏓 Pong!");

    });

}