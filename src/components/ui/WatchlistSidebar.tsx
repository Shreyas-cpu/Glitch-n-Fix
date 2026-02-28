import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { WatchlistItem } from "../../types/market";

interface WatchlistSidebarProps {
  items: WatchlistItem[];
  onRemove: (id: string) => void;
}

export const WatchlistSidebar = ({
  items,
  onRemove,
}: WatchlistSidebarProps) => (
  <div className="space-y-3">
    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
      Watchlist
    </h3>
    <AnimatePresence>
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex justify-between p-3 bg-[#151619] rounded-lg"
        >
          <span>{item.name}</span>
          <button onClick={() => onRemove(item.id)}>
            <Trash2 size={14} />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
