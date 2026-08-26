import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid, XAxis, YAxis,
} from "recharts";
import {
  aggregatorNewsFeed, aggregatorSentimentTrend, aggregatorSentimentStats,
  newsArticles, worldNews,
} from "../data/seedData.js";

const PIECOLORS = ["#22c55e", "#ef4444", "#52525b"];

function fmt(n) { return n.toLocaleString("en-IN"); }

function sentBg(s) {
  if (s > 0.3) return "bg-emerald-500/10 text-emerald-300";
  if (s > 0) return "bg-amber-500/10 text-amber-300";
  if (s > -0.3) return "bg-zinc-500/10 text-zinc-400";
  return "bg-red-500/10 text-red-300";
}
function sentLabel(s) {
  if (s > 0.3) return "POSITIVE";
  if (s > 0) return "MILD POS";
  if (s > -0.3) return "NEUTRAL";
  return "NEGATIVE";
}

export default function NewsAggregator() {
  const stats = aggregatorSentimentStats;
  const [tab, setTab] = useState("indian");
  const feed = tab === "indian" ? newsArticles : worldNews;

  const pieData = [
    { name: "Positive", value: stats.positivePct },
    { name: "Negative", value: stats.negativePct },
    { name: "Neutral", value: stats.neutralPct },
  ];

  const trendData = aggregatorSentimentTrend;

  const aggFeed = tab === "indian"
    ? aggregatorNewsFeed
    : worldNews.map((n) => ({ ...n, aggregator: "global" }));

  return (
    <div className="space-y-5">
      {/* Title + tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">News Intelligence</h1>
          <p className="mt-1 text-sm text-zinc-500">Aggregated from all OSINT sources · {fmt(stats.totalArticlesToday)} articles today</p>
        </div>
        <div className="flex gap-1">
          {["indian", "world"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 text-[11px] font-medium uppercase ${
                tab === t ? "bg-zinc-700 text-zinc-100" : "bg-zinc-800/60 text-zinc-500 hover:text-zinc-300"
              }`}>{t} News</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Articles Today</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{fmt(tab === "indian" ? stats.totalArticlesToday : 18400)}</p>
          <p className="mt-1 text-xs text-zinc-600">{tab === "indian" ? "Indian markets" : "Global markets"}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Avg Sentiment</p>
          <p className={`mt-1 text-2xl font-bold ${stats.overallAvgSentiment > 0.15 ? "text-emerald-400" : "text-amber-400"}`}>
            {stats.overallAvgSentiment > 0 ? "+" : ""}{stats.overallAvgSentiment.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-zinc-600">{stats.positivePct}% positive</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Sources</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{tab === "indian" ? 18 : 15}</p>
          <p className="mt-1 text-xs text-zinc-600">feeds tracked</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Latency</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">0.18s</p>
          <p className="mt-1 text-xs text-zinc-600">avg source → system</p>
        </div>
      </div>

      {/* Charts row */}
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
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" /><span className="text-zinc-300">Positive <strong className="text-emerald-400">{stats.positivePct}%</strong></span></div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" /><span className="text-zinc-300">Negative <strong className="text-red-400">{stats.negativePct}%</strong></span></div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-zinc-500" /><span className="text-zinc-300">Neutral <strong className="text-zinc-400">{stats.neutralPct}%</strong></span></div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 lg:col-span-3">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">7-Day Sentiment Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
              <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} />
              <YAxis domain={[-0.1, 0.5]} tick={{ fill: "#71717a", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
              <Line type="monotone" dataKey="avg" name="Avg Sentiment" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <LineChart data={trendData} syncId="sentiment">
                <Line dataKey="articles" stroke="#3b82f6" strokeWidth={0} />
              </LineChart>
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-1 flex gap-4 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-amber-400" /> Avg sentiment</span>
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-blue-400 opacity-30" /> Article volume</span>
          </div>
        </div>
      </div>

      {/* News feed */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-400">{tab === "indian" ? "Indian Market News Feed" : "Global Market News Feed"}</h3>
          <span className="text-[10px] text-zinc-500">{feed.length} articles</span>
        </div>
        <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
          {feed.map((item) => (
            <a key={item.id} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
              className="block rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 transition hover:border-emerald-700/50 hover:bg-zinc-800/50">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-semibold text-zinc-300">{item.sourceIcon || item.icon || item.source.slice(0, 2)}</span>
                <span className="text-zinc-500">{item.time} {tab === "indian" ? "IST" : "UTC"}</span>
                <span className={`rounded-full px-1.5 py-0.5 font-medium ${sentBg(item.sentiment)}`}>{sentLabel(item.sentiment)}</span>
              </div>
              <p className="mt-0.5 text-sm font-medium text-zinc-200">{item.title}</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">{item.summary}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(item.tickers || []).map((t) => (
                  <span key={t} className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-[9px] font-medium text-zinc-400">{t}</span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
