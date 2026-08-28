import { useLiveData, fetchEtfPrices } from "../api/liveData.js";
import { etfMomentum as seed } from "../data/seedData.js";

export default function EtfMomentum() {
  const { data: live } = useLiveData(fetchEtfPrices, null, 60000);
  const list = live || seed;
  const ranked = list.map((e, i) => ({ ...e, rank: i + 1 }));

  if (!ranked.length) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-400">ETF Prices {live ? "● LIVE" : ""}</h3>
      <div className="space-y-1.5">
        {ranked.map((e) => (
          <div key={e.symbol} className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-2 transition hover:border-zinc-700">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-[10px] font-bold text-zinc-400">{e.rank}</span>
              <div>
                <p className="text-[12px] font-semibold text-zinc-200">{e.symbol}</p>
                <p className="text-[9px] text-zinc-500">{e.category || ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="font-medium text-zinc-100">₹{e.ltp.toFixed(2)}</span>
              <span className={`font-medium ${e.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {e.change >= 0 ? "+" : ""}{e.change.toFixed(2)}%
              </span>
              <div className="w-16 rounded-sm bg-zinc-800/60">
                <div className="h-1.5 rounded-sm bg-emerald-500" style={{ width: `${Math.min(100, Math.max(10, (e.change + 5) * 10))}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {!live && <p className="mt-2 text-[10px] text-zinc-600">Live ETF data unavailable — showing seed</p>}
    </div>
  );
}
