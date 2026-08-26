import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from "recharts";

function fmt(n) { return n.toLocaleString("en-IN", { minimumFractionDigits: 2 }); }

export default function NiftyChart({ data, last, open }) {
  const change = last ? last.price - open.price : 0;
  const changePct = open ? ((change / open.price) * 100) : 0;
  const isUp = change >= 0;
  const color = isUp ? "#22c55e" : "#ef4444";
  const avg = data.reduce((s, d) => s + d.price, 0) / data.length;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-400">NIFTY 50</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-100">{last ? fmt(last.price) : "—"}</span>
            <span className={`text-sm font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
              {change >= 0 ? "+" : ""}{fmt(change)} ({isUp ? "+" : ""}{changePct.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-zinc-800/60 px-3 py-1.5 text-[11px] text-zinc-400">
          <span>Open: {fmt(open?.price ?? 0)}</span>
          <span className="mx-2">|</span>
          <span>Day Avg: {fmt(avg)}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
          <XAxis dataKey="time" tick={{ fill: "#71717a", fontSize: 10 }} interval={14} />
          <YAxis domain={["auto", "auto"]} tick={{ fill: "#71717a", fontSize: 10 }} orientation="right" />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 12 }}
            formatter={(v) => [fmt(Number(v))]}
          />
          <ReferenceLine y={open?.price} stroke="#71717a" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#niftyGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
