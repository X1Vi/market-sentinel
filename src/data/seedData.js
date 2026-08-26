// ---- Nifty 50 intraday (75 pts, every 5 min, 9:15–15:30 IST) ----
export function generateNiftyIntraday() {
  const points = [];
  let price = 24482;
  const pattern = [
    0, 1, 2, -2, -1, -3, -4, -2, 0,
    3, 1, 4, 5, 2, 1, 3, 6, 4, 2, 0,
    -1, -2, 0, 2, 5, 3, 4, 7, 5, 6,
    4, 2, 3, 1, 0, -1, -3, -2, -4, -1,
    2, 4, 3, 5, 2, 1, 0, -2, -1, 3,
    4, 2, 1, -1, -3, -2, 0, 2, 1, 3,
    5, 4, 3, 2, 1, -1, -2, 0, 2, 3, 1, 2,
    0, -1, 1, 2, -1, -2, -3, -4, -6, -4, -2, 0, 2,
  ];
  const times = [];
  let h = 9, m = 15;
  for (let i = 0; i < 75; i++) {
    times.push(`${h}:${String(m).padStart(2, "0")}`);
    m += 5;
    if (m >= 60) { h++; m -= 60; }
  }
  for (let i = 0; i < 75; i++) {
    price += pattern[i] + (Math.random() - 0.5) * 2;
    points.push({ time: times[i], price: +price.toFixed(2) });
  }
  return points;
}

export const indices = {
  nifty:     { name: "NIFTY 50",  value: 24495.30, change: +0.42 },
  sensex:    { name: "SENSEX",    value: 80214.60, change: +0.38 },
  banknifty: { name: "BANK NIFTY", value: 52140.15, change: +0.61 },
  finnifty:  { name: "FIN NIFTY",  value: 23845.70, change: +0.55 },
  niftyit:   { name: "NIFTY IT",   value: 38420.10, change: -0.23 },
};

export const stocks = [
  { symbol: "RELIANCE",   ltp: 2940.15, change: +1.15, sentiment: 0.72, direction: "BULLISH", sector: "Oil & Gas" },
  { symbol: "TCS",        ltp: 4211.30, change: -0.31, sentiment: 0.34, direction: "NEUTRAL",  sector: "IT" },
  { symbol: "HDFCBANK",   ltp: 1691.40, change: +2.08, sentiment: 0.85, direction: "BULLISH", sector: "Banking" },
  { symbol: "INFY",       ltp: 1567.75, change: -0.82, sentiment: -0.12, direction: "BEARISH",  sector: "IT" },
  { symbol: "ITC",        ltp: 486.20,  change: +0.48, sentiment: 0.56, direction: "BULLISH",  sector: "FMCG" },
  { symbol: "SBIN",       ltp: 813.55,  change: +1.42, sentiment: 0.61, direction: "BULLISH",  sector: "PSU Bank" },
  { symbol: "BHARTIARTL", ltp: 1582.90, change: -0.19, sentiment: 0.28, direction: "NEUTRAL",  sector: "Telecom" },
  { symbol: "ICICIBANK",  ltp: 1231.05, change: +0.93, sentiment: 0.68, direction: "BULLISH",  sector: "Banking" },
  { symbol: "LT",         ltp: 3612.70, change: +1.08, sentiment: 0.73, direction: "BULLISH",  sector: "Infra" },
  { symbol: "KOTAKBANK",  ltp: 1813.30, change: -0.44, sentiment: 0.22, direction: "NEUTRAL",  sector: "Banking" },
  { symbol: "SUNPHARMA",  ltp: 1520.40, change: +1.87, sentiment: 0.79, direction: "BULLISH",  sector: "Pharma" },
  { symbol: "TITAN",      ltp: 3708.60, change: -1.12, sentiment: -0.41, direction: "BEARISH",  sector: "Consumer" },
];

export const goldETFs = [
  { symbol: "GOLDBEES",  name: "Nippon India Gold BeES",      ltp: 63.45, change: +0.76, sentiment: 0.62, direction: "BULLISH" },
  { symbol: "ICICIGOLD", name: "ICICI Prudential Gold ETF",   ltp: 63.20, change: +0.71, sentiment: 0.58, direction: "BULLISH" },
  { symbol: "GOLDSHARE", name: "UTI Gold ETF",                ltp: 62.10, change: +0.64, sentiment: 0.55, direction: "BULLISH" },
  { symbol: "HDFCGOLD",  name: "HDFC Gold ETF",               ltp: 63.80, change: +0.82, sentiment: 0.69, direction: "BULLISH" },
  { symbol: "GOLDIETF",  name: "SBI Gold ETF",                ltp: 62.90, change: +0.68, sentiment: 0.61, direction: "BULLISH" },
];
export const goldSpot = { price: 72450, change: +0.48, unit: "INR / 10g" };

