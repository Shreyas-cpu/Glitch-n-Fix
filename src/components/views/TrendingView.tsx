import React, { useState } from "react";
import { useTrending } from "../../hooks/useTrending";
import { useGeminiPrice } from "../../hooks/useGeminiPrice";
import { GainersLosersGrid, GainerLoser } from "../ui/GainersLosersGrid";
import { SectorHeatmap, Sector } from "../ui/SectorHeatmap";
import { TrendingTable, TrendingToken } from "../ui/TrendingTable";
import { Card } from "../ui/Card";
import { Filter } from "lucide-react";

// --- Mock Data ---
const MOCK_GAINERS: GainerLoser[] = [
  { id: "g1", symbol: "PEPE", name: "Pepe", price: 0.0000124, change: 45.2 },
  { id: "g2", symbol: "WIF", name: "dogwifhat", price: 2.45, change: 32.1 },
  { id: "g3", symbol: "BONK", name: "Bonk", price: 0.0000289, change: 28.7 },
  { id: "g4", symbol: "FLOKI", name: "Floki", price: 0.000234, change: 18.9 },
  { id: "g5", symbol: "RNDR", name: "Render", price: 8.45, change: 15.4 },
];

const MOCK_LOSERS: GainerLoser[] = [
  {
    id: "l1",
    symbol: "SHIB",
    name: "Shiba Inu",
    price: 0.0000098,
    change: -12.3,
  },
  { id: "l2", symbol: "DYDX", name: "dYdX", price: 2.15, change: -10.8 },
  { id: "l3", symbol: "APE", name: "ApeCoin", price: 1.24, change: -9.2 },
  { id: "l4", symbol: "SAND", name: "Sandbox", price: 0.45, change: -7.6 },
  { id: "l5", symbol: "GALA", name: "Gala", price: 0.032, change: -6.1 },
];

const MOCK_SECTORS: Sector[] = [
  { id: "s1", name: "DeFi", marketCap: 89e9, change: 4.2 },
  { id: "s2", name: "Layer 2", marketCap: 34e9, change: -2.1 },
  { id: "s3", name: "Gaming", marketCap: 12e9, change: 8.5 },
  { id: "s4", name: "AI & Big Data", marketCap: 28e9, change: 12.3 },
  { id: "s5", name: "Meme", marketCap: 45e9, change: -5.4 },
  { id: "s6", name: "Infrastructure", marketCap: 67e9, change: 1.8 },
];

const generateSparkline = (trend: "up" | "down" | "flat"): number[] => {
  let current = 100;
  return Array.from({ length: 20 }).map(() => {
    const change = (Math.random() - 0.5) * 10;
    const direction = trend === "up" ? 2 : trend === "down" ? -2 : 0;
    current = current + change + direction;
    return Math.max(0, current);
  });
};

const MOCK_TRENDING_TOKENS: TrendingToken[] = [
  {
    id: "t1",
    symbol: "SOL",
    name: "Solana",
    price: 145.2,
    volChange: 45.2,
    sentiment: 88,
    sparkline: generateSparkline("up"),
  },
  {
    id: "t2",
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.154,
    volChange: 124.5,
    sentiment: 92,
    sparkline: generateSparkline("up"),
  },
  {
    id: "t3",
    symbol: "LINK",
    name: "Chainlink",
    price: 18.4,
    volChange: 12.4,
    sentiment: 65,
    sparkline: generateSparkline("flat"),
  },
  {
    id: "t4",
    symbol: "ARB",
    name: "Arbitrum",
    price: 1.15,
    volChange: -15.4,
    sentiment: 45,
    sparkline: generateSparkline("down"),
  },
  {
    id: "t5",
    symbol: "AVAX",
    name: "Avalanche",
    price: 38.5,
    volChange: 5.2,
    sentiment: 58,
    sparkline: generateSparkline("up"),
  },
  {
    id: "t6",
    symbol: "TON",
    name: "Toncoin",
    price: 6.8,
    volChange: 84.1,
    sentiment: 75,
    sparkline: generateSparkline("up"),
  },
];

export const TrendingView = () => {
  const [sortField, setSortField] = useState<"volChange" | "sentiment">(
    "volChange",
  );

  const { data: trendingRaw = [] } = useTrending();
  const { data: gemini } = useGeminiPrice("btcusd");

  const derivedTokens: TrendingToken[] = (trendingRaw.length ? trendingRaw : MOCK_TRENDING_TOKENS.map((t) => ({
    id: t.id,
    symbol: t.symbol,
    name: t.name,
    price: t.price,
    volChange: t.volChange,
    sentiment: t.sentiment,
    sparkline: t.sparkline,
  } as TrendingToken))) .map((item: any, idx: number) => {
    // when item comes from CoinGecko trending, it may have `price_btc`
    const price = item.price_btc && gemini ? Number(item.price_btc) * Number(gemini.last) : (item.price || 0);
    const volChange = item.volChange ?? (Math.random() * 60 - 20);
    const sentiment = item.sentiment ?? Math.floor(30 + Math.random() * 70);
    const sparkline = item.sparkline ?? generateSparkline(volChange > 0 ? "up" : "down");
    return {
      id: item.id || `t-${idx}`,
      symbol: (item.symbol || item.id || "").toUpperCase(),
      name: item.name || item.id || "Unknown",
      price,
      volChange,
      sentiment,
      sparkline,
    } as TrendingToken;
  });

  const sortedTokens = [...derivedTokens].sort((a, b) => b[sortField] - a[sortField]);

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Top Section: Gainers/Losers & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-auto lg:h-[400px]">
        {/* Left: Gainers & Losers Grid */}
        <GainersLosersGrid gainers={MOCK_GAINERS} losers={MOCK_LOSERS} />

        {/* Right: Sector Heatmap */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Sector Heatmap
            </h2>
          </div>
          <div className="flex-1">
            <SectorHeatmap sectors={MOCK_SECTORS} />
          </div>
        </div>
      </div>

      {/* Bottom Section: Trending Table */}
      <div className="flex flex-col gap-4 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Trending Assets
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Based on volume momentum and social sentiment
            </p>
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
          <TrendingTable tokens={sortedTokens} />
        </Card>
      </div>
    </div>
  );
};
