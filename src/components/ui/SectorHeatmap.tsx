import { motion } from "motion/react";

export interface Sector {
  id: string;
  name: string;
  marketCap: number;
  change: number;
}

interface SectorHeatmapProps {
  sectors: Sector[];
  onSectorClick?: (sector: Sector) => void;
  selectedSectorId?: string | null;
}

export const SectorHeatmap = ({ sectors, onSectorClick, selectedSectorId }: SectorHeatmapProps) => {
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
          const isSelected = selectedSectorId === sector.id;

          return (
            <motion.div
              key={sector.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSectorClick?.(sector)}
              className={`relative rounded-xl overflow-hidden group cursor-pointer ${styleClass}`}
              style={{ backgroundColor: bgColorStyle }}
            >
              <div
                className={`absolute inset-0 border rounded-xl transition-colors z-10 ${
                  isSelected
                    ? "border-emerald-400 ring-1 ring-emerald-400/30"
                    : "border-white/5 group-hover:border-white/30"
                }`}
              />
              <div className="absolute inset-0 p-4 flex flex-col justify-between z-20">
                <div className="text-white/90 font-bold group-hover:text-white transition-colors truncate">
                  {sector.name}
                </div>
                <div>
                  <div className="text-white/60 text-xs font-mono mb-0.5 truncate">
                    ${(sector.marketCap / 1e9).toFixed(1)}B
                  </div>
                  <div
                    className={`font-mono font-bold text-sm ${
                      isPositive ? "text-emerald-100" : "text-red-100"
                    }`}
                  >
                    {isPositive ? "+" : "-"}
                    {percentage.toFixed(2)}%
                  </div>
                </div>
              </div>
              {/* Click indicator */}
              <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/70">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};