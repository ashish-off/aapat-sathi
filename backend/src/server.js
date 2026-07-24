import app from "./app.js";
import { startDispatchEscalationWorker } from "./workers/dispatchEscalation.js";
import { startTelegramBot } from "./telegram/index.js";
import { bot } from "./telegram/bot.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚑 Aapat Sathi backend running on port ${PORT}`);
  // startDispatchEscalationWorker();
  startTelegramBot();
});

// Graceful shutdown to prevent Telegram 409 Conflict on nodemon restart
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
process.once("SIGUSR2", () => {
  bot.stop("SIGUSR2");
  process.kill(process.pid, "SIGUSR2");
});
