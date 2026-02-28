import React, { useState, useMemo, useEffect, useRef } from "react";
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
import { ProfileView } from "../views/ProfileView";
import { AuthModal } from "../ui/AuthModal";
import { WalletConnectModal } from "../ui/WalletConnectModal";
import { TradePanel, Trade } from "../ui/TradePanel";
import { RecentTrades } from "../ui/RecentTrades";

interface WalletInfo {
  address: string;
  balance: number;
}

import { TrendingUp, Activity, ShieldCheck, ArrowDownUp } from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { motion } from "motion/react";
import { Coin, WatchlistItem } from "../../types/market";

export default function Dashboard() {
  const queryClient = useQueryClient();

  const [walletConnected, setWalletConnected] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTradePanel, setShowTradePanel] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);

  // --- Settings State ---
  const defaultSettings = {
    slippage: "0.5%",
    gasPriority: "Fast",
    twoFactor: false,
    timeout: "1h",
    theme: "Dark",
    desktopNotifs: true,
  };
  const [settings, setSettings] = useState(defaultSettings);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail("");
    setWalletConnected(false);
    setWalletInfo(null);
  };

  const handleWalletConnect = (address: string) => {
    const simulatedBalance = parseFloat((Math.random() * 10 + 0.5).toFixed(4));
    setWalletInfo({ address, balance: simulatedBalance });
    setWalletConnected(true);
    setShowWalletModal(false);
  };

  const handleWalletDisconnect = () => {
    setWalletConnected(false);
    setWalletInfo(null);
  };

  const handleTrade = (trade: Trade) => {
    setTrades((prev) => [trade, ...prev]);
    if (walletInfo) {
      const newBalance =
        trade.type === "buy"
          ? walletInfo.balance - trade.totalCost
          : walletInfo.balance + trade.totalCost;
      setWalletInfo({ ...walletInfo, balance: Math.max(0, newBalance) });
    }
  };

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "market_cap",
    direction: "desc",
  });

  // Fetch Market Data
  const { data: coins = [] } = useQuery({
    queryKey: ["marketData"],
    queryFn: async () => {
      const res = await axios.get("/api/market");
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  // Set default selected coin — only once
  const hasSetDefault = useRef(false);
  useEffect(() => {
    if (coins.length > 0 && !hasSetDefault.current) {
      setSelectedCoinId(coins[0].id);
      hasSetDefault.current = true;
    }
  }, [coins]);

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

  const filteredCoins = useMemo(() => {
    const filtered = coins.filter(
      (c: Coin) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
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
      direction:
        prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const selectedCoinData = useMemo(() => {
    return coins.find((c: Coin) => c.id === selectedCoinId) || coins[0];
  }, [coins, selectedCoinId]);

  const watchlistIds = watchlist.map((i: WatchlistItem) => i.id);

  return (
    <div className="min-h-screen bg-nexus-bg text-zinc-300 font-sans">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={handleWalletConnect}
      />

      <TradePanel
        coins={coins}
        walletBalance={walletInfo?.balance ?? 0}
        onTrade={handleTrade}
        isOpen={showTradePanel}
        onClose={() => setShowTradePanel(false)}
        preselectedCoinId={selectedCoinId}
      />

      <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />

      <main className="pl-64">
        <Header
          walletConnected={walletConnected}
          walletInfo={walletInfo}
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
          onConnectWallet={() => setShowWalletModal(true)}
          onDisconnectWallet={handleWalletDisconnect}
          onLoginClick={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {activeTab === "dashboard" ? (
          <div className="p-8 max-w-7xl mx-auto grid grid-cols-12 gap-8">
            {/* Stats */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Global Market Cap"
                value="$2.48T"
                change={2.4}
                icon={TrendingUp}
              />
              <StatCard
                title="24h Volume"
                value="$84.2B"
                change={-1.2}
                icon={Activity}
              />
              <StatCard
                title="BTC Dominance"
                value="52.4%"
                change={0.8}
                icon={ShieldCheck}
              />
            </div>

            {/* Market Section */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <Card>
                <div className="w-full p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-nexus-card border border-[#141414] flex items-center justify-center text-white font-bold">
                      {selectedCoinData?.symbol
                        ?.substring(0, 2)
                        ?.toUpperCase() || "$"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {selectedCoinData?.name || "Asset"}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 font-mono text-sm uppercase">
                          {selectedCoinData?.symbol}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${selectedCoinData?.price_change_percentage_24h >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                        >
                          {selectedCoinData?.price_change_percentage_24h > 0
                            ? "+"
                            : ""}
                          {selectedCoinData?.price_change_percentage_24h?.toFixed(
                            2,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-mono text-white font-bold">
                        ${selectedCoinData?.current_price?.toLocaleString()}
                      </div>
                      <div className="text-xs text-zinc-500">Current Price</div>
                    </div>
                  </div>

                  {selectedCoinData && (
                    <ResponsiveContainer width="100%" aspect={2.5}>
                      <AreaChart
                        data={(
                          selectedCoinData.sparkline_in_7d?.price ?? []
                        ).map((p: number, i: number) => ({
                          time: i,
                          price: p,
                        }))}
                      >
                        <defs>
                          <linearGradient
                            id="colorPrice"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={
                                selectedCoinData?.price_change_percentage_24h >=
                                0
                                  ? "#10b981"
                                  : "#ef4444"
                              }
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={
                                selectedCoinData?.price_change_percentage_24h >=
                                0
                                  ? "#10b981"
                                  : "#ef4444"
                              }
                              stopOpacity={0}
                            />
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
                          itemStyle={{
                            color:
                              selectedCoinData?.price_change_percentage_24h >= 0
                                ? "#10b981"
                                : "#ef4444",
                          }}
                          formatter={(value: number) => [
                            `$${value.toLocaleString()}`,
                            "Price",
                          ]}
                          labelFormatter={() => ""}
                        />

                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke={
                            selectedCoinData?.price_change_percentage_24h >= 0
                              ? "#10b981"
                              : "#ef4444"
                          }
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
                  onTradeClick={(coinId) => {
                    setSelectedCoinId(coinId);
                    setShowTradePanel(true);
                  }}
                />
              </Card>
            </div>

            {/* Right Sidebar: Trade + Watchlist + Recent Trades */}
            <div className="col-span-12 lg:col-span-4 space-y-6 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2 custom-scrollbar">
              {/* Trade Button */}
              {walletConnected && (
                <button
                  onClick={() => setShowTradePanel(true)}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <ArrowDownUp size={18} /> Open Trade Panel
                </button>
              )}

              <WatchlistSidebar
                items={watchlist}
                onRemove={(id) => removeFromWatchlist.mutate(id)}
              />

              <RecentTrades trades={trades} />
            </div>
          </div>
        ) : activeTab === "activity" ? (
          <ActivityView trades={trades} />
        ) : activeTab === "trending" ? (
          <TrendingView />
        ) : activeTab === "profile" ? (
          <ProfileView
            isAuthenticated={isAuthenticated}
            userEmail={userEmail}
            walletConnected={walletConnected}
            walletInfo={walletInfo}
            trades={trades}
          />
        ) : activeTab === "settings" ? (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            defaultSettings={defaultSettings}
            walletAddress={walletInfo?.address}
            onDisconnectWallet={handleWalletDisconnect}
          />
        ) : (
          <div className="p-8 max-w-7xl mx-auto h-[80vh] flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 rounded-full bg-nexus-card border border-[#141414] flex items-center justify-center mb-6"
            >
              {activeTab === "activity" && (
                <Activity size={32} className="text-emerald-500" />
              )}
              {activeTab === "trending" && (
                <TrendingUp size={32} className="text-emerald-500" />
              )}
              {activeTab === "settings" && (
                <ShieldCheck size={32} className="text-emerald-500" />
              )}
            </motion.div>
            <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-widest">
              {activeTab} View
            </h2>
            <p className="text-zinc-500 text-lg">
              This module is currently disabled or under development.
            </p>
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
