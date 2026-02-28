import React, { useState, useMemo } from "react";
import { TransactionTable, Transaction } from "../ui/TransactionTable";
import { LiveFeedSidebar, BlockData } from "../ui/LiveFeedSidebar";
import { StatCard } from "../ui/StatCard";
import { Card } from "../ui/Card";
import { Zap, Activity, ShieldCheck, Filter, Loader2, Inbox } from "lucide-react";
import { usePortfolio } from "../../hooks/usePortfolio";
import { TradeTransaction } from "../../types/market";

/** Turn real TradeTransaction into the Transaction shape the table expects */
function toTableTransaction(t: TradeTransaction): Transaction {
  const ts = new Date(t.timestamp);
  const diff = Date.now() - ts.getTime();
  const mins = Math.floor(diff / 60000);
  const time =
    mins < 1 ? "just now" : mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;

  const triggerLabel = t.trigger === "stop-loss" ? " [SL]" : t.trigger === "take-profit" ? " [TP]" : "";

  return {
    id: t.id,
    hash: "0x" + t.id.replace(/[^a-f0-9]/gi, "").padEnd(64, "0").slice(0, 64),
    method: t.type === "buy" ? "Swap" : "Send",
    status: "Success" as const,
    time,
    value: `${t.amount.toFixed(4)} ${t.symbol.toUpperCase()}${triggerLabel}`,
    usdValue: `$${t.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
  };
}

const MOCK_BLOCKS: BlockData[] = [
  { id: "b1", blockNumber: 19284756, miner: "0xAb5...8E2", txns: 182, timeAgo: "12s ago", reward: "0.024 ETH" },
  { id: "b2", blockNumber: 19284755, miner: "0x3Fc...1D9", txns: 156, timeAgo: "24s ago", reward: "0.019 ETH" },
  { id: "b3", blockNumber: 19284754, miner: "0x7Ba...4F1", txns: 201, timeAgo: "36s ago", reward: "0.031 ETH" },
  { id: "b4", blockNumber: 19284753, miner: "0x1Cd...9A3", txns: 143, timeAgo: "48s ago", reward: "0.015 ETH" },
  { id: "b5", blockNumber: 19284752, miner: "0x9Ef...2B7", txns: 178, timeAgo: "60s ago", reward: "0.022 ETH" },
];

export const ActivityView = () => {
  const { transactions: rawTx, isLoading } = usePortfolio();
  const [filterType, setFilterType] = useState<"All" | "buy" | "sell">("All");
  const [timeRange, setTimeRange] = useState("24h");

  const filtered = useMemo(() => {
    let list = [...rawTx].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filterType !== "All") {
      list = list.filter((t) => t.type === filterType);
    }

    const now = Date.now();
    const rangeMs = timeRange === "1h" ? 3600000 : timeRange === "24h" ? 86400000 : 604800000;
    list = list.filter((t) => now - new Date(t.timestamp).getTime() <= rangeMs);

    return list;
  }, [rawTx, filterType, timeRange]);

  const tableRows = useMemo(() => filtered.map(toTableTransaction), [filtered]);

  const totalBuys = rawTx.filter((t) => t.type === "buy").length;
  const totalSells = rawTx.filter((t) => t.type === "sell").length;
  const totalVolume = rawTx.reduce((s, t) => s + t.total, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Trades"
          value={rawTx.length.toString()}
          change={totalBuys - totalSells}
          icon={Activity}
        />
        <StatCard
          title="Trade Volume"
          value={`$${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          change={0}
          icon={Zap}
        />
        <StatCard
          title="Buys / Sells"
          value={`${totalBuys} / ${totalSells}`}
          change={totalBuys > totalSells ? 1 : totalSells > totalBuys ? -1 : 0}
          icon={ShieldCheck}
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Order History</h2>
            <div className="flex items-center gap-3">
              <div className="relative group flex items-center">
                <Filter size={16} className="absolute left-3 text-zinc-500" />
                <select
                  className="bg-[#151619] border border-[#1A1B1E] text-sm text-white rounded-lg pl-9 pr-8 py-2 appearance-none focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as "All" | "buy" | "sell")}
                >
                  <option value="All">All Types</option>
                  <option value="buy">Buys</option>
                  <option value="sell">Sells</option>
                </select>
              </div>
              <div className="flex bg-[#151619] p-1 rounded-lg border border-[#1A1B1E]">
                {["1h", "24h", "7d"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      timeRange === range
                        ? "bg-[#1A1B1E] text-white border border-[#2A2B2E]"
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
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 size={24} className="text-emerald-500 animate-spin" />
              </div>
            ) : tableRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-zinc-500 gap-3">
                <Inbox size={32} />
                <p className="text-sm">No trades yet. Buy or sell a coin to see activity here.</p>
              </div>
            ) : (
              <TransactionTable transactions={tableRows} />
            )}
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 max-h-[calc(100vh-16rem)] flex flex-col">
          <LiveFeedSidebar blocks={MOCK_BLOCKS} />
        </div>
      </div>
    </div>
  );
};