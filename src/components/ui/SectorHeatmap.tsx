import { motion } from "motion/react";

export interface Sector {
    id: string;
    name: string;
    marketCap: number;
    change: number;
}

interface SectorHeatmapProps {
    sectors: Sector[];
}

e
                    const styleClass = layoutStyles[index] || "col-span-4 row-span-1";

                    return (
                        <motion.div
                            key={sector.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`relative rounded-xl overflow-hidden group cursor-pointer ${styleClass}`}
                            style={{ backgroundColor: bgColorStyle }}
                        >
                            {/* Inner border overlay */}
                            <div className="absolute inset-0 border border-white/5 rounded-xl group-hover:border-white/20 transition-colors z-10" />
xport const MarketTable = ({
  coins,
  onAddToWatchlist,
  watchlistIds,
  sortConfig,
  onSort,
  selectedCoinId,
  onRowClick,
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
          <tr className="border-b border-[#141414]">
            <th
              className="px-6 py-4 text-xs text-zinc-500 uppercase cursor-pointer hover:text-zinc-300"
              onClick={() => onSort("name")}
            >
              Asset <SortIcon field="name" />
            </th>
            <th
              className="px-6 py-4 text-xs text-zinc-500 uppercase cursor-pointer hover:text-zinc-300"
              onClick={() => onSort("current_price")}
            >
              Price <SortIcon field="current_price" />
            </th>
            <th
              className="px-6 py-4 text-xs text-zinc-500 uppercase cursor-pointer hover:text-zinc-300"
              onClick={() => onSort("price_change_percentage_24h")}
            >
              24h <SortIcon field="price_change_percentage_24h" />
            </th>
            <th
              className="px-6 py-4 text-xs text-zinc-500 uppercase cursor-pointer hover:text-zinc-300"
              onClick={() => onSort("market_cap")}
            >
              Market Cap <SortIcon field="market_cap" />
            </th>
            <th className="px-6 py-4 text-right"></th>
          </tr>
        </thead>

        <tbody>
          {coins.map((coin) => (
            <motion.tr
              key={coin.id}
                            <div className="absolute inset-0 p-4 flex flex-col justify-between z-20">
                                <div className="text-white/90 font-bold group-hover:text-white transition-colors truncate">
                                    {sector.name}
                                </div>

                                <div>
                                    <div className="text-white/60 text-xs font-mono mb-0.5 truncate">
                                        ${(sector.marketCap / 1e9).toFixed(1)}B
                                    </div>
                                    <div className={`font-mono font-bold text-sm ${isPositive ? 'text-emerald-100' : 'text-red-100'}`}>
                                        {isPositive ? '+' : '-'}{percentage.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
