import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

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
                        <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Transaction Hash</th>
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
                                {/* Transaction Hash */}
                                <td className="px-6 py-4 text-sm font-mono text-zinc-400">
                                    <span className="group-hover:text-white transition-colors">
                                        {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                                    </span>
                                </td>

                                {/* Method */}
                                <td className="px-6 py-4">
                                    <span className="text-xs px-2 py-1 rounded-md bg-[#1e1e22] text-zinc-300 font-medium">
                                        {tx.method}
                                    </span>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4">
                                    <div className="text-sm">
                                        {tx.status === "Success" && (
                                            <div className="flex items-center gap-1.5 text-emerald-400">
                                                <ArrowUpRight size={14} />
                                                Success
                                            </div>
                                        )}
                                        {tx.status === "Pending" && (
                                            <div className="flex items-center gap-1.5 text-yellow-400">
                                                <Clock size={14} />
                                                Pending
                                            </div>
                                        )}
                                        {tx.status === "Failed" && (
                                            <div className="flex items-center gap-1.5 text-red-400">
                                                <ArrowDownRight size={14} />
                                                Failed
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* Time */}
                                <td className="px-6 py-4 text-zinc-400 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-zinc-500" />
                                        {tx.time}
                                    </div>
                                </td>

                                {/* Value */}
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