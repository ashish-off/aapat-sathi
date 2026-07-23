import { extractEmergencyData } from "../services/gemini.service.js";

export async function parseSms(smsContent) {
  const trimmed = smsContent.trim();
  const firstWord = trimmed.split(" ")[0]?.toLowerCase();

  if (firstWord !== "help") {
    return {
      error: "Invalid command. Please start your message with 'HELP'.",
    };
  }

  const parsed = await extractEmergencyData(trimmed);

  if (!parsed.locationText) {
    return {
      error:
        "Could not find a location in your message. Please include a location like 'tole, city/village'.",
    };
  }

  const geo = await geocodeLocation(parsed.locationText);

  return {
    emergencyType: parsed.emergencyType,
    locationText: parsed.locationText,
    lat: geo?.lat ?? null,
    lon: geo?.lon ?? null,
    geocodeConfidence: geo ? "matched" : "not_found",
  };
}
async function geocodeLocation(locationText) {
  if (!locationText) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    locationText,
  )}&limit=1&countrycodes=np`;

  const res = await fetch(url, {
    headers: { "User-Agent": "AapatSathi/1.0 (dklsabin23@gmail.com)" },
  });
  const data = await res.json();

  if (!data.length) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}
