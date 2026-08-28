// ─── Live Data API Layer ────────────────────────────────────
// Fetches real-time data from: Yahoo Finance, RSSHub, GDELT, CoinGecko
// All endpoints are CORS-compatible. Falls back to seed data on error.
// Implements stale-while-revalidate caching to avoid redundant API calls.

import { useState, useEffect, useCallback, useRef } from "react";
import {
  indices as seedIndices, stocks as seedStocks, goldETFs as seedGold,
  newsArticles as seedNews, worldNews as seedWorldNews, aggregatorNewsFeed,
} from "../data/seedData.js";

// ── In-memory cache (stale-while-revalidate) ───────────────
const cache = new Map();
const DEFAULT_TTL = 20000; // 20s default cache TTL

function cachedFetch(url, timeoutMs = 8000, ttlMs = DEFAULT_TTL) {
  const now = Date.now();
  const hit = cache.get(url);
  // Fresh cache hit: return immediately
  if (hit && now - hit.ts < ttlMs) return hit.data;
  // Stale cache hit: return stale, revalidate in background
  const promise = _fetchJson(url, timeoutMs).catch(() => hit?.data || null);
  if (hit) {
    promise.then(data => cache.set(url, { data, ts: Date.now() }));
    return hit.data;
  }
  // No cache: wait for fetch
  return promise.then(data => { cache.set(url, { data, ts: Date.now() }); return data; });
}

async function _fetchJson(url, timeoutMs) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally { clearTimeout(id); }
}

async function fetchJson(url, timeoutMs = 8000) {
  return cachedFetch(url, timeoutMs);
}

// ────────────────────────────────────────────────────────────
// YAHOO FINANCE
// ────────────────────────────────────────────────────────────
const YH = {
  nifty: "^NSEI", sensex: "^BSESN", banknifty: "^NSEBANK",
  stocks: ["RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ITC.NS","SBIN.NS","HINDUNILVR.NS","ICICIBANK.NS","LT.NS","BHARTIARTL.NS"],
  gold: "GC=F",
};

async function yahooQuotes(symbols) {
  if (!symbols.length) return [];
  const data = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${symbols.join(",")}?range=1d&interval=5m`, 10000);
  return data?.chart?.result || [];
}

export async function fetchIndices() {
  const results = await yahooQuotes([YH.nifty, YH.sensex, YH.banknifty]);
  if (!results.length) return seedIndices;
  const m = {};
  for (const r of results) {
    const meta = r?.meta; if (!meta) continue;
    const price = meta.regularMarketPrice || meta.chartPreviousClose || 0;
    const ch = meta.previousClose ? +(((price - meta.previousClose) / meta.previousClose) * 100).toFixed(2) : 0;
    if (meta.symbol === YH.nifty) m.nifty = { name: "NIFTY 50", value: price, change: ch };
    if (meta.symbol === YH.sensex) m.sensex = { name: "SENSEX", value: price, change: ch };
    if (meta.symbol === YH.banknifty) m.banknifty = { name: "BANK NIFTY", value: price, change: ch };
  }
  return { ...seedIndices, ...m };
}

export async function fetchStocks() {
  const results = await yahooQuotes(YH.stocks);
  if (!results.length) return seedStocks;
  return results.map((r, i) => {
    const meta = r?.meta; const seed = seedStocks[i] || {};
    if (!meta) return seed;
    const price = meta.regularMarketPrice || meta.chartPreviousClose || seed.ltp;
    const ch = meta.previousClose ? +(((price - meta.previousClose) / meta.previousClose) * 100).toFixed(2) : seed.change;
    return { ...seed, ltp: price, change: ch };
  });
}

export async function fetchNiftyIntraday() {
  const data = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${YH.nifty}?range=1d&interval=5m`, 10000);
  if (!data?.chart?.result?.[0]) return null;
  const r = data.chart.result[0];
  const quotes = r.indicators?.quote?.[0];
  if (!quotes?.close?.length) return null;
  return r.timestamp.map((t, i) => {
    const d = new Date(t * 1000);
    return { time: `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`, price: +quotes.close[i]?.toFixed(2) };
  }).filter(p => p.price > 0);
}

