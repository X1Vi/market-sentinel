import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { useLiveData, fetchNiftyIntraday } from "../api/liveData.js";
import { generateNiftyIntraday } from "../data/seedData.js";

function fmt(n) { return n.toLocaleString("en-IN", { minimumFractionDigits: 2 }); }

export default function NiftyChart({ last, open }) {
  const { data: liveData } = useLiveData(fetchNiftyIntraday, null, 60000);
  const [seedData] = useState(() => generateNiftyIntraday());

  const data = liveData || seedData;
  const lastP = last || data[data.length - 1];
  const openP = open || data[0];
  const change = lastP.price - openP.price;
  const changePct = openP ? ((change / openP.price) * 100) : 0;
  const isUp = change >= 0;
  const color = isUp ? "#22c55e" : "#ef4444";
  const avg = data.reduce((s, d) => s + d.price, 0) / data.length;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-400">NIFTY 50 {liveData ? "● LIVE" : ""}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-100">{fmt(lastP.price)}</span>
            <span className={`text-sm font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
              {change >= 0 ? "+" : ""}{fmt(change)} ({isUp ? "+" : ""}{changePct.toFixed(2)}%)
            </span>
            {liveData && <span className="text-[9px] text-emerald-500 animate-pulse">live</span>}
          </div>
        </div>
        <div className="rounded-lg bg-zinc-800/60 px-3 py-1.5 text-[11px] text-zinc-400">
          <span>Open: {fmt(openP.price)}</span>
          <span className="mx-2">|</span>
          <span>Avg: {fmt(avg)}</span>
          <span className="mx-2">|</span>
          <span>{data.length} pts</span>
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
          <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 12 }} formatter={(v) => [fmt(Number(v))]} />
          <ReferenceLine y={openP.price} stroke="#71717a" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#niftyGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
