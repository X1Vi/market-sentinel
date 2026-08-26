import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { goldETFs, goldSpot } from "../data/seedData.js";

function fmt(n) { return n.toLocaleString("en-IN", { minimumFractionDigits: 2 }); }

export default function GoldTracker() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Gold Tracker 🥇</h3>
        <div className="text-right">
          <p className="text-xs font-semibold text-amber-400">Spot ₹{fmt(goldSpot.price)}</p>
          <p className="text-[10px] text-emerald-400">+{goldSpot.change.toFixed(2)}%</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={goldETFs} layout="vertical" margin={{ left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#71717a", fontSize: 9 }} domain={[62, 65]} />
          <YAxis type="category" dataKey="symbol" width={65} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }}
            formatter={(v) => [`₹${Number(v).toFixed(2)}`]}
          />
          <Bar dataKey="ltp" name="Price" radius={[0, 4, 4, 0]}>
            {goldETFs.map((_, i) => (
              <Cell key={i} fill="#fbbf24" fillOpacity={1 - i * 0.1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-3 space-y-1.5">
        {goldETFs.map((etf) => (
          <div key={etf.symbol} className="flex items-center justify-between rounded-lg border border-zinc-800/60 px-3 py-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-300">{etf.symbol}</span>
              <span className="text-[10px] text-zinc-500">{etf.name.split("ETF")[0]} ETF</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-amber-400">₹{etf.ltp.toFixed(2)}</span>
              <span className={`${etf.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                +{etf.change.toFixed(2)}%
              </span>
              <span className="text-[10px] text-zinc-500">{etf.direction}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
