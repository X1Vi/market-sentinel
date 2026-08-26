import { useState } from "react";
import { generateSp500Intraday, worldIndices, currencies, commodities, worldNews, globalSentimentStats } from "../data/seedData.js";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

const PIECOLORS = ["#22c55e", "#ef4444", "#52525b"];

function fmt(n) { return n.toLocaleString("en-IN"); }

export default function WorldMarkets() {
  const [spxData] = useState(() => generateSp500Intraday());
  const last = spxData[spxData.length - 1];
  const open = spxData[0];
  const change = last.price - open.price;
  const isUp = change >= 0;
  const color = isUp ? "#22c55e" : "#ef4444";

  const pieData = [
    { name: "Positive", value: globalSentimentStats.positivePct },
    { name: "Negative", value: globalSentimentStats.negativePct },
    { name: "Neutral", value: globalSentimentStats.neutralPct },
  ];

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">World Markets</h1>
        <p className="mt-1 text-sm text-zinc-500">Global indices, currencies, commodities, and international news sentiment</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Markets Tracked</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{worldIndices.length}</p>
          <p className="mt-1 text-xs text-zinc-600">{worldIndices.filter(i => i.change >= 0).length} advancing</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Currencies</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{currencies.length}</p>
          <p className="mt-1 text-xs text-zinc-600">{currencies.filter(c => c.direction === "bullish").length} bullish</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Articles Today</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{fmt(globalSentimentStats.totalArticlesToday)}</p>
          <p className="mt-1 text-xs text-zinc-600">{globalSentimentStats.sources.length} sources</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Global Sentiment</p>
          <p className={`mt-1 text-2xl font-bold ${globalSentimentStats.overallAvgSentiment > 0.15 ? "text-emerald-400" : "text-amber-400"}`}>
            {globalSentimentStats.overallAvgSentiment > 0 ? "+" : ""}{globalSentimentStats.overallAvgSentiment.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-zinc-600">{globalSentimentStats.positivePct}% positive</p>
        </div>
      </div>

      {/* S&P 500 chart + Sentiment pie */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-zinc-400">S&P 500</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-zinc-100">{last.price.toFixed(2)}</span>
                <span className={`text-sm font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                  {change >= 0 ? "+" : ""}{change.toFixed(2)} ({isUp ? "+" : ""}{((change / open.price) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {["US", "Europe", "Asia"].map((r) => (
                <span key={r} className="rounded bg-zinc-800/60 px-2 py-1 text-[10px] text-zinc-400">{r}</span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={spxData}>
              <defs>
                <linearGradient id="spxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
              <XAxis dataKey="time" tick={{ fill: "#71717a", fontSize: 9 }} interval={9} />
              <YAxis domain={["auto", "auto"]} tick={{ fill: "#71717a", fontSize: 9 }} orientation="right" />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
              <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#spxGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment pie */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">Global News Sentiment</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2}>
                {pieData.map((_, i) => <Cell key={i} fill={PIECOLORS[i % PIECOLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-around text-center text-[11px]">
            <div><p className="text-lg font-bold text-emerald-400">{globalSentimentStats.positivePct}%</p><p className="text-[9px] text-zinc-500">Positive</p></div>
            <div><p className="text-lg font-bold text-red-400">{globalSentimentStats.negativePct}%</p><p className="text-[9px] text-zinc-500">Negative</p></div>
            <div><p className="text-lg font-bold text-zinc-400">{globalSentimentStats.neutralPct}%</p><p className="text-[9px] text-zinc-500">Neutral</p></div>
          </div>
          <div className="mt-2 space-y-1">
            {globalSentimentStats.topMovers.map((m) => (
              <span key={m} className="mr-1 inline-block rounded bg-zinc-800/60 px-1.5 py-0.5 text-[9px] text-zinc-400">{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* World indices table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Global Indices</h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {worldIndices.map((idx) => (
            <div key={idx.symbol} className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-zinc-200">{idx.symbol}</span>
                <span className="rounded bg-zinc-800/60 px-1 py-0.5 text-[8px] text-zinc-500">{idx.region}</span>
              </div>
              <p className="mt-1 text-sm font-bold text-zinc-100">{idx.value.toLocaleString()}</p>
              <p className={`text-[10px] font-semibold ${idx.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {idx.change >= 0 ? "+" : ""}{idx.change.toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Currencies + Commodities */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">Currencies</h3>
          <div className="space-y-1.5">
            {currencies.map((c) => (
              <div key={c.pair} className="flex items-center justify-between rounded border border-zinc-800/60 bg-zinc-900/60 px-3 py-2">
                <span className="text-[11px] font-semibold text-zinc-200">{c.pair}</span>
                <span className="text-[11px] font-medium text-zinc-100">{c.rate.toFixed(c.rate < 10 ? 4 : 2)}</span>
                <span className={`text-[10px] font-medium ${c.change.startsWith("+") ? "text-emerald-400" : c.change.startsWith("-") ? "text-red-400" : "text-zinc-400"}`}>{c.change}</span>
                <span className={`text-[9px] ${c.direction === "bullish" ? "text-emerald-400" : c.direction === "bearish" ? "text-red-400" : "text-zinc-500"}`}>{c.direction}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">Commodities</h3>
          <div className="space-y-1.5">
            {commodities.map((c) => (
              <div key={c.symbol} className="flex items-center justify-between rounded border border-zinc-800/60 bg-zinc-900/60 px-3 py-2">
                <div>
                  <p className="text-[11px] font-semibold text-zinc-200">{c.name}</p>
                  <p className="text-[8px] text-zinc-500">{c.symbol}</p>
                </div>
                <span className="text-[11px] font-medium text-zinc-100">{c.symbol === "XAU/USD" || c.symbol === "XAG/USD" ? `$${c.price.toFixed(c.symbol === "XAU/USD" ? 2 : 2)}` : `$${c.price.toFixed(2)}`}</span>
                <span className={`text-[10px] font-medium ${c.change.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{c.change}</span>
                <span className={`text-[9px] ${c.sentiment === "bullish" ? "text-emerald-400" : "text-red-400"}`}>{c.sentiment}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* World news feed */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-400">World News Feed</h3>
          <span className="text-[10px] text-zinc-500">{worldNews.length} articles · {globalSentimentStats.sources.join(", ")}</span>
        </div>
        <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
          {worldNews.map((item) => (
            <a key={item.id} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
              className="block rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 transition hover:border-emerald-700/50 hover:bg-zinc-800/50">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-semibold text-zinc-300">{item.icon}</span>
                <span className="text-zinc-500">{item.time} UTC</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                  item.sentiment > 0.3 ? "bg-emerald-500/10 text-emerald-300" : item.sentiment > 0 ? "bg-amber-500/10 text-amber-300" : "bg-red-500/10 text-red-300"
                }`}>{item.label}</span>
              </div>
              <p className="mt-0.5 text-sm font-medium text-zinc-200">{item.title}</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">{item.summary}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {item.tickers.map((t) => (
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
