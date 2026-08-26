import { stocks } from "../data/seedData.js";

const D_MAP = { BULLISH: "🟢", NEUTRAL: "⚪", BEARISH: "🔴" };

export default function StockWatchlist() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-400">Stock Watchlist</h3>
      <div className="space-y-1.5">
        {stocks.map((s) => (
          <div key={s.symbol} className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-2.5 transition hover:border-zinc-700">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-zinc-200">{s.symbol}</span>
                  <span className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-[10px] text-zinc-500">{s.sector}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-100">₹{s.ltp.toFixed(2)}</span>
                  <span className={`text-[11px] font-semibold ${s.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {s.change >= 0 ? "+" : ""}{s.change.toFixed(2)}%
                  </span>
                  <span>{D_MAP[s.direction]}</span>
                </div>
              </div>
              <div className="ml-3 flex flex-col items-center">
                <div className="h-6 w-16 rounded-sm bg-zinc-800/60">
                  <div
                    className="h-full rounded-sm transition-all"
                    style={{
                      width: `${Math.abs(s.sentiment) * 60 + 20}%`,
                      backgroundColor: s.sentiment > 0.3 ? "#22c55e" : s.sentiment < -0.1 ? "#ef4444" : "#71717a",
                    }}
                  />
                </div>
                <span className="mt-0.5 text-[9px] text-zinc-500">
                  {s.sentiment > 0.6 ? "STRONG" : s.sentiment > 0.2 ? "POS" : s.sentiment < -0.1 ? "NEG" : "—"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
