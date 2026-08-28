import { useLiveData, fetchIndices, fetchStocks } from "../api/liveData.js";

export default function MarketTicker() {
  const { data: indices } = useLiveData(fetchIndices, null, 30000);
  const { data: stockList } = useLiveData(fetchStocks, null, 60000);

  const all = [
    ...(indices ? Object.values(indices) : []),
    ...(stockList || []).slice(0, 6),
  ];
  if (!all.length) return null;

  const tickerItems = all.map((item) => {
    const isIndex = "name" in item;
    const label = isIndex ? item.name : item.symbol;
    const value = isIndex ? item.value.toLocaleString("en-IN") : `₹${item.ltp.toFixed(2)}`;
    return { label, value, change: item.change };
  });

  return (
    <div className="overflow-hidden border-b border-zinc-800 bg-zinc-900/30">
      <div className="ticker-track flex gap-0 whitespace-nowrap">
        {[...tickerItems, ...tickerItems].map((item, i) => (
          <div key={i} className="flex items-center gap-2 border-r border-zinc-800/60 px-4 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{item.label}</span>
            <span className="text-xs font-medium text-zinc-200">{item.value}</span>
            <span className={`text-[10px] font-semibold ${item.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
