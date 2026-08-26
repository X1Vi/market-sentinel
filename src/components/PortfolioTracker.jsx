import { useState, useMemo } from "react";
import { portfolioTracker } from "../data/seedData.js";

export default function PortfolioTracker() {
  const seed = portfolioTracker;

  const [sipAmount, setSipAmount] = useState(seed.sipMonthly);
  const [totalInvested, setTotalInvested] = useState(seed.totalInvested);
  const [currentValue, setCurrentValue] = useState(seed.currentValue);
  const [niftyPct, setNiftyPct] = useState(seed.currentAllocation.niftybees);
  const [goldPct, setGoldPct] = useState(seed.currentAllocation.goldbees);
  const [sipLog, setSipLog] = useState(seed.sipHistory.map((h) => ({ ...h })));

  const niftyVal = useMemo(() => Math.round(currentValue * niftyPct / 100), [currentValue, niftyPct]);
  const goldVal = useMemo(() => Math.round(currentValue * goldPct / 100), [currentValue, goldPct]);
  const totalReturn = useMemo(() => totalInvested > 0 ? ((currentValue / totalInvested) - 1) * 100 : 0, [currentValue, totalInvested]);
  const devNifty = useMemo(() => niftyPct - seed.targetAllocation.niftybees, [niftyPct]);
  const devGold = useMemo(() => goldPct - seed.targetAllocation.goldbees, [goldPct]);
  const needRebalance = Math.abs(devNifty) > 5 || Math.abs(devGold) > 5;

  const addContribution = () => {
    const newInvested = totalInvested + sipAmount;
    setTotalInvested(newInvested);
    const newValue = currentValue + sipAmount;
    setCurrentValue(newValue);
    const now = new Date();
    const label = now.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    setSipLog((prev) => [...prev, { month: label, invested: sipAmount, value: newValue }]);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">50/50 Portfolio</h3>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${needRebalance ? "bg-amber-500/10 text-amber-300" : "bg-emerald-500/10 text-emerald-300"}`}>
          {needRebalance ? "REBALANCE" : "ON TRACK"}
        </span>
      </div>

      {/* Allocation sliders */}
      <div className="mb-3 space-y-2">
        <div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-zinc-200">NIFTYBEES</span>
            <span className="font-semibold text-zinc-100">{niftyPct}%</span>
          </div>
          <input type="range" min={10} max={90} value={niftyPct} onChange={(e) => setNiftyPct(Number(e.target.value))} className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-700/60 accent-emerald-500" />
          <p className="mt-0.5 text-[9px] text-zinc-500">
            Target {seed.targetAllocation.niftybees}% · {devNifty >= 0 ? "+" : ""}{devNifty}% deviation · ₹{niftyVal.toLocaleString()}
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-zinc-200">GOLDBEES</span>
            <span className="font-semibold text-amber-400">{goldPct}%</span>
          </div>
          <input type="range" min={10} max={90} value={goldPct} onChange={(e) => setGoldPct(Number(e.target.value))} className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-700/60 accent-amber-400" />
          <p className="mt-0.5 text-[9px] text-zinc-500">
            Target {seed.targetAllocation.goldbees}% · {devGold >= 0 ? "+" : ""}{devGold}% deviation · ₹{goldVal.toLocaleString()}
          </p>
        </div>
      </div>

      {/* SIP input + Contribute */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex-1">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Monthly SIP</p>
          <div className="mt-0.5 flex items-center rounded-lg bg-zinc-800/60 px-2.5 py-1.5">
            <span className="text-xs text-zinc-400">₹</span>
            <input type="number" value={sipAmount} onChange={(e) => setSipAmount(Math.max(0, Number(e.target.value)))} className="ml-1 w-full bg-transparent text-xs font-medium text-zinc-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
          </div>
        </div>
        <button onClick={addContribution} className="mt-4 self-end rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-emerald-500 active:scale-95">
          + Contribute
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
        <div className="rounded bg-zinc-800/50 p-1.5">
          <p className="text-[9px] text-zinc-500">Invested</p>
          <p className="font-semibold text-zinc-100">₹{totalInvested.toLocaleString()}</p>
        </div>
        <div className="rounded bg-zinc-800/50 p-1.5">
          <p className="text-[9px] text-zinc-500">Value</p>
          <input type="number" value={currentValue} onChange={(e) => setCurrentValue(Math.max(0, Number(e.target.value)))}
            className="w-full bg-transparent text-center font-semibold text-emerald-400 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
        </div>
        <div className="rounded bg-zinc-800/50 p-1.5">
          <p className="text-[9px] text-zinc-500">Return</p>
          <p className={`font-semibold ${totalReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>{totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(1)}%</p>
        </div>
        <div className="rounded bg-zinc-800/50 p-1.5">
          <p className="text-[9px] text-zinc-500">Max DD</p>
          <p className="font-semibold text-red-400">-{seed.maxDrawdown}%</p>
        </div>
      </div>

      {/* SIP log */}
      {sipLog.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-[9px] uppercase tracking-wider text-zinc-500">Contribution Log</p>
          <div className="max-h-24 space-y-0.5 overflow-y-auto">
            {sipLog.map((h, i) => (
              <div key={i} className="flex justify-between rounded bg-zinc-800/30 px-2 py-1 text-[10px]">
                <span className="text-zinc-400">{h.month}</span>
                <span className="text-zinc-300">₹{h.invested.toLocaleString()}</span>
                <span className="text-zinc-400">→ ₹{h.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {needRebalance && (
        <div className="mt-2 rounded-lg bg-amber-500/10 p-2 text-[11px] text-amber-300">
          ⚠️ Deviation above 5% — adjust sliders to rebalance
        </div>
      )}
    </div>
  );
}
