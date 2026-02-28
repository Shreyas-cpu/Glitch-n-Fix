import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Coin, WatchlistItem } from "../../types/market";

export default function Dashboard() {
  const queryClient = useQueryClient();

  const [walletConnected, setWalletConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "market_cap",
    direction: "desc",
  });

  // Fetch Market Data
  const {
    data: coins = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["marketData"],
    queryFn: async () => {
      const res = await axios.get("/api/market");
      return Array.isArray(res.data) ? (res.data as Coin[]) : [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  // Set default selected coin
  useEffect(() => {
    if (coins.length > 0 && !selectedCoinId) {
      setSelectedCoinId(coins[0].id);
    }
  }, [coins, selectedCoinId]);

  // Fetch Watchlist
  const { data: watchlist = [] } = useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const res = await axios.get("/api/watchlist");
      return res.data as WatchlistItem[];
    },
  });

  const addToWatchlist = useMutation({
    mutationFn: (coin: Coin) =>
      axios.post("/api/watchlist", {
        item: { id: coin.id, symbol: coin.symbol, name: coin.name },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  const removeFromWatchlist = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/watchlist/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  // Filter + Sort
  const filteredCoins = useMemo(() => {
    const filtered = coins.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const field = sortConfig.field;
      const valA = a[field];
      const valB = b[field];

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
    return coins.find((c) => c.id === selectedCoinId) || coins[0];
  }, [coins, selectedCoinId]);

  const watchlistIds = watchlist.map((i) => i.id);

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

        {activeTab === "dashboard" ? (
          <div className="p-8 max-w-7xl mx-auto grid grid-cols-12 gap-8">
            {/* Stats Row */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Global Market Cap" value="$2.48T" change={2.4} icon={TrendingUp} />
              <StatCard title="24h Volume" value="$84.2B" change={-1.2} icon={Activity} />
              <StatCard title="BTC Dominance" value="52.4%" change={0.8} icon={ShieldCheck} />
            </div>

            {/* Chart + Table */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Price Chart */}
              <Card>
                <div className="w-full p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-zinc-500 animate-pulse">Loading market data...</div>
                    </div>
                  ) : isError ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-red-400">Failed to load market data. Try again later.</div>
                    </div>
                  ) : selectedCoinData ? (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[#151619] border border-[#141414] flex items-center justify-center text-white font-bold">
                          {selectedCoinData.symbol?.substring(0, 2).toUpperCase() || "$"}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{selectedCoinData.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-500 font-mono text-sm uppercase">{selectedCoinData.symbol}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                selectedCoinData.price_change_percentage_24h >= 0
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {selectedCoinData.price_change_percentage_24h > 0 ? "+" : ""}
                              {selectedCoinData.price_change_percentage_24h?.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                        <div className="ml-auto text-right">
                          <div className="text-2xl font-mono text-white font-bold">
                            ${selectedCoinData.current_price?.toLocaleString()}
                          </div>
                          <div className="text-xs text-zinc-500">Current Price</div>
                        </div>
                      </div>

                      <ResponsiveContainer width="100%" aspect={2.5}>
                        <AreaChart
                          data={(selectedCoinData.sparkline_in_7d?.price ?? []).map((p, i) => ({
                            time: i,
                            price: p,
                          }))}
                        >
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="5%"
                                stopColor={
                                  selectedCoinData.price_change_percentage_24h >= 0 ? "#10b981" : "#ef4444"
                                }
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor={
                                  selectedCoinData.price_change_percentage_24h >= 0 ? "#10b981" : "#ef4444"
                                }
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#141414" />
                          <XAxis dataKey="time" hide />
                          <YAxis hide domain={["auto", "auto"]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#151619",
                              border: "1px solid #141414",
                              borderRadius: "8px",
                            }}
                            itemStyle={{
                              color: selectedCoinData.price_change_percentage_24h >= 0 ? "#10b981" : "#ef4444",
                            }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
                            labelFormatter={() => ""}
                          />
                          <Area
                            type="monotone"
                            dataKey="price"
                            stroke={
                              selectedCoinData.price_change_percentage_24h >= 0 ? "#10b981" : "#ef4444"
                            }
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </>
                  ) : null}
                </div>
              </Card>

              {/* Market Table */}
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

            {/* Watchlist Sidebar */}
            <div className="col-span-12 lg:col-span-4 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
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
          <SettingsView />
        ) : null}
      </main>
    </div>
  );
}