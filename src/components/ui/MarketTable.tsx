import { motion } from "motion/react";
import {
  Plus,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  ChevronUp,
  ChevronDown,
  ArrowDownUp,
} from "lucide-react";
import { Coin } from "../../types/market";

export type SortField =
  | "name"
  | "current_price"
  | "price_change_percentage_24h"
  | "market_cap";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

interface MarketTableProps {
  coins: Coin[];
  onAddToWatchlist: (coin: Coin) => void;
  watchlistIds: string[];
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  selectedCoinId: string | null;
  onRowClick: (coinId: string) => void;
  onTradeClick?: (coinId: string) => void;
}

export const MarketTable = ({
  coins,
  onAddToWatchlist,
  watchlistIds,
  sortConfig,
  onSort,
  selectedCoinId,
  onRowClick,
  onTradeClick,
}: MarketTableProps) => {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={14} className="ml-1 inline" />
    ) : (
      <ChevronDown size={14} className="ml-1 inline" />
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-nexus-border bg-nexus-bg/50 text-left text-xs uppercase tracking-wider text-zinc-500">
            <th className="px-6 py-4 font-medium">Asset</th>
            <th
              className="px-6 py-4 font-medium cursor-pointer"
              onClick={() => onSort("current_price")}
            >
              <div className="flex items-center gap-2">
                Price <SortIcon field="current_price" />
              </div>
            </th>
            <th
              className="px-6 py-4 font-medium cursor-pointer"
              onClick={() => onSort("price_change_percentage_24h")}
            >
              <div className="flex items-center gap-2">
                24h Change <SortIcon field="price_change_percentage_24h" />
              </div>
            </th>
            <th
              className="px-6 py-4 font-medium cursor-pointer"
              onClick={() => onSort("market_cap")}
            >
              <div className="flex items-center gap-2">
                Market Cap <SortIcon field="market_cap" />
              </div>
            </th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => (
            <motion.tr
              key={coin.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => onRowClick(coin.id)}
              className={`cursor-pointer transition-colors ${selectedCoinId === coin.id ? "bg-[#141414]" : "hover:bg-nexus-card"}`}
            >
              <td className="px-6 py-4 text-white flex items-center gap-3">
                <span className="font-semibold">{coin.name}</span>
                <span className="text-xs text-zinc-500 uppercase">
                  {coin.symbol}
                </span>
              </td>
              <td className="px-6 py-4 text-white font-mono">
                ${coin.current_price.toLocaleString()}
              </td>
              <td
                className={`px-6 py-4 ${coin.price_change_percentage_24h >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {coin.price_change_percentage_24h >= 0 ? (
                  <ArrowUpRight size={14} className="inline mr-1" />
                ) : (
                  <ArrowDownRight size={14} className="inline mr-1" />
                )}
                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </td>
              <td className="px-6 py-4 text-zinc-400">
                ${(coin.market_cap / 1e9).toFixed(2)}B
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {onTradeClick && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTradeClick(coin.id);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <ArrowDownUp size={14} /> Trade
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToWatchlist(coin);
                    }}
                    disabled={watchlistIds.includes(coin.id)}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                    title={
                      watchlistIds.includes(coin.id)
                        ? "In Watchlist"
                        : "Add to Watchlist"
                    }
                  >
                    {watchlistIds.includes(coin.id) ? (
                      <ShieldCheck size={18} className="text-emerald-500" />
                    ) : (
                      <Plus
                        size={18}
                        className="text-zinc-400 hover:text-white"
                      />
                    )}
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
