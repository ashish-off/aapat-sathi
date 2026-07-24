import { Router } from "express";
import { processEmergencyMessage } from "../services/orchestrationService.js";

const router = Router();

// Test endpoint for orchestrator
router.post("/orchestrate", async (req, res, next) => {
  try {
    console.log("haaaaaaa")
    const { rawMessage, latitude, longitude, senderContact, channel } = req.body;

    if (!rawMessage) {
      const err = new Error("rawMessage is required");
      err.status = 400;
      throw err;
    }

    const result = await processEmergencyMessage(
      rawMessage,
      latitude,
      longitude,
      senderContact || "test-contact",
      channel || "api_test"
    );

    console.log(result);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
