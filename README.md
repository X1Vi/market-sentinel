<div align="center">
  <h1>📊 Market Sentinel</h1>
  <p><strong>News sentiment engine + market intelligence dashboard for Indian and global markets</strong></p>
  <p>
    <a href="https://x1vi.github.io/market-sentinel">Live Demo</a> ·
    <a href="#features">Features</a> ·
    <a href="#pages">Pages</a> ·
    <a href="#setup">Setup</a> ·
    <a href="#deploy">Deploy</a> ·
    <a href="#stack">Stack</a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
    <img src="https://img.shields.io/badge/react-19-blue" alt="React 19" />
    <img src="https://img.shields.io/badge/vite-8-purple" alt="Vite 8" />
  </p>
</div>

---

Market Sentinel is a single-page React dashboard that ingests news from 12+ OSINT aggregators, scores sentiment, tracks Indian stock/Gold ETF portfolios, monitors pairs trading bots, and displays global market data — all in one place.

Built on top of a curated stack of open-source tools: RSSHub, Miniflux, GDELT, FinBERT, newsboat, beehive, and more.

---

## Features

- **News Sentiment Engine** — 18+ Indian + 15 global news sources scored by sentiment (positive/negative/neutral) with per-source color coding
- **Nifty 50 Intraday** — Live-style 75-point chart with open, change %, and day average
- **Stock Watchlist** — 12 NSE stocks with sentiment mini-bars and direction indicators
- **Pairs Trading Monitor** — BANKBEES vs SETFNIFBK spread with z-score, half-life, cointegration stats, and entry/exit zone detection
- **50/50 Portfolio Tracker** — Editable NIFTYBEES + GOLDBEES portfolio with SIP calculator (time-weighted returns, annual increment), allocation sliders, contribution log
- **ETF Momentum Rotation** — Ranked by 12M momentum for dual-momentum strategies
- **Nifty PE / Market Valuation** — PE gauge with earnings yield, equity risk premium, Graham recommendation
- **World Markets** — S&P 500 intraday chart, 10 global indices, 6 currencies, 5 commodities, global news feed
- **Aggregator Source Health** — Pipeline stats for all 12 OSINT aggregators (throughput, latency, uptime, sentiment breakdown)
- **Direction Engine** — AI-generated predictions with confidence levels and historical pattern references

## Pages

| Page | Route | Description |
|------|-------|-------------|
| **Dashboard** | `/` | Indian market overview: Nifty chart, sentiment, news, stocks, pairs bot, portfolio, valuation |
| **News Intel** | `/news-aggregator` | Aggregated news sentiment with pie chart, 7-day trend, Indian/World toggle |
| **World Markets** | `/world-markets` | S&P 500, global indices, currencies, commodities, international news |
| **Source Health** | `/source-health` | Aggregator pipeline status, latency, throughput, uptime for all sources |

## Setup

```sh
npm install
npm run dev
# → http://localhost:5173
```

## Deploy

```sh
npm run build     # production build → dist/
npm run deploy    # build + push to gh-pages branch
```

The app is configured for GitHub Pages with HashRouter. Once the `gh-pages` branch exists, enable Pages in your repo settings.

### Manual deploy from scratch

```sh
git init
git add -A
git commit -m "initial commit"
git remote add origin https://github.com/x1vi/market-sentinel.git
git push -u origin main
npm run deploy
```

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Routing | React Router (HashRouter) |
| Deploy | gh-pages → GitHub Pages |
| OSINT Backends | RSSHub, Miniflux, GDELT Pulse, FinBERT, newsboat, beehive, News Agent, News Llama, Noisepan, finance-news-aggregator, Signal Discovery |

## License

MIT
