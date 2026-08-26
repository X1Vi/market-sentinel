import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import MacroStrip from "./MacroStrip.jsx";
import MarketTicker from "./MarketTicker.jsx";
import { useState, useEffect } from "react";
import { getMarketStatus } from "../data/seedData.js";

export default function Layout() {
  const [marketStatus] = useState(() => getMarketStatus());

  useEffect(() => {
    const t = setInterval(() => window.dispatchEvent(new CustomEvent("marketStatusChange")), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#090a0f]">
      <Header status={marketStatus} />
      <MacroStrip />
      <MarketTicker />
      <main className="mx-auto max-w-7xl space-y-5 px-4 pb-12 pt-3">
        <Outlet />
      </main>
      <footer className="border-t border-zinc-800 px-4 py-6 text-center text-xs text-zinc-600">
        Indian Market Sentinel · Sentiment-driven direction engine · Data from public financial news · Not financial advice
      </footer>
    </div>
  );
}
