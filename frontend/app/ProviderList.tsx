"use client";

import { useState } from "react";

type Provider = {
  id: string;
  name: string;
  providerType: string;
  address: string;
  phone: string;
  capabilities: string[];
  status: string;
};

const CATEGORY_FILTERS = ["All", "ICU", "Emergency", "Oxygen", "Surgery", "Maternity", "Cardiology"];

export default function ProviderList({ initialProviders }: { initialProviders: Provider[] }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = initialProviders.filter((p) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (p.name || "").toLowerCase().includes(term) ||
      (p.address || "").toLowerCase().includes(term) ||
      (p.capabilities || []).some((c) => (c || "").toLowerCase().includes(term)) ||
      (p.providerType || "").toLowerCase().includes(term);

    const matchesCategory =
      selectedCategory === "All" ||
      (p.capabilities || []).some(
        (c) => (c || "").toLowerCase() === selectedCategory.toLowerCase()
      );

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full">
      {/* Header section for providers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Healthcare Facilities & Hospitals
          </h2>
          <p className="text-sm text-slate-600">
            Real-time availability of verified medical facilities across Nepal.
          </p>
        </div>
        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-center border border-slate-200">
          Showing {filtered.length} {filtered.length === 1 ? "provider" : "providers"}
        </span>
      </div>

      {/* Controls: Search + Filter Badges */}
      <div className="space-y-4 mb-8">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search hospital by name, location, or specialized service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 focus:border-slate-800 focus:ring-2 focus:ring-slate-100 focus:outline-none pl-11 pr-4 py-3 rounded-xl text-base text-slate-900 placeholder:text-slate-400 transition-all shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-500 mr-1">Filter Capability:</span>
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Providers */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl max-w-md mx-auto shadow-xs">
          <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0v-4m0 4h4" />
          </svg>
          <h3 className="text-base font-semibold text-slate-800">No Hospitals Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search or selecting another capability filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((provider) => (
            <div
              key={provider.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Header of card */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                      {provider.name}
                    </h3>
                    <span className="text-xs font-medium text-slate-500 capitalize">
                      {provider.providerType.replace("_", " ")}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shrink-0 ${
                      provider.status === "OPEN"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : provider.status === "LIMITED"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        provider.status === "OPEN"
                          ? "bg-emerald-600"
                          : provider.status === "LIMITED"
                          ? "bg-amber-600"
                          : "bg-red-600"
                      }`}
                    />
                    {provider.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{provider.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${provider.phone}`} className="hover:text-blue-600 hover:underline font-medium">
                      {provider.phone}
                    </a>
                  </div>
                </div>

                {/* Capabilities Badges */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {provider.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md border border-slate-200 font-medium capitalize"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action row */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <a
                  href={`tel:${provider.phone}`}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-lg text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Facility
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.name + " " + provider.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2 px-3 rounded-lg transition-colors border border-slate-200 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
