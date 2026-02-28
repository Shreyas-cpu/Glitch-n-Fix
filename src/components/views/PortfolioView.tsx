import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  BarChart3,
} from "lucide-react";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useMarketData } from "../../hooks/useMarketData";
import { StatCard } from "../ui/StatCard";
import { Card } from "../ui/Card";

export const PortfolioView = () => {
  const { portfolio, transactions, isLoading } = usePortfolio();
  const { data: coins = [] } = useMarketData();

  // Enrich portfolio with live prices
  const enrichedHoldings = useMemo(() => {
    return portfolio.map((h) => {
      const liveCoin = coins.find((c) => c.id === h.coinId);
      const currentPrice = liveCoin?.current_price ?? h.avgPrice;
      const currentValue = h.amount * currentPrice;
      const costBasis = h.amount * h.avgPrice;
      const pnl = currentValue - costBasis;
      const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
      return {
        ...h,
        currentPrice,
        currentValue,
        costBasis,
        pnl,
        pnlPercent,
        change24h: liveCoin?.price_change_percentage_24h ?? 0,
      };
    });
  }, [portfolio, coins]);

  const totalValue = enrichedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = enrichedHoldings.reduce((sum, h) => sum + h.costBasis, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Portfolio Value"
          value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={totalPnlPercent}
          icon={Wallet}
        />
        <StatCard
          title="Total P&L"
          value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={totalPnlPercent}
          icon={BarChart3}
        />
        <StatCard
          title="Holdings"
          value={`${enrichedHoldings.length} Assets`}
          change={0}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Holdings Table */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Your Holdings</h2>

          {isLoading ? (
            <Card className="p-8">
              <div className="text-zinc-500 animate-pulse text-center">Loading portfolio...</div>
            </Card>
          ) : enrichedHoldings.length === 0 ? (
            <Card className="p-8">
              <div className="text-center space-y-3">
                <Wallet size={48} className="mx-auto text-zinc-600" />
                <p className="text-zinc-500">No holdings yet.</p>
                <p className="text-zinc-600 text-sm">
                  Go to Dashboard and click on a coin row to buy your first asset.
                </p>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#141414]">
                      <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Asset</th>
                      <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Amount</th>
                      <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Avg Price</th>
                      <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Current</th>
                      <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Value</th>
                      <th className="px-6 py-4 text-xs text-zinc-500 uppercase">SL / TP</th>
                      <th className="px-6 py-4 text-xs text-zinc-500 uppercase text-right">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrichedHoldings.map((h) => (
                      <motion.tr
                        key={h.coinId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-[#151619] transition-colors"
                      >
                        <td className="px-6 py-4 text-white">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{h.name}</span>
                            <span className="text-xs text-zinc-500 uppercase">{h.symbol}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white font-mono">
                          {h.amount.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 text-zinc-400 font-mono">
                          ${h.avgPrice.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-mono">${h.currentPrice.toLocaleString()}</div>
                          <div className={`text-xs ${h.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {h.change24h >= 0 ? "+" : ""}{h.change24h.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white font-mono font-bold">
                          ${h.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs space-y-0.5">
                            {h.stopLoss ? (
                              <div className="text-red-400">SL: ${h.stopLoss.toLocaleString()}</div>
                            ) : (
                              <div className="text-zinc-600">SL: —</div>
                            )}
                            {h.takeProfit ? (
                              <div className="text-emerald-400">TP: ${h.takeProfit.toLocaleString()}</div>
                            ) : (
                              <div className="text-zinc-600">TP: —</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`font-mono font-bold ${h.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {h.pnl >= 0 ? "+" : ""}${h.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className={`text-xs flex items-center justify-end gap-1 ${h.pnlPercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {h.pnlPercent >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(h.pnlPercent).toFixed(2)}%
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Recent Trades */}
        <div className="col-span-12 lg:col-span-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Recent Trades
          </h3>
          <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
            <AnimatePresence>
              {transactions.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">No trades yet.</p>
              ) : (
                transactions.slice(0, 20).map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-[#151619] rounded-xl border border-[#1A1B1E] hover:border-[#2A2B2E] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {tx.type === "buy" ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <TrendingUp size={12} className="text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
                            <TrendingDown size={12} className="text-red-400" />
                          </div>
                        )}
                        <span className={`text-xs font-bold uppercase ${
                          tx.type === "buy" ? "text-emerald-400" : "text-red-400"
                        }`}>
                          {tx.type}
                        </span>
                        {tx.trigger && tx.trigger !== "manual" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 font-medium">
                            {tx.trigger === "stop-loss" ? "SL" : "TP"}
                          </span>
                        )}
                        <span className="text-sm text-white font-semibold">{tx.symbol}</span>
                      </div>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(tx.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">
                        {tx.amount.toFixed(6)} × ${tx.pricePerUnit.toLocaleString()}
                      </span>
                      <span className="text-white font-mono font-bold">
                        ${tx.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {tx.pnl !== undefined && tx.type === "sell" && (
                      <div className={`text-xs mt-1 text-right font-mono ${tx.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        P&L: {tx.pnl >= 0 ? "+" : ""}${tx.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
