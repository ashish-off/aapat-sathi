import ProviderList from "./ProviderList";
import Link from "next/link";

export default async function Home() {
  let initialProviders = [];
  try {
    // Fetching data from the backend using the env variable
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
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col">
      <header className="flex justify-end mb-8">
        <Link 
          href="/register" 
          className="glass-panel text-sm font-medium px-4 py-2 rounded-full hover:bg-black/5 transition-colors border-brand-500/20 text-brand-600"
        >
          Provider Login / Register
        </Link>
      </header>

      <div className="text-center mb-16 mt-8">
        <div className="inline-block p-1 px-3 mb-6 rounded-full glass-panel border-brand-500/20 text-brand-600 text-sm font-medium tracking-wide">
          Emergency Dispatch System
        </div>
        <h1 className="text-5xl sm:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 tracking-tight mb-6 animate-gradient-x">
          Aapat Sathi
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Find the right healthcare facility with the exact medical capabilities you need, when every second counts.
        </p>
      </div>

      <ProviderList initialProviders={initialProviders} />
    </main>
  );
}
