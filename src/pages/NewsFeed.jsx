import { useState, useMemo } from "react";
import { useLiveData, fetchAllNews } from "../api/liveData.js";

function fmt(n) { return n.toLocaleString("en-IN"); }

const SRC_COLORS = {
  "Economic Times": "#f59e0b", Moneycontrol: "#3b82f6", Livemint: "#06b6d4",
  "CNBC-TV18": "#ef4444", "Bloomberg Quint": "#8b5cf6", "Zee Business": "#eab308",
  "PIB India": "#10b981", "Business Standard": "#6366f1", RBI: "#f43f5e",
  Reuters: "#2563eb", Bloomberg: "#7c3aed", CNBC: "#0891b2", "Financial Times": "#f97316",
};

function sentBadge(s) {
  if (s > 0.3) return "bg-emerald-500/10 text-emerald-300";
  if (s > 0) return "bg-amber-500/10 text-amber-300";
  return "bg-red-500/10 text-red-300";
}

export default function NewsFeed() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [count, setCount] = useState(25);

  // Fetch live data from all aggregators
  const { data: liveArticles } = useLiveData(
    () => fetchAllNews({ region: filter, max: 80 }),
    null,
    120000 // every 2 min
  );

  const filtered = useMemo(() => {
    let items = liveArticles || [];
    if (filter !== "all") items = items.filter((a) => (a.region || "").toLowerCase() === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((a) => a.title?.toLowerCase().includes(q) || a.summary?.toLowerCase().includes(q) || a.source?.toLowerCase().includes(q));
    }
    return items;
  }, [liveArticles, filter, search]);

  const visible = filtered.slice(0, count);
  const hasMore = count < filtered.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">News Feed <span className="text-[10px] font-normal text-emerald-500">● LIVE</span></h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {fmt(filtered.length)} articles · GDELT + RSSHub + Indian sources · refreshes every 2 min
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCount(25); }}
            placeholder="Search articles..."
            className="w-44 rounded-lg border border-zinc-800 bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-600" />
          {["all", "indian", "world"].map((f) => (
            <button key={f} onClick={() => { setFilter(f); setCount(25); }}
              className={`rounded-md px-3 py-1.5 text-[11px] font-medium uppercase ${
                filter === f ? "bg-zinc-700 text-zinc-100" : "bg-zinc-800/60 text-zinc-500 hover:text-zinc-300"
              }`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {visible.map((item, i) => (
          <a key={`${item.id || i}-${item.source}`} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
            className="group flex items-start gap-4 rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-4 transition hover:border-emerald-700/40 hover:bg-zinc-800/40">
            <div className="hidden shrink-0 sm:flex">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg text-[11px] font-bold uppercase text-white"
                style={{ backgroundColor: SRC_COLORS[item.source] || "#52525b" }}>
                {item.sourceIcon || item.source?.slice(0, 2) || "NN"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                <span className="font-semibold text-zinc-300">{item.source || "Unknown"}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-500">{item.time || ""}</span>
                {item.sentiment !== undefined && (
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${sentBadge(item.sentiment)}`}>
                    {item.sentiment > 0.3 ? "Bullish" : item.sentiment > 0 ? "Mild" : item.sentiment > -0.3 ? "Neutral" : "Bearish"}
                  </span>
                )}
                {item.region && (
                  <span className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-[9px] text-zinc-500">{item.region}</span>
                )}
              </div>
              <p className="mt-1 text-sm font-semibold leading-snug text-zinc-200 group-hover:text-emerald-300">{item.title}</p>
              {item.summary && <p className="mt-1 text-xs leading-relaxed text-zinc-500 line-clamp-2">{item.summary}</p>}
              {item.tickers?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tickers.map((t) => <span key={t} className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-[9px] font-medium text-zinc-400">{t}</span>)}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center py-4">
          <button onClick={() => setCount((c) => c + 25)}
            className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-8 py-2 text-xs font-medium text-zinc-300 transition hover:border-emerald-700 hover:text-emerald-300">
            Load {Math.min(25, filtered.length - count)} more articles
          </button>
        </div>
      )}
    </div>
  );
}
