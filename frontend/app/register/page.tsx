"use client";

import { useState } from "react";
import { registerProvider } from "../actions/providerActions";
import Link from "next/link";

const CAPABILITIES = [
  "icu", "surgery", "maternity", "trauma", 
  "burns", "pediatrics", "cardiology", 
  "neurology", "orthopedics", "oxygen", "general"
];

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    
    const result = await registerProvider(formData);
    
    setLoading(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "An error occurred");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Registration Successful</h2>
          <p className="text-gray-600 mb-6">Your healthcare facility is now listed on Aapat Sathi.</p>
          <Link href="/" className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-blue-600">
              Partner with Aapat Sathi
            </h1>
            <p className="text-gray-600 mt-2">Register your healthcare facility to receive emergency dispatches.</p>
          </div>
          <Link href="/" className="text-sm text-brand-400 hover:text-brand-300">
            &larr; Back to Home
          </Link>
        </div>

        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Facility Name</label>
                <input required type="text" name="name" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. City Hospital" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Provider Type</label>
                <select required name="providerType" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-brand-500 transition-colors">
                  <option value="hospital">Hospital</option>
                  <option value="urgent_care_clinic">Urgent Care Clinic</option>
                  <option value="trauma_center">Trauma Center</option>
                  <option value="health_post">Health Post</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <input required type="tel" name="phone" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. 061-123456" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <input required type="text" name="address" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. Lakeside, Pokhara" />
              </div>

              {/* Coordinates */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Latitude</label>
                <input required type="number" step="any" name="latitude" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. 28.2096" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Longitude</label>
                <input required type="number" step="any" name="longitude" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. 83.9856" />
              </div>
            </div>

            {/* Capabilities */}
            <div className="pt-4 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-700 block mb-3">Available Medical Capabilities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CAPABILITIES.map((cap) => (
                  <label key={cap} className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" name={`capabilities_${cap}`} className="peer sr-only" />
                      <div className="w-5 h-5 rounded border border-gray-300 bg-white peer-checked:bg-brand-500 peer-checked:border-brand-500 transition-colors"></div>
                      <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 capitalize transition-colors">{cap}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Register Facility"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
