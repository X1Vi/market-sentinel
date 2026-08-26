import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { pairsData } from "../data/seedData.js";

export default function PairsMonitor() {
  const p = pairsData;
  const z = p.zScore;
  const entryZone = Math.abs(z) >= 2;
  const exitZone = Math.abs(z) < 0.3;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Pairs Trading Bot</h3>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          entryZone ? "bg-emerald-500/10 text-emerald-300" :
          Math.abs(z) > 1.5 ? "bg-amber-500/10 text-amber-300" :
          "bg-zinc-500/10 text-zinc-400"
        }`}>
          {entryZone ? "ENTRY ZONE" : Math.abs(z) > 1.5 ? "WATCHING" : "NEUTRAL"}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-2 text-center">
        <div className="rounded-lg bg-zinc-800/60 p-2">
          <p className="text-[9px] uppercase text-zinc-500">Spread</p>
          <p className="text-sm font-semibold text-zinc-100">{p.spread.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-zinc-800/60 p-2">
          <p className="text-[9px] uppercase text-zinc-500">Z-Score</p>
          <p className={`text-sm font-semibold ${Math.abs(z) >= 2 ? "text-emerald-400" : Math.abs(z) > 1.5 ? "text-amber-400" : "text-zinc-100"}`}>
            {z.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-800/60 p-2">
          <p className="text-[9px] uppercase text-zinc-500">Half-Life</p>
          <p className="text-sm font-semibold text-zinc-100">{p.halfLife}d</p>
        </div>
        <div className="rounded-lg bg-zinc-800/60 p-2">
          <p className="text-[9px] uppercase text-zinc-500">Win Rate</p>
          <p className="text-sm font-semibold text-emerald-400">{p.winRate}%</p>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-3 text-[11px]">
        <span className="text-zinc-400">{p.legA.symbol} <span className="text-zinc-500">₹{p.legA.price}</span></span>
        <span className="text-zinc-600">vs</span>
        <span className="text-zinc-400">{p.legB.symbol} <span className="text-zinc-500">₹{p.legB.price}</span></span>
        <span className="ml-auto text-zinc-500">ADF p={p.adfPValue} · Win {p.winRate}%</span>
      </div>

      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={p.spreadHistory}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
          <XAxis dataKey="time" tick={{ fill: "#52525b", fontSize: 8 }} interval={5} />
          <YAxis tick={{ fill: "#52525b", fontSize: 8 }} domain={[0, 3.5]} />
          <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 10 }} />
          <Line type="monotone" dataKey="val" stroke="#38bdf8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
