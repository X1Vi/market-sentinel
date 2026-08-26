import { etfMomentum } from "../data/seedData.js";

export default function EtfMomentum() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-400">ETF Momentum Rotation</h3>
      <div className="space-y-1.5">
        {etfMomentum.map((e) => (
          <div key={e.symbol} className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-2 transition hover:border-zinc-700">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-[10px] font-bold text-zinc-400">
                {e.rank}
              </span>
              <div>
                <p className="text-[12px] font-semibold text-zinc-200">{e.symbol}</p>
                <p className="text-[9px] text-zinc-500">{e.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="text-center">
                <p className="text-[9px] text-zinc-500">1M</p>
                <p className={`font-medium ${e.m1 >= 0 ? "text-emerald-400" : "text-red-400"}`}>{e.m1 >= 0 ? "+" : ""}{e.m1.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-zinc-500">3M</p>
                <p className={`font-medium ${e.m3 >= 0 ? "text-emerald-400" : "text-red-400"}`}>{e.m3 >= 0 ? "+" : ""}{e.m3.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-zinc-500">12M</p>
                <p className={`font-medium ${e.m12 >= 0 ? "text-emerald-400" : "text-red-400"}`}>{e.m12 >= 0 ? "+" : ""}{e.m12.toFixed(1)}%</p>
              </div>
              <div className="w-16 rounded-sm bg-zinc-800/60">
                <div className="h-1.5 rounded-sm bg-emerald-500" style={{ width: `${(e.momentum / 25) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-zinc-600">Rank by 12M momentum · Rotate monthly into #1</p>
    </div>
  );
}
