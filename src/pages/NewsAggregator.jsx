import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import { useLiveData, fetchGdeltNews } from "../api/liveData.js";
import { generateSentimentTrend, aggregatorSentimentStats as seedStats } from "../data/seedData.js";

const PIECOLORS = ["#22c55e", "#ef4444", "#52525b"];

export default function NewsAggregator() {
  const [tab, setTab] = useState("indian");
  const [trend] = useState(() => generateSentimentTrend());

  const { data: gdelt } = useLiveData(
    () => fetchGdeltNews(tab === "indian" ? "India stock market NSE BSE Nifty" : "global stock market finance economy", 50),
    null, 120000
  );

  const liveArticles = gdelt || [];

  // Compute sentiment stats from live data
  const stats = useMemo(() => {
    if (!liveArticles.length) return seedStats;
    const total = liveArticles.length;
    const pos = liveArticles.filter((a) => (a.sentiment || 0) > 0.2).length;
    const neg = liveArticles.filter((a) => (a.sentiment || 0) < -0.1).length;
    const neut = total - pos - neg;
    const avg = liveArticles.reduce((s, a) => s + (a.sentiment || 0), 0) / total;
    return {
      positivePct: Math.round((pos / total) * 100),
      negativePct: Math.round((neg / total) * 100),
      neutralPct: Math.round((neut / total) * 100),
      overallAvgSentiment: +avg.toFixed(2),
      totalArticlesToday: total,
    };
  }, [liveArticles]);

  const pieData = [
    { name: "Positive", value: stats.positivePct },
    { name: "Negative", value: stats.negativePct },
    { name: "Neutral", value: stats.neutralPct },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">News Intelligence {liveArticles.length > 0 ? "● LIVE" : ""}</h1>
          <p className="mt-1 text-sm text-zinc-500">Aggregated from GDELT · {stats.totalArticlesToday} articles</p>
        </div>
        <div className="flex gap-1">
          {["indian", "world"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 text-[11px] font-medium uppercase ${tab === t ? "bg-zinc-700 text-zinc-100" : "bg-zinc-800/60 text-zinc-500 hover:text-zinc-300"}`}>{t} News</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Articles</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{stats.totalArticlesToday}</p>
          <p className="mt-1 text-xs text-zinc-600">{liveArticles.length > 0 ? "GDELT live" : "seed"}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Avg Sentiment</p>
          <p className={`mt-1 text-2xl font-bold ${stats.overallAvgSentiment > 0.15 ? "text-emerald-400" : "text-amber-400"}`}>
            {stats.overallAvgSentiment > 0 ? "+" : ""}{stats.overallAvgSentiment.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-zinc-600">{stats.positivePct}% positive</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Positive</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{stats.positivePct}%</p>
          <p className="mt-1 text-xs text-zinc-600">of articles</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Negative</p>
          <p className="mt-1 text-2xl font-bold text-red-400">{stats.negativePct}%</p>
          <p className="mt-1 text-xs text-zinc-600">of articles</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 lg:col-span-2">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">Sentiment Distribution</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIECOLORS[i % PIECOLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-sm">
              <div><span className="inline-block h-3 w-3 rounded-full bg-emerald-500 mr-1" /> Positive <strong className="text-emerald-400">{stats.positivePct}%</strong></div>
              <div><span className="inline-block h-3 w-3 rounded-full bg-red-500 mr-1" /> Negative <strong className="text-red-400">{stats.negativePct}%</strong></div>
              <div><span className="inline-block h-3 w-3 rounded-full bg-zinc-500 mr-1" /> Neutral <strong className="text-zinc-400">{stats.neutralPct}%</strong></div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 lg:col-span-3">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">7-Day Sentiment Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
              <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} />
              <YAxis domain={[-0.1, 0.5]} tick={{ fill: "#71717a", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
              <Line type="monotone" dataKey="avg" name="Avg Sentiment" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live GDELT articles */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-400">{tab === "indian" ? "Indian Market News" : "Global Market News"} {liveArticles.length > 0 ? "● LIVE" : ""}</h3>
          <span className="text-[10px] text-zinc-500">{liveArticles.length} articles · GDELT</span>
        </div>
        <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
          {(liveArticles.length ? liveArticles : []).slice(0, 20).map((item, i) => (
            <a key={item.id || i} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
              className="block rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 transition hover:border-emerald-700/50 hover:bg-zinc-800/50">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-semibold text-zinc-300">{item.sourceIcon || item.source?.slice(0, 2) || "NN"}</span>
                <span className="text-zinc-500">{item.time || ""}</span>
                <span className={`rounded-full px-1.5 py-0.5 font-medium ${(item.sentiment || 0) > 0.3 ? "bg-emerald-500/10 text-emerald-300" : (item.sentiment || 0) > 0 ? "bg-amber-500/10 text-amber-300" : "bg-red-500/10 text-red-300"}`}>
                  {(item.sentiment || 0) > 0.3 ? "BULLISH" : (item.sentiment || 0) > 0 ? "POSITIVE" : "NEGATIVE"}
                </span>
              </div>
              <p className="mt-0.5 text-sm font-medium text-zinc-200">{item.title || "Untitled"}</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">{item.summary || ""}</p>
            </a>
          ))}
          {liveArticles.length === 0 && (
            <p className="text-center text-xs text-zinc-600 py-8">Loading live GDELT news feed...</p>
          )}
        </div>
      </div>
    </div>
  );
}
