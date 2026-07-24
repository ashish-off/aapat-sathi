import ProviderList from "./ProviderList";
import AIAssistant from "./components/AIAssistant";
import Link from "next/link";

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
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xs">
              +
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight block leading-none">
                Aapat Sathi
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                आपात साथी • Nepal Emergency Dispatch
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Emergency Call Pill */}
            <a
              href="tel:102"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Ambulance: 102</span>
            </a>

            <Link
              href="/register"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              Provider Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200/70 text-slate-700 border border-slate-300/60">
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
