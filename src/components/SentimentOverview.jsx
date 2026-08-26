import { useState } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis } from "recharts";
import { generateSentimentTrend, newsArticles } from "../data/seedData.js";

export default function SentimentOverview() {
  const [trend] = useState(() => generateSentimentTrend());

  const avgSentiment = newsArticles.reduce((s, a) => s + a.sentiment, 0) / newsArticles.length;
  const positiveCount = newsArticles.filter((a) => a.sentiment > 0.2).length;
  const negativeCount = newsArticles.filter((a) => a.sentiment < -0.1).length;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-400">Market Sentiment</h3>

      <div className="relative mx-auto mb-4 flex h-24 w-48 items-end justify-center overflow-hidden">
        <div className="absolute bottom-0 h-24 w-48 rounded-t-full bg-zinc-800/60" />
        <div
          className="absolute bottom-0 h-24 w-48 rounded-t-full transition-all duration-1000"
          style={{ background: `conic-gradient(from 180deg, #ef4444 0deg, #f59e0b 45deg, #22c55e 90deg, transparent 90deg 180deg)` }}
        />
        <div className="z-10 mb-2 text-center">
          <span className={`text-2xl font-bold ${avgSentiment > 0.2 ? "text-emerald-400" : avgSentiment < -0.1 ? "text-red-400" : "text-amber-400"}`}>
            {avgSentiment > 0.2 ? "BULLISH" : avgSentiment < -0.1 ? "BEARISH" : "NEUTRAL"}
          </span>
          <p className="text-[11px] text-zinc-500">{avgSentiment.toFixed(2)} / +1.00</p>
        </div>
      </div>

      <div className="mb-3 flex justify-between text-center">
        <div>
          <p className="text-lg font-bold text-emerald-400">{positiveCount}</p>
          <p className="text-[10px] uppercase text-zinc-500">Positives</p>
        </div>
        <div>
          <p className="text-lg font-bold text-red-400">{negativeCount}</p>
          <p className="text-[10px] uppercase text-zinc-500">Negatives</p>
        </div>
        <div>
          <p className="text-lg font-bold text-zinc-300">{newsArticles.length - positiveCount - negativeCount}</p>
          <p className="text-[10px] uppercase text-zinc-500">Neutral</p>
        </div>
      </div>

      <h4 className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">30-Day Trend</h4>
      <ResponsiveContainer width="100%" height={110}>
        <LineChart data={trend}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
          <XAxis dataKey="date" tick={{ fill: "#52525b", fontSize: 8 }} interval={6} />
          <YAxis domain={[-0.3, 0.7]} tick={{ fill: "#52525b", fontSize: 8 }} />
          <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }} />
          <Line type="monotone" dataKey="sentiment" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
