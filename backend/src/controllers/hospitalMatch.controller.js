import { findBestHospital } from "../services/hospitalMatch.service.js";
import { dispatchToNextAmbulance } from "../services/dispatch.service.js";
import { db } from "../db/index.js";
import { emergencyRequests, providerAvailability } from "../db/schema/index.js";
import { eq, sql } from "drizzle-orm";
import { parseSms } from "../services/parseSms.js";
import { processEmergencySms } from "../services/telerivetRest.service.js";

export async function matchProvider(req, res, next) {
  try {
    const { lat, lon, emergency_type } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: "lat and lon are required" });
    }

    const userLat = Number(lat);
    const userLon = Number(lon);

    if (Number.isNaN(userLat) || Number.isNaN(userLon)) {
      return res
        .status(400)
        .json({ error: "lat and lon must be valid numbers" });
    }

    const result = await findBestHospital({
      lat: userLat,
      lon: userLon,
      emergencyType: emergency_type,
    });

    // Create an emergency request for dispatch
    const [newRequest] = await db
      .insert(emergencyRequests)
      .values({
        channel: "web",
        urgencyLevel: "high", // simplified for now
        latitude: userLat,
        longitude: userLon,
        providerId: result?.recommended?.hospitalId,
        status: "triaged",
      })
      .returning();

    // Increment emergency queue for the matched provider
    if (result?.recommended?.hospitalId) {
      await db
        .update(providerAvailability)
        .set({
          emergencyQueue: sql`${providerAvailability.emergencyQueue} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(providerAvailability.providerId, result.recommended.hospitalId));
    }

    // Trigger ambulance dispatch
    const dispatchResult = await dispatchToNextAmbulance(newRequest.id);

    return res.status(200).json({
      hospital: result,
      ambulanceDispatch: dispatchResult
        ? "Contacting nearest ambulance..."
        : "No available ambulances.",
      emergencyRequestId: newRequest.id,
    });
  } catch (err) {
    next(err);
  }
}

export async function getIncomingResponse(req, res, next) {
  const { event, content, from_number, secret } = req.body;

  if (secret !== process.env.TELERIVET_WEBHOOK_SECRET) {
    return res.status(403).send("Invalid webhook secret");
  }
  if (event !== "incoming_message") {
    return res.sendStatus(200);
  }

  res.status(200).json({
    messages: [
      { content: "Received your emergency request. Dispatching help now..." },
    ],
  });

  processEmergencySms({ content, from_number }).catch((err) => {
    console.error("Emergency SMS processing failed:", err);
  });
}
