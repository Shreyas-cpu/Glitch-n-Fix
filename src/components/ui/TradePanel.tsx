import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowDownUp,
  ArrowUpRight,
  ArrowDownRight,
  X,
  AlertTriangle,
} from "lucide-react";
import { Coin } from "../../types/market";

export interface Trade {
  id: string;
  type: "buy" | "sell";
  coinId: string;
  coinSymbol: string;
  coinName: string;
  amount: number;
  pricePerCoin: number;
  totalCost: number;
  timestamp: Date;
}

interface TradePanelProps {
  coins: Coin[];
  walletBalance: number;
  onTrade: (trade: Trade) => void;
  isOpen: boolean;
  onClose: () => void;
  preselectedCoinId?: string | null;
}

export const TradePanel = ({
  coins,
  walletBalance,
  onTrade,
  isOpen,
  onClose,
  preselectedCoinId,
}: TradePanelProps) => {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [selectedCoinId, setSelectedCoinId] = useState(preselectedCoinId || "");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedCoin = coins.find((c) => c.id === selectedCoinId);
  const amountNum = parseFloat(amount) || 0;
  const totalCost = selectedCoin ? amountNum * selectedCoin.current_price : 0;

  // Sync preselectedCoinId when it changes
  React.useEffect(() => {
    if (preselectedCoinId) setSelectedCoinId(preselectedCoinId);
  }, [preselectedCoinId]);

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedCoinId) {
      setError("Please select a coin");
      return;
    }
    if (amountNum <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (tradeType === "buy" && totalCost > walletBalance) {
      setError(
        `Insufficient balance. Need ${totalCost.toFixed(4)} ETH but have ${walletBalance.toFixed(4)} ETH`,
      );
      return;
    }

    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 800));

    const trade: Trade = {
      id: `trade-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: tradeType,
      coinId: selectedCoinId,
      coinSymbol: selectedCoin!.symbol,
      coinName: selectedCoin!.name,
      amount: amountNum,
      pricePerCoin: selectedCoin!.current_price,
      totalCost,
      timestamp: new Date(),
    };

    onTrade(trade);
    setIsProcessing(false);
    setSuccess(
      `${tradeType === "buy" ? "Bought" : "Sold"} ${amountNum} ${selectedCoin!.symbol.toUpperCase()} for ${totalCost.toFixed(4)} ETH`,
    );
    setAmount("");

    setTimeout(() => setSuccess(""), 3000);
  };

  const quickAmounts =
    tradeType === "buy" ? [0.01, 0.05, 0.1, 0.5] : [0.001, 0.005, 0.01, 0.05];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg mx-4 bg-nexus-bg border border-nexus-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Glow */}
            <div
              className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none ${tradeType === "buy" ? "bg-emerald-500/10" : "bg-red-500/10"}`}
            />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${tradeType === "buy" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}
                >
                  <ArrowDownUp
                    size={20}
                    className={
                      tradeType === "buy" ? "text-emerald-500" : "text-red-500"
                    }
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Trade</h2>
                  <p className="text-xs text-zinc-500">
                    Balance: {walletBalance.toFixed(4)} ETH
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleTrade}
              className="relative px-6 pb-6 pt-3 flex flex-col gap-4"
            >
              {/* Buy / Sell Tabs */}
              <div className="flex bg-nexus-card p-1 rounded-lg border border-nexus-border">
                <button
                  type="button"
                  onClick={() => {
                    setTradeType("buy");
                    setError("");
                  }}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${tradeType === "buy" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-white"}`}
                >
                  <ArrowUpRight size={16} /> Buy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTradeType("sell");
                    setError("");
                  }}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${tradeType === "sell" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-zinc-500 hover:text-white"}`}
                >
                  <ArrowDownRight size={16} /> Sell
                </button>
              </div>

              {/* Coin selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Asset
                </label>
                <select
                  value={selectedCoinId}
                  onChange={(e) => setSelectedCoinId(e.target.value)}
                  className="w-full bg-nexus-card border border-nexus-border rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer appearance-none"
                >
                  <option value="">Select a coin...</option>
                  {coins.map((coin) => (
                    <option key={coin.id} value={coin.id}>
                      {coin.name} ({coin.symbol.toUpperCase()}) — $
                      {coin.current_price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Amount ({selectedCoin?.symbol?.toUpperCase() || "coins"})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-nexus-card border border-nexus-border rounded-lg py-2.5 px-4 text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
                {/* Quick amounts */}
                <div className="flex gap-2 mt-1">
                  {quickAmounts.map((qa) => (
                    <button
                      key={qa}
                      type="button"
                      onClick={() => setAmount(qa.toString())}
                      className="px-3 py-1 text-xs bg-nexus-card border border-nexus-border rounded-md text-zinc-400 hover:text-white hover:border-emerald-500/30 transition-all"
                    >
                      {qa}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Summary */}
              {selectedCoin && amountNum > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-nexus-card border border-nexus-border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">
                      Price per {selectedCoin.symbol.toUpperCase()}
                    </span>
                    <span className="text-white font-mono">
                      ${selectedCoin.current_price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Quantity</span>
                    <span className="text-white font-mono">
                      {amountNum} {selectedCoin.symbol.toUpperCase()}
                    </span>
                  </div>
                  <div className="border-t border-nexus-border pt-2 flex justify-between text-sm font-bold">
                    <span className="text-zinc-300">
                      Total {tradeType === "buy" ? "Cost" : "Credit"}
                    </span>
                    <span
                      className={
                        tradeType === "buy"
                          ? "text-red-400"
                          : "text-emerald-400"
                      }
                    >
                      {tradeType === "buy" ? "-" : "+"}
                      {totalCost.toFixed(4)} ETH
                    </span>
                  </div>
                  {tradeType === "buy" && totalCost > walletBalance && (
                    <div className="flex items-center gap-2 text-xs text-red-400 mt-1">
                      <AlertTriangle size={14} />
                      Insufficient balance
                    </div>
                  )}
                </motion.div>
              )}

              {/* Error / Success */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2"
                  >
                    ✅ {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={isProcessing || !selectedCoinId || amountNum <= 0}
                className={`w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 active:scale-[0.98] flex items-center justify-center gap-2 ${tradeType === "buy" ? "bg-emerald-500 text-white hover:bg-emerald-400" : "bg-red-500 text-white hover:bg-red-400"}`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  <>
                    {tradeType === "buy" ? "Buy" : "Sell"}{" "}
                    {selectedCoin?.symbol?.toUpperCase() || "Asset"}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
