"use client";

import { useState, useEffect, useRef } from "react";
import { registerProvider, registerAmbulanceAction } from "../actions/providerActions";
import { searchPlaces, reverseGeocode, getCurrentLocation, PlaceSuggestion } from "../services/geocodingService";
import Link from "next/link";
import { Building2, Ambulance as AmbulanceIcon, CheckCircle2, ArrowLeft, MapPin, Loader2, Compass } from "lucide-react";

const CAPABILITIES = [
  "icu", "surgery", "maternity", "trauma", 
  "burns", "pediatrics", "cardiology", 
  "neurology", "orthopedics", "oxygen", "general"
];

export default function RegisterPage() {
  const [registerType, setRegisterType] = useState<"healthcare" | "ambulance">("healthcare");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Healthcare Form Location State
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [hospitalLat, setHospitalLat] = useState<number>(27.7052);
  const [hospitalLon, setHospitalLon] = useState<number>(85.3145);
  const [hospitalSuggestions, setHospitalSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [isSearchingHospital, setIsSearchingHospital] = useState(false);

  // Ambulance Form Location State
  const [ambulanceRegion, setAmbulanceRegion] = useState("");
  const [ambulanceLat, setAmbulanceLat] = useState<number>(27.7172);
  const [ambulanceLon, setAmbulanceLon] = useState<number>(85.324);
  const [ambulanceSuggestions, setAmbulanceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showAmbulanceDropdown, setShowAmbulanceDropdown] = useState(false);
  const [isSearchingAmbulance, setIsSearchingAmbulance] = useState(false);

  // Search place suggestions as Healthcare Address is typed
  useEffect(() => {
    if (!hospitalAddress.trim() || hospitalAddress.trim().length < 2) {
      setHospitalSuggestions([]);
      setShowHospitalDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingHospital(true);
      const results = await searchPlaces(hospitalAddress);
      setHospitalSuggestions(results);
      setShowHospitalDropdown(results.length > 0);
      setIsSearchingHospital(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [hospitalAddress]);

  // Search place suggestions as Ambulance Region is typed
  useEffect(() => {
    if (!ambulanceRegion.trim() || ambulanceRegion.trim().length < 2) {
      setAmbulanceSuggestions([]);
      setShowAmbulanceDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingAmbulance(true);
      const results = await searchPlaces(ambulanceRegion);
      setAmbulanceSuggestions(results);
      setShowAmbulanceDropdown(results.length > 0);
      setIsSearchingAmbulance(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [ambulanceRegion]);

  // Handle "Use My Current Location" button click
  const handleUseCurrentLocation = async (target: "hospital" | "ambulance") => {
    try {
      if (target === "hospital") setIsSearchingHospital(true);
      else setIsSearchingAmbulance(true);

      const loc = await getCurrentLocation();
      const placeName = await reverseGeocode(loc.lat, loc.lon);

      if (target === "hospital") {
        setHospitalLat(loc.lat);
        setHospitalLon(loc.lon);
        setHospitalAddress(placeName || "Current GPS Location");
        setShowHospitalDropdown(false);
      } else {
        setAmbulanceLat(loc.lat);
        setAmbulanceLon(loc.lon);
        setAmbulanceRegion(placeName || "Current GPS Base Region");
        setShowAmbulanceDropdown(false);
      }
    } catch (err: any) {
      alert("Could not retrieve GPS location. Please select a suggested location from the list.");
    } finally {
      if (target === "hospital") setIsSearchingHospital(false);
      else setIsSearchingAmbulance(false);
    }
  };

  const handleSelectHospitalSuggestion = (suggestion: PlaceSuggestion) => {
    setHospitalAddress(suggestion.displayName);
    setHospitalLat(suggestion.lat);
    setHospitalLon(suggestion.lon);
    setShowHospitalDropdown(false);
  };

  const handleSelectAmbulanceSuggestion = (suggestion: PlaceSuggestion) => {
    setAmbulanceRegion(suggestion.displayName);
    setAmbulanceLat(suggestion.lat);
    setAmbulanceLon(suggestion.lon);
    setShowAmbulanceDropdown(false);
  };

  async function handleHealthcareSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await registerProvider(formData);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "An error occurred during healthcare registration.");
    }
  }

  async function handleAmbulanceSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await registerAmbulanceAction(formData);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "An error occurred during ambulance registration.");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful</h2>
          <p className="text-slate-600 mb-6 text-sm">
            {registerType === "healthcare"
              ? "Your healthcare facility is now listed on Aapat Sathi."
              : "Your emergency ambulance unit is now registered and active on Aapat Sathi."}
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href={registerType === "healthcare" ? "/" : "/ambulance-details"}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow-xs"
            >
              {registerType === "healthcare" ? "Return to Dashboard" : "View Live Ambulances"}
            </Link>
            <button
              onClick={() => setSuccess(false)}
              className="text-xs text-slate-500 hover:text-slate-800 py-2 cursor-pointer"
            >
              Register Another Service
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center bg-slate-50">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-1">
              Service Provider Portal
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Partner with Aapat Sathi
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Register your service to receive rapid emergency dispatches across Nepal.
            </p>
          </div>
          <Link href="/" className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>

        {/* Dual Option Selector Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => {
              setRegisterType("healthcare");
              setError(null);
            }}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              registerType === "healthcare"
                ? "bg-white border-blue-600 ring-2 ring-blue-100 shadow-sm"
                : "bg-white/60 border-slate-200 hover:border-slate-300 text-slate-600"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                registerType === "healthcare" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
              }`}>
                <Building2 className="w-5 h-5" />
              </div>
              {registerType === "healthcare" && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Healthcare Facility</h3>
              <p className="text-xs text-slate-500 mt-0.5">Hospital, Clinic, Trauma Center, Health Post</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setRegisterType("ambulance");
              setError(null);
            }}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              registerType === "ambulance"
                ? "bg-white border-red-600 ring-2 ring-red-100 shadow-sm"
                : "bg-white/60 border-slate-200 hover:border-slate-300 text-slate-600"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                registerType === "ambulance" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
              }`}>
                <AmbulanceIcon className="w-5 h-5" />
              </div>
              {registerType === "ambulance" && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ambulance Service</h3>
              <p className="text-xs text-slate-500 mt-0.5">Vehicle, Driver Contact & Dispatch GPS</p>
            </div>
          </button>
        </div>

        {/* Registration Form Box */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Option 1: Healthcare Form */}
          {registerType === "healthcare" ? (
            <form action={handleHealthcareSubmit} className="space-y-6">
              {/* Hidden Lat/Lon inputs set by user selection / GPS button */}
              <input type="hidden" name="latitude" value={hospitalLat} />
              <input type="hidden" name="longitude" value={hospitalLon} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Facility Name</label>
                  <input required type="text" name="name" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors" placeholder="e.g. Bir Hospital" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Provider Type</label>
                  <select required name="providerType" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors">
                    <option value="hospital">Hospital</option>
                    <option value="urgent_care_clinic">Urgent Care Clinic</option>
                    <option value="trauma_center">Trauma Center</option>
                    <option value="health_post">Health Post</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                  <input required type="tel" name="phone" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors" placeholder="e.g. 01-4221119" />
                </div>

                {/* Facility Address Input with Autocomplete & Use My Current Location */}
                <div className="space-y-1.5 md:col-span-2 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Facility Address / Location</label>
                    <button
                      type="button"
                      onClick={() => handleUseCurrentLocation("hospital")}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>📍 Use My Current Location</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      required
                      type="text"
                      name="address"
                      value={hospitalAddress}
                      onChange={(e) => setHospitalAddress(e.target.value)}
                      onFocus={() => hospitalSuggestions.length > 0 && setShowHospitalDropdown(true)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
                      placeholder="Type location to see suggestions (e.g. Mahaboudha, Kathmandu)..."
                    />
                    {isSearchingHospital && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-blue-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Place Suggestions Autocomplete Dropdown */}
                  {showHospitalDropdown && hospitalSuggestions.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                      <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        Suggested Locations (Click to Select)
                      </div>
                      {hospitalSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectHospitalSuggestion(item)}
                          className="w-full text-left px-4 py-2.5 text-xs text-slate-800 hover:bg-blue-50 hover:text-blue-900 border-b border-slate-100 last:border-0 transition-colors flex items-start gap-2 cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{item.displayName}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Location Coordinate Badge */}
                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center justify-between border border-slate-200/80">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      Assigned GPS Location:
                    </span>
                    <span className="font-mono text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      Lat {hospitalLat.toFixed(4)}, Lon {hospitalLon.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div className="pt-4 border-t border-slate-200">
                <label className="text-xs font-semibold text-slate-700 block mb-3">Available Medical Capabilities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CAPABILITIES.map((cap) => (
                    <label key={cap} className="flex items-center space-x-2.5 cursor-pointer group">
                      <input type="checkbox" name={`capabilities_${cap}`} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                      <span className="text-xs text-slate-700 group-hover:text-slate-900 capitalize font-medium">{cap}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {loading ? "Registering Facility..." : "Register Healthcare Facility"}
              </button>
            </form>
          ) : (
            /* Option 2: Ambulance Form */
            <form action={handleAmbulanceSubmit} className="space-y-6">
              {/* Hidden Lat/Lon inputs set by user selection / GPS button */}
              <input type="hidden" name="latitude" value={ambulanceLat} />
              <input type="hidden" name="longitude" value={ambulanceLon} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Vehicle Registration Number</label>
                  <input required type="text" name="vehicleNumber" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors" placeholder="e.g. BA 1 JHA 1024" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Driver / Contact Person Name</label>
                  <input required type="text" name="driverName" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors" placeholder="e.g. Ram Bahadur Shrestha" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Driver Direct Phone Number</label>
                  <input required type="tel" name="driverPhone" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors" placeholder="e.g. 9841234567" />
                </div>

                {/* Base Region Input with Autocomplete & Use My Current Location */}
                <div className="space-y-1.5 md:col-span-2 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Base Location / Region</label>
                    <button
                      type="button"
                      onClick={() => handleUseCurrentLocation("ambulance")}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>📍 Use My Current Location</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      required
                      type="text"
                      name="region"
                      value={ambulanceRegion}
                      onChange={(e) => setAmbulanceRegion(e.target.value)}
                      onFocus={() => ambulanceSuggestions.length > 0 && setShowAmbulanceDropdown(true)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
                      placeholder="Type location to see suggestions (e.g. Lazimpat, Kathmandu)..."
                    />
                    {isSearchingAmbulance && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-red-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Place Suggestions Autocomplete Dropdown */}
                  {showAmbulanceDropdown && ambulanceSuggestions.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                      <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        Suggested Base Locations (Click to Select)
                      </div>
                      {ambulanceSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectAmbulanceSuggestion(item)}
                          className="w-full text-left px-4 py-2.5 text-xs text-slate-800 hover:bg-red-50 hover:text-red-900 border-b border-slate-100 last:border-0 transition-colors flex items-start gap-2 cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{item.displayName}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Location Coordinate Badge */}
                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center justify-between border border-slate-200/80">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                      Assigned GPS Location:
                    </span>
                    <span className="font-mono text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      Lat {ambulanceLat.toFixed(4)}, Lon {ambulanceLon.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {loading ? "Registering Ambulance..." : "Register Emergency Ambulance"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
