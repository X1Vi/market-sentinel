import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { aggregatorSources } from "../data/seedData.js";

const BARCHART_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#06b6d4", "#8b5cf6", "#f43f5e", "#84cc16", "#14b8a6", "#6366f1", "#f97316", "#e11d48", "#d946ef"];

function fmt(n) { return n.toLocaleString("en-IN"); }

export default function SourceHealth() {
  const aggChartData = aggregatorSources.map((a) => ({
    name: a.id === "indian-sentinel" ? "Market Sentinel" : a.id === "signal-discovery" ? "Signal Disc." : a.id === "finance-news-rs" ? "Fin. News RS" : a.id === "finance-news-agg" ? "Fin. News Py" : a.name,
    articles: a.articlesToday,
    uptime: a.uptime,
    latency: a.latencyMs,
  }));

  const avgUptime = aggregatorSources.reduce((s, a) => s + a.uptime, 0) / aggregatorSources.length;
  const totalDaily = aggregatorSources.reduce((s, a) => s + a.articlesToday, 0);
  const avgLatency = aggregatorSources.reduce((s, a) => s + a.latencyMs, 0) / aggregatorSources.length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Source Health</h1>
        <p className="mt-1 text-sm text-zinc-500">Aggregator pipeline status, latency, throughput, and uptime across all {aggregatorSources.length} sources</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Active Aggregators</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{aggregatorSources.length}</p>
          <p className="mt-1 text-xs text-zinc-600">{aggregatorSources.filter(a => a.status === "active").length} live</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Articles / Day</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{fmt(totalDaily)}</p>
          <p className="mt-1 text-xs text-zinc-600">across all sources</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Avg Uptime</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{avgUptime.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-zinc-600">last 30 days</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Avg Latency</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{avgLatency.toFixed(0)} ms</p>
          <p className="mt-1 text-xs text-zinc-600">source → system</p>
        </div>
      </div>

      {/* Latency bar chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Articles by Aggregator (Today)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={aggChartData} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#71717a", fontSize: 9 }} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
            <Bar dataKey="articles" name="articles" radius={[0, 4, 4, 0]}>
              {aggChartData.map((_, i) => <Cell key={i} fill={BARCHART_COLORS[i % BARCHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Full health table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Aggregator Source Health</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="px-3 py-2 text-[9px] uppercase tracking-wider text-zinc-500">Aggregator</th>
                <th className="px-3 py-2 text-[9px] uppercase tracking-wider text-zinc-500">Type</th>
                <th className="px-3 py-2 text-[9px] uppercase tracking-wider text-zinc-500">Lang</th>
                <th className="px-3 py-2 text-[9px] uppercase tracking-wider text-zinc-500">Sources</th>
                <th className="px-3 py-2 text-[9px] uppercase tracking-wider text-zinc-500">Today</th>
                <th className="px-3 py-2 text-[9px] uppercase tracking-wider text-zinc-500">Total (k)</th>
                <th className="px-3 py-2 text-[9px] uppercase tracking-wider text-zinc-500">Latency</th>
                <th className="px-3 py-2 text-[9px] uppercase tracking-wider text-zinc-500">Uptime</th>
                <th className="px-3 py-2 text-[9px] uppercase tracking-wider text-zinc-500">Pos%</th>
                <th className="px-3 py-2 text-[9px] uppercase tracking-wider text-zinc-500">Neg%</th>
                <th className="px-3 py-2 text-[9px] uppercase tracking-wider text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {aggregatorSources.map((a) => (
                <tr key={a.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
                  <td className="px-3 py-2 font-medium text-zinc-200">{a.name}</td>
                  <td className="px-3 py-2 text-[10px] text-zinc-400">{a.type}</td>
                  <td className="px-3 py-2 text-[10px] text-zinc-400">{a.lang}</td>
                  <td className="px-3 py-2 text-zinc-300">{a.sources}</td>
                  <td className="px-3 py-2 text-zinc-300">{fmt(a.articlesToday)}</td>
                  <td className="px-3 py-2 text-zinc-300">{fmt(Math.round(a.articlesTotal / 1000))}</td>
                  <td className="px-3 py-2 text-zinc-300">{a.latencyMs} ms</td>
                  <td className="px-3 py-2 text-zinc-300">{a.uptime}%</td>
                  <td className="px-3 py-2 text-emerald-400">{a.posPct}%</td>
                  <td className="px-3 py-2 text-red-400">{a.negPct}%</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${a.status === "active" ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
                      {a.status === "active" ? "Live" : "Down"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
