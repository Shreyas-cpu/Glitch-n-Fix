import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { Trade } from "./TradePanel";

interface RecentTradesProps {
  trades: Trade[];
}

export const RecentTrades = ({ trades }: RecentTradesProps) => {
  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
        <Clock size={32} className="mb-3 opacity-50" />
        <p className="text-sm font-medium">No trades yet</p>
        <p className="text-xs mt-1">Your trade history will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider px-1 mb-2">
        Recent Trades ({trades.length})
      </h3>
      <AnimatePresence>
        {trades.map((trade, i) => {
          const isBuy = trade.type === "buy";
          const timeAgo = getTimeAgo(trade.timestamp);

          return (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-3 bg-nexus-card border border-nexus-border rounded-xl hover:border-nexus-border-hover transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${isBuy ? "bg-emerald-500/10" : "bg-red-500/10"}`}
                >
                  {isBuy ? (
                    <ArrowUpRight size={16} className="text-emerald-400" />
                  ) : (
                    <ArrowDownRight size={16} className="text-red-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded ${isBuy ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                    >
                      {trade.type.toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {trade.amount} {trade.coinSymbol.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    @ ${trade.pricePerCoin.toLocaleString()} per coin
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-sm font-mono font-bold ${isBuy ? "text-red-400" : "text-emerald-400"}`}
                >
                  {isBuy ? "-" : "+"}
                  {trade.totalCost.toFixed(4)} ETH
                </div>
                <div className="text-xs text-zinc-600 mt-0.5">{timeAgo}</div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