export const newsArticles = [
  {
    id: 1, title: "RBI keeps repo rate unchanged at 6.5%, shifts stance to 'neutral'",
    source: "Economic Times", sourceIcon: "ET", time: "14:22", sentiment: 0.45, sentimentLabel: "POSITIVE",
    url: "https://economictimes.indiatimes.com/markets/stocks/news/rbi-keeps-repo-rate-unchanged-at-6-5-shifts-stance-to-neutral",
    tickers: ["HDFCBANK", "SBIN", "NIFTY"], summary: "MPC voted 5:1 to hold rates. RBI Governor says inflation trajectory improving, growth resilient."
  },
  {
    id: 2, title: "FIIs turn net buyers after 6 weeks — ₹3,420 crore inflow in cash segment",
    source: "Moneycontrol", sourceIcon: "MC", time: "13:58", sentiment: 0.68, sentimentLabel: "BULLISH",
    url: "https://www.moneycontrol.com/news/business/fiis-turn-net-buyers-after-6-weeks-3-420-crore-inflow-in-cash-segment",
    tickers: ["NIFTY", "SENSEX", "BANKNIFTY"], summary: "FPIs bought ₹12,480 crore in the last 3 sessions. DIIs also net buyers at ₹2,100 crore."
  },
  {
    id: 3, title: "HDFC Bank Q2 results beat estimates — net profit up 22% YoY",
    source: "Livemint", sourceIcon: "LM", time: "13:35", sentiment: 0.88, sentimentLabel: "STRONG BUY",
    url: "https://www.livemint.com/market/hdfc-bank-q2-results-beat-estimates-net-profit-up-22-yoy",
    tickers: ["HDFCBANK"], summary: "Net profit ₹16,821 crore vs est ₹15,400 crore. NII up 18%, asset quality improves. NIM at 4.6%."
  },
  {
    id: 4, title: "TCS flags demand slowdown — BFSI vertical growth decelerates",
    source: "CNBC-TV18", sourceIcon: "C18", time: "13:10", sentiment: -0.42, sentimentLabel: "NEGATIVE",
    url: "https://www.cnbctv18.com/market/tcs-flags-demand-slowdown-bfsi-vertical-growth-decelerates",
    tickers: ["TCS", "INFY", "NIFTYIT"], summary: "Management commentary cautious on near-term discretionary spending in US/EU banking clients."
  },
  {
    id: 5, title: "Reliance retail arm files DRHP for Jio Financial Services IPO",
    source: "Bloomberg Quint", sourceIcon: "BQ", time: "12:45", sentiment: 0.71, sentimentLabel: "POSITIVE",
    url: "https://www.bqprime.com/business/reliance-retail-arm-files-drhp-for-jio-financial-services-ipo",
    tickers: ["RELIANCE"], summary: "IPO size pegged at ₹15,000 crore. Opens in Q3 FY26. Valuation estimates at ₹1.2 lakh crore."
  },
  {
    id: 6, title: "Crude oil dips below USD82/bbl — positive for Indian macros and OMCs",
    source: "Economic Times", sourceIcon: "ET", time: "12:28", sentiment: 0.55, sentimentLabel: "POSITIVE",
    url: "https://economictimes.indiatimes.com/markets/stocks/news/crude-oil-dips-below-usd82-bbl-positive-for-indian-macros-and-omcs",
    tickers: ["NIFTY"], summary: "Brent crude eases on demand concern from China. Every USD1 fall saves India ~₹10,000 cr import bill."
  },
  {
    id: 7, title: "Gold hits all-time high — analysts see ₹75,000/10g by Diwali",
    source: "Zee Business", sourceIcon: "ZB", time: "12:02", sentiment: 0.78, sentimentLabel: "BULLISH",
    url: "https://www.zeebiz.com/markets/gold-hits-all-time-high-analysts-see-75-000-10g-by-diwali",
    tickers: ["GOLDBEES", "GOLDIETF"], summary: "Spot gold crosses ₹72,450. Fed rate cut expectations, geopolitical tensions, and Indian festive demand driving rally."
  },
  {
    id: 8, title: "Infosys loses major BFSI deal to TCS — client consolidation impact",
    source: "Moneycontrol", sourceIcon: "MC", time: "11:40", sentiment: -0.35, sentimentLabel: "NEGATIVE",
    url: "https://www.moneycontrol.com/news/business/infosys-loses-major-bfsi-deal-to-tcs-client-consolidation-impact",
    tickers: ["INFY", "TCS"], summary: "5-year deal reportedly moving to TCS. Infosys shares down 0.8%."
  },
  {
    id: 9, title: "GST collection for August at ₹1.74 lakh crore, up 10.5% YoY",
    source: "PIB India", sourceIcon: "PIB", time: "11:15", sentiment: 0.52, sentimentLabel: "POSITIVE",
    url: "https://pib.gov.in/PressReleaseIframePage.aspx?PRID=435243",
    tickers: ["NIFTY", "SENSEX"], summary: "Strong indirect tax numbers signal robust domestic consumption. 10th consecutive month above ₹1.6 lakh crore."
  },
  {
    id: 10, title: "ITC Q1: cigarette volume growth surprises at 6%; FMCG margins expand",
    source: "Livemint", sourceIcon: "LM", time: "10:50", sentiment: 0.64, sentimentLabel: "BULLISH",
    url: "https://www.livemint.com/market/itc-q1-cigarette-volume-growth-surprises-at-6-fmcg-margins-expand",
    tickers: ["ITC"], summary: "Revenue ₹17,482 cr (+8.2%). Cigarettes EBIT up 12%. FMCG EBITDA margin crosses 11% — highest ever."
  },
  {
    id: 11, title: "SBI raises ₹10,000 crore via infra bonds — credit growth target 14-16%",
    source: "CNBC-TV18", sourceIcon: "C18", time: "10:25", sentiment: 0.49, sentimentLabel: "POSITIVE",
    url: "https://www.cnbctv18.com/market/sbi-raises-10-000-crore-via-infra-bonds-credit-growth-target-14-16",
    tickers: ["SBIN"], summary: "Bonds oversubscribed 4.2x. Proceeds for infrastructure and affordable housing. CRAR at 14.8% post-raise."
  },
  {
    id: 12, title: "Sun Pharma gets US FDA approval for generic Revlimid — blockbuster opportunity",
    source: "Economic Times", sourceIcon: "ET", time: "10:02", sentiment: 0.82, sentimentLabel: "STRONG BUY",
    url: "https://economictimes.indiatimes.com/markets/stocks/news/sun-pharma-gets-us-fda-approval-for-generic-revlimid-blockbuster-opportunity",
    tickers: ["SUNPHARMA"], summary: "Lenalidomide capsules 2.5-20mg approved. US market size ~USD2.1B. Sun Pharma up 1.9% in early trade."
  },
  {
    id: 13, title: "Titan Q2 update: jewellery revenue growth moderates to 8% amid higher gold prices",
    source: "Moneycontrol", sourceIcon: "MC", time: "09:45", sentiment: -0.28, sentimentLabel: "CAUTION",
    url: "https://www.moneycontrol.com/news/business/titan-q2-update-jewellery-revenue-growth-moderates-to-8-amid-higher-gold-prices",
    tickers: ["TITAN"], summary: "Demand impacted by ₹72,000/10g gold. Same-store growth at 4% vs 11% last year. Management trims FY volume guidance."
  },
  {
    id: 14, title: "Nifty technicals: 24,500 resistance — breakout above this could trigger 250-point rally",
    source: "Zee Business", sourceIcon: "ZB", time: "09:30", sentiment: 0.31, sentimentLabel: "NEUTRAL",
    url: "https://www.zeebiz.com/markets/nifty-technicals-24-500-resistance-breakout-above-this-could-trigger-250-point-r",
    tickers: ["NIFTY"], summary: "Nifty facing stiff resistance at 24,500. RSI at 62. Support at 24,350. VWAP at 24,440."
  },
  {
    id: 15, title: "Bharti Airtel: Deutsche Bank upgrades to BUY, TP ₹1,850 — ARPU growth thesis",
    source: "Bloomberg Quint", sourceIcon: "BQ", time: "09:15", sentiment: 0.59, sentimentLabel: "BULLISH",
    url: "https://www.bqprime.com/business/bharti-airtel-deutsche-bank-upgrades-to-buy-tp-1-850-arpu-growth-thesis",
    tickers: ["BHARTIARTL"], summary: "DB expects ARPU to reach ₹230 by Q4 FY26. 5G monetisation and Africa business are key catalysts."
  },
  {
    id: 16, title: "L&T wins ₹7,000 cr EPC contract for Mumbai-Ahmedabad bullet train corridor",
    source: "Business Standard", sourceIcon: "BS", time: "08:50", sentiment: 0.66, sentimentLabel: "BULLISH",
    url: "https://www.business-standard.com/markets/l-t-wins-7-000-cr-epc-contract-for-mumbai-ahmedabad-bullet-train-corridor",
    tickers: ["LT"], summary: "Order book crosses ₹4.5 lakh crore. Infra capex momentum strong with NHAI and railway projects."
  },
  {
    id: 17, title: "SEBI tightens F&O rules — 6 new measures to curb retail speculation",
    source: "Economic Times", sourceIcon: "ET", time: "08:30", sentiment: -0.15, sentimentLabel: "MIXED",
    url: "https://economictimes.indiatimes.com/markets/stocks/news/sebi-tightens-f-o-rules-6-new-measures-to-curb-retail-speculation",
    tickers: ["NIFTY", "BANKNIFTY"], summary: "Upfront margin collection, higher lot sizes, weekly expiry rationalisation expected. Volumes may dip near-term."
  },
  {
    id: 18, title: "RBI bulletin: Indian economy well-placed; FY26 GDP growth forecast at 7.2%",
    source: "RBI", sourceIcon: "RBI", time: "08:15", sentiment: 0.57, sentimentLabel: "POSITIVE",
    url: "https://rbi.org.in/Scripts/BS_PressReleaseDetail.aspx?prid=158369",
    tickers: ["NIFTY", "SENSEX"], summary: "High frequency indicators point to sustained momentum. Private capex cycle turning. CPI seen at 4.5% avg."
  },
];

