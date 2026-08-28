// ─── Live Data API Layer ────────────────────────────────────
// Fetches real-time data from free public APIs with seed data fallback.
// All endpoints are CORS-compatible from the browser.

import {
  indices as seedIndices, stocks as seedStocks, goldETFs as seedGold,
  newsArticles as seedNews, worldNews as seedWorldNews,
  currencies as seedCurrencies, commodities as seedCommodities,
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
  } catch {
    clearTimeout(id);
    return null;
  }
}

// ── Yahoo Finance symbols ──
const YAHOO = {
  nifty: "^NSEI",
  sensex: "^BSESN",
  banknifty: "^NSEBANK",
  stocks: ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ITC.NS", "SBIN.NS", "HINDUNILVR.NS", "ICICIBANK.NS", "LT.NS", "BHARTIARTL.NS"],
  gold: "GC=F",
};

// ── Fetch multiple Yahoo Finance quotes ──
async function fetchYahooQuotes(symbols) {
  if (!symbols.length) return [];
  const csv = symbols.join(",");
  const data = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${csv}?range=1d&interval=5m`, 10000);
  if (!data?.chart?.result) return [];
  return data.chart.result;
}

// ── Live indices ──
export async function fetchIndices() {
  const results = await fetchYahooQuotes([YAHOO.nifty, YAHOO.sensex, YAHOO.banknifty]);
  if (!results.length) return seedIndices;

  const map = {};
  for (const r of results) {
    const meta = r.meta;
    if (!meta) continue;
    const prevClose = meta.previousClose || 1;
    const price = meta.regularMarketPrice || meta.chartPreviousClose || 0;
    const change = ((price - prevClose) / prevClose) * 100;
    if (meta.symbol === YAHOO.nifty) map.nifty = { name: "NIFTY 50", value: price, change: +change.toFixed(2) };
    if (meta.symbol === YAHOO.sensex) map.sensex = { name: "SENSEX", value: price, change: +change.toFixed(2) };
    if (meta.symbol === YAHOO.banknifty) map.banknifty = { name: "BANK NIFTY", value: price, change: +change.toFixed(2) };
  }
  return { ...seedIndices, ...map };
}

// ── Live stocks ──
export async function fetchStocks() {
  const results = await fetchYahooQuotes(YAHOO.stocks);
  if (!results.length) return seedStocks;

  return results.map((r, i) => {
    const meta = r?.meta;
    const seed = seedStocks[i] || {};
    if (!meta) return seed;
    const prevClose = meta.previousClose || 1;
    const price = meta.regularMarketPrice || meta.chartPreviousClose || seed.ltp;
    const change = prevClose ? +(((price - prevClose) / prevClose) * 100).toFixed(2) : seed.change;
    return { ...seed, ltp: price, change };
  });
}

// ── Live Nifty intraday (from Yahoo Finance chart) ──
export async function fetchNiftyIntraday() {
  const data = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${YAHOO.nifty}?range=1d&interval=5m`, 10000);
  if (!data?.chart?.result?.[0]) return null;

  const r = data.chart.result[0];
  const timestamps = r.timestamp || [];
  const quotes = r.indicators?.quote?.[0];
  if (!quotes?.close?.length) return null;

  const points = [];
  for (let i = 0; i < timestamps.length; i++) {
    const t = new Date(timestamps[i] * 1000);
    const price = quotes.close[i];
    if (price === null || price === undefined) continue;
    const hh = String(t.getHours()).padStart(2, "0");
    const mm = String(t.getMinutes()).padStart(2, "0");
    points.push({ time: `${hh}:${mm}`, price: +price.toFixed(2) });
  }
  return points.length > 5 ? points : null;
}

// ── Live gold price from Yahoo Finance ──
export async function fetchGold() {
  const data = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${YAHOO.gold}?range=1d&interval=5m`, 8000);
  if (!data?.chart?.result?.[0]?.meta) return { etfs: seedGold, spot: { price: 72450, change: 0 } };
  const meta = data.chart.result[0].meta;
  const price = meta.regularMarketPrice || meta.chartPreviousClose || 72450;
  const prev = meta.previousClose || price;
  const change = ((price - prev) / prev) * 100;
  return { etfs: seedGold, spot: { price: +price.toFixed(2), change: +change.toFixed(2) } };
}

// ── GDELT news (free, no API key) ──
export async function fetchGdeltNews(query = "Indian stock market NSE OR BSE OR Nifty", max = 12) {
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&format=json&maxrecords=${max}&sort=datedesc`;
  const data = await fetchJson(url, 10000);
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
    tickers: [],
    summary: a.summary || "",
  }));
}

// ── CoinGecko for crypto prices (free, CORS-friendly) ──
export async function fetchCryptoPrice(ids = "bitcoin,ethereum") {
  const data = await fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, 8000);
  return data;
}

// ── ── ── ── ── ── ── ──
// useLiveData hook — fetches live data with refresh, falls back to seed
// ── ── ── ── ── ── ── ──
import { useState, useEffect, useCallback } from "react";

export function useLiveData(fetcher, seed, refreshMs = 30000) {
  const [data, setData] = useState(seed);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcher();
      if (result !== null && result !== undefined) {
        setData(result);
        setError(null);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    if (refreshMs > 0) {
      const t = setInterval(load, refreshMs);
      return () => clearInterval(t);
    }
  }, [load, refreshMs]);

  return { data, loading, error };
}
