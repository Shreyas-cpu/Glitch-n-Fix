import { ArrowUpRight, ArrowDownRight, ArrowRightLeft } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "./Card";

export interface GainerLoser {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
}

interface GainersLosersGridProps {
  gainers: GainerLoser[];
  losers: GainerLoser[];
  onTokenClick?: (token: GainerLoser) => void;
  onTrade?: (token: GainerLoser) => void;
}

const TokenList = ({
  title,
  tokens,
  isGainer,
  onTokenClick,
  onTrade,
}: {
  title: string;
  tokens: GainerLoser[];
  isGainer: boolean;
  onTokenClick?: (token: GainerLoser) => void;
  onTrade?: (token: GainerLoser) => void;
}) => (
  <Card className="p-6 h-full flex flex-col">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
      <div
        className={`px-2 py-1 rounded bg-[#1A1B1E] text-xs font-mono border border-[#2A2B2E] ${
          isGainer ? "text-emerald-500" : "text-red-500"
        }`}
      >
        24h Top 5
      </div>
    </div>
    <div className="flex flex-col gap-3 flex-1">
      {tokens.map((token, index) => (
        <motion.div
          key={token.id}
          initial={{ opacity: 0, x: isGainer ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onTokenClick?.(token)}
          className="flex items-center justify-between p-3 rounded-lg bg-[#1A1B1E] border border-[#2A2B2E] hover:border-zinc-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 w-4">{index + 1}</span>
            <div>
              <div className="text-sm font-semibold text-white">
                {token.symbol}
              </div>
              <div className="text-xs text-zinc-500">{token.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-mono text-white">
                $
                {token.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}
              </div>
              <div
                className={`text-xs flex items-center justify-end gap-1 ${
                  isGainer ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {isGainer ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {Math.abs(token.change).toFixed(2)}%
              </div>
            </div>
            {onTrade && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTrade(token);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 flex items-center gap-1"
              >
                <ArrowRightLeft size={10} />
                Trade
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  </Card>
);

export const GainersLosersGrid = ({ gainers, losers, onTokenClick, onTrade }: GainersLosersGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      <TokenList title="Top Gainers" tokens={gainers} isGainer={true} onTokenClick={onTokenClick} onTrade={onTrade} />
      <TokenList title="Top Losers" tokens={losers} isGainer={false} onTokenClick={onTokenClick} onTrade={onTrade} />
    </div>
  );
};