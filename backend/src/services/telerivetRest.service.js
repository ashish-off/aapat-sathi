// telerivetRest.service.js
import { parseSms } from "./parseSms.js";
import { findBestHospital } from "./hospitalMatch.service.js";
import { dispatchToNextAmbulance } from "./dispatch.service.js";
import { db } from "../db/index.js";
import { emergencyRequests } from "../db/schema/index.js";
const TELERIVET_API_KEY = process.env.TELERIVET_API_KEY;
const TELERIVET_PROJECT_ID = process.env.TELERIVET_PROJECT_ID;

export async function sendFollowUpSms(toNumber, content) {
  const url = `https://api.telerivet.com/v1/projects/${TELERIVET_PROJECT_ID}/messages/send`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${TELERIVET_API_KEY}:`).toString("base64")}`,
    },
    body: JSON.stringify({
      content,
      to_number: toNumber,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error("Telerivet sendMessage failed:", res.status, errBody);
    return null;
  }

  return res.json(); // returns the created Message object
}

export async function processEmergencySms({ content, from_number }) {
  const parsedData = await parseSms(content);

  if (parsedData.error) {
    await sendFollowUpSms(from_number, `Error: ${parsedData.error}`);
    return;
  }

  const { emergencyType, lat, lon } = parsedData;
  const userLat = Number(lat);
  const userLon = Number(lon);

  if (Number.isNaN(userLat) || Number.isNaN(userLon)) {
    await sendFollowUpSms(
      from_number,
      "Error: We couldn't pinpoint your location. Please provide a clearer address.",
    );
    return;
  }

  const result = await findBestHospital({
    lat: userLat,
    lon: userLon,
    emergencyType,
  });

  const [newRequest] = await db
    .insert(emergencyRequests)
    .values({
      channel: "sms",
      senderContact: from_number,
      extractedSymptom: emergencyType,
      urgencyLevel: "high",
      latitude: userLat,
      longitude: userLon,
      providerId: result?.recommended?.hospitalId,
      status: "triaged",
    })
    .returning();

  const dispatchResult = await dispatchToNextAmbulance(newRequest.id);

  let replyContent = result.recommended
    ? `Help is on the way! The nearest hospital is ${result.recommended.hospitalName} (${result.recommended.distanceKm}km away). `
    : "No hospitals found nearby. ";
  replyContent += dispatchResult
    ? "We are currently dispatching the nearest ambulance."
    : "However, there are no available ambulances right now.";

  await sendFollowUpSms(from_number, replyContent);
}
