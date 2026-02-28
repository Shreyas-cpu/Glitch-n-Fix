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

export const SectorHeatmap = ({ sectors }: SectorHeatmapProps) => {
  const totalMarketCap = sectors.reduce(
    (sum, sector) => sum + sector.marketCap,
    0,
  );

  const layoutStyles = [
    "col-span-12 md:col-span-8 row-span-2",
    "col-span-6 md:col-span-4 row-span-1",
    "col-span-6 md:col-span-4 row-span-1",
    "col-span-4 md:col-span-3 row-span-1",
    "col-span-4 md:col-span-3 row-span-1",
    "col-span-4 md:col-span-6 row-span-1",
  ];

  return (
    <div className="bg-[#151619] rounded-2xl border border-[#1A1B1E] overflow-hidden p-1.5 h-full min-h-[400px]">
      <div className="grid grid-cols-12 auto-rows-fr gap-1.5 h-full w-full">
        {sectors.slice(0, 6).map((sector, index) => {
          const isPositive = sector.change >= 0;
          const percentage = Math.abs(sector.change);
          const intensity = Math.min(percentage / 10, 1);
          const bgColorStyle = isPositive
            ? `rgba(16, 185, 129, ${0.1 + intensity * 0.4})`
            : `rgba(239, 68, 68, ${0.1 + intensity * 0.4})`;
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
              <div className="absolute inset-0 border border-white/5 rounded-xl group-hover:border-white/20 transition-colors z-10" />
              <div className="absolute inset-0 p-4 flex flex-col justify-between z-20">
                <div className="text-white/90 font-bold group-hover:text-white transition-colors truncate">
                  {sector.name}
                </div>
                <div>
                  <div className="text-white/60 text-xs font-mono mb-0.5 truncate">
                    ${(sector.marketCap / 1e9).toFixed(1)}B
                  </div>
                  <div
                    className={`font-mono font-bold text-sm ${isPositive ? "text-emerald-100" : "text-red-100"}`}
                  >
                    {isPositive ? "+" : "-"}
                    {percentage.toFixed(2)}%
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
