const ITEMS = [
  ["USD/INR", "₹83.42", "-0.12%"],
  ["Crude", "$81.85", "-1.4%"],
  ["Gold 10g", "₹72,450", "+0.48%"],
  ["India 10Y", "7.12%", "—"],
  ["VIX", "13.8", "-2.1%"],
  ["FII (₹ Cr)", "+3,420", "—"],
  ["DII (₹ Cr)", "+2,100", "—"],
];

export default function MacroStrip() {
  return (
    <div className="overflow-hidden border-b border-zinc-800 bg-zinc-900/50">
      <div className="ticker-track flex gap-0 whitespace-nowrap">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <div key={i} className="flex items-center gap-2 border-r border-zinc-800/60 px-5 py-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{item[0]}</span>
            <span className="text-xs font-semibold text-zinc-200">{item[1]}</span>
            <span className={`text-[10px] ${item[2].startsWith("+") ? "text-emerald-400" : item[2].startsWith("-") ? "text-red-400" : "text-zinc-500"}`}>
              {item[2]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
