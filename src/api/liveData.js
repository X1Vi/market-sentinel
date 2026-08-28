// ─── Live Data API Layer (rate-limited, cached) ─────────────
// Fetches from: Yahoo Finance, Frankfurter, CoinGecko, GDELT, RSSHub
// - Per-host request queue with min gap (avoids rate-limiting)
// - Exponential backoff on HTTP 429 / "Too Many Requests"
// - Two-layer cache (memory + localStorage) with stale-while-revalidate
// - ALL Yahoo symbols fetched in ONE consolidated snapshot request
// Falls back to seed data when APIs fail.

import { useState, useEffect, useCallback, useRef } from "react";
import {
  indices as seedIndices, stocks as seedStocks, goldETFs as seedGold,
  newsArticles as seedNews, worldNews as seedWorldNews, aggregatorNewsFeed,
} from "../data/seedData.js";

// ── helpers ─────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Per-host rate limiter (serialize + min gap) ─────────────
const hostState = new Map(); // host -> { lastStart, tail }

function rateLimited(url, timeoutMs, gapMs = 1200) {
  const host = new URL(url).host;
  const st = hostState.get(host) || { lastStart: 0, tail: Promise.resolve() };
  const task = st.tail.then(() => {
    const wait = Math.max(0, st.lastStart + gapMs - Date.now());
    if (wait > 0) return sleep(wait);
  }).then(() => {
    st.lastStart = Date.now();
    return rawFetchWithBackoff(url, timeoutMs);
  });
  const tail = task.then(() => {}, () => {});
  st.tail = tail;
  hostState.set(host, st);
  return task;
}

// ── Raw fetch with redirect-follow + 429 backoff ─────────────
async function rawFetch(url, timeoutMs) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
    if (res.status === 429) {
      const e = new Error("rate-limited"); e.status = 429; throw e;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    // Yahoo sometimes returns 200 with a throttling body
    if (text.includes("Too Many Requests")) {
      const e = new Error("rate-limited"); e.status = 429; throw e;
    }
    try { return JSON.parse(text); } catch { return null; }
  } finally { clearTimeout(id); }
}

async function rawFetchWithBackoff(url, timeoutMs, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await rawFetch(url, timeoutMs);
    } catch (e) {
      if (e.status === 429 && i < retries - 1) {
        await sleep(2000 * Math.pow(2, i)); // 2s, 4s backoff
        continue;
      }
      throw e;
    }
  }
}

// ── Two-layer cache (memory + localStorage) + in-flight dedup ──
const cache = new Map();
const inflight = new Map();
const DEFAULT_TTL = 30000; // 30s default
const LS_PREFIX = "ms_cache_";

function lsKey(url) {
  try { return LS_PREFIX + btoa(url).slice(0, 60); } catch { return LS_PREFIX + url.length; }
}

async function doFetch(url, timeoutMs, ttlMs) {
  const now = Date.now();
  const memHit = cache.get(url);

  // 1. Fresh memory cache
  if (memHit && now - memHit.ts < ttlMs) return memHit.data;

  // 2. localStorage cache (instant page load)
  const key = lsKey(url);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const ls = JSON.parse(raw);
      if (now - ls.ts < ttlMs * 3) {
        cache.set(url, { data: ls.data, ts: ls.ts });
        rateLimited(url, timeoutMs).then((fresh) => {
          if (fresh) { cache.set(url, { data: fresh, ts: Date.now() }); localStorage.setItem(key, JSON.stringify({ data: fresh, ts: Date.now() })); }
        }).catch(() => {});
        return ls.data;
      }
    }
  } catch {}

  // 3. Stale memory cache → return stale, revalidate in background
  if (memHit) {
    rateLimited(url, timeoutMs).then((fresh) => {
      if (fresh) {
        cache.set(url, { data: fresh, ts: Date.now() });
        try { localStorage.setItem(key, JSON.stringify({ data: fresh, ts: Date.now() })); } catch {}
      }
    }).catch(() => {});
    return memHit.data;
  }

  // 4. Cold cache → fetch and wait
  const data = await rateLimited(url, timeoutMs).catch(() => null);
  if (data) {
    cache.set(url, { data, ts: Date.now() });
    try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
  }
  return data;
}

// Always returns a Promise; dedupes concurrent identical requests
function fetchJson(url, timeoutMs = 8000, ttlMs = DEFAULT_TTL) {
  if (inflight.has(url)) return inflight.get(url);
  const p = doFetch(url, timeoutMs, ttlMs).finally(() => inflight.delete(url));
  inflight.set(url, p);
  return p;
}