export async function fetchGold() {
  const data = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${YH.gold}?range=1d&interval=5m`, 8000);
  if (!data?.chart?.result?.[0]?.meta) return { etfs: seedGold, spot: { price: 72450, change: 0 } };
  const meta = data.chart.result[0].meta;
  const price = meta.regularMarketPrice || meta.chartPreviousClose || 72450;
  const ch = meta.previousClose ? +(((price - meta.previousClose) / meta.previousClose) * 100).toFixed(2) : 0;
  return { etfs: seedGold, spot: { price: +price.toFixed(2), change: ch } };
}

// ── Live ETF prices (NIFTYBEES, GOLDBEES, etc.) ──
const ETF_SYMBOLS = ["NIFTYBEES.NS","GOLDBEES.NS","BANKBEES.NS","JUNIORBEES.NS","SETFNIFBK.NS","PSUBNKBEES.NS","CPSEETF.NS"];
const ETF_NAMES = {"NIFTYBEES.NS":"NIFTYBEES","GOLDBEES.NS":"GOLDBEES","BANKBEES.NS":"BANKBEES","JUNIORBEES.NS":"JUNIORBEES","SETFNIFBK.NS":"SETFNIFBK","PSUBNKBEES.NS":"PSUBNKBEES","CPSEETF.NS":"CPSEETF"};
const ETF_CATEGORIES = {"NIFTYBEES.NS":"Broad Market","GOLDBEES.NS":"Commodity","BANKBEES.NS":"Banking","JUNIORBEES.NS":"Broad Market","SETFNIFBK.NS":"Banking","PSUBNKBEES.NS":"Banking","CPSEETF.NS":"PSU"};

export async function fetchEtfPrices() {
  const results = await yahooQuotes(ETF_SYMBOLS);
  if (!results.length) return null;
  return results.map((r, i) => {
    const meta = r?.meta; const sym = ETF_SYMBOLS[i];
    if (!meta) return null;
    const price = meta.regularMarketPrice || meta.chartPreviousClose || 0;
    const prev = meta.previousClose || price;
    const ch = prev ? +(((price - prev) / prev) * 100).toFixed(2) : 0;
    return { symbol: ETF_NAMES[sym] || sym, name: ETF_NAMES[sym] || sym, category: ETF_CATEGORIES[sym] || "Other", ltp: price, change: ch, rank: 0 };
  }).filter(Boolean);
}

// ── Live commodities from Yahoo Finance ──
const COMMODITY_SYMBOLS = ["GC=F","SI=F","CL=F","BZ=F","HG=F"];
const COMMODITY_NAMES = {"GC=F":"Gold","SI=F":"Silver","CL=F":"Crude WTI","BZ=F":"Brent","HG=F":"Copper"};

export async function fetchCommodities() {
  const results = await yahooQuotes(COMMODITY_SYMBOLS);
  if (!results.length) return null;
  return results.map((r) => {
    const meta = r?.meta; if (!meta) return null;
    const price = meta.regularMarketPrice || meta.chartPreviousClose || 0;
    const prev = meta.previousClose || price;
    const ch = prev ? +(((price - prev) / prev) * 100).toFixed(2) : 0;
    return { name: COMMODITY_NAMES[meta.symbol] || meta.symbol, symbol: meta.symbol, price, change: `${ch>=0?"+":""}${ch}%`, sentiment: ch>=0?"bullish":"bearish" };
  }).filter(Boolean);
}

// ── Live currencies from Frankfurter (free, no key) ──
export async function fetchCurrencies() {
  const data = await fetchJson("https://api.frankfurter.app/latest?from=USD", 60000); // 1min cache
  if (!data?.rates) return null;
  const r = data.rates;
  return [
    { pair: "EUR/USD", rate: +(1/(r.EUR||0.92)).toFixed(4), change: "\u2014", direction: r.EUR>0.83?"bullish":"bearish" },
    { pair: "GBP/USD", rate: +(1/(r.GBP||0.78)).toFixed(4), change: "\u2014", direction: r.GBP>0.75?"bullish":"bearish" },
    { pair: "USD/JPY", rate: r.JPY||144, change: "\u2014", direction: "neutral" },
    { pair: "USD/CHF", rate: r.CHF||0.85, change: "\u2014", direction: "neutral" },
    { pair: "USD/CNH", rate: r.CNY||7.12, change: "\u2014", direction: "neutral" },
    { pair: "DXY", rate: 1, change: "0.00%", direction: "neutral" },
  ];
}

// ── Real historical CAGR from Yahoo Finance (1-year lookback) ──
export async function fetchHistoricalCagr() {
  const now = Math.floor(Date.now()/1000);
  const yearAgo = now - 365*86400;
  const nifty = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${YH.nifty}?period1=${yearAgo}&period2=${now}&interval=1mo`, 3600000); // cache 1hr
  const gold = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${YH.gold}?period1=${yearAgo}&period2=${now}&interval=1mo`, 3600000);
  const calc = (chart) => {
    if (!chart?.chart?.result?.[0]) return null;
    const closes = chart.chart.result[0].indicators?.quote?.[0]?.close?.filter(c=>c>0)||[];
    if (closes.length<2) return null;
    const years = (closes.length-1)/12;
    return years>0 ? +((Math.pow(closes[closes.length-1]/closes[0], 1/years)-1)*100).toFixed(1) : null;
  };
  return { nifty: calc(nifty), gold: calc(gold) };
}

// ── Live ETF pair for PairsMonitor ──
export async function fetchEtfPair() {
  const results = await yahooQuotes(["BANKBEES.NS","SETFNIFBK.NS"]);
  if (results.length<2) return null;
  const getP = (r) => r?.meta?.regularMarketPrice||r?.meta?.chartPreviousClose||0;
  const bankbees = getP(results[0]), setfnifbk = getP(results[1]);
  return { bankbees, setfnifbk, spread: +(bankbees-setfnifbk).toFixed(2) };
}

// ── Live Nifty PE estimate ──
const NIFTY_EPS = 1100;
export async function fetchNiftyPe() {
  const data = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${YH.nifty}?range=1d&interval=1d`, 30000);
  if (!data?.chart?.result?.[0]?.meta) return null;
  const price = data.chart.result[0].meta.regularMarketPrice||data.chart.result[0].meta.chartPreviousClose||0;
  if (!price) return null;
  const pe = +(price/NIFTY_EPS).toFixed(1);
  return { niftyPE: pe, niftyPrice: price, earningsYield: +(1/pe*100).toFixed(1) };
}

