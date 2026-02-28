import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useMarketData } from "../../hooks/useMarketData";

import Sidebar, { TabType } from "./Sidebar";
import Header from "./Header";
import { StatCard } from "../ui/StatCard";
import { Card } from "../ui/Card";
import { MarketTable, SortConfig, SortField } from "../ui/MarketTable";
import { WatchlistSidebar } from "../ui/WatchlistSidebar";
import { ActivityView } from "../views/ActivityView";
import { TrendingView } from "../views/TrendingView";
import { SettingsView } from "../views/SettingsView";
import { TrendingUp, Activity, ShieldCheck } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Coin, WatchlistItem } from "../../types/market";
import { useWatchlist } from "../../hooks/useWatchlist";
import { useSettings } from "../../hooks/useSettings";
import { useGeminiPrice } from "../../hooks/useGeminiPrice";

export default function Dashboard() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // user preferences persisted via hook
  const { settings, setSettings, save: saveSettings, restore: restoreSettings } =
    useSettings();

  // fetch a live ticker from Gemini (uses API key if provided)
  const { data: geminiData } = useGeminiPrice("btcusd");

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "market_cap",
    direction: "desc",
  });

  // Fetch Market Data
  const { coins = [], isLoading } = useMarketData();

  // Local forced fetch fallback: poll CoinGecko directly to guarantee live prices
  const [liveCoins, setLiveCoins] = React.useState<Coin[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout | null = null;

    const fetchDirect = async () => {
      try {
        const res = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              order: "market_cap_desc",
              per_page: 10,
              page: 1,
              sparkline: true,
            },
            timeout: 8000,
          }
        );
        if (!mounted) return;
        if (Array.isArray(res.data) && res.data.length) {
          setLiveCoins(res.data);
          setLastUpdated(new Date());
        }
      } catch (err) {
        // ignore; fallback to existing hook
      }
    };

    // initial fetch + polling
    fetchDirect();
    timer = setInterval(fetchDirect, 5000); // every 5s

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  const displayCoins = liveCoins.length ? liveCoins : coins;

  useEffect(() => {
    if (displayCoins.length) setLastUpdated(new Date());
    console.log("displayCoins updated", displayCoins.map(c=>c.id));
  }, [displayCoins]);

  // Set default selected coin (based on whichever source we display)
  useEffect(() => {
    if (displayCoins.length > 0 && !selectedCoinId) {
      setSelectedCoinId(displayCoins[0].id);
    }
  }, [displayCoins, selectedCoinId]);

  // Watchlist helpers (centralized hook)
  const {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    watchlistIds,
  } = useWatchlist();

  const filteredCoins = useMemo(() => {
    const filtered = displayCoins.filter(
      (c: Coin) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a: Coin, b: Coin) => {
      const field = sortConfig.field;
      const valA = a[field] as string | number;
      const valB = b[field] as string | number;

      if (typeof valA === "string" && typeof valB === "string") {
        return sortConfig.direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortConfig.direction === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
  }, [coins, searchQuery, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const selectedCoinData = useMemo(() => {
    return coins.find((c: Coin) => c.id === selectedCoinId) || coins[0];
  }, [coins, selectedCoinId]);


  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-300 font-sans">
      <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />

      <main className="pl-64">
        <Header
          walletConnected={walletConnected}
          setWalletConnected={setWalletConnected}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        {lastUpdated && (
          <div className="px-8 text-xs text-zinc-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}

        {activeTab === "dashboard" ? (
          <div className="p-8 max-w-7xl mx-auto grid grid-cols-12 gap-8">
            {/* Stats */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Global Market Cap" value="$2.48T" change={2.4} icon={TrendingUp} />
              <StatCard title="24h Volume" value="$84.2B" change={-1.2} icon={Activity} />
              <StatCard title="BTC Dominance" value="52.4%" change={0.8} icon={ShieldCheck} />
              {geminiData && (
                <StatCard
                  title="BTC (Gemini)"
                  value={`$${geminiData.last.toLocaleString()}`}
                  change={0}
                  icon={TrendingUp}
                />
              )}
            </div>

            {/* Market Section */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <Card>
                <div className="w-full p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#151619] border border-[#141414] flex items-center justify-center text-white font-bold">
                      {selectedCoinData?.symbol?.substring(0, 2).toUpperCase() || "$"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedCoinData?.name || "Asset"}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 font-mono text-sm uppercase">{selectedCoinData?.symbol}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCoinData?.price_change_percentage_24h >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                          {selectedCoinData?.price_change_percentage_24h > 0 ? "+" : ""}{selectedCoinData?.price_change_percentage_24h?.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-mono text-white font-bold">${selectedCoinData?.current_price?.toLocaleString()}</div>
                      <div className="text-xs text-zinc-500">Current Price</div>
                    </div>
                  </div>

                  {selectedCoinData && (
                    <ResponsiveContainer width="100%" aspect={2.5}>
                      <AreaChart
                        data={(selectedCoinData.sparkline_in_7d?.price ?? []).map(
                          (p: number, i: number) => ({
                            time: i,
                            price: p,
                          })
                        )}
                      >
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={selectedCoinData?.price_change_percentage_24h >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={selectedCoinData?.price_change_percentage_24h >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0} />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#141414"
                        />

                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={["auto", "auto"]} />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#151619",
                            border: "1px solid #141414",
                            borderRadius: "8px",
                          }}
                          itemStyle={{ color: selectedCoinData?.price_change_percentage_24h >= 0 ? "#10b981" : "#ef4444" }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
                          labelFormatter={() => ""}
                        />

                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke={selectedCoinData?.price_change_percentage_24h >= 0 ? "#10b981" : "#ef4444"}
                          fillOpacity={1}
                          fill="url(#colorPrice)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>

              <Card>
                <MarketTable
                  coins={filteredCoins}
                  onAddToWatchlist={(c) => addToWatchlist.mutate(c)}
                  watchlistIds={watchlistIds}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  selectedCoinId={selectedCoinId}
                  onRowClick={setSelectedCoinId}
                />
              </Card>
            </div>

            {/* Watchlist */}
            <div className="col-span-12 lg:col-span-4 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2 custom-scrollbar">
              <WatchlistSidebar
                items={watchlist}
                onRemove={(id) => removeFromWatchlist.mutate(id)}
              />
            </div>
          </div>

        ) : activeTab === "activity" ? (
          <ActivityView />

        ) : activeTab === "trending" ? (
          <TrendingView />

        ) : activeTab === "settings" ? (
          <SettingsView
            settings={settings}
            setSettings={setSettings}
            onSave={saveSettings}
            onRestore={restoreSettings}
            onDisconnect={() => setWalletConnected(false)}
          />

        ) : (
          <div className="p-8 max-w-7xl mx-auto h-[80vh] flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 rounded-full bg-[#151619] border border-[#141414] flex items-center justify-center mb-6"
            >
              <ShieldCheck size={32} className="text-emerald-500" />
            </motion.div>
            <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-widest">Unknown Tab</h2>
            <p className="text-zinc-500 text-lg">This module is currently disabled or under development.</p>
            <button
              onClick={() => setActiveTab("dashboard")}
              className="mt-8 px-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-all"
            >
              Return Home
            </button>
          </div>
        )}
      </main>
    </div>
  );
}