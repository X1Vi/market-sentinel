// ─── Live Data API Layer ────────────────────────────────────
// Fetches real-time data from: Yahoo Finance, RSSHub, GDELT, CoinGecko
// All endpoints are CORS-compatible. Falls back to seed data on error.

import { useState, useEffect, useCallback } from "react";
import {
  indices as seedIndices, stocks as seedStocks, goldETFs as seedGold,
  newsArticles as seedNews, worldNews as seedWorldNews, aggregatorNewsFeed,
} from "../data/seedData.js";

// ── helpers ──
async function fetchJson(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch { clearTimeout(id); return null; }
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

// Real historical CAGR from Yahoo Finance (1-year lookback)
export async function fetchHistoricalCagr() {
  const now = Math.floor(Date.now() / 1000);
  const yearAgo = now - 365 * 86400;
  const nifty = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${YH.nifty}?period1=${yearAgo}&period2=${now}&interval=1mo`, 8000);
  const gold = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${YH.gold}?period1=${yearAgo}&period2=${now}&interval=1mo`, 8000);
  const calcCagr = (chart) => {
    if (!chart?.chart?.result?.[0]) return null;
    const closes = chart.chart.result[0].indicators?.quote?.[0]?.close?.filter(c => c > 0) || [];
    if (closes.length < 2) return null;
    const start = closes[0], end = closes[closes.length - 1];
    const years = (closes.length - 1) / 12;
    return years > 0 ? +((Math.pow(end / start, 1 / years) - 1) * 100).toFixed(1) : null;
  };
  return { nifty: calcCagr(nifty), gold: calcCagr(gold) };
}

// ────────────────────────────────────────────────────────────
// RSSHub NEWS (public instance)
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
  const data = await fetchJson(`${url}?format=json`, 6000);
  if (!data?.items?.length) return [];
  return data.items.map((item, i) => ({
    id: `rss-${data.title?.slice(0,8) || "feed"}-${i}`,
    title: item.title || "",
    source: data.title || "RSS",
    sourceIcon: (data.title || "RS").slice(0, 2).toUpperCase(),
    url: item.link || "#",
    time: item.date_modified ? new Date(item.date_modified).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "12:00",
    sentiment: 0,
    sentimentLabel: "NEUTRAL",
    tickers: [],
    summary: item.summary?.replace(/<[^>]*>/g, "").slice(0, 200) || "",
    region: "Indian",
  }));
}

export async function fetchRsshubNews() {
  const results = await Promise.allSettled(RSS_FEEDS.map(f => fetchRssFeed(f.url)));
  const articles = results.flatMap((r, i) => r.status === "fulfilled" ? r.value : []);
  return articles.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 40);
}

// ────────────────────────────────────────────────────────────
// GDELT NEWS
// ────────────────────────────────────────────────────────────
export async function fetchGdeltNews(query, max = 15) {
  const q = encodeURIComponent(query || "Indian stock market NSE OR BSE OR Nifty");
  const data = await fetchJson(`https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&format=json&maxrecords=${max}&sort=datedesc`, 10000);
  if (!data?.articles?.length) return null;
  return data.articles.map((a, i) => ({
    id: `gdelt-${i}`,
    title: a.title || "Untitled",
    source: a.domain || "GDELT",
    sourceIcon: (a.domain || "GD").slice(0, 2).toUpperCase(),
    url: a.url || "#",
    time: a.seendate ? `${a.seendate.slice(8, 10)}:${a.seendate.slice(10, 12) || "00"}` : "12:00",
    sentiment: a.tone ? +(a.tone / 20).toFixed(2) : 0,
    sentimentLabel: a.tone > 5 ? "BULLISH" : a.tone > -5 ? "NEUTRAL" : "NEGATIVE",
    tickers: [], summary: a.summary || "",
    region: "World",
  }));
}

// ────────────────────────────────────────────────────────────
// AGGREGATED NEWS (combines ALL sources)
// ────────────────────────────────────────────────────────────
export async function fetchAllNews({ region = "all", max = 30 } = {}) {
  const [gdelt, rsshub] = await Promise.allSettled([
    fetchGdeltNews(region === "indian" ? "India stock market NSE Nifty BSE" : "stock market global finance", max / 2),
    fetchRsshubNews(),
  ]);
  const gdeltArticles = gdelt.status === "fulfilled" && gdelt.value ? gdelt.value : [];
  const rsshubArticles = rsshub.status === "fulfilled" && rsshub.value ? rsshub.value : [];
  const seed = region === "world" ? seedWorldNews : region === "indian" ? [...seedNews, ...aggregatorNewsFeed] : [...seedNews, ...aggregatorNewsFeed, ...seedWorldNews];
  const combined = [...gdeltArticles, ...rsshubArticles, ...seed.map(a => ({ ...a, region: a.region || "Indian" }))];
  // De-duplicate by title
  const seen = new Set();
  return combined.filter(a => { const k = a.title?.slice(0, 40); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, max);
}

// ────────────────────────────────────────────────────────────
// COINGECKO
// ────────────────────────────────────────────────────────────
export async function fetchCryptoPrice(ids = "bitcoin,ethereum") {
  return fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, 8000);
}

// ────────────────────────────────────────────────────────────
// useLiveData HOOK
// ────────────────────────────────────────────────────────────
export function useLiveData(fetcher, seed, refreshMs = 30000) {
  const [data, setData] = useState(seed);
  const [loading, setLoading] = useState(seed === null || seed === undefined);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const result = await fetcher();
      if (result !== null && result !== undefined) { setData(result); setError(null); }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // If we have seed data, don't show loading on first render
    if (!seed && seed !== undefined) setLoading(true);
    load();
    if (refreshMs > 0) { const t = setInterval(load, refreshMs); return () => clearInterval(t); }
  }, [load, refreshMs]);

  return { data, loading, error };
}
