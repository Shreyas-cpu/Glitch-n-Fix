import React, { useState, useMemo } from "react";
import { GainersLosersGrid, GainerLoser } from "../ui/GainersLosersGrid";
import { SectorHeatmap, Sector } from "../ui/SectorHeatmap";
import { TrendingTable, TrendingToken } from "../ui/TrendingTable";
import { Card } from "../ui/Card";
import { Filter, Loader2 } from "lucide-react";
import { Coin } from "../../types/market";
import { useMarketData } from "../../hooks/useMarketData";

/** Derive top gainers from real market data */
function deriveGainers(coins: Coin[]): GainerLoser[] {
  return [...coins]
    .filter((c) => c.price_change_percentage_24h > 0)
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      price: c.current_price,
      change: c.price_change_percentage_24h,
    }));
}

/** Derive top losers from real market data */
function deriveLosers(coins: Coin[]): GainerLoser[] {
  return [...coins]
    .filter((c) => c.price_change_percentage_24h < 0)
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      price: c.current_price,
      change: c.price_change_percentage_24h,
    }));
}

/** Derive sector heatmap from real market data by grouping coins */
function deriveSectors(coins: Coin[]): Sector[] {
  const sectorMap: Record<string, { names: string[]; marketCap: number; changes: number[] }> = {
    "Smart Contracts": { names: ["ethereum", "solana", "cardano", "avalanche-2"], marketCap: 0, changes: [] },
    "Store of Value": { names: ["bitcoin", "litecoin"], marketCap: 0, changes: [] },
    "DeFi": { names: ["chainlink", "uniswap", "aave"], marketCap: 0, changes: [] },
    "Stablecoins": { names: ["tether", "usd-coin", "dai"], marketCap: 0, changes: [] },
    "Meme Coins": { names: ["dogecoin", "shiba-inu", "pepe"], marketCap: 0, changes: [] },
    "Exchange": { names: ["binancecoin", "crypto-com-chain", "okb"], marketCap: 0, changes: [] },
  };

  for (const coin of coins) {
    for (const [sector, data] of Object.entries(sectorMap)) {
      if (data.names.includes(coin.id)) {
        data.marketCap += coin.market_cap || 0;
        data.changes.push(coin.price_change_percentage_24h);
      }
    }
  }

  return Object.entries(sectorMap)
    .filter(([, d]) => d.changes.length > 0)
    .map(([name, d], i) => ({
      id: `sector-${i}`,
      name,
      marketCap: d.marketCap,
      change: d.changes.reduce((a, b) => a + b, 0) / d.changes.length,
    }));
}

/** Derive trending tokens from real market data (by volume and 24h change) */
function deriveTrending(coins: Coin[]): TrendingToken[] {
  return [...coins]
    .sort((a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0))
    .slice(0, 8)
    .map((c) => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      price: c.current_price,
      volChange: c.price_change_percentage_24h,
      sentiment: Math.min(99, Math.max(5, 50 + Math.round(c.price_change_percentage_24h * 5))),
      sparkline: c.sparkline_in_7d?.price ?? [],
    }));
}

/** Convert any trending-view token into a Coin for the TradeModal */
function toTradeCoin(token: { id: string; symbol: string; name: string; price: number; change?: number }): Coin {
  return {
    id: token.id,
    symbol: token.symbol,
    name: token.name,
    current_price: token.price,
    price_change_percentage_24h: token.change ?? 0,
    market_cap: 0,
  };
}

interface TrendingViewProps {
  onTrade?: (coin: Coin) => void;
  onNavigateToDashboard?: (searchQuery: string) => void;
}

export const TrendingView = ({ onTrade, onNavigateToDashboard }: TrendingViewProps) => {
  const { data: coins = [], isLoading } = useMarketData();
  const [sortField, setSortField] = useState<"volChange" | "sentiment">("volChange");
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const gainers = useMemo(() => deriveGainers(coins), [coins]);
  const losers = useMemo(() => deriveLosers(coins), [coins]);
  const sectors = useMemo(() => deriveSectors(coins), [coins]);
  const trending = useMemo(() => deriveTrending(coins), [coins]);

  const sortedTokens = useMemo(
    () => [...trending].sort((a, b) => b[sortField] - a[sortField]),
    [trending, sortField]
  );

  const handleTokenTrade = (token: { id: string; symbol: string; name: string; price: number; change?: number }) => {
    onTrade?.(toTradeCoin(token));
  };

  const handleTokenClick = (token: { name: string; id?: string }) => {
    setSelectedTokenId(token.id ?? null);
    onNavigateToDashboard?.(token.name);
  };

  const handleSectorClick = (sector: Sector) => {
    setSelectedSectorId((prev) => (prev === sector.id ? null : sector.id));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="text-emerald-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-auto lg:h-[400px]">
            <GainersLosersGrid
              gainers={gainers}
              losers={losers}
              onTokenClick={handleGainerLoserClick}
              onTrade={handleGainerLoserTrade}
            />
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white tracking-tight">Sector Heatmap</h2>
                <span className="text-xs text-zinc-500">Click a sector to explore</span>
              </div>
              <div className="flex-1">
                <SectorHeatmap
                  sectors={sectors}
                  onSectorClick={handleSectorClick}
                  selectedSectorId={selectedSectorId}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Trending Assets</h2>
                <p className="text-sm text-zinc-500 mt-1">Based on volume momentum and social sentiment</p>
              </div>
              <div className="flex bg-[#151619] p-1 rounded-lg border border-[#1A1B1E]">
                <button
                  onClick={() => setSortField("volChange")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    sortField === "volChange"
                      ? "bg-[#1A1B1E] text-white shadow-sm border border-[#2A2B2E]"
                      : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Filter size={14} /> By Volume
                </button>
                <button
                  onClick={() => setSortField("sentiment")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    sortField === "sentiment"
                      ? "bg-[#1A1B1E] text-white shadow-sm border border-[#2A2B2E]"
                      : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Filter size={14} /> By Sentiment
                </button>
              </div>
            </div>
            <Card>
              <TrendingTable
                tokens={sortedTokens}
                onTokenClick={handleTrendingClick}
                onTrade={handleTrendingTrade}
                selectedTokenId={selectedTokenId}
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );

  function handleGainerLoserTrade(token: GainerLoser) {
    handleTokenTrade(token);
  }

  function handleGainerLoserClick(token: GainerLoser) {
    handleTokenClick(token);
  }

  function handleTrendingTrade(token: TrendingToken) {
    handleTokenTrade({ ...token, change: token.volChange });
  }

  function handleTrendingClick(token: TrendingToken) {
    handleTokenClick(token);
  }
};