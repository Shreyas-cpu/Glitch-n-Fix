import React, { useState, useEffect } from "react";
import { StatCard } from "../ui/StatCard";
import { Card } from "../ui/Card";
import { TransactionTable, Transaction } from "../ui/TransactionTable";
import { LiveFeedSidebar, BlockData } from "../ui/LiveFeedSidebar";
import { Zap, Activity, ShieldCheck, Filter } from "lucide-react";
import { useBlocks } from "../../hooks/useBlocks";

// --- Mock Data ---
const generateMockTransactions = (count: number): Transaction[] => {
  const methods: Transaction["method"][] = [
    "Swap",
    "Send",
    "Mint",
    "Burn",
    "Approve",
  ];
  const statuses: Transaction["status"][] = ["Success", "Pending", "Failed"];
  const coins = ["ETH", "USDC", "WBTC", "LINK", "UNI"];

  return Array.from({ length: count }).map((_, i) => {
    const method = methods[Math.floor(Math.random() * methods.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const coin = coins[Math.floor(Math.random() * coins.length)];
    const valueNum = (Math.random() * 10).toFixed(4);

    return {
      id: `tx-${Date.now()}-${i}`,
      hash:
        "0x" +
        Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join(""),
      method,
      status,
      time: `${Math.floor(Math.random() * 60)} mins ago`,
      value: `${valueNum} ${coin}`,
      usdValue: `$${(parseFloat(valueNum) * 2000).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    };
  });
};

const MOCK_BLOCKS: BlockData[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `block-${i}`,
  blockNumber: 19234567 - i,
  miner: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
  txns: Math.floor(Math.random() * 200) + 50,
  timeAgo: `${12 * (i + 1)}s ago`,
  reward: `${(0.01 + Math.random() * 0.05).toFixed(4)} ETH`,
}));

const TIME_RANGES = ["1H", "24H", "7D", "30D"];

export const ActivityView = () => {
  const [filterMethod, setFilterMethod] = useState("All");
  const [timeRange, setTimeRange] = useState("24H");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // try to pull latest block info to populate live feed
  const { data: blockInfo, refetch: refetchBlocks } = useBlocks();

  useEffect(() => {
    setTransactions(generateMockTransactions(15));
  }, []); // run once on mount

  const filteredTransactions = transactions.filter((tx) => {
    if (filterMethod !== "All" && tx.method !== filterMethod) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Activity Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Network Load"
          value="48 Gwei"
          change={-12.4}
          icon={Zap}
        />
        <StatCard
          title="24h Transactions"
          value="1.2M"
          change={5.2}
          icon={Activity}
        />
        <StatCard
          title="Active Contracts"
          value="42,891"
          change={1.2}
          icon={ShieldCheck}
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Content: Transactions */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Header & Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Recent Transactions
            </h2>
            <button
              onClick={() => {
                setTransactions(generateMockTransactions(15));
                refetchBlocks();
              }}
              className="mt-2 sm:mt-0 px-3 py-1.5 text-xs bg-[#1A1B1E] rounded hover:bg-[#2A2B2E]"
            >
              Refresh
            </button>
            <div className="flex items-center gap-3">
              <div className="relative group flex items-center">
                <Filter size={16} className="absolute left-3 text-zinc-500" />
                <select
                  className="bg-[#151619] border border-[#1A1B1E] text-sm text-white rounded-lg pl-9 pr-8 py-2 appearance-none focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Swap">Swaps</option>
                  <option value="Send">Sends</option>
                  <option value="Mint">Mints</option>
                </select>
              </div>
              <div className="flex bg-[#151619] p-1 rounded-lg border border-[#1A1B1E]">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      timeRange === range
                        ? "bg-[#1A1B1E] text-white shadow-sm border border-[#2A2B2E]"
                        : "text-zinc-500 hover:text-white border border-transparent"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Card>
            <TransactionTable transactions={filteredTransactions} />
          </Card>
        </div>

        {/* Sidebar: Live Feed (real blocks if available) */}
        <div className="col-span-12 lg:col-span-4 max-h-[calc(100vh-16rem)] flex flex-col">
          <LiveFeedSidebar
            blocks={
              blockInfo
                ? [
                    {
                      id: blockInfo.hash || "",
                      blockNumber: blockInfo.height || 0,
                      miner: blockInfo.miner || "unknown",
                      txns: blockInfo.n_tx || 0,
                      timeAgo: blockInfo.time ? "just now" : "",
                      reward: blockInfo.fee_reward ? `${blockInfo.fee_reward} ETH` : "",
                    },
                  ]
                : MOCK_BLOCKS
            }
          />
        </div>
      </div>
    </div>
  );
};
