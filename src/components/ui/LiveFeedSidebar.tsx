import { motion, AnimatePresence } from "framer-motion";
import { Cuboid } from "lucide-react";

export interface BlockData {
  id: string;
  blockNumber: number;
  miner: string;
  txns: number;
  timeAgo: string;
  reward: string;
}

interface LiveFeedSidebarProps {
  blocks: BlockData[];
}

export const LiveFeedSidebar = ({ blocks }: LiveFeedSidebarProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Network Feed
        </h3>
        <span className="text-xs text-emerald-500 font-mono bg-emerald-500/10 px-2 py-1 rounded">
          12s block time
        </span>
      </div>
      <div className="space-y-3 pr-2 custom-scrollbar overflow-y-auto">
        <AnimatePresence>
          {blocks.map((block) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-[#151619] rounded-xl border border-[#1A1B1E] hover:border-[#2A2B2E] transition-colors relative overflow-hidden group"
            >
              <div className="flex justify-between items-start relative z-10 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Cuboid size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-400 hover:underline cursor-pointer">
                      #{block.blockNumber.toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">
                      Miner{" "}
                      <span className="text-blue-400 hover:underline cursor-pointer">
                        {block.miner}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-zinc-500 font-medium">
                  {block.timeAgo}
                </div>
              </div>
              <div className="flex justify-between items-end relative z-10">
                <div className="text-xs text-zinc-400">
                  <span className="font-medium text-white">{block.txns}</span>{" "}
                  txns
                </div>
                <div className="text-xs font-mono text-zinc-300 bg-[#1A1B1E] px-2 py-1 rounded border border-[#2A2B2E]">
                  Reward:{" "}
                  <span className="text-emerald-400 font-bold">
                    {block.reward}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
