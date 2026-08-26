import { insights } from "../data/seedData.js";

const COLOR_MAP = {
  emerald: { bg: "bg-emerald-500/5 border-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-300" },
  red: { bg: "bg-red-500/5 border-red-500/20", badge: "bg-red-500/10 text-red-300" },
  amber: { bg: "bg-amber-500/5 border-amber-500/20", badge: "bg-amber-500/10 text-amber-300" },
  blue: { bg: "bg-sky-500/5 border-sky-500/20", badge: "bg-sky-500/10 text-sky-300" },
};

export default function Insights() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-400">Direction Engine — Predictions</h3>
      <div className="max-h-[440px] space-y-3 overflow-y-auto pr-1">
        {insights.map((ins, i) => {
          const c = COLOR_MAP[ins.color] || COLOR_MAP.emerald;
          return (
            <div key={i} className={`rounded-lg border p-3 ${c.bg}`}>
              <div className="mb-1 flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${c.badge}`}>
                  {ins.direction}
                </span>
                <span className="text-[10px] uppercase text-zinc-500">Confidence: {ins.confidence}</span>
              </div>
              <p className="text-sm font-semibold text-zinc-100">{ins.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{ins.summary}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
