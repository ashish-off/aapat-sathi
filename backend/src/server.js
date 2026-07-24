import app from "./app.js";
import { startDispatchEscalationWorker } from "./workers/dispatchEscalation.js";
import { startTelegramBot } from "./telegram/index.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚑 Aapat Sathi backend running on port ${PORT}`);
  startDispatchEscalationWorker();
  await startTelegramBot();
});
