import { extractEmergencyData } from "../services/gemini.service.js";

const COORD_REGEX = /(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)/;

export async function parseSms(smsContent) {
  const trimmed = smsContent.trim();
  const firstWord = trimmed.split(" ")[0]?.toLowerCase();

  if (firstWord !== "help") {
    return {
      error: "Invalid command. Please start your message with 'HELP'.",
    };
  }

  // Everything after "HELP", e.g. "ACCIDENT 34.05,-118.24" or "ACCIDENT Rambazar, Pokhara"
  const rest = trimmed.slice(firstWord.length).trim();
  const [emergencyTypeRaw, ...remainderParts] = rest.split(" ");
  const remainderText = remainderParts.join(" ").trim();

  // Case 1: the message IS just coordinates — this is what the app sends
  // directly from GPS, e.g. "HELP ACCIDENT 34.0522,-118.2437".
  // No need to geocode something that's already an exact fix.
  if (isCoordinatePair(remainderText)) {
    const match = remainderText.match(COORD_REGEX);
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[3]);

    if (isValidCoordinate(lat, lon)) {
      return {
        emergencyType: emergencyTypeRaw?.toUpperCase(),
        locationText: null,
        lat,
        lon,
        geocodeConfidence: "exact", // came straight from GPS, not geocoded
      };
    }
    // If the numbers were out of range (garbled/truncated SMS), fall through
    // to the text-parsing path below instead of failing outright.
  }

  // Case 2: a human typed a place name, e.g. "HELP ACCIDENT Rambazar, Pokhara"
  // — this needs geocoding.
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

function isCoordinatePair(text) {
  // Strict: the ENTIRE remaining text must be just "num,num" — this stops
  // a place name that happens to contain a comma ("Rambazar, Pokhara")
  // from being misread as coordinates.
  return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(text);
}

function isValidCoordinate(lat, lon) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
  );
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
