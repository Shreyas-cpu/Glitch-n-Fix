import { motion } from "motion/react";
import { ResponsiveContainer, AreaChart, Area, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";

export interface TrendingToken {
  id: string;
  symbol: string;
  name: string;
  price: number;
  volChange: number;
  sentiment: number;
  sparkline: number[];
}

interface TrendingTableProps {
  tokens: TrendingToken[];
}

export const TrendingTable = ({ tokens }: TrendingTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#141414]">
            <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Token</th>
            <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Price</th>
            <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Vol Change</th>
            <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Sentiment</th>
            <th className="px-6 py-4 text-xs text-zinc-500 uppercase text-right w-48">7d Trend</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => {
            const isPositive =
              token.sparkline[token.sparkline.length - 1] >= token.sparkline[0];
            const strokeColor = isPositive ? "#10b981" : "#ef4444";
            const gradientId = `trendGrad-${token.id}`;

            return (
              <motion.tr
                key={token.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-[#151619] transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{token.symbol}</div>
                      <div className="text-xs text-zinc-500">{token.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-white font-mono text-sm">
                  ${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-1.5 font-medium ${token.volChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    <TrendingUp size={14} className={token.volChange < 0 ? "rotate-180" : ""} />
                    {token.volChange > 0 ? "+" : ""}{token.volChange.toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-300 font-mono text-sm w-8">{token.sentiment}%</span>
                    <div className="w-24 h-1.5 bg-[#1A1B1E] rounded-full overflow-hidden border border-[#2A2B2E]">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${token.sentiment}%`,
                          backgroundColor:
                            token.sentiment > 70 ? "#10b981" : token.sentiment > 40 ? "#fbbf24" : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-2 w-48 h-16 pointer-events-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={token.sparkline.map((val, i) => ({ time: i, price: val }))}>
                      <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <YAxis hide domain={["dataMin", "dataMax"]} />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={strokeColor}
                        fillOpacity={1}
                        fill={`url(#${gradientId})`}
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};