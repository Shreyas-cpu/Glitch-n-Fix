import { motion, AnimatePresence } from "motion/react";
import { Trash2 } from "lucide-react";
import { WatchlistItem } from "../../types/market";

interface WatchlistSidebarProps {
  items: WatchlistItem[];
  onRemove: (id: string) => void;
  onItemClick?: (id: string) => void;
}

export const WatchlistSidebar = ({ items, onRemove, onItemClick }: WatchlistSidebarProps) => (
  <div className="space-y-3">
    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
      Watchlist ({items.length})
    </h3>
    <AnimatePresence>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-8">
          No items in watchlist. Click + on a coin to add it.
        </p>
      ) : (
        items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-between items-center p-3 bg-[#151619] rounded-lg border border-[#1A1B1E] hover:border-emerald-500/50 transition-colors cursor-pointer"
            onClick={() => onItemClick?.(item.id)}
          >
            <div className="flex items-center gap-3">
              <span className="text-white font-medium">{item.name}</span>
              <span className="text-xs text-zinc-500 uppercase">
                {item.symbol}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        ))
      )}
    </AnimatePresence>
  </div>
);