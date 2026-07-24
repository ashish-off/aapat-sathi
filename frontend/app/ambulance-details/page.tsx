import Link from "next/link";

type Ambulance = {
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
            <Link href="/" className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xs hover:bg-red-700 transition-colors">
              +
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
            <a
              href="tel:102"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Call Hotline: 102</span>
            </a>

            <Link
              href="/register"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              Register Ambulance
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-semibold uppercase tracking-wider">
              Live Ambulance Availability
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Emergency Ambulance Services
            </h1>
            <p className="text-red-100 text-sm max-w-xl">
              Direct contact hotline with active emergency drivers across Nepal. Dial driver phone numbers directly for immediate patient transport.
            </p>
          </div>

          <a
            href="tel:102"
            className="px-6 py-3 bg-white text-red-700 hover:bg-red-50 font-bold rounded-xl text-sm transition-colors shrink-0 flex items-center gap-2 shadow-md"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Dial National Emergency (102)</span>
          </a>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Registered Emergency Vehicles
            </h2>
            <p className="text-xs text-slate-500">Showing {ambulances.length} ambulance units in network</p>
          </div>
          <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
            &larr; Back to Main Triage
          </Link>
        </div>

        {/* Ambulance Cards Grid */}
        {ambulances.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl max-w-md mx-auto">
            <h3 className="text-base font-semibold text-slate-800">No Ambulances Currently Listed</h3>
            <p className="text-xs text-slate-500 mt-1">Register a new ambulance to list it on Aapat Sathi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ambulances.map((amb) => (
              <div
                key={amb.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-500 block uppercase">
                        {amb.vehicleNumber}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                        {amb.type || "Emergency Ambulance Unit"}
                      </h3>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shrink-0 ${
                        amb.status === "available"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          amb.status === "available" ? "bg-emerald-600 animate-pulse" : "bg-amber-600"
                        }`}
                      />
                      {amb.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Driver Name:</span>
                      <span className="font-semibold text-slate-900">{amb.driverName || "On Duty Driver"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Direct Phone:</span>
                      <span className="font-semibold text-slate-900">{amb.driverPhone || "N/A"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Operating Region:</span>
                      <span className="font-semibold text-slate-900">{amb.region || "Kathmandu Valley"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">GPS Coordinates:</span>
                      <span className="font-mono text-slate-700">{amb.latitude.toFixed(4)}, {amb.longitude.toFixed(4)}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={`tel:${amb.driverPhone || "102"}`}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl text-center transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call Driver Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
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
