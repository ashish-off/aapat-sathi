import { db } from "../db/index.js";
import { ambulanceDispatches } from "../db/schema/index.js";
import { eq, and, lt } from "drizzle-orm";
import { dispatchToNextAmbulance } from "../services/dispatch.service.js";

const TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

export function startDispatchEscalationWorker() {
  console.log("Starting ambulance dispatch escalation worker...");

  // Run every 30 seconds
  setInterval(async () => {
    try {
      const twoMinsAgo = new Date(Date.now() - TIMEOUT_MS);

      // Find pending dispatches older than 2 minutes
      const timedOutDispatches = await db
        .select()
        .from(ambulanceDispatches)
        .where(
          and(
            eq(ambulanceDispatches.status, "pending"),
            lt(ambulanceDispatches.createdAt, twoMinsAgo)
          )
        );

      for (const dispatch of timedOutDispatches) {
        console.log(`Dispatch ${dispatch.id} timed out. Marking as timed_out and escalating...`);
        
        // Mark as timed out
        await db
          .update(ambulanceDispatches)
          .set({ status: "timed_out", updatedAt: new Date() })
          .where(eq(ambulanceDispatches.id, dispatch.id));

        // Try the next ambulance
        await dispatchToNextAmbulance(dispatch.emergencyRequestId);
      }
    } catch (err) {
      console.error("Error in dispatch escalation worker:", err);
    }
  }, 30 * 1000);
}
