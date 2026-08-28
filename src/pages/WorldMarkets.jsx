import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart,
  PieChart, Pie, Cell,
} from "recharts";
import { useLiveData, fetchIndices, fetchCommodities, fetchCurrencies, fetchGdeltNews, fetchNiftyIntraday } from "../api/liveData.js";
import { worldIndices as seedIndices, worldNews as seedWorldNews, globalSentimentStats } from "../data/seedData.js";

const PIECOLORS = ["#22c55e", "#ef4444", "#52525b"];

function fmt(n) { return n.toLocaleString("en-IN"); }

export default function WorldMarkets() {
  const { data: liveIndices } = useLiveData(fetchIndices, null, 30000);
  const { data: commodities } = useLiveData(fetchCommodities, null, 60000);
  const { data: currencies } = useLiveData(fetchCurrencies, null, 60000);
  const { data: spxData } = useLiveData(fetchNiftyIntraday, null, 60000);
  const { data: gdelt } = useLiveData(() => fetchGdeltNews("global stock market economy finance", 15), null, 120000);

  const [seedSpx] = useState(() => {
    const points = []; let p = 5810;
    for (let i = 0; i < 50; i++) { p += (Math.random() - 0.5) * 6; points.push({ time: `${i}`, price: +p.toFixed(2) }); }
    return points;
  });

  const indices = liveIndices ? Object.values(liveIndices) : seedIndices;
  const chartData = spxData || seedSpx;
  const worldNews = gdelt || seedWorldNews;
  const comm = commodities || [{ name: "Gold", symbol: "XAU", price: 2512, change: "+0.48%", sentiment: "bullish" }];
  const curr = currencies || [{ pair: "USD/INR", rate: 83.42, change: "—", direction: "neutral" }];

  const last = chartData[chartData.length - 1];
  const open = chartData[0];
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
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">World Markets {liveIndices ? "● LIVE" : ""}</h1>
        <p className="mt-1 text-sm text-zinc-500">Global indices, currencies, commodities, and international news</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Markets</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{indices.length}</p>
          <p className="mt-1 text-xs text-zinc-600">{indices.filter(i => (i.change || 0) >= 0).length} advancing</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Currencies</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{curr.length}</p>
          <p className="mt-1 text-xs text-zinc-600">{curr.filter(c => c.direction === "bullish").length} bullish</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Articles</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{worldNews.length}</p>
          <p className="mt-1 text-xs text-zinc-600">{gdelt ? "GDELT live" : "seed"}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Sentiment</p>
          <p className={`mt-1 text-2xl font-bold ${globalSentimentStats.overallAvgSentiment > 0.15 ? "text-emerald-400" : "text-amber-400"}`}>
            {globalSentimentStats.overallAvgSentiment > 0 ? "+" : ""}{globalSentimentStats.overallAvgSentiment.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-zinc-600">{globalSentimentStats.positivePct}% positive</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-zinc-400">S&P 500 {spxData ? "● LIVE" : ""}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-zinc-100">{last.price.toFixed(2)}</span>
                <span className={`text-sm font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                  {change >= 0 ? "+" : ""}{change.toFixed(2)} ({isUp ? "+" : ""}{((change / open.price) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="flex gap-2">{["US", "Europe", "Asia"].map((r) => <span key={r} className="rounded bg-zinc-800/60 px-2 py-1 text-[10px] text-zinc-400">{r}</span>)}</div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs><linearGradient id="spxGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.25} /><stop offset="100%" stopColor={color} stopOpacity={0.01} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
              <XAxis dataKey="time" tick={{ fill: "#71717a", fontSize: 9 }} interval={9} />
              <YAxis domain={["auto", "auto"]} tick={{ fill: "#71717a", fontSize: 9 }} orientation="right" />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} />
              <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#spxGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">Global Sentiment {gdelt ? "● LIVE" : ""}</h3>
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
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Global Indices</h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {indices.map((idx) => {
            const val = idx.value || idx.price || 0;
            const ch = idx.change || 0;
            return (
              <div key={idx.symbol || idx.name} className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-zinc-200">{idx.symbol || (idx.name || "").slice(0, 4)}</span>
                  <span className="rounded bg-zinc-800/60 px-1 py-0.5 text-[8px] text-zinc-500">{idx.region || "Global"}</span>
                </div>
                <p className="mt-1 text-sm font-bold text-zinc-100">{typeof val === "number" ? val.toLocaleString() : val}</p>
                <p className={`text-[10px] font-semibold ${ch >= 0 ? "text-emerald-400" : "text-red-400"}`}>{ch >= 0 ? "+" : ""}{ch.toFixed(2)}%</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">Currencies {currencies ? "● LIVE" : ""}</h3>
          <div className="space-y-1.5">
            {curr.map((c) => (
              <div key={c.pair} className="flex items-center justify-between rounded border border-zinc-800/60 bg-zinc-900/60 px-3 py-2">
                <span className="text-[11px] font-semibold text-zinc-200">{c.pair}</span>
                <span className="text-[11px] font-medium text-zinc-100">{typeof c.rate === "number" ? c.rate.toFixed(c.rate < 10 ? 4 : 2) : c.rate}</span>
                <span className={`text-[10px] font-medium ${c.change?.startsWith("+") ? "text-emerald-400" : c.change?.startsWith("-") ? "text-red-400" : "text-zinc-400"}`}>{c.change || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">Commodities {commodities ? "● LIVE" : ""}</h3>
          <div className="space-y-1.5">
            {comm.map((c) => (
              <div key={c.symbol} className="flex items-center justify-between rounded border border-zinc-800/60 bg-zinc-900/60 px-3 py-2">
                <div><p className="text-[11px] font-semibold text-zinc-200">{c.name}</p><p className="text-[8px] text-zinc-500">{c.symbol}</p></div>
                <span className="text-[11px] font-medium text-zinc-100">${typeof c.price === "number" ? c.price.toFixed(2) : c.price}</span>
                <span className={`text-[10px] font-medium ${c.change?.startsWith("+") ? "text-emerald-400" : (c.change || "").startsWith("-") ? "text-red-400" : "text-zinc-400"}`}>{c.change || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-400">World News {gdelt ? "● LIVE" : ""}</h3>
          <span className="text-[10px] text-zinc-500">{worldNews.length} articles</span>
        </div>
        <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
          {worldNews.slice(0, 15).map((item, i) => (
            <a key={item.id || i} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
              className="block rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 transition hover:border-emerald-700/50 hover:bg-zinc-800/50">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-semibold text-zinc-300">{item.sourceIcon || item.source?.slice(0, 2) || "NN"}</span>
                <span className="text-zinc-500">{item.time || ""}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${(item.sentiment || 0) > 0.3 ? "bg-emerald-500/10 text-emerald-300" : (item.sentiment || 0) > 0 ? "bg-amber-500/10 text-amber-300" : "bg-red-500/10 text-red-300"}`}>
                  {(item.sentiment || 0) > 0.3 ? "BULLISH" : (item.sentiment || 0) > 0 ? "POSITIVE" : "NEUTRAL"}
                </span>
              </div>
              <p className="mt-0.5 text-sm font-medium text-zinc-200">{item.title}</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">{item.summary || ""}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
