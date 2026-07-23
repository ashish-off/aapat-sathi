import { findBestHospital } from "../services/hospitalMatch.service.js";
import { dispatchToNextAmbulance } from "../services/dispatch.service.js";
import { db } from "../db/index.js";
import { emergencyRequests } from "../db/schema/index.js";

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

    // Trigger ambulance dispatch
    const dispatchResult = await dispatchToNextAmbulance(newRequest.id);

    return res.status(200).json({
      hospital: result,
      ambulanceDispatch: dispatchResult ? "Contacting nearest ambulance..." : "No available ambulances.",
      emergencyRequestId: newRequest.id
    });
  } catch (err) {
    next(err);
  }
}

export async function getIncomingResponse(req, res, next) {
  const { event, content, from_number, phone_id, secret } = req.body;

  if (secret !== process.env.TELERIVET_WEBHOOK_SECRET) {
    return res.status(403).send("Invalid webhook secret");
  }

  if (event !== "incoming_message") {
    return res.sendStatus(200); // ignore other event types (delivery status, etc.)
  }

  const parsedData = await parseSms(content);

  if (parsedData.error) {
    return res.status(400).json({ error: parsedData.error });
  }

  const { disease, location } = parsedData;
  const lat = location.lat;
  const lon = location.lon;
  const userLat = Number(lat);
  const userLon = Number(lon);

  if (Number.isNaN(userLat) || Number.isNaN(userLon)) {
    return res.status(400).json({ error: "lat and lon must be valid numbers" });
  }

  const result = await findBestHospital({
    lat: userLat,
    lon: userLon,
    emergencyType: disease,
  });

  // Create an emergency request for SMS
  const [newRequest] = await db
    .insert(emergencyRequests)
    .values({
      channel: "sms",
      senderContact: from_number,
      extractedSymptom: disease,
      urgencyLevel: "high",
      latitude: userLat,
      longitude: userLon,
      providerId: result?.recommended?.hospitalId,
      status: "triaged",
    })
    .returning();

  // Trigger ambulance dispatch
  const dispatchResult = await dispatchToNextAmbulance(newRequest.id);

  return res.status(200).json({
    hospital: result,
    ambulanceDispatch: dispatchResult ? "Contacting nearest ambulance..." : "No available ambulances.",
    emergencyRequestId: newRequest.id
  });
}
