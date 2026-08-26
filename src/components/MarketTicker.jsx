import { indices, stocks } from "../data/seedData.js";

export default function MarketTicker() {
  const tickerItems = [
    ...Object.values(indices).map((i) => ({ label: i.name, value: i.value.toLocaleString("en-IN"), change: i.change })),
    ...stocks.slice(0, 6).map((s) => ({ label: s.symbol, value: `₹${s.ltp.toFixed(2)}`, change: s.change })),
  ];
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
