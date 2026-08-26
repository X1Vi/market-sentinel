import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";
import {
  aggregatorSources, aggregatorNewsFeed, aggregatorSentimentTrend,
  aggregatorSentimentStats, newsArticles,
} from "../data/seedData.js";

const PIECOLORS = ["#22c55e", "#ef4444", "#52525b"];
const BARCHART_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#06b6d4", "#8b5cf6", "#f43f5e", "#84cc16", "#14b8a6", "#6366f1", "#f97316", "#e11d48", "#d946ef"];

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

  const pieData = [
    { name: "Positive", value: stats.positivePct },
    { name: "Negative", value: stats.negativePct },
    { name: "Neutral", value: stats.neutralPct },
  ];

  const aggChartData = aggregatorSources.map((a) => ({
    name: a.id === "indian-sentinel" ? "Market Sentinel" : a.id === "signal-discovery" ? "Signal Disc." : a.id === "finance-news-rs" ? "Fin. News RS" : a.id === "finance-news-agg" ? "Fin. News Py" : a.id === "news-agent" ? "News Agent" : a.id === "news-llama" ? "News Llama" : a.id === "gdelt-pulse" ? "GDELT" : a.id === "noisepan" ? "Noisepan" : a.name,
    articles: a.articlesToday,
    positive: a.posPct,
    negative: a.negPct,
  })).sort((a, b) => b.articles - a.articles);

  const trendData = aggregatorSentimentTrend;

  const allFeed = [...aggregatorNewsFeed, ...newsArticles.map((n) => ({
    id: `na-${n.id}`, aggregator: "additional", time: n.time,
    title: n.title, source: n.source, sentiment: n.sentiment, label: n.sentimentLabel,
    tickers: n.tickers, summary: n.summary,
  }))].sort((a, b) => b.id.localeCompare(a.id));

  const topEntities = stats.topEntities.slice(0, 12);

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">News Aggregator Intelligence</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Aggregated feed from all {aggregatorSources.length} OSINT sources · {fmt(stats.totalArticlesToday)} articles today · {fmt(stats.sourcesMonitored)} sources monitored · Last updated {stats.latestUpdate}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Articles Today</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{fmt(stats.totalArticlesToday)}</p>
          <p className="mt-1 text-xs text-zinc-600">{fmt(stats.totalArticlesAllTime)} all time</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Active Aggregators</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{aggregatorSources.length}</p>
          <p className="mt-1 text-xs text-zinc-600">{fmt(stats.sourcesMonitored)} sources</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Avg Sentiment</p>
          <p className={`mt-1 text-2xl font-bold ${stats.overallAvgSentiment > 0.15 ? "text-emerald-400" : stats.overallAvgSentiment < -0.05 ? "text-red-400" : "text-amber-400"}`}>
            {stats.overallAvgSentiment > 0 ? "+" : ""}{stats.overallAvgSentiment.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-zinc-600">{stats.positivePct}% positive</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Avg Latency</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{stats.avgLatencySec.toFixed(2)}s</p>
          <p className="mt-1 text-xs text-zinc-600">source to system</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Unique Tickers</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{fmt(stats.uniqueTickersMentioned)}</p>
          <p className="mt-1 text-xs text-zinc-600">{stats.topTopics.length} sectors tracked</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Pie chart — sentiment distribution */}
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
              <div className="pt-2 text-[11px] text-zinc-500">Based on {fmt(stats.totalArticlesToday)} articles today across {aggregatorSources.length} aggregators</div>
            </div>
          </div>
        </div>

        {/* Sentiment trend line */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 lg:col-span-3">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">7-Day Sentiment Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
              <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} />
              <YAxis domain={[-0.1, 0.5]} tick={{ fill: "#71717a", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
              <Line type="monotone" dataKey="avg" name="Avg Sentiment" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <BarChart data={trendData} syncId="sentiment">
                <Bar dataKey="articles" fill="#3b82f6" opacity={0.15} radius={[2, 2, 0, 0]} />
              </BarChart>
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-1 flex gap-4 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-amber-400" /> Avg sentiment</span>
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-blue-400 opacity-30" /> Article volume</span>
          </div>
        </div>
      </div>

      {/* Aggregator articles bar + entities */}
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 lg:col-span-3">
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

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 lg:col-span-2">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">Top Entities Mentioned</h3>
          <div className="space-y-1.5">
            {topEntities.map((e, i) => (
              <div key={e} className="flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-[10px] font-bold text-zinc-400">{i + 1}</span>
                <span className="text-sm font-medium text-zinc-200">{e}</span>
                <span className="ml-auto text-[11px] text-zinc-500">
                  {i < 3 ? "🔥 High" : i < 7 ? "📊 Mid" : "💤 Low"}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-zinc-600">{fmt(stats.uniqueTickersMentioned)} unique tickers · {stats.topTopics.length} sectors</p>
        </div>
      </div>

      {/* Aggregator source health table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Aggregator Source Health</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-500">Aggregator</th>
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-500">Type</th>
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-500">Lang</th>
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-500">Sources</th>
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-500">Today</th>
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-500">Total (k)</th>
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-500">Latency</th>
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-500">Uptime</th>
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-500">Pos%</th>
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-500">Neg%</th>
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {aggregatorSources.map((a) => (
                <tr key={a.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
                  <td className="px-3 py-2 font-medium text-zinc-200">{a.name}</td>
                  <td className="px-3 py-2 text-xs text-zinc-400">{a.type}</td>
                  <td className="px-3 py-2 text-xs text-zinc-400">{a.lang}</td>
                  <td className="px-3 py-2 text-zinc-300">{a.sources}</td>
                  <td className="px-3 py-2 text-zinc-300">{fmt(a.articlesToday)}</td>
                  <td className="px-3 py-2 text-zinc-300">{fmt(Math.round(a.articlesTotal / 1000))}</td>
                  <td className="px-3 py-2 text-zinc-300">{a.latencyMs} ms</td>
                  <td className="px-3 py-2 text-zinc-300">{a.uptime}%</td>
                  <td className="px-3 py-2 text-emerald-400">{a.posPct}%</td>
                  <td className="px-3 py-2 text-red-400">{a.negPct}%</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${a.status === "active" ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
                      {a.status === "active" ? "🟢 Live" : "🔴 Down"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live aggregated feed */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-400">Aggregated News Feed</h3>
          <span className="text-[10px] text-zinc-500">{allFeed.length} articles · {aggregatorSources.length} sources</span>
        </div>
        <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
          {allFeed.map((item) => {
            const agg = aggregatorSources.find((a) => item.aggregator === a.id || item.aggregator === "additional");
            const aggName = item.aggregator === "additional" ? "Direct Feed" : agg?.name ?? item.aggregator;
            return (
              <a
                key={item.id}
                href={item.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 transition hover:border-emerald-700/50 hover:bg-zinc-800/50"
              >
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-semibold text-zinc-300">{item.source}</span>
                  <span className="text-zinc-500">{item.time} IST</span>
                  <span className={`rounded-full px-1.5 py-0.5 font-medium ${sentBg(item.sentiment)}`}>
                    {sentLabel(item.sentiment)}
                  </span>
                  <span className="ml-auto text-zinc-600">{aggName}</span>
                </div>
                <p className="mt-0.5 text-sm font-medium text-zinc-200">{item.title}</p>
                <p className="mt-0.5 text-[11px] text-zinc-500">{item.summary}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.tickers.map((t) => (
                    <span key={t} className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-[9px] font-medium text-zinc-400">{t}</span>
                  ))}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
