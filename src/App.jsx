import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import NewsAggregator from "./pages/NewsAggregator.jsx";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="news-aggregator" element={<NewsAggregator />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
