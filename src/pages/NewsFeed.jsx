import { useState, useMemo } from "react";
import { newsArticles, aggregatorNewsFeed, worldNews } from "../data/seedData.js";

function fmt(n) { return n.toLocaleString("en-IN"); }

const ALL = [
  ...newsArticles.map((a) => ({ ...a, region: "Indian", feed: "Indian Markets" })),
  ...aggregatorNewsFeed.map((a) => ({ ...a, region: "Indian", feed: a.aggregator })),
  ...worldNews.map((a) => ({ ...a, region: "World", feed: "Global" })),
].sort((a, b) => b.id.toString().localeCompare(a.id.toString()));

const SRC_COLORS = {
  "Economic Times": "#f59e0b", Moneycontrol: "#3b82f6", Livemint: "#06b6d4",
  "CNBC-TV18": "#ef4444", "Bloomberg Quint": "#8b5cf6", "Zee Business": "#eab308",
  "PIB India": "#10b981", "Business Standard": "#6366f1", RBI: "#f43f5e",
  Reuters: "#2563eb", Bloomberg: "#7c3aed", CNBC: "#0891b2",
  "Financial Times": "#f97316",
};

function sentBadge(s) {
  if (s > 0.3) return "bg-emerald-500/10 text-emerald-300";
  if (s > 0) return "bg-amber-500/10 text-amber-300";
  return "bg-red-500/10 text-red-300";
}
function sentLabel(s) {
  if (s > 0.3) return "Bullish";
  if (s > 0) return "Mild";
  return s > -0.3 ? "Neutral" : "Bearish";
}

export default function NewsFeed() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [count, setCount] = useState(25);

  const filtered = useMemo(() => {
    let items = ALL;
    if (filter === "indian") items = items.filter((a) => a.region === "Indian");
    if (filter === "world") items = items.filter((a) => a.region === "World");
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((a) => a.title.toLowerCase().includes(q) || a.summary?.toLowerCase().includes(q) || a.source.toLowerCase().includes(q));
    }
    return items;
  }, [filter, search]);

  const visible = filtered.slice(0, count);
  const hasMore = count < filtered.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">News Feed</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{fmt(filtered.length)} articles across {fmt(ALL.length)} total</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCount(25); }}
            placeholder="Search articles..."
            className="w-44 rounded-lg border border-zinc-800 bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-600" />
          {/* Region filter */}
          {["all", "indian", "world"].map((f) => (
            <button key={f} onClick={() => { setFilter(f); setCount(25); }}
              className={`rounded-md px-3 py-1.5 text-[11px] font-medium uppercase ${
                filter === f ? "bg-zinc-700 text-zinc-100" : "bg-zinc-800/60 text-zinc-500 hover:text-zinc-300"
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {/* News grid */}
      <div className="space-y-2">
        {visible.map((item) => (
          <a key={`${item.region}-${item.id}`} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
            className="group flex items-start gap-4 rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-4 transition hover:border-emerald-700/40 hover:bg-zinc-800/40">
            {/* Source icon */}
            <div className="hidden shrink-0 sm:flex">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg text-[11px] font-bold uppercase text-white"
                style={{ backgroundColor: SRC_COLORS[item.source] || "#52525b" }}>
                {item.sourceIcon || item.icon || item.source.slice(0, 2)}
              </span>
            </div>
            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                <span className="font-semibold text-zinc-300">{item.source}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-500">{item.time} {item.region === "World" ? "UTC" : "IST"}</span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${sentBadge(item.sentiment)}`}>
                  {sentLabel(item.sentiment)}
                </span>
                <span className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-[9px] text-zinc-500">{item.region}</span>
              </div>
              <p className="mt-1 text-sm font-semibold leading-snug text-zinc-200 group-hover:text-emerald-300">
                {item.title}
              </p>
              {item.summary && (
                <p className="mt-1 text-xs leading-relaxed text-zinc-500 line-clamp-2">{item.summary}</p>
              )}
              {item.tickers && item.tickers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tickers.map((t) => (
                    <span key={t} className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-[9px] font-medium text-zinc-400">{t}</span>
                  ))}
                </div>
              )}
            </div>
            {/* Feed source */}
            <div className="hidden shrink-0 text-right lg:block">
              <p className="text-[9px] text-zinc-600">{item.feed}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Load more */}
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
