import app from "./app.js";
import {startTelegramBot} from './telegram/index.js'

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚑 Aapat Sathi backend running on port ${PORT}`);
  await startTelegramBot();
});