// ────────────────────────────────────────────────────────────
// RSSHub NEWS
// ────────────────────────────────────────────────────────────
const RSSHUB = "https://rsshub.app";
const RSS_FEEDS = [
  { id:"et-markets", url:`${RSSHUB}/economictimes/industry/markets`, region:"Indian" },
  { id:"moneycontrol", url:`${RSSHUB}/moneycontrol/news`, region:"Indian" },
  { id:"reuters", url:`${RSSHUB}/reuters/marketsNews`, region:"World" },
  { id:"bloomberg", url:`${RSSHUB}/bloomberg/markets`, region:"World" },
  { id:"cnbc", url:`${RSSHUB}/cnbc`, region:"World" },
];

async function fetchRssFeed(url) {
  const data = await fetchJson(`${url}?format=json`, 30000); // 30s cache
  if (!data?.items?.length) return [];
  return data.items.map((item, i) => ({
    id: `rss-${(data.title||"feed").slice(0,8)}-${i}`,
    title: item.title||"",
    source: data.title||"RSS",
    sourceIcon: (data.title||"RS").slice(0,2).toUpperCase(),
    url: item.link||"#",
    time: item.date_modified ? new Date(item.date_modified).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) : "12:00",
    sentiment: 0, sentimentLabel: "NEUTRAL", tickers: [],
    summary: (item.summary||"").replace(/<[^>]*>/g,"").slice(0,200),
    region: "Indian",
  }));
}

