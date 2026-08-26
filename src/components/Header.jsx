import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header({ status }) {
  const { pathname } = useLocation();

  const navItems = [
    { to: "/", label: "Dashboard", icon: "◈" },
    { to: "/news-aggregator", label: "News Intel", icon: "▦" },
    { to: "/news-feed", label: "News Feed", icon: "📰" },
    { to: "/world-markets", label: "World Mkts", icon: "🌐" },
    { to: "/source-health", label: "Source Health", icon: "⚙" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#0c0d14]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇮🇳</span>
            <div>
              <h1 className="text-lg font-bold tracking-wide text-zinc-100">Market Sentinel</h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Markets · News · Signal Discovery</p>
            </div>
          </div>
          <nav className="ml-6 flex gap-1">
            {navItems.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link key={item.to} to={item.to}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    active ? "bg-emerald-500/10 text-emerald-300" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}>
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-zinc-800/60 px-3 py-1.5">
            <span className={`live-dot h-2 w-2 rounded-full ${status.status === "OPEN" ? "bg-emerald-400" : status.status === "PRE" ? "bg-amber-400" : "bg-zinc-600"}`} />
            <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
          </div>
          <ClientClock />
          <a href="https://groww.in" target="_blank" rel="noreferrer"
            className="rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 px-4 py-1.5 text-xs font-bold text-white transition hover:scale-105">
            Open in Groww →
          </a>
        </div>
      </div>
    </header>
  );
}

function ClientClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const ist = new Date(time.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const hh = String(ist.getHours()).padStart(2, "0");
  const mm = String(ist.getMinutes()).padStart(2, "0");
  const ss = String(ist.getSeconds()).padStart(2, "0");
  return <span className="text-sm font-mono text-zinc-400">{hh}:{mm}:{ss} IST</span>;
}