export function generateSentimentTrend() {
  const points = [];
  const baseSentiments = [
    0.15, 0.22, 0.18, 0.30, 0.25, 0.12, 0.08, -0.05, 0.02, 0.10,
    0.20, 0.15, 0.35, 0.28, 0.40, 0.32, 0.25, 0.18, 0.08, 0.12,
    0.22, 0.28, 0.35, 0.30, 0.45, 0.38, 0.50, 0.42, 0.35, 0.44,
  ];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const s = baseSentiments[29 - i] + (Math.random() - 0.5) * 0.1;
    points.push({ date: label, sentiment: +s.toFixed(2), nifty: 24400 + i * 3 + (Math.random() - 0.5) * 20 });
  }
  return points;
}

export const insights = [
  {
    title: "HDFC Bank — Strong Buy Signal",
    summary: "Q2 beat + FII buying + RBI neutral stance. Sentiment 0.85 across 14 news articles. Historical pattern: similar confluence preceded 8-12% 30-day rally in 4 of last 5 instances.",
    confidence: "High", direction: "BULLISH", color: "emerald",
  },
  {
    title: "Gold ETFs — Accumulate on Dips",
    summary: "Spot gold at ATH ₹72,450. Fed rate cut narrative + festive season demand + geopolitical risk premium. Analysts targeting ₹75,000 by Diwali. GOLDBEES AUM inflows at 18-month high.",
    confidence: "Medium", direction: "BULLISH", color: "amber",
  },
  {
    title: "IT Sector — Wait and Watch",
    summary: "TCS caution on BFSI demand + Infosys deal loss. NIFTY IT down 0.23%. Global IT spending forecasts being revised down. Wait for Q3 commentary before fresh longs.",
    confidence: "Medium", direction: "CAUTION", color: "red",
  },
  {
    title: "Nifty 24,500 — Key Resistance Level",
    summary: "Three failed attempts at 24,500 this session. RSI at 62, not overbought. Break above 24,500 with volume targets 24,680-24,750. Support at 24,350 needs to hold for bullish bias.",
    confidence: "Medium", direction: "NEUTRAL-BULLISH", color: "blue",
  },
  {
    title: "Sun Pharma — FDA Catalyst Play",
    summary: "Lenalidomide ANDA approval opens USD2.1B US market. Revenue ramp expected Q3-Q4. Stock up 1.87% today. Target ₹1,700 (12% upside) based on FY26 PE rerating.",
    confidence: "Medium", direction: "BULLISH", color: "emerald",
  },
];