export async function fetchRsshubNews() {
  const results = await Promise.allSettled(RSS_FEEDS.map(f=>fetchRssFeed(f.url)));
  return results.flatMap((r,i)=>r.status==="fulfilled"?r.value:[]).sort((a,b)=>b.time.localeCompare(a.time)).slice(0,40);
}

// ────────────────────────────────────────────────────────────
// GDELT NEWS
// ────────────────────────────────────────────────────────────
export async function fetchGdeltNews(query, max=15) {
  const q = encodeURIComponent(query||"Indian stock market NSE OR BSE OR Nifty");
  const data = await fetchJson(`https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&format=json&maxrecords=${max}&sort=datedesc`, 30000); // 30s cache
  if (!data?.articles?.length) return null;
  return data.articles.map((a,i) => ({
    id: `gdelt-${i}`, title: a.title||"Untitled", source: a.domain||"GDELT",
    sourceIcon: (a.domain||"GD").slice(0,2).toUpperCase(), url: a.url||"#",
    time: a.seendate ? `${a.seendate.slice(8,10)}:${a.seendate.slice(10,12)||"00"}` : "12:00",
    sentiment: a.tone ? +(a.tone/20).toFixed(2) : 0,
    sentimentLabel: a.tone>5 ? "BULLISH" : a.tone>-5 ? "NEUTRAL" : "NEGATIVE",
    tickers: [], summary: a.summary||"", region: "World",
  }));
}

// ────────────────────────────────────────────────────────────
// AGGREGATED NEWS
// ────────────────────────────────────────────────────────────
export async function fetchAllNews({ region="all", max=30 }={}) {
  const [gdelt, rsshub] = await Promise.allSettled([
    fetchGdeltNews(region==="indian"?"India stock market NSE Nifty BSE":"stock market global finance", max/2),
    fetchRsshubNews(),
  ]);
  const gdeltA = gdelt.status==="fulfilled"&&gdelt.value?gdelt.value:[];
  const rsshubA = rsshub.status==="fulfilled"&&rsshub.value?rsshub.value:[];
  const seed = region==="world" ? seedWorldNews : region==="indian" ? [...seedNews,...aggregatorNewsFeed] : [...seedNews,...aggregatorNewsFeed,...seedWorldNews];
  const combined = [...gdeltA, ...rsshubA, ...seed.map(a=>({...a, region: a.region||"Indian"}))];
  const seen = new Set();
  return combined.filter(a=>{const k=a.title?.slice(0,40); if(seen.has(k))return false; seen.add(k);return true}).slice(0,max);
}

// ────────────────────────────────────────────────────────────
// COINGECKO
// ────────────────────────────────────────────────────────────
export async function fetchCryptoPrice(ids="bitcoin,ethereum") {
  return fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, 30000);
}

// ────────────────────────────────────────────────────────────
// useLiveData HOOK (with stale-while-revalidate + manual refresh)
// ────────────────────────────────────────────────────────────
export function useLiveData(fetcher, seed, refreshMs=30000) {
  const [data, setData] = useState(seed);
  const [loading, setLoading] = useState(seed===null||seed===undefined);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const mountedRef = useRef(true);

  const load = useCallback(async (force=false) => {
    try {
      if (force) setLoading(true);
      const result = await fetcherRef.current();
      if (mountedRef.current && result!==null && result!==undefined) { setData(result); setError(null); }
    } catch (e) { if (mountedRef.current) setError(e.message); }
    finally { if (mountedRef.current) setLoading(false); }
  }, []);

  const refreshNow = useCallback(() => load(true), [load]);

  useEffect(() => {
    mountedRef.current = true;
    if (seed===null||seed===undefined) setLoading(true);
    load();
    if (refreshMs>0) {
      const t = setInterval(()=>load(false), refreshMs);
      return ()=>{ mountedRef.current=false; clearInterval(t); };
    }
    return ()=>{ mountedRef.current=false; };
  }, [load, refreshMs]);

  return { data, loading, error, refreshNow };
}