// ────────────────────────────────────────────────────────────
// YAHOO FINANCE — consolidated snapshot (ONE request, all symbols)
// ────────────────────────────────────────────────────────────
const YH = {
  indices: ["^NSEI", "^BSESN", "^NSEBANK"],
  stocks: ["RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ITC.NS","SBIN.NS","HINDUNILVR.NS","ICICIBANK.NS","LT.NS","BHARTIARTL.NS"],
  etfs: ["NIFTYBEES.NS","GOLDBEES.NS","BANKBEES.NS","JUNIORBEES.NS","SETFNIFBK.NS","PSUBNKBEES.NS","CPSEETF.NS"],
  commodities: ["GC=F","SI=F","CL=F","BZ=F","HG=F"],
};
const ALL_SYMS = [...new Set([...YH.indices, ...YH.stocks, ...YH.etfs, ...YH.commodities])];
const SNAPSHOT_URL = `https://query1.finance.yahoo.com/v8/finance/chart/${ALL_SYMS.join(",")}?range=1d&interval=5m`;

const pct = (v) => (v && v.prev) ? +(((v.price - v.prev) / v.prev) * 100).toFixed(2) : 0;

function parseSnapshot(data) {
  const map = {};
  for (const r of (data?.chart?.result || [])) {
    const meta = r?.meta; if (!meta) continue;
    const price = meta.regularMarketPrice || meta.chartPreviousClose || 0;
    map[meta.symbol] = { price, prev: meta.previousClose || price, r, meta };
  }
  return map;
}

const ETF_NAMES = {"NIFTYBEES.NS":"NIFTYBEES","GOLDBEES.NS":"GOLDBEES","BANKBEES.NS":"BANKBEES","JUNIORBEES.NS":"JUNIORBEES","SETFNIFBK.NS":"SETFNIFBK","PSUBNKBEES.NS":"PSUBNKBEES","CPSEETF.NS":"CPSEETF"};
const ETF_CATEGORIES = {"NIFTYBEES.NS":"Broad Market","GOLDBEES.NS":"Commodity","BANKBEES.NS":"Banking","JUNIORBEES.NS":"Broad Market","SETFNIFBK.NS":"Banking","PSUBNKBEES.NS":"Banking","CPSEETF.NS":"PSU"};
const COMMODITY_NAMES = {"GC=F":"Gold","SI=F":"Silver","CL=F":"Crude WTI","BZ=F":"Brent","HG=F":"Copper"};

export async function fetchIndices() {
  const data = await fetchJson(SNAPSHOT_URL, 12000, 30000);
  const map = parseSnapshot(data);
  if (!Object.keys(map).length) return seedIndices;
  const m = {};
  const n = map["^NSEI"]; if (n) m.nifty = { name: "NIFTY 50", value: n.price, change: pct(n) };
  const s = map["^BSESN"]; if (s) m.sensex = { name: "SENSEX", value: s.price, change: pct(s) };
  const b = map["^NSEBANK"]; if (b) m.banknifty = { name: "BANK NIFTY", value: b.price, change: pct(b) };
  return { ...seedIndices, ...m };
}

export async function fetchStocks() {
  const data = await fetchJson(SNAPSHOT_URL, 12000, 30000);
  const map = parseSnapshot(data);
  if (!Object.keys(map).length) return seedStocks;
  return YH.stocks.map((sym, i) => {
    const v = map[sym]; const seed = seedStocks[i] || {};
    if (!v) return seed;
    return { ...seed, ltp: v.price, change: pct(v) };
  });
}

export async function fetchNiftyIntraday() {
  const data = await fetchJson(SNAPSHOT_URL, 12000, 30000);
  const r = data?.chart?.result?.find((x) => x.meta?.symbol === "^NSEI");
  if (!r) return null;
  const quotes = r.indicators?.quote?.[0];
  if (!quotes?.close?.length) return null;
  return r.timestamp.map((t, i) => {
    const d = new Date(t * 1000);
    return { time: `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`, price: +quotes.close[i]?.toFixed(2) };
  }).filter((p) => p.price > 0);
}

export async function fetchGold() {
  const data = await fetchJson(SNAPSHOT_URL, 12000, 30000);
  const map = parseSnapshot(data);
  const v = map["GC=F"];
  if (!v) return { etfs: seedGold, spot: { price: 72450, change: 0 } };
  return { etfs: seedGold, spot: { price: +v.price.toFixed(2), change: pct(v) } };
}

export async function fetchEtfPrices() {
  const data = await fetchJson(SNAPSHOT_URL, 12000, 30000);
  const map = parseSnapshot(data);
  if (!Object.keys(map).length) return null;
  return YH.etfs.map((sym) => {
    const v = map[sym]; if (!v) return null;
    return { symbol: ETF_NAMES[sym] || sym, name: ETF_NAMES[sym] || sym, category: ETF_CATEGORIES[sym] || "Other", ltp: v.price, change: pct(v), rank: 0 };
  }).filter(Boolean);
}

