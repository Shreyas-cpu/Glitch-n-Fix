import { useState } from "react";
import { StatCard } from "../ui/StatCard";
import { Card } from "../ui/Card";
import { TransactionTable, Transaction } from "../ui/TransactionTable";
import { LiveFeedSidebar, BlockData } from "../ui/LiveFeedSidebar";
import { Zap, Activity, ShieldCheck, Filter } from "lucide-react";
import { Trade } from "../ui/TradePanel";

// --- Mock Data ---
const MOCK_TRANSACTIONS: Transaction[] = (() => {
  const methods: Transaction["method"][] = [
    "Swap",
    "Send",
    "Mint",
    "Burn",
    "Approve",
  ];
  const statuses: Transaction["status"][] = ["Success", "Pending", "Failed"];
  const coins = ["ETH", "USDC", "WBTC", "LINK", "UNI"];

  return Array.from({ length: 15 }).map((_, i) => {
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
})();

const MOCK_BLOCKS: BlockData[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `block-${i}`,
  blockNumber: 19234567 - i,
  miner: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
  txns: Math.floor(Math.random() * 200) + 50,
  timeAgo: `${12 * (i + 1)}s ago`,
  reward: `${(0.01 + Math.random() * 0.05).toFixed(4)} ETH`,
}));

const TIME_RANGES = ["1H", "24H", "7D", "30D"];

interface ActivityViewProps {
  trades: Trade[];
}

export const ActivityView = ({ trades }: ActivityViewProps) => {
  const [filterMethod, setFilterMethod] = useState("All");
  const [timeRange, setTimeRange] = useState("24H");

  // Transform Trade[] into Transaction[] for the table
  const transactions: Transaction[] = trades.map((t) => ({
    id: t.id,
    hash:
      "0x" +
      Math.random().toString(16).substring(2, 10) +
      t.id.substring(t.id.length - 8),
    method: t.type === "buy" ? "Swap" : "Swap", // Mapping Buy/Sell to Swap for TS compatibility
    status: "Success",
    time: "Just now",
    value: `${t.amount} ${t.coinSymbol.toUpperCase()}`,
    usdValue: `${t.totalCost.toFixed(4)} ETH`,
  }));

  // Append mock transactions for visual filler
  const allTransactions = [...transactions, ...MOCK_TRANSACTIONS];

  const filteredTransactions = allTransactions.filter((tx) => {
    if (filterMethod === "All") return true;
    if (filterMethod === "Trade" && tx.method === "Swap") return true; // Show swaps as trades
    return tx.method === filterMethod;
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
            <div className="flex items-center gap-3">
              <div className="relative group flex items-center">
                <Filter size={16} className="absolute left-3 text-zinc-500" />
                <select
                  className="bg-nexus-card border border-nexus-border text-sm text-white rounded-lg pl-9 pr-8 py-2 appearance-none focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Trade">Trades (Buy/Sell)</option>
                  <option value="Swap">Swaps</option>
                  <option value="Mint">Mints</option>
                </select>
              </div>
              <div className="flex bg-nexus-card p-1 rounded-lg border border-nexus-border">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      timeRange === range
                        ? "bg-nexus-card-hover text-white shadow-sm border border-nexus-border-hover"
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

        {/* Sidebar: Live Feed */}
        <div className="col-span-12 lg:col-span-4 max-h-[calc(100vh-16rem)] flex flex-col">
          <LiveFeedSidebar blocks={MOCK_BLOCKS} />
        </div>
      </div>
    </div>
  );
};
