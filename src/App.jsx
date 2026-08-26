import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import NewsAggregator from "./pages/NewsAggregator.jsx";
import WorldMarkets from "./pages/WorldMarkets.jsx";
import SourceHealth from "./pages/SourceHealth.jsx";
import NewsFeed from "./pages/NewsFeed.jsx";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="news-aggregator" element={<NewsAggregator />} />
          <Route path="world-markets" element={<WorldMarkets />} />
          <Route path="news-feed" element={<NewsFeed />} />
          <Route path="source-health" element={<SourceHealth />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
