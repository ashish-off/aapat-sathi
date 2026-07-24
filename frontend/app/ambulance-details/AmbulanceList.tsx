"use client";

import { useState } from "react";
import { Search, MapPin, Loader2, X, Phone, Ambulance as AmbulanceIcon, Compass } from "lucide-react";
import { getCurrentLocation, reverseGeocode } from "../services/geocodingService";

export type Ambulance = {
  id: string;
  vehicleNumber: string;
  driverName?: string;
  driverPhone?: string;
  latitude: number;
  longitude: number;
  status: "available" | "busy" | "maintenance" | string;
  type?: string;
  region?: string;
};

// Haversine formula to compute distance between two coordinates in kilometers
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

export default function AmbulanceList({ initialAmbulances }: { initialAmbulances: Ambulance[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLocating, setIsLocating] = useState(false);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Extract unique types from data
  const types = ["all", ...Array.from(new Set(initialAmbulances.map((a) => a.type).filter(Boolean)))];

  const handleFindNearMe = async () => {
    setIsLocating(true);
    setActiveLocation("Current GPS Location");

    try {
      const loc = await getCurrentLocation();
      setUserCoords(loc);
      const placeName = await reverseGeocode(loc.lat, loc.lon);
      if (placeName) {
        setActiveLocation(placeName);
      }
    } catch (err: any) {
      console.warn("GPS location error:", err.message);
      // Fallback default coordinates (Kathmandu center) if browser blocks GPS permissions
      setUserCoords({ lat: 27.7172, lon: 85.324 });
      setActiveLocation("Kathmandu Area");
    } finally {
      setTimeout(() => {
        setIsLocating(false);
      }, 1200);
    }
  };

  // Filter and sort ambulances
  const filteredAndSorted = initialAmbulances
    .map((amb) => {
      const distance = userCoords
        ? getDistanceKm(userCoords.lat, userCoords.lon, amb.latitude, amb.longitude)
        : null;
      return { ...amb, distance };
    })
    .filter((amb) => {
      const term = search.toLowerCase();
      const matchesSearch =
        (amb.vehicleNumber || "").toLowerCase().includes(term) ||
        (amb.driverName || "").toLowerCase().includes(term) ||
        (amb.region || "").toLowerCase().includes(term) ||
        (amb.type || "").toLowerCase().includes(term) ||
        (amb.driverPhone || "").includes(term);

      const matchesType =
        typeFilter === "all" || (amb.type || "").toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // If user clicked "Find Near Me", sort strictly by closest distance first!
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return 0;
    });

  return (
    <div className="w-full space-y-6">
      {/* Search & Location Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search by city, region (e.g. Kathmandu, Pokhara), driver, or vehicle number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!e.target.value) {
                  setActiveLocation(null);
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-100 focus:outline-none pl-11 pr-4 py-3 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setActiveLocation(null);
                }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* "Find the Available Ambulance Near Me" Action Button */}
          <button
            type="button"
            onClick={handleFindNearMe}
            disabled={isLocating}
            className="w-full sm:w-auto px-5 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-75 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
          >
            <Compass className="w-4 h-4" />
            <span>{isLocating ? "Locating Nearest..." : "📍 Find the Available Ambulance Near Me"}</span>
          </button>
        </div>

        {/* Vehicle Type Filter Pill Row */}
        {types.length > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Vehicle Type:</span>
              <div className="flex flex-wrap gap-1.5">
                {types.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t as string)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer capitalize ${
                      typeFilter.toLowerCase() === (t as string).toLowerCase()
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {t === "all" ? "All Types" : t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Location Scanning Banner */}
      {isLocating && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md animate-fadeIn flex flex-col sm:flex-row items-center gap-5">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-red-500 opacity-75"></span>
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white relative shadow-lg">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Searching nearest ambulances around your GPS location...
              </h3>
              <span className="px-2 py-0.5 rounded bg-red-500/30 text-red-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                Distance Shortlisting
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Calculating real-time GPS distances to shortlist closest available emergency drivers.
            </p>
          </div>
        </div>
      )}

      {/* Showing Count & Shortlist Notice */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredAndSorted.length}</strong> available ambulance {filteredAndSorted.length === 1 ? "unit" : "units"}
          {userCoords && <span className="ml-1 text-red-600 font-semibold">(Sorted by closest distance to you)</span>}
        </span>
        {(search || typeFilter !== "all" || userCoords) && (
          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("all");
              setActiveLocation(null);
              setUserCoords(null);
            }}
            className="text-red-600 font-semibold hover:underline cursor-pointer"
          >
            Reset Filters & Sort
          </button>
        )}
      </div>

      {/* Ambulance Cards Grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl max-w-md mx-auto shadow-xs">
          <AmbulanceIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Ambulances Found</h3>
          <p className="text-xs text-slate-500 mt-1">No registered emergency units match your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSorted.map((amb) => (
            <div
              key={amb.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-red-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Card Header + Distance Badge */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-500 block uppercase">
                      {amb.vehicleNumber}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                      {amb.type || "Emergency Ambulance Unit"}
                    </h3>
                  </div>

                  {amb.distance !== null && (
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
                      <MapPin className="w-3 h-3 text-red-600" />
                      {amb.distance} km away
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Driver Name:</span>
                    <span className="font-semibold text-slate-900">{amb.driverName || "On Duty Driver"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Direct Phone:</span>
                    <a href={`tel:${amb.driverPhone}`} className="font-semibold text-red-600 hover:underline">
                      {amb.driverPhone || "N/A"}
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Base Region:</span>
                    <span className="font-semibold text-slate-900">{amb.region || "Nepal"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">GPS Location:</span>
                    <span className="font-mono text-slate-700">{amb.latitude.toFixed(4)}, {amb.longitude.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {/* Direct Action */}
              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2">
                <a
                  href={`tel:${amb.driverPhone || "102"}`}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl text-center transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  Call Driver Now
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