export function getMarketStatus() {
  const now = new Date();
  const istHour = now.getUTCHours() + 5;
  const istMin = now.getUTCMinutes();
  const time = istHour * 60 + istMin;
  const day = now.getUTCDay();
  const isWeekend = day === 0 || day === 6;
  const isOpen = !isWeekend && time >= 555 && time <= 930;
  if (isWeekend) return { status: "CLOSED", label: "Market Closed — Weekend", color: "text-zinc-500" };
  if (time < 555) return { status: "PRE", label: "Pre-Open (9:15 AM)", color: "text-amber-400" };
  if (time > 930) return { status: "POST", label: "Market Closed", color: "text-zinc-500" };
  return { status: "OPEN", label: "Market Open", color: "text-emerald-400" };
}

// ---- Pairs Trading (BANKBEES vs SETFNIFBK) ----
export const pairsData = {
  legA: { symbol: "BANKBEES", name: "Nippon India Bank ETF", price: 524.15 },
  legB: { symbol: "SETFNIFBK", name: "SBI Nifty Bank ETF", price: 526.30 },
  spread: -2.15,
  spreadNorm: 1.72,
  zScore: 1.72,
  halfLife: 0,
  halfLifeUnit: "days",
  adfPValue: 0.003,
  cointegrated: true,
  winRate: 73.4,
  signal: "HOLD",
  tradesToday: 0,
  totalTrades: 342,
  recentReturns: [0.4, 1.2, -0.3, 0.8, -0.1, 0.6, 0.9, -0.5, 1.1, 0.3],
  spreadHistory: [
    { time: "9:15", val: 1.1 }, { time: "9:30", val: 1.3 }, { time: "9:45", val: 1.8 },
    { time: "10:00", val: 2.0 }, { time: "10:15", val: 2.4 }, { time: "10:30", val: 2.1 },
    { time: "10:45", val: 1.9 }, { time: "11:00", val: 1.5 }, { time: "11:15", val: 1.8 },
    { time: "11:30", val: 2.0 }, { time: "11:45", val: 2.3 }, { time: "12:00", val: 2.5 },
    { time: "12:15", val: 2.1 }, { time: "12:30", val: 1.7 }, { time: "12:45", val: 1.9 },
    { time: "13:00", val: 2.2 }, { time: "13:15", val: 1.8 }, { time: "13:30", val: 2.1 },
    { time: "13:45", val: 1.4 }, { time: "14:00", val: 1.7 }, { time: "14:15", val: 2.0 },
    { time: "14:30", val: 1.8 }, { time: "14:45", val: 2.2 }, { time: "15:00", val: 1.6 },
    { time: "15:15", val: 1.7 }, { time: "15:30", val: 1.7 },
  ],
};

