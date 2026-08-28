import { useState } from "react";
import { useLiveData, fetchAllNews } from "../api/liveData.js";

function sentStyle(n) {
  if (n > 0.4) return { bg: "bg-emerald-500/10", text: "text-emerald-300" };
  if (n > 0) return { bg: "bg-amber-500/10", text: "text-amber-300" };
  if (n > -0.3) return { bg: "bg-zinc-500/10", text: "text-zinc-400" };
  return { bg: "bg-red-500/10", text: "text-red-300" };
}

const SRC_COLORS = {
  "Economic Times": "#f59e0b", Moneycontrol: "#3b82f6", Livemint: "#06b6d4",
  "CNBC-TV18": "#ef4444", "Bloomberg Quint": "#8b5cf6", "Zee Business": "#eab308",
  "PIB India": "#10b981", "Business Standard": "#6366f1", RBI: "#f43f5e",
};

export default function NewsFeed() {
  const [filter, setFilter] = useState("all");
  const { data: liveArticles } = useLiveData(() => fetchAllNews({ region: filter, max: 30 }), null, 120000);
  const articles = liveArticles || [];

  const filtered = filter === "all" ? articles
    : filter === "positive" ? articles.filter((n) => (n.sentiment || 0) > 0.2)
    : articles.filter((n) => (n.sentiment || 0) < -0.1);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Latest News Sentiment {liveArticles ? "● LIVE" : ""}</h3>
        <div className="flex gap-1">
          {["all", "positive", "negative"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium uppercase ${filter === f ? "bg-zinc-700 text-zinc-100" : "bg-zinc-800/60 text-zinc-500 hover:text-zinc-300"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
        {filtered.map((item, i) => {
          const s = sentStyle(item.sentiment || 0);
          return (
            <a key={item.id || i} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
              className="block rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 transition hover:border-emerald-700/50 hover:bg-zinc-800/50">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white"
                  style={{ backgroundColor: SRC_COLORS[item.source] || "#52525b" }}>
                  {item.sourceIcon || item.source?.slice(0, 2) || "NN"}
                </span>
                <span className="text-[10px] text-zinc-500">{item.time || ""}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.bg} ${s.text}`}>
                  {item.sentimentLabel || "—"}
                </span>
              </div>
              <p className="text-sm font-medium leading-snug text-zinc-200">{item.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{item.summary || ""}</p>
              {item.tickers?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tickers.map((t) => <span key={t} className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">{t}</span>)}
                </div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
