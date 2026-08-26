import { useState } from "react";
import { generateNiftyIntraday } from "../data/seedData.js";
import NiftyChart from "../components/NiftyChart.jsx";
import SentimentOverview from "../components/SentimentOverview.jsx";
import NewsFeed from "../components/NewsFeed.jsx";
import StockWatchlist from "../components/StockWatchlist.jsx";
import PairsMonitor from "../components/PairsMonitor.jsx";
import EtfMomentum from "../components/EtfMomentum.jsx";
import GoldTracker from "../components/GoldTracker.jsx";
import MarketValuation from "../components/MarketValuation.jsx";
import PortfolioTracker from "../components/PortfolioTracker.jsx";
import Insights from "../components/Insights.jsx";

export default function Home() {
  const [niftyData] = useState(() => generateNiftyIntraday());
  const last = niftyData[niftyData.length - 1];
  const open = niftyData[0];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NiftyChart data={niftyData} last={last} open={open} />
        </div>
        <SentimentOverview />
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3"><NewsFeed /></div>
        <div className="lg:col-span-2"><StockWatchlist /></div>
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3"><PairsMonitor /></div>
        <div className="lg:col-span-2"><EtfMomentum /></div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <GoldTracker />
        <MarketValuation />
        <PortfolioTracker />
      </div>
      <Insights />
    </div>
  );
}
