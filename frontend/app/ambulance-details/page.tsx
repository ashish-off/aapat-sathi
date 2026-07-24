import Link from "next/link";
import AmbulanceList, { Ambulance } from "./AmbulanceList";
import { Plus, ArrowLeft, Ambulance as AmbulanceIcon, PhoneCall, ShieldAlert } from "lucide-react";

export default async function AmbulanceDetailsPage() {
  let ambulances: Ambulance[] = [];
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_URL}/api/ambulances`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      ambulances = data.ambulances || [];
    }
  } catch (err) {
    console.error("Failed to fetch ambulances:", err);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black shadow-xs hover:bg-red-700 transition-colors">
              <Plus className="w-6 h-6 stroke-[3]" />
            </Link>
            <div>
              <Link href="/" className="font-extrabold text-slate-900 text-lg tracking-tight hover:underline">
                Aapat Sathi
              </Link>
              <span className="text-xs text-slate-500 font-medium tracking-wide block">
                Emergency Ambulance Dispatch Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/register"
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <AmbulanceIcon className="w-4 h-4 text-slate-400" />
              <span>Register Ambulance</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              Live Ambulance Availability
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Emergency Ambulance Services
            </h1>
            <p className="text-red-100 text-sm max-w-xl">
              Direct contact hotline with active emergency drivers across Nepal. Filter by region, availability, or vehicle type and dial drivers directly.
            </p>
          </div>

          <a
            href="tel:102"
            className="px-6 py-3 bg-white text-red-700 hover:bg-red-50 font-bold rounded-xl text-sm transition-colors shrink-0 flex items-center gap-2 shadow-md"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Dial National Emergency (102)</span>
          </a>
        </div>

        {/* Interactive Ambulance List Component */}
        <section>
          <AmbulanceList initialAmbulances={ambulances} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-medium text-slate-700">Aapat Sathi Emergency Response Network</p>
          <p>Always contact 102 or local police in life-threatening situations.</p>
        </div>
      </footer>
    </div>
  );
}