// ---- ETF Momentum / Sector Rotation ----
export const etfMomentum = [
  { symbol: "GOLDBEES",  name: "Gold ETF",         category: "Commodity",  m1: +3.4, m3: +8.2,  m12: +22.9, momentum: 22.9, rank: 1 },
  { symbol: "JUNIORBEES",name: "Nifty Next 50",     category: "Broad Market", m1: +2.8, m3: +7.1,  m12: +20.3, momentum: 20.3, rank: 2 },
  { symbol: "NIFTYBEES", name: "Nifty 50",          category: "Broad Market", m1: +2.1, m3: +5.8,  m12: +18.2, momentum: 18.2, rank: 3 },
  { symbol: "CPSEETF",   name: "CPSE (PSU)",        category: "PSU",         m1: +1.2, m3: +4.5,  m12: +16.8, momentum: 16.8, rank: 4 },
  { symbol: "BANKBEES",  name: "Nifty Bank",        category: "Banking",     m1: +1.8, m3: +4.9,  m12: +14.5, momentum: 14.5, rank: 5 },
  { symbol: "PSUBNKBEES",name: "PSU Bank",          category: "Banking",     m1: +0.5, m3: +3.2,  m12: +12.1, momentum: 12.1, rank: 6 },
];

// ---- Market Valuation ----
export const marketValuation = {
  niftyPE: 22.4,
  niftyPE1YHigh: 26.8,
  niftyPE1YLow: 18.2,
  niftyPEAvg: 22.1,
  zone: "Fair",
  niftyPEHistory: [
    21.8, 22.1, 22.0, 21.5, 21.2, 20.8, 20.5, 20.2, 20.0, 20.4,
    21.0, 21.5, 21.8, 22.0, 22.3, 22.5, 22.8, 23.0, 23.2, 23.5,
    23.8, 24.0, 24.2, 23.8, 23.5, 23.2, 22.8, 22.5, 22.4, 22.4,
  ],
  earningsYield: 4.46,
  bond10y: 7.12,
  equityRiskPremium: -2.66,
  shillerPE: 28.1,
  grahamRecommendation: "Maintain 50/50 stock/gold allocation — rebalance if Nifty PE crosses 25 or falls below 18.",
};

// ---- 50/50 Portfolio Tracker ----
export const portfolioTracker = {
  strategy: "50% NIFTYBEES + 50% GOLDBEES",
  targetAllocation: { niftybees: 50, goldbees: 50 },
  currentAllocation: { niftybees: 52, goldbees: 48 },
  deviationNifty: +2.0,
  deviationGold: -2.0,
  sipMonthly: 5000,
  totalInvested: 45000,
  currentValue: 49200,
  totalReturn: +9.3,
  annualizedReturn: 12.8,
  maxDrawdown: 6.7,
  lastRebalance: "14 Aug 2026",
  nextRebalance: "14 Aug 2027",
  sipHistory: [
    { month: "Mar", invested: 5000, value: 5150 },
    { month: "Apr", invested: 5000, value: 10200 },
    { month: "May", invested: 5000, value: 15800 },
    { month: "Jun", invested: 5000, value: 21100 },
    { month: "Jul", invested: 5000, value: 26900 },
    { month: "Aug (partial)", invested: 20000, value: 49200 },
  ],
  rebalanceSignal: false,
  status: "ON TRACK",
};

// ---- Aggregator Sources (from market-osint-stack) ----
export const aggregatorSources = [
  { id: "beehive", name: "Beehive", type: "AI News Aggregator", lang: "Python", sources: 45, articlesToday: 1280, articlesTotal: 284000, latencyMs: 240, uptime: 99.2, posPct: 35, negPct: 18, neutralPct: 47, topEntities: ["RELIANCE", "TCS", "HDFCBANK"], status: "active" },
  { id: "news-agent", name: "News Agent", type: "LLM-Powered Agent", lang: "Python", sources: 120, articlesToday: 2340, articlesTotal: 512000, latencyMs: 180, uptime: 99.7, posPct: 38, negPct: 22, neutralPct: 40, topEntities: ["INFY", "ITC", "SBIN"], status: "active" },
  { id: "rsshub", name: "RSSHub", type: "RSS Feed Generator", lang: "TypeScript", sources: 300, articlesToday: 8200, articlesTotal: 4100000, latencyMs: 65, uptime: 99.9, posPct: 30, negPct: 15, neutralPct: 55, topEntities: ["NIFTY", "SENSEX", "BANKNIFTY"], status: "active" },
  { id: "miniflux", name: "Miniflux", type: "RSS Reader", lang: "Go", sources: 85, articlesToday: 4100, articlesTotal: 1200000, latencyMs: 45, uptime: 100, posPct: 32, negPct: 17, neutralPct: 51, topEntities: ["RELIANCE", "TCS", "WIPRO"], status: "active" },
  { id: "newsboat", name: "Newsboat", type: "Terminal RSS Reader", lang: "C++", sources: 60, articlesToday: 2800, articlesTotal: 680000, latencyMs: 55, uptime: 100, posPct: 31, negPct: 16, neutralPct: 53, topEntities: ["HDFCBANK", "ICICIBANK", "KOTAKBANK"], status: "active" },
  { id: "gdelt-pulse", name: "GDELT Pulse", type: "Global Event DB", lang: "Python", sources: 200, articlesToday: 15000, articlesTotal: 8400000, latencyMs: 950, uptime: 98.5, posPct: 28, negPct: 25, neutralPct: 47, topEntities: ["NIFTY", "SENSEX", "USDINR"], status: "active" },
  { id: "noisepan", name: "Noisepan", type: "Signal Extractor", lang: "Go", sources: 30, articlesToday: 420, articlesTotal: 89000, latencyMs: 120, uptime: 99.8, posPct: 42, negPct: 20, neutralPct: 38, topEntities: ["GOLDBEES", "GOLDIETF", "SILVER"], status: "active" },
  { id: "finance-news-agg", name: "Finance News Aggr.", type: "Finance News", lang: "Python", sources: 35, articlesToday: 980, articlesTotal: 195000, latencyMs: 310, uptime: 98.9, posPct: 36, negPct: 19, neutralPct: 45, topEntities: ["RELIANCE", "TATASTEEL", "HINDUNILVR"], status: "active" },
  { id: "finance-news-rs", name: "Finance News (Rust)", type: "Finance News", lang: "Rust", sources: 35, articlesToday: 1050, articlesTotal: 210000, latencyMs: 28, uptime: 99.9, posPct: 35, negPct: 18, neutralPct: 47, topEntities: ["SBIN", "ICICIBANK", "AXISBANK"], status: "active" },
  { id: "news-llama", name: "News Llama", type: "AI News Digest", lang: "Python", sources: 50, articlesToday: 2100, articlesTotal: 420000, latencyMs: 200, uptime: 99.1, posPct: 40, negPct: 21, neutralPct: 39, topEntities: ["M&M", "MARUTI", "TATAMOTORS"], status: "active" },
  { id: "signal-discovery", name: "Signal Discovery", type: "Statistical Research", lang: "TypeScript", sources: 15, articlesToday: 380, articlesTotal: 76000, latencyMs: 320, uptime: 99.5, posPct: 44, negPct: 22, neutralPct: 34, topEntities: ["BTC", "ETH", "HYPERLIQUID"], status: "active" },
  { id: "indian-sentinel", name: "Market Sentinel", type: "Indian Market Sentiment", lang: "JavaScript", sources: 22, articlesToday: 650, articlesTotal: 130000, latencyMs: 180, uptime: 99.6, posPct: 38, negPct: 20, neutralPct: 42, topEntities: ["NIFTY", "BANKNIFTY", "GOLDBEES"], status: "active" },
];

