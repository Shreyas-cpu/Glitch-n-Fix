import React from "react";
import { motion } from "motion/react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Copy,
  Check,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Trade } from "../ui/TradePanel";

interface WalletInfo {
  address: string;
  balance: number;
}

interface Holding {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  amount: number;
  avgPrice: number;
}

interface ProfileViewProps {
  isAuthenticated: boolean;
  userEmail: string;
  walletConnected: boolean;
  walletInfo: WalletInfo | null;
  trades: Trade[];
}

function shortenAddress(addr: string) {
  return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);
}

export const ProfileView = ({
  isAuthenticated,
  userEmail,
  walletConnected,
  walletInfo,
  trades,
}: ProfileViewProps) => {
  const [copied, setCopied] = React.useState(false);

  // Calculate holdings from trades
  const holdings: Holding[] = React.useMemo(() => {
    const map = new Map<string, Holding>();
    trades.forEach((t) => {
      const existing = map.get(t.coinId);
      if (existing) {
        if (t.type === "buy") {
          const totalCost =
            existing.avgPrice * existing.amount + t.pricePerCoin * t.amount;
          existing.amount += t.amount;
          existing.avgPrice = totalCost / existing.amount;
        } else {
          existing.amount = Math.max(0, existing.amount - t.amount);
        }
      } else if (t.type === "buy") {
        map.set(t.coinId, {
          coinId: t.coinId,
          coinSymbol: t.coinSymbol,
          coinName: t.coinName,
          amount: t.amount,
          avgPrice: t.pricePerCoin,
        });
      }
    });
    return Array.from(map.values()).filter((h) => h.amount > 0);
  }, [trades]);

  // Statistics
  const totalTrades = trades.length;
  const buyTrades = trades.filter((t) => t.type === "buy").length;
  const sellTrades = trades.filter((t) => t.type === "sell").length;
  const totalVolume = trades.reduce((sum, t) => sum + t.totalCost, 0);
  const totalHoldingsValue = holdings.reduce(
    (sum, h) => sum + h.amount * h.avgPrice,
    0,
  );

  const copyAddress = () => {
    if (walletInfo) {
      navigator.clipboard.writeText(walletInfo.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center h-[70vh]">
        <div className="w-20 h-20 rounded-full bg-nexus-card border border-nexus-border flex items-center justify-center mb-6">
          <Wallet size={32} className="text-zinc-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
        <p className="text-zinc-500 text-sm">
          Please sign in to view your profile
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-white tracking-tight">Profile</h2>

      {/* Wallet Card */}
      <Card className="p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
              <Wallet size={28} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">
                Account
              </div>
              <div className="text-white font-semibold">{userEmail}</div>
              {walletConnected && walletInfo && (
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-1.5 mt-1 text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  {shortenAddress(walletInfo.address)}
                  {copied ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              )}
            </div>
          </div>
          {walletConnected && walletInfo && (
            <div className="text-right">
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">
                Wallet Balance
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {walletInfo.balance.toFixed(4)} ETH
              </div>
            </div>
          )}
        </div>
        {!walletConnected && (
          <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-xs text-yellow-400">
            ⚠ No wallet connected. Connect a wallet to start trading.
          </div>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Trades",
            value: totalTrades.toString(),
            icon: BarChart3,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Buys",
            value: buyTrades.toString(),
            icon: ArrowUpRight,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Sells",
            value: sellTrades.toString(),
            icon: ArrowDownRight,
            color: "text-red-400",
            bg: "bg-red-500/10",
          },
          {
            label: "Volume",
            value: `${totalVolume.toFixed(2)} ETH`,
            icon: Activity,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-nexus-card border border-nexus-border rounded-xl p-4"
          >
            <div
              className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}
            >
              <stat.icon size={16} className={stat.color} />
            </div>
            <div className="text-xs text-zinc-500 mb-0.5">{stat.label}</div>
            <div className={`text-lg font-bold font-mono ${stat.color}`}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Holdings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <PieChart size={18} className="text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Current Holdings</h3>
          </div>
          {holdings.length > 0 && (
            <div className="text-sm font-mono text-zinc-400">
              Est. Value:{" "}
              <span className="text-emerald-400 font-bold">
                $
                {totalHoldingsValue.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
        </div>

        {holdings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-zinc-600">
            <PieChart size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No holdings yet</p>
            <p className="text-xs mt-1">Buy some assets to see them here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {holdings.map((h, i) => (
              <motion.div
                key={h.coinId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 bg-nexus-bg border border-nexus-border rounded-xl hover:border-nexus-border-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-nexus-card-hover border border-nexus-border-hover flex items-center justify-center text-xs font-bold text-white">
                    {h.coinSymbol.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {h.coinName}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase">
                      {h.coinSymbol}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-white font-bold">
                    {h.amount.toFixed(6)} {h.coinSymbol.toUpperCase()}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono">
                    Avg: $
                    {h.avgPrice.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Trade History */}
      {trades.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={18} className="text-emerald-400" />
            Trade History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-nexus-border">
                  <th className="px-4 py-3 text-xs text-zinc-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-xs text-zinc-500 uppercase">
                    Asset
                  </th>
                  <th className="px-4 py-3 text-xs text-zinc-500 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-xs text-zinc-500 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-xs text-zinc-500 uppercase text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, 10).map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-nexus-border/50 hover:bg-nexus-card transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${trade.type === "buy" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                      >
                        {trade.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-medium">
                      {trade.coinSymbol.toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-zinc-300">
                      {trade.amount}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-zinc-400">
                      ${trade.pricePerCoin.toLocaleString()}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm font-mono text-right font-bold ${trade.type === "buy" ? "text-red-400" : "text-emerald-400"}`}
                    >
                      {trade.type === "buy" ? "-" : "+"}
                      {trade.totalCost.toFixed(4)} ETH
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
