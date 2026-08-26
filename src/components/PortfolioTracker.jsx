import { useState, useMemo, useCallback } from "react";
import { portfolioTracker } from "../data/seedData.js";

function fmt(n) { return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 }); }
function fmtPct(n, d = 1) { return `${n >= 0 ? "+" : ""}${Number(n).toFixed(d)}%`; }

function monthsBetween(a, b) {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

// ── SIP engine (extracted, no side effects) ─────────────────
function computeSip(params) {
  const { startMonth, startYear, endMonth, endYear, sipMonthly, annualIncrement, niftyCagr, goldCagr, targetNifty, targetGold } = params;
  const now = new Date();
  const start = new Date(startYear, startMonth - 1, 1);
  if (start > now) return { rows: [], totalInv: 0, totalCur: 0, niftyInv: 0, goldInv: 0, niftyCur: 0, goldCur: 0 };

  // Use end date if set, otherwise now
  const hasEnd = endMonth > 0 && endYear > 0;
  const end = hasEnd ? new Date(endYear, endMonth - 1, 1) : now;
  // Use end date as cutoff if set (projection), otherwise now
  const cutoff = hasEnd ? end : now; // SIPs stop at end, growth calculated to now

  let totalMonths = monthsBetween(start, cutoff);
  if (totalMonths < 0) return { rows: [], totalInv: 0, totalCur: 0, niftyInv: 0, goldInv: 0, niftyCur: 0, goldCur: 0 };
  totalMonths = Math.max(1, totalMonths);

  const rows = [];
  let niftyInv = 0, goldInv = 0, niftyCur = 0, goldCur = 0;

  for (let m = 0; m <= totalMonths; m++) {
    const sipDate = new Date(start);
    sipDate.setMonth(sipDate.getMonth() + m);
    if (sipDate > cutoff) break;

    const yearsElapsed = Math.floor(m / 12);
    const sipAmt = Math.round(sipMonthly * Math.pow(1 + annualIncrement / 100, yearsElapsed));
    const niftyAmt = Math.round(sipAmt * targetNifty / 100);
    const goldAmt = sipAmt - niftyAmt;

    // Growth always calculated to now (current value)
    // Future SIPs get monthsActive = 0 (no growth yet)
    const monthsActive = Math.max(0, monthsBetween(sipDate, now));
    const yearsActive = monthsActive / 12;

    const niftyFactor = Math.pow(1 + niftyCagr / 100, yearsActive);
    const goldFactor = Math.pow(1 + goldCagr / 100, yearsActive);

    const niftyNow = +(niftyAmt * niftyFactor).toFixed(2);
    const goldNow = +(goldAmt * goldFactor).toFixed(2);

    niftyInv += niftyAmt;
    goldInv += goldAmt;
    niftyCur += niftyNow;
    goldCur += goldNow;

    rows.push({
      label: sipDate.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      niftyAmt, goldAmt, niftyNow, goldNow, monthsActive,
    });
  }

  return { rows, totalInv: niftyInv + goldInv, totalCur: +(niftyCur + goldCur).toFixed(2), niftyInv, goldInv, niftyCur: +niftyCur.toFixed(2), goldCur: +goldCur.toFixed(2) };
}

// ── Simple number input handler (no clamping) ──────────────
function onNum(setter) {
  return (e) => setter(e.target.value === "" ? 0 : Number(e.target.value));
}

// ── Component ──────────────────────────────────────────────
export default function PortfolioTracker() {
  const seed = portfolioTracker;

  const [startMonth, setStartMonth] = useState(seed.sipStart.month);
  const [startYear, setStartYear] = useState(seed.sipStart.year);
  const [endMonth, setEndMonth] = useState(0);
  const [endYear, setEndYear] = useState(0);
  const [sipAmount, setSipAmount] = useState(seed.sipMonthly);
  const [annualInc, setAnnualInc] = useState(seed.sipAnnualIncrement);
  const [niftyCagr, setNiftyCagr] = useState(seed.expectedReturns.niftybees);
  const [goldCagr, setGoldCagr] = useState(seed.expectedReturns.goldbees);
  const [targetNifty, setTargetNifty] = useState(seed.targetRatio.niftybees);
  const targetGold = 100 - targetNifty;

  // Override current values (empty = use computed)
  const [ovNifty, setOvNifty] = useState("");
  const [ovGold, setOvGold] = useState("");

  // Extra contribution tracking
  const [extraAmt, setExtraAmt] = useState(0);
  const [extraNiftyInv, setExtraNiftyInv] = useState(0);
  const [extraGoldInv, setExtraGoldInv] = useState(0);
  const [extraLog, setExtraLog] = useState([]);

  // ── compute SIP projection ──
  const sip = useMemo(
    () => computeSip({ startMonth, startYear, endMonth, endYear, sipMonthly: sipAmount, annualIncrement: annualInc, niftyCagr, goldCagr, targetNifty, targetGold }),
    [startMonth, startYear, endMonth, endYear, sipAmount, annualInc, niftyCagr, goldCagr, targetNifty, targetGold],
  );

  // Total invested = SIP invested + extra contributions
  const totalNiftyInv = sip.niftyInv + extraNiftyInv;
  const totalGoldInv = sip.goldInv + extraGoldInv;
  const totalInvested = totalNiftyInv + totalGoldInv;

  // Current value = computed from SIP (or override) + extra (which also grew)
  // Override replaces the SIP-computed current value for that asset
  const niftyCur = ovNifty !== "" ? Number(ovNifty) : sip.niftyCur;
  const goldCur = ovGold !== "" ? Number(ovGold) : sip.goldCur;
  const totalCur = niftyCur + goldCur;

  // Returns use totalInvested (includes extra) and totalCur
  const niftyRet = totalNiftyInv > 0 ? (niftyCur / totalNiftyInv - 1) * 100 : 0;
  const goldRet = totalGoldInv > 0 ? (goldCur / totalGoldInv - 1) * 100 : 0;
  const totalRet = totalInvested > 0 ? (totalCur / totalInvested - 1) * 100 : 0;

  const niftyPct = totalCur > 0 ? (niftyCur / totalCur) * 100 : 50;
  const goldPct = 100 - niftyPct;
  const devNifty = niftyPct - targetNifty;
  const needRebalance = Math.abs(devNifty) > 5;

  const addExtra = useCallback(() => {
    if (extraAmt <= 0) return;
    const niftyAdd = Math.round(extraAmt * targetNifty / 100);
    const goldAdd = extraAmt - niftyAdd;
    setExtraNiftyInv((v) => v + niftyAdd);
    setExtraGoldInv((v) => v + goldAdd);
    // Always set override so current value includes extra
    setOvNifty(String(niftyCur + niftyAdd));
    setOvGold(String(goldCur + goldAdd));
    const now = new Date();
    setExtraLog((prev) => [...prev, { label: now.toLocaleDateString("en-IN", { month: "short", day: "numeric" }), niftyAdd, goldAdd }]);
    setExtraAmt(0);
  }, [extraAmt, targetNifty, targetGold]);

  // ── Shared input class ──
  const ipt = "w-full rounded bg-zinc-800/60 px-1.5 py-1 text-[10px] text-zinc-200 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">NIFTYBEES + GOLDBEES</h3>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${needRebalance ? "bg-amber-500/10 text-amber-300" : "bg-emerald-500/10 text-emerald-300"}`}>
          {needRebalance ? "REBALANCE" : "ON TRACK"}
        </span>
      </div>

      {/* ── Row 1: SIP params ── */}
      <div className="mb-3 grid grid-cols-7 gap-1.5">
        <div>
          <p className="text-[7px] uppercase tracking-wider text-zinc-500">Start M</p>
          <input type="number" value={startMonth} onChange={onNum(setStartMonth)} className={ipt} />
        </div>
        <div>
          <p className="text-[7px] uppercase tracking-wider text-zinc-500">Start Y</p>
          <input type="number" value={startYear} onChange={onNum(setStartYear)} className={ipt} />
        </div>
        <div>
          <p className="text-[7px] uppercase tracking-wider text-zinc-500">End M</p>
          <input type="number" value={endMonth} onChange={onNum(setEndMonth)} placeholder="0" className={ipt} />
        </div>
        <div>
          <p className="text-[7px] uppercase tracking-wider text-zinc-500">End Y</p>
          <input type="number" value={endYear} onChange={onNum(setEndYear)} placeholder="0" className={ipt} />
        </div>
        <div>
          <p className="text-[7px] uppercase tracking-wider text-zinc-500">SIP/Mo ₹</p>
          <input type="number" value={sipAmount} onChange={onNum(setSipAmount)} className={ipt} />
        </div>
        <div>
          <p className="text-[7px] uppercase tracking-wider text-zinc-500">Ann Incr %</p>
          <input type="number" value={annualInc} onChange={onNum(setAnnualInc)} className={ipt} />
        </div>
        <div>
          <p className="text-[7px] uppercase tracking-wider text-zinc-500">Target N %</p>
          <input type="number" value={targetNifty} onChange={onNum(setTargetNifty)} className={ipt} />
        </div>
      </div>

      {/* ── Row 2: Per-asset cards ── */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        {/* NIFTYBEES */}
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-zinc-200">NIFTYBEES</span>
            <span className="text-[11px] font-bold text-emerald-400">{niftyPct.toFixed(1)}%</span>
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            <div>
              <p className="text-[7px] text-zinc-500">CAGR %</p>
              <input type="number" value={niftyCagr} onChange={onNum(setNiftyCagr)} className={ipt} />
            </div>
            <div>
              <p className="text-[7px] text-zinc-500">Invested ₹</p>
              <p className="text-[10px] font-semibold text-zinc-100">₹{fmt(totalNiftyInv)}</p>
            </div>
          </div>
          <p className="mt-1 text-[7px] text-zinc-500">Current Value ₹</p>
          <div className="flex items-center">
            <span className="text-[9px] text-zinc-400">₹</span>
            <input type="number" value={ovNifty === "" ? sip.niftyCur : ovNifty}
              onChange={(e) => setOvNifty(e.target.value === "" ? "" : String(Math.max(0, Number(e.target.value))))}
              placeholder={String(sip.niftyCur)}
              className="ml-0.5 w-full bg-transparent text-[10px] font-semibold text-emerald-400 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
          </div>
          <p className={`mt-1 text-[9px] font-semibold ${niftyRet >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {fmtPct(niftyRet)}
          </p>
        </div>

        {/* GOLDBEES */}
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-zinc-200">GOLDBEES</span>
            <span className="text-[11px] font-bold text-amber-400">{goldPct.toFixed(1)}%</span>
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            <div>
              <p className="text-[7px] text-zinc-500">CAGR %</p>
              <input type="number" value={goldCagr} onChange={onNum(setGoldCagr)} className={ipt} />
            </div>
            <div>
              <p className="text-[7px] text-zinc-500">Invested ₹</p>
              <p className="text-[10px] font-semibold text-zinc-100">₹{fmt(totalGoldInv)}</p>
            </div>
          </div>
          <p className="mt-1 text-[7px] text-zinc-500">Current Value ₹</p>
          <div className="flex items-center">
            <span className="text-[9px] text-zinc-400">₹</span>
            <input type="number" value={ovGold === "" ? sip.goldCur : ovGold}
              onChange={(e) => setOvGold(e.target.value === "" ? "" : String(Math.max(0, Number(e.target.value))))}
              placeholder={String(sip.goldCur)}
              className="ml-0.5 w-full bg-transparent text-[10px] font-semibold text-amber-400 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
          </div>
          <p className={`mt-1 text-[9px] font-semibold ${goldRet >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {fmtPct(goldRet)}
          </p>
        </div>
      </div>

      {/* ── Row 3: Summary ── */}
      <div className="mb-3 grid grid-cols-4 gap-2 text-center text-[10px]">
        <div className="rounded bg-zinc-800/50 p-1.5">
          <p className="text-[7px] text-zinc-500">Invested</p>
          <p className="text-xs font-semibold text-zinc-100">₹{fmt(totalInvested)}</p>
          <p className="text-[7px] text-zinc-600">{sip.rows.length} SIPs + {extraLog.length} extras</p>
        </div>
        <div className="rounded bg-zinc-800/50 p-1.5">
          <p className="text-[7px] text-zinc-500">Current Value</p>
          <p className="text-xs font-semibold text-emerald-400">₹{fmt(totalCur)}</p>
          <p className="text-[7px] text-zinc-600">{ovNifty !== "" || ovGold !== "" ? "manual" : "projected"}</p>
        </div>
        <div className="rounded bg-zinc-800/50 p-1.5">
          <p className="text-[7px] text-zinc-500">Return</p>
          <p className={`text-xs font-semibold ${totalRet >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtPct(totalRet)}</p>
          <p className="text-[7px] text-zinc-600">₹{fmt(totalCur - totalInvested)}</p>
        </div>
        <div className="rounded bg-zinc-800/50 p-1.5">
          <p className="text-[7px] text-zinc-500">Max DD</p>
          <p className="text-xs font-semibold text-red-400">-{seed.maxDrawdown}%</p>
          <p className="text-[7px] text-zinc-600">reference</p>
        </div>
      </div>

      {/* ── Row 4: Extra + log ── */}
      <div className="mb-2 flex items-center gap-2">
        <div className="flex-1">
          <p className="text-[7px] uppercase tracking-wider text-zinc-500">Extra Contribution ₹</p>
          <div className="mt-0.5 flex items-center rounded-lg bg-zinc-800/60 px-2.5 py-1">
            <span className="text-[9px] text-zinc-400">₹</span>
            <input type="number" value={extraAmt} onChange={(e) => setExtraAmt(Math.max(0, Number(e.target.value)))}
              className="ml-1 w-full bg-transparent text-[10px] font-medium text-zinc-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
          </div>
        </div>
        <button onClick={addExtra}
          className="mt-3 self-end rounded-lg bg-emerald-600 px-3 py-1.5 text-[9px] font-semibold text-white transition hover:bg-emerald-500 active:scale-95">
          + Add (by target %)
        </button>
      </div>

      {/* ── Contribution logs ── */}
      <div className="max-h-48 space-y-0.5 overflow-y-auto">
        {sip.rows.length > 0 && (
          <>
            <p className="sticky top-0 bg-zinc-900 pb-0.5 text-[7px] uppercase tracking-wider text-zinc-500">
              SIP Schedule · {sip.rows.length} installments
              {endMonth > 0 && endYear > 0 ? ` · ${startMonth}/${startYear} → ${endMonth}/${endYear}` : ` · since ${startMonth}/${startYear}`}
            </p>
            {sip.rows.map((r, i) => (
              <div key={`s-${i}`} className="flex justify-between rounded bg-zinc-800/30 px-2 py-0.5 text-[8px]">
                <span className="w-14 text-zinc-500">{r.label}</span>
                <span className="text-zinc-400">₹{fmt(r.niftyAmt)}N + ₹{fmt(r.goldAmt)}G</span>
                <span className={`w-20 text-right ${r.niftyNow + r.goldNow >= r.niftyAmt + r.goldAmt ? "text-emerald-400" : "text-red-400"}`}>
                  → ₹{fmt(r.niftyNow + r.goldNow)}
                </span>
              </div>
            ))}
          </>
        )}
        {extraLog.length > 0 && (
          <>
            <p className="sticky top-0 bg-zinc-900 pb-0.5 pt-1 text-[7px] uppercase tracking-wider text-zinc-500">Extras ({extraLog.length})</p>
            {extraLog.map((r, i) => (
              <div key={`e-${i}`} className="flex justify-between rounded bg-amber-500/5 px-2 py-0.5 text-[8px]">
                <span className="w-14 text-zinc-500">{r.label}</span>
                <span className="text-zinc-400">₹{fmt(r.niftyAdd)}N + ₹{fmt(r.goldAdd)}G</span>
                <span className="w-20 text-right text-zinc-500">extra</span>
              </div>
            ))}
          </>
        )}
      </div>

      {needRebalance && (
        <div className="mt-2 rounded-lg bg-amber-500/10 p-2 text-[9px] text-amber-300">
          ⚠️ Deviation {devNifty.toFixed(1)}% (N {niftyPct.toFixed(0)}% vs target {targetNifty}%)
        </div>
      )}
    </div>
  );
}
