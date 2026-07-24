import ProviderList from "./ProviderList";
import AIAssistant from "./components/AIAssistant";
import Link from "next/link";
import { Ambulance, Building2, Plus, Sparkles } from "lucide-react";

export default async function Home() {
  let initialProviders = [];
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_URL}/api/providers`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      initialProviders = data.providers || [];
    }
  } catch (error) {
    console.error("Could not fetch providers:", error);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-100 selection:text-red-800">
      {/* Taller Top Header / Nav */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black shadow-sm">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-xl tracking-tight block leading-none">
                Aapat Sathi
              </span>
              <span className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1 block">
                आपात साथी • Nepal Emergency Dispatch
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Find Ambulance Button -> /ambulance-details */}
            <Link
              href="/ambulance-details"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs sm:text-sm font-bold hover:bg-red-100 transition-colors shadow-xs"
            >
              <Ambulance className="w-4 h-4" />
              <span>Find Ambulance</span>
            </Link>

            {/* Service Provider Button -> /register */}
            <Link
              href="/register"
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Service Provider</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-200/70 text-slate-700 border border-slate-300/60">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Rapid Healthcare Triage & Availability Engine
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Emergency Care, Instantly Matched.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Locate nearest hospitals with exact required medical capabilities (ICU, Trauma, Oxygen, Maternity) in critical moments.
          </p>
        </div>

        {/* Emergency AI Assistant (Text & Voice) */}
        <section>
          <AIAssistant />
        </section>

        {/* Hospital Directory Section */}
        <section className="pt-6">
          <ProviderList initialProviders={initialProviders} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-medium text-slate-700">Aapat Sathi Emergency Response System — Nepal</p>
          <p>For immediate life-threatening emergencies, call national emergency hotline 102 or 100.</p>
        </div>
      </footer>
    </div>
  );
}
