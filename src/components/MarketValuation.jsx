import { useLiveData, fetchNiftyPe } from "../api/liveData.js";
import { marketValuation as seed } from "../data/seedData.js";

export default function MarketValuation() {
  const { data: live } = useLiveData(fetchNiftyPe, null, 60000);

  const v = {
    niftyPE: live?.niftyPE || seed.niftyPE,
    niftyPrice: live?.niftyPrice || null,
    earningsYield: live?.earningsYield || seed.earningsYield,
    niftyPE1YLow: seed.niftyPE1YLow,
    niftyPE1YHigh: seed.niftyPE1YHigh,
    bond10y: seed.bond10y,
    equityRiskPremium: live ? +(live.earningsYield - seed.bond10y).toFixed(1) : seed.equityRiskPremium,
    grahamRecommendation: seed.grahamRecommendation,
    zone: live?.niftyPE > 25 ? "EXPENSIVE" : live?.niftyPE > 22 ? "FAIR" : "CHEAP",
  };

  const pct = ((v.niftyPE - v.niftyPE1YLow) / (v.niftyPE1YHigh - v.niftyPE1YLow)) * 100;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Market Valuation {live ? "● LIVE" : ""}</h3>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          v.zone === "EXPENSIVE" ? "bg-red-500/10 text-red-300" : v.zone === "FAIR" ? "bg-amber-500/10 text-amber-300" : "bg-emerald-500/10 text-emerald-300"
        }`}>{v.zone}</span>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-zinc-800/60 p-2">
          <p className="text-[9px] uppercase text-zinc-500">Nifty PE</p>
          <p className="text-lg font-bold text-zinc-100">{v.niftyPE}</p>
          <p className="text-[9px] text-zinc-600">1Y range {v.niftyPE1YLow}–{v.niftyPE1YHigh}</p>
        </div>
        <div className="rounded-lg bg-zinc-800/60 p-2">
          <p className="text-[9px] uppercase text-zinc-500">Earnings Yield</p>
          <p className="text-lg font-bold text-amber-400">{v.earningsYield.toFixed(1)}%</p>
          <p className="text-[9px] text-zinc-600">Bond 10Y {v.bond10y}%</p>
        </div>
        <div className="rounded-lg bg-zinc-800/60 p-2">
          <p className="text-[9px] uppercase text-zinc-500">ERP</p>
          <p className={`text-lg font-bold ${v.equityRiskPremium > 0 ? "text-emerald-400" : "text-red-400"}`}>
            {v.equityRiskPremium > 0 ? "+" : ""}{v.equityRiskPremium.toFixed(1)}%
          </p>
          <p className="text-[9px] text-zinc-600">Equity Risk Premium</p>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-[9px] text-zinc-600">
          <span>Cheap ({v.niftyPE1YLow})</span>
          <span>Fair (22)</span>
          <span>Expensive ({v.niftyPE1YHigh})</span>
        </div>
        <div className="mt-1 h-3 w-full rounded-full bg-zinc-800/80">
          <div className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
          <div className="relative -top-3 left-0 h-5 w-2 rounded bg-white" style={{ marginLeft: `${Math.min(100, Math.max(0, pct))}%` }} />
        </div>
        <p className="mt-2 text-[10px] leading-snug text-zinc-500">{v.grahamRecommendation}</p>
      </div>
    </div>
  );
}
