import { useLiveData, fetchEtfPair } from "../api/liveData.js";
import { pairsData } from "../data/seedData.js";

export default function PairsMonitor() {
  const { data: live } = useLiveData(fetchEtfPair, null, 30000);
  const seed = pairsData;

  // Use live prices if available, otherwise seed
  const bankbeesPrice = live?.bankbees || seed.legA.price;
  const setfnifbkPrice = live?.setfnifbk || seed.legB.price;
  const spread = live?.spread ?? seed.spread;

  // Keep seed values for z-score/half-life/etc (need historical data)
  const z = seed.zScore;
  const entryZone = Math.abs(z) >= 2;

  return (
    <div className={`rounded-xl border ${live ? "border-emerald-800/40" : "border-zinc-800"} bg-zinc-900/40 p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Pairs Trading Bot {live ? "● LIVE" : ""}</h3>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          entryZone ? "bg-emerald-500/10 text-emerald-300" : Math.abs(z) > 1.5 ? "bg-amber-500/10 text-amber-300" : "bg-zinc-500/10 text-zinc-400"
        }`}>
          {entryZone ? "ENTRY ZONE" : Math.abs(z) > 1.5 ? "WATCHING" : "NEUTRAL"}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-2 text-center">
        <div className="rounded-lg bg-zinc-800/60 p-2">
          <p className="text-[9px] uppercase text-zinc-500">Spread</p>
          <p className="text-sm font-semibold text-zinc-100">{spread.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-zinc-800/60 p-2">
          <p className="text-[9px] uppercase text-zinc-500">Z-Score</p>
          <p className={`text-sm font-semibold ${Math.abs(z) >= 2 ? "text-emerald-400" : Math.abs(z) > 1.5 ? "text-amber-400" : "text-zinc-100"}`}>
            {z.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-800/60 p-2">
          <p className="text-[9px] uppercase text-zinc-500">Half-Life</p>
          <p className="text-sm font-semibold text-zinc-100">{seed.halfLife}d</p>
        </div>
        <div className="rounded-lg bg-zinc-800/60 p-2">
          <p className="text-[9px] uppercase text-zinc-500">Win Rate</p>
          <p className="text-sm font-semibold text-emerald-400">{seed.winRate}%</p>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-3 text-[11px]">
        <span className="text-zinc-400">BANKBEES <span className="text-zinc-500">₹{bankbeesPrice.toFixed(2)}</span></span>
        <span className="text-zinc-600">vs</span>
        <span className="text-zinc-400">SETFNIFBK <span className="text-zinc-500">₹{setfnifbkPrice.toFixed(2)}</span></span>
        <span className="ml-auto text-zinc-500">ADF p={seed.adfPValue}</span>
      </div>

      {/* Spread history (seed data for chart) */}
      <div className="mt-2 overflow-hidden rounded-lg bg-zinc-800/30 px-3 py-2">
        <div className="flex items-end gap-[3px] h-16">
          {seed.spreadHistory.slice(-30).map((p, i) => {
            const h = Math.max(4, (p.val / 3.5) * 56);
            return <div key={i} className="w-2 rounded-t bg-cyan-500/60" style={{ height: `${h}px` }} title={p.time} />;
          })}
        </div>
        <p className="mt-1 text-[8px] text-zinc-600">Recent spread history (30 periods)</p>
      </div>
    </div>
  );
}
