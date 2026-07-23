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

export default function ProviderList({ initialProviders }: { initialProviders: Provider[] }) {
  const [search, setSearch] = useState("");

  const filtered = initialProviders.filter((p) => {
    const term = search.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(term) ||
      (p.address || "").toLowerCase().includes(term) ||
      (p.capabilities || []).some(c => (c || "").toLowerCase().includes(term)) ||
      (p.providerType || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by name, location, or capabilities (e.g. ICU, surgery)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full glass-panel pl-11 pr-4 py-4 rounded-xl text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder-gray-400 shadow-2xl"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-600 glass-panel rounded-2xl max-w-md mx-auto">
          No providers found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((provider) => (
            <div 
              key={provider.id} 
              className="glass-panel rounded-2xl p-6 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(37,99,235,0.1)] transition-all duration-300 flex flex-col h-full group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                    {provider.name}
                  </h3>
                  <span className="text-sm text-brand-600 capitalize tracking-wide font-medium">
                    {provider.providerType.replace("_", " ")}
                  </span>
                </div>
                <div className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                  provider.status === "OPEN" ? "bg-green-500/10 text-green-400 border border-green-500/20" : 
                  provider.status === "LIMITED" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : 
                  "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {provider.status}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 flex-grow mb-6">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{provider.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{provider.phone}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                {provider.capabilities.map((cap) => (
                  <span 
                    key={cap} 
                    className="bg-brand-50 text-brand-700 text-xs px-2.5 py-1 rounded-md border border-brand-200 capitalize"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
