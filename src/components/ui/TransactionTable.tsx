import { motion, AnimatePresence } from "motion/react";
import { Clock } from "lucide-react";

export interface Transaction {
  id: string;
  hash: string;
  method: "Swap" | "Send" | "Mint" | "Burn" | "Approve";
  status: "Success" | "Pending" | "Failed";
  time: string;
  value: string;
  usdValue: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable = ({ transactions }: TransactionTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#141414]">
            <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Tx Hash</th>
            <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Method</th>
            <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Status</th>
            <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Time</th>
            <th className="px-6 py-4 text-xs text-zinc-500 uppercase text-right">Value</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {transactions.map((tx) => (
              <motion.tr
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="hover:bg-[#151619] transition-colors group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-mono text-emerald-400 hover:underline cursor-pointer">
                    {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-white bg-[#1A1B1E] px-2 py-1 rounded border border-[#2A2B2E]">
                    {tx.method}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    {tx.status === "Success" && (
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Success
                      </div>
                    )}
                    {tx.status === "Pending" && (
                      <div className="flex items-center gap-1.5 text-yellow-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                        Pending
                      </div>
                    )}
                    {tx.status === "Failed" && (
                      <div className="flex items-center gap-1.5 text-red-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        Failed
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-400 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-zinc-500" />
                    {tx.time}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-white font-medium">{tx.value}</div>
                  <div className="text-xs text-zinc-500">{tx.usdValue}</div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};