"use client";

import { useState } from "react";
import { registerProvider, registerAmbulanceAction } from "../actions/providerActions";
import Link from "next/link";

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
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
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
              className="text-xs text-slate-500 hover:text-slate-800 py-2"
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
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            &larr; Home
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
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0v-4m0 4h4" />
                </svg>
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
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Address / Location</label>
                  <input required type="text" name="address" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors" placeholder="e.g. Mahaboudha, Kathmandu" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Latitude</label>
                  <input required type="number" step="any" name="latitude" defaultValue="27.705" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors" placeholder="e.g. 27.7052" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Longitude</label>
                  <input required type="number" step="any" name="longitude" defaultValue="85.314" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors" placeholder="e.g. 85.3145" />
                </div>
              </div>

              {/* Capabilities */}
              <div className="pt-4 border-t border-slate-200">
                <label className="text-xs font-semibold text-slate-700 block mb-3">Available Medical Capabilities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CAPABILITIES.map((cap) => (
                    <label key={cap} className="flex items-center space-x-2.5 cursor-pointer group">
                      <input type="checkbox" name={`capabilities_${cap}`} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Base Location / Region</label>
                  <input required type="text" name="region" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors" placeholder="e.g. Lazimpat, Kathmandu Valley" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Base Latitude</label>
                  <input required type="number" step="any" name="latitude" defaultValue="27.7172" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors" placeholder="e.g. 27.7172" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Base Longitude</label>
                  <input required type="number" step="any" name="longitude" defaultValue="85.324" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors" placeholder="e.g. 85.324" />
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