export async function fetchCommodities() {
  const data = await fetchJson(SNAPSHOT_URL, 12000, 30000);
  const map = parseSnapshot(data);
  if (!Object.keys(map).length) return null;
  return YH.commodities.map((sym) => {
    const v = map[sym]; if (!v) return null;
    const ch = pct(v);
    return { name: COMMODITY_NAMES[sym] || sym, symbol: sym, price: v.price, change: `${ch>=0?"+":""}${ch}%`, sentiment: ch>=0?"bullish":"bearish" };
  }).filter(Boolean);
}

export async function fetchEtfPair() {
  const data = await fetchJson(SNAPSHOT_URL, 12000, 30000);
  const map = parseSnapshot(data);
  const a = map["BANKBEES.NS"], b = map["SETFNIFBK.NS"];
  if (!a || !b) return null;
  return { bankbees: a.price, setfnifbk: b.price, spread: +(a.price - b.price).toFixed(2) };
}

// ── Live Nifty PE estimate (from snapshot) ──
const NIFTY_EPS = 1100;
export async function fetchNiftyPe() {
  const data = await fetchJson(SNAPSHOT_URL, 12000, 30000);
  const map = parseSnapshot(data);
  const v = map["^NSEI"];
  if (!v || !v.price) return null;
  const pe = +(v.price / NIFTY_EPS).toFixed(1);
  return { niftyPE: pe, niftyPrice: v.price, earningsYield: +(1 / pe * 100).toFixed(1) };
}

// ── Real historical CAGR (1yr, cached 1hr, rate-limited) ──
export async function fetchHistoricalCagr() {
  const now = Math.floor(Date.now() / 1000);
  const yearAgo = now - 365 * 86400;
  const calc = (chart) => {
    if (!chart?.chart?.result?.[0]) return null;
    const closes = chart.chart.result[0].indicators?.quote?.[0]?.close?.filter((c) => c > 0) || [];
    if (closes.length < 2) return null;
    const years = (closes.length - 1) / 12;
    return years > 0 ? +((Math.pow(closes[closes.length - 1] / closes[0], 1 / years) - 1) * 100).toFixed(1) : null;
  };
  const nifty = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/^NSEI?period1=${yearAgo}&period2=${now}&interval=1mo`, 12000, 3600000);
  const gold = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/GC=F?period1=${yearAgo}&period2=${now}&interval=1mo`, 12000, 3600000);
  return { nifty: calc(nifty), gold: calc(gold) };
}

// ────────────────────────────────────────────────────────────
// CURRENCIES (Frankfurter — no key, use dev domain to avoid redirect)
// ────────────────────────────────────────────────────────────
export async function fetchCurrencies() {
  const data = await fetchJson("https://api.frankfurter.dev/v1/latest?base=USD", 8000, 600000);
  if (!data?.rates) return null;
  const r = data.rates;
  return [
    { pair: "EUR/USD", rate: +(1 / (r.EUR || 0.92)).toFixed(4), change: "\u2014", direction: r.EUR > 0.83 ? "bullish" : "bearish" },
    { pair: "GBP/USD", rate: +(1 / (r.GBP || 0.78)).toFixed(4), change: "\u2014", direction: r.GBP > 0.75 ? "bullish" : "bearish" },
    { pair: "USD/JPY", rate: r.JPY || 144, change: "\u2014", direction: "neutral" },
    { pair: "USD/CHF", rate: r.CHF || 0.85, change: "\u2014", direction: "neutral" },
    { pair: "USD/CNH", rate: r.CNY || 7.12, change: "\u2014", direction: "neutral" },
    { pair: "DXY", rate: 1, change: "0.00%", direction: "neutral" },
  ];
}

// ────────────────────────────────────────────────────────────
// RSSHub NEWS
// ────────────────────────────────────────────────────────────
const RSSHUB = "https://rsshub.app";
const RSS_FEEDS = [
  { id: "et-markets", url: `${RSSHUB}/economictimes/industry/markets`, region: "Indian" },
  { id: "moneycontrol", url: `${RSSHUB}/moneycontrol/news`, region: "Indian" },
  { id: "reuters", url: `${RSSHUB}/reuters/marketsNews`, region: "World" },
  { id: "bloomberg", url: `${RSSHUB}/bloomberg/markets`, region: "World" },
  { id: "cnbc", url: `${RSSHUB}/cnbc`, region: "World" },
];

