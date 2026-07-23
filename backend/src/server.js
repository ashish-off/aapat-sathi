import dotenv from "dotenv";

import app from "./app.js";
import { startDispatchEscalationWorker } from "./workers/dispatchEscalation.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚑 Aapat Sathi backend running on port ${PORT}`);
  startDispatchEscalationWorker();
});
