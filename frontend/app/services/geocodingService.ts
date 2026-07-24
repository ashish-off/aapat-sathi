export type PlaceSuggestion = {
  displayName: string;
  lat: number;
  lon: number;
};

/**
 * Searches OpenStreetMap (OSM) Nominatim API for place suggestions matching a query string.
 * @param query - Search text (e.g., "Lazimpat", "Kathmandu Hospital")
 * @returns Array of up to 5 matching place suggestions with lat/lon
 */
export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const searchQuery = query.toLowerCase().includes("nepal")
      ? query
      : `${query}, Nepal`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "AapatSathiEmergencyDispatch/1.0",
      },
    });

    if (res.ok) {
      const data = await res.json();
      return data.map((item: any) => ({
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));
    }
  } catch (err) {
    console.error("Place search error:", err);
  }
  return [];
}

/**
 * Reverse geocodes lat/lon into a human-readable location name
 */
export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "AapatSathiEmergencyDispatch/1.0",
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    }
  } catch (err) {
    console.error("Reverse geocoding error:", err);
  }
  return null;
}

/**
 * Gets the current device GPS location using browser Geolocation API.
 */
export function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
    );
  });
}