async function fetchRssFeed(url) {
  const data = await fetchJson(`${url}?format=json`, 8000, 30000);
  if (!data?.items?.length) return [];
  return data.items.map((item, i) => ({
    id: `rss-${(data.title || "feed").slice(0, 8)}-${i}`,
    title: item.title || "", source: data.title || "RSS",
    sourceIcon: (data.title || "RS").slice(0, 2).toUpperCase(), url: item.link || "#",
    time: item.date_modified ? new Date(item.date_modified).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "12:00",
    sentiment: 0, sentimentLabel: "NEUTRAL", tickers: [],
    summary: (item.summary || "").replace(/<[^>]*>/g, "").slice(0, 200), region: "Indian",
  }));
}

export async function fetchRsshubNews() {
  const results = await Promise.allSettled(RSS_FEEDS.map((f) => fetchRssFeed(f.url)));
  return results.flatMap((r, i) => r.status === "fulfilled" ? r.value : []).sort((a, b) => b.time.localeCompare(a.time)).slice(0, 40);
}

// ────────────────────────────────────────────────────────────
// GDELT NEWS
// ────────────────────────────────────────────────────────────
export async function fetchGdeltNews(query, max = 15) {
  const q = encodeURIComponent(query || "Indian stock market NSE OR BSE OR Nifty");
  const data = await fetchJson(`https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=artlist&format=json&maxrecords=${max}&sort=datedesc`, 10000, 30000);
  if (!data?.articles?.length) return null;
  return data.articles.map((a, i) => ({
    id: `gdelt-${i}`, title: a.title || "Untitled", source: a.domain || "GDELT",
    sourceIcon: (a.domain || "GD").slice(0, 2).toUpperCase(), url: a.url || "#",
    time: a.seendate ? `${a.seendate.slice(8, 10)}:${a.seendate.slice(10, 12) || "00"}` : "12:00",
    sentiment: a.tone ? +(a.tone / 20).toFixed(2) : 0,
    sentimentLabel: a.tone > 5 ? "BULLISH" : a.tone > -5 ? "NEUTRAL" : "NEGATIVE",
    tickers: [], summary: a.summary || "", region: "World",
  }));
}

// ────────────────────────────────────────────────────────────
// AGGREGATED NEWS
// ────────────────────────────────────────────────────────────
export async function fetchAllNews({ region = "all", max = 30 } = {}) {
  const [gdelt, rsshub] = await Promise.allSettled([
    fetchGdeltNews(region === "indian" ? "India stock market NSE Nifty BSE" : "stock market global finance", max / 2),
    fetchRsshubNews(),
  ]);
  const gdeltA = gdelt.status === "fulfilled" && gdelt.value ? gdelt.value : [];
  const rsshubA = rsshub.status === "fulfilled" && rsshub.value ? rsshub.value : [];
  const seed = region === "world" ? seedWorldNews : region === "indian" ? [...seedNews, ...aggregatorNewsFeed] : [...seedNews, ...aggregatorNewsFeed, ...seedWorldNews];
  const combined = [...gdeltA, ...rsshubA, ...seed.map((a) => ({ ...a, region: a.region || "Indian" }))];
  const seen = new Set();
  return combined.filter((a) => { const k = a.title?.slice(0, 40); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, max);
}

// ────────────────────────────────────────────────────────────
// COINGECKO
// ────────────────────────────────────────────────────────────
export async function fetchCryptoPrice(ids = "bitcoin,ethereum") {
  return fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, 8000, 60000);
}

// ────────────────────────────────────────────────────────────
// useLiveData HOOK
// ────────────────────────────────────────────────────────────
export function useLiveData(fetcher, seed, refreshMs = 30000) {
  const [data, setData] = useState(seed);
  const [loading, setLoading] = useState(seed === null || seed === undefined);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const mountedRef = useRef(true);

  const load = useCallback(async (force = false) => {
    try {
      if (force) setLoading(true);
      const result = await fetcherRef.current();
      if (mountedRef.current && result !== null && result !== undefined) { setData(result); setError(null); }
    } catch (e) { if (mountedRef.current) setError(e.message); }
    finally { if (mountedRef.current) setLoading(false); }
  }, []);

  const refreshNow = useCallback(() => load(true), [load]);

  useEffect(() => {
    mountedRef.current = true;
    if (seed === null || seed === undefined) setLoading(true);
    load();
    if (refreshMs > 0) {
      const t = setInterval(() => load(false), refreshMs);
      return () => { mountedRef.current = false; clearInterval(t); };
    }
    return () => { mountedRef.current = false; };
  }, [load, refreshMs]);

  return { data, loading, error, refreshNow };
}