// ---- Aggregated news feed (enriched with aggregator tags) ----
export const aggregatorNewsFeed = [
  { id: "an-1", aggregator: "beehive", time: "14:25", title: "Nifty reclaims 24,500 as FMCG stocks rally", source: "Economic Times", sentiment: 0.52, label: "POSITIVE", url: "https://economictimes.indiatimes.com/markets/stocks/news/nifty-reclaims-24-500-as-fmcg-stocks-rally", tickers: ["ITC", "HINDUNILVR", "NESTLEIND"], summary: "FMCG index up 1.8% led by ITC. Nifty closed above 24,500 after 3 sessions." },
  { id: "an-2", aggregator: "beehive", time: "14:22", title: "RBI MPC minutes show split vote on rate cut timing", source: "Moneycontrol", sentiment: -0.15, label: "CAUTION", url: "https://www.moneycontrol.com/news/business/rbi-mpc-minutes-show-split-vote-on-rate-cut-timing", tickers: ["HDFCBANK", "SBIN", "NIFTY"], summary: "Two members favoured early rate cut citing growth concerns. Governor Das favoured wait-and-watch." },
  { id: "an-3", aggregator: "news-agent", time: "14:18", title: "TCS, Infosys lead IT recovery on US rate cut hopes", source: "CNBC-TV18", sentiment: 0.48, label: "POSITIVE", url: "https://www.cnbctv18.com/market/tcs-infosys-lead-it-recovery-on-us-rate-cut-hopes", tickers: ["TCS", "INFY", "NIFTYIT"], summary: "NIFTY IT up 1.2%. Fed chair signals potential rate cut in September meeting." },
  { id: "an-4", aggregator: "news-agent", time: "14:10", title: "Gold ETF inflows surge 340% YoY in August", source: "Livemint", sentiment: 0.71, label: "BULLISH", url: "https://www.livemint.com/market/gold-etf-inflows-surge-340-yoy-in-august", tickers: ["GOLDBEES", "GOLDIETF", "HDFCGOLD"], summary: "Net inflows at ₹4,200 cr vs ₹960 cr last year. AUM crosses ₹1.2 lakh cr." },
  { id: "an-5", aggregator: "rsshub", time: "14:05", title: "Brent crude holds above USD81 on Middle East tensions", source: "Reuters", sentiment: -0.22, label: "CAUTION", url: "https://www.reuters.com/markets/brent-crude-holds-above-usd81-on-middle-east-tensions", tickers: ["IOC", "BPCL", "HPCL"], summary: "Oil prices steady as Israel-Hezbollah tensions offset China demand concerns." },
  { id: "an-6", aggregator: "rsshub", time: "14:00", title: "SEBI proposes stricter disclosure norms for FPIs", source: "Business Standard", sentiment: -0.08, label: "NEUTRAL", url: "https://www.business-standard.com/markets/sebi-proposes-stricter-disclosure-norms-for-fpis", tickers: ["NIFTY", "SENSEX"], summary: "New rules require granular disclosure of beneficial ownership for holdings above ₹25,000 cr." },
  { id: "an-7", aggregator: "miniflux", time: "13:52", title: "HDFC Bank crosses ₹17 lakh cr market cap, joins top 5", source: "Zee Business", sentiment: 0.62, label: "BULLISH", url: "https://www.zeebiz.com/markets/hdfc-bank-crosses-17-lakh-cr-market-cap-joins-top-5", tickers: ["HDFCBANK"], summary: "Stock at all-time high. Market cap now exceeds ₹17 lakh cr — 5th Indian company to achieve milestone." },
  { id: "an-8", aggregator: "miniflux", time: "13:45", title: "SBI posts 18% rise in Q1 net profit on strong loan growth", source: "Economic Times", sentiment: 0.55, label: "POSITIVE", url: "https://economictimes.indiatimes.com/markets/stocks/news/sbi-posts-18-rise-in-q1-net-profit-on-strong-loan-growth", tickers: ["SBIN"], summary: "Net profit ₹21,384 cr. Domestic loan growth at 16.2%. NIM stable at 3.22%." },
  { id: "an-9", aggregator: "gdelt-pulse", time: "13:38", title: "China industrial output misses estimates — global demand concerns", source: "Bloomberg", sentiment: -0.31, label: "NEGATIVE", url: "https://www.bloomberg.com/news/articles/china-industrial-output-misses-estimates-global-demand-concerns", tickers: ["TATASTEEL", "JSWSTEEL", "HINDALCO"], summary: "China's July industrial production at 4.8% vs 5.2% expected. Commodity prices dip." },
  { id: "an-10", aggregator: "gdelt-pulse", time: "13:30", title: "Monsoon deficit narrows to 4% — agri outlook improves", source: "PIB India", sentiment: 0.42, label: "POSITIVE", url: "https://pib.gov.in/PressReleaseIframePage.aspx?PRID=435243", tickers: ["ITC", "COROMANDEL", "PIIND"], summary: "Southwest monsoon covers entire country. Rainfall deficit down from 11% in July." },
  { id: "an-11", aggregator: "noisepan", time: "13:22", title: "Gold-silver ratio drops to 82 — silver outperforming", source: "Zee Business", sentiment: 0.36, label: "POSITIVE", url: "https://www.zeebiz.com/markets/gold-silver-ratio-drops-to-82-silver-outperforming", tickers: ["GOLDBEES", "SILVER"], summary: "Silver up 28% YTD vs gold 18%. Ratio down from 90 in Jan." },
  { id: "an-12", aggregator: "noisepan", time: "13:15", title: "Smallcap index correction: 12 stocks down over 30% in 3 months", source: "Moneycontrol", sentiment: -0.45, label: "CAUTION", url: "https://www.moneycontrol.com/news/business/smallcap-index-correction-12-stocks-down-over-30-in-3-months", tickers: ["NIFTYSMALL", "NIFTYMID"], summary: "BSE Smallcap index down 8% from peak. Valuation concerns persist." },
  { id: "an-13", aggregator: "finance-news-agg", time: "13:08", title: "Reliance to demerge O2C business into separate entity", source: "Economic Times", sentiment: 0.49, label: "POSITIVE", url: "https://economictimes.indiatimes.com/markets/stocks/news/reliance-to-demerge-o2c-business-into-separate-entity", tickers: ["RELIANCE"], summary: "O2C business valuation estimated at ₹4.5 lakh cr. Demerger expected within 6 months." },
  { id: "an-14", aggregator: "finance-news-agg", time: "13:00", title: "Tata Motors EV sales cross 1 lakh units milestone", source: "CNBC-TV18", sentiment: 0.58, label: "BULLISH", url: "https://www.cnbctv18.com/market/tata-motors-ev-sales-cross-1-lakh-units-milestone", tickers: ["TATAMOTORS"], summary: "EV portfolio includes Tiago, Tigor, Nexon and Punch. Market share at 72% in EV segment." },
  { id: "an-15", aggregator: "news-llama", time: "12:45", title: "Nifty PE at 22.4 — should investors be worried?", source: "Livemint", sentiment: -0.12, label: "CAUTION", url: "https://www.livemint.com/market/nifty-pe-at-22-4-should-investors-be-worried", tickers: ["NIFTY"], summary: "Current PE above 10-year average of 20.6 but below FY21 peak of 28.1. Mixed signals." },
  { id: "an-16", aggregator: "news-llama", time: "12:30", title: "Infosys partners with NVIDIA to launch new AI platform", source: "Business Standard", sentiment: 0.65, label: "BULLISH", url: "https://www.business-standard.com/markets/infosys-partners-with-nvidia-to-launch-new-ai-platform", tickers: ["INFY", "TCS", "LTTS"], summary: "Platform called Infosys Topaz AI integrates NVIDIA GPUs for enterprise automation." },
  { id: "an-17", aggregator: "signal-discovery", time: "12:15", title: "BTC breaks above USD68K — ETF inflows at 3-month high", source: "CoinDesk", sentiment: 0.72, label: "BULLISH", url: "https://www.coindesk.com/markets/btc-breaks-above-usd68k-etf-inflows-at-3-month-high", tickers: ["BTC", "ETH", "HYPE"], summary: "Bitcoin ETF net inflows $540M this week. Open interest on BTC futures at $38B." },
  { id: "an-18", aggregator: "signal-discovery", time: "12:00", title: "Polymarket 'Fed cuts rates in 2026' probability jumps to 72%", source: "Polymarket", sentiment: 0.44, label: "POSITIVE", url: "https://polymarket.com/event/polymarket-fed-cuts-rates-in-2026-probability-jumps-to-72", tickers: ["NIFTY", "SENSEX", "USDINR"], summary: "Market probability up from 58% last week. Non-farm payrolls miss was the catalyst." },
  { id: "an-19", aggregator: "indian-sentinel", time: "11:45", title: "BANKBEES vs SETFNIFBK spread at z-score 1.72 — watching entry zone", source: "Market Sentinel", sentiment: 0.33, label: "NEUTRAL", url: "/bankbees-vs-setfnifbk-spread-at-z-score-1-72-watching-entry-zone", tickers: ["BANKBEES", "SETFNIFBK"], summary: "Current z-score 1.72. Entry threshold at 2.0. Half-life 0 days — instant reversion expected." },
  { id: "an-20", aggregator: "indian-sentinel", time: "11:30", title: "FII/DII flows today: FIIs net buy ₹1,240 cr, DIIs net buy ₹820 cr", source: "NSE", sentiment: 0.48, label: "POSITIVE", url: "https://www.nseindia.com/market-data/live-marketfii-dii-flows-today-fiis-net-buy-1-240-cr-diis-net-buy-820-cr", tickers: ["NIFTY", "SENSEX"], summary: "FII buying 5th consecutive session. Total June inflow at ₹8,200 cr." },
  { id: "an-21", aggregator: "beehive", time: "11:15", title: "Maruti Suzuki launches eVitara at ₹14 lakh — best-selling EV contender", source: "AutoCar India", sentiment: 0.56, label: "BULLISH", url: "https://www.autocarindia.com/car-news/maruti-suzuki-launches-evitara-at-14-lakh-best-selling-ev-contender", tickers: ["MARUTI", "TATAMOTORS", "M&M"], summary: "Range 500km. Bookings open. Production capacity 1 lakh units/year at Gujarat plant." },
  { id: "an-22", aggregator: "rsshub", time: "11:00", title: "Adani Group stocks rally on Gujarat govt green energy push", source: "CNBC-TV18", sentiment: 0.41, label: "POSITIVE", url: "https://www.cnbctv18.com/market/adani-group-stocks-rally-on-gujarat-govt-green-energy-push", tickers: ["ADANIENT", "ADANIGREEN", "ADANIPORTS"], summary: "Gujarat announces 50 GW solar park. Adani Green to develop 30% of capacity." },
  { id: "an-23", aggregator: "miniflux", time: "10:45", title: "RBI tightens norms for personal loans — NBFC stocks dip", source: "Economic Times", sentiment: -0.28, label: "NEGATIVE", url: "https://economictimes.indiatimes.com/markets/stocks/news/rbi-tightens-norms-for-personal-loans-nbfc-stocks-dip", tickers: ["BAJFINANCE", "HDFCBNK", "SBIN"], summary: "Risk weight on consumer credit increased to 125% from 100%. NBFC margins to compress." },
  { id: "an-24", aggregator: "finance-news-rs", time: "10:30", title: "Zomato delivers first profitable quarter — net profit ₹124 cr", source: "Moneycontrol", sentiment: 0.74, label: "STRONG BUY", url: "https://www.moneycontrol.com/news/business/zomato-delivers-first-profitable-quarter-net-profit-124-cr", tickers: ["ZOMATO", "SWIGGY"], summary: "Revenue ₹4,450 cr. Blinkit contributes 35%. GOV growth at 48% YoY." },
];

