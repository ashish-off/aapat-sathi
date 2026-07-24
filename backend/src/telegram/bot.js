import { Telegraf, session } from 'telegraf';

export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// 1. Session Middleware (In-memory for hackathon, replaces global userLocations)
bot.use(session());

// Initialize default session state if it doesn't exist
bot.use(async (ctx, next) => {
  if (ctx.session === undefined) {
    ctx.session = {};
  }
  await next();
});

// 2. Global Error Boundary
bot.catch((err, ctx) => {
  console.error(`[Telegram Error] for ${ctx.updateType}:`, err);
});

// 3. Request Logging Middleware
bot.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`[Telegram] ${ctx.updateType} from user ${ctx.from?.id} processed in ${ms}ms`);
});