// ---- Aggregator sentiment 7-day trend ----
export const aggregatorSentimentTrend = [
  { date: "20 Aug", avg: 0.28, articles: 4800 },
  { date: "21 Aug", avg: 0.32, articles: 5100 },
  { date: "22 Aug", avg: 0.25, articles: 4900 },
  { date: "23 Aug", avg: 0.18, articles: 4600 },
  { date: "24 Aug", avg: 0.05, articles: 1200 },
  { date: "25 Aug", avg: 0.08, articles: 1100 },
  { date: "26 Aug", avg: 0.22, articles: 3400 },
];

// ---- Overall sentiment stats from aggregators ----
export const aggregatorSentimentStats = {
  totalArticlesToday: 39380,
  totalArticlesAllTime: 16294000,
  overallAvgSentiment: 0.22,
  positivePct: 36,
  negativePct: 19,
  neutralPct: 45,
  topTopics: ["Banking", "IT", "Oil & Gas", "FMCG", "Pharma", "Auto", "Gold", "Infra", "PSU", "Crypto"],
  topEntities: ["RELIANCE", "TCS", "HDFCBANK", "NIFTY", "ICICIBANK", "INFY", "SBIN", "ITC", "BHARTIARTL", "KOTAKBANK"],
  uniqueTickersMentioned: 412,
  avgLatencySec: 0.18,
  sourcesMonitored: 997,
  latestUpdate: "14:25 IST",
};
