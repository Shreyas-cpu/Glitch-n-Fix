import React, { useState } from "react";
import {
  X,
  ArrowDownUp,
  TrendingUp,
  TrendingDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Target,
} from "lucide-react";
import { Coin } from "../../types/market";
import { usePortfolio } from "../../hooks/usePortfolio";

interface TradeModalProps {
  coin: Coin;
  onClose: () => void;
}

export const TradeModal = ({ coin, onClose }: TradeModalProps) => {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { buy, sell, setSLTP, portfolio } = usePortfolio();

  const holding = portfolio.find((p) => p.coinId === coin.id);
  const parsedAmount = parseFloat(amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;
  const totalCost = isValidAmount ? parsedAmount * coin.current_price : 0;

  const parsedSL = parseFloat(stopLoss);
  const parsedTP = parseFloat(takeProfit);
  const hasSL = !isNaN(parsedSL) && parsedSL > 0;
  const hasTP = !isNaN(parsedTP) && parsedTP > 0;

  const handleTrade = async () => {
    if (!isValidAmount) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      if (mode === "buy") {
        await buy({
          coinId: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          amount: parsedAmount,
          pricePerUnit: coin.current_price,
        });

        // Set SL/TP after successful buy if configured
        if (hasSL || hasTP) {
          await setSLTP({
            coinId: coin.id,
            stopLoss: hasSL ? parsedSL : null,
            takeProfit: hasTP ? parsedTP : null,
          });
        }
      } else {
        await sell({
          coinId: coin.id,
          amount: parsedAmount,
          pricePerUnit: coin.current_price,
        });
      }
      setStatus("success");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.response?.data?.error || "Transaction failed. Please try again.");
    }
  };

  const slPercentage = hasSL
    ? (((coin.current_price - parsedSL) / coin.current_price) * 100).toFixed(1)
    : null;
  const tpPercentage = hasTP
    ? (((parsedTP - coin.current_price) / coin.current_price) * 100).toFixed(1)
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#151619] border border-[#1A1B1E] rounded-2xl w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1A1B1E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A1B1E] border border-[#2A2B2E] flex items-center justify-center text-white font-bold text-sm">
              {coin.symbol?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{coin.name}</h3>
              <span className="text-xs text-zinc-500 uppercase font-mono">{coin.symbol}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Buy/Sell Toggle */}
        <div className="p-6 space-y-5">
          <div className="flex bg-[#1A1B1E] p-1 rounded-lg border border-[#2A2B2E]">
            <button
              onClick={() => { setMode("buy"); setStatus("idle"); setErrorMsg(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                mode === "buy"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-zinc-500 hover:text-white border border-transparent"
              }`}
            >
              <TrendingUp size={16} /> Buy
            </button>
            <button
              onClick={() => { setMode("sell"); setStatus("idle"); setErrorMsg(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                mode === "sell"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "text-zinc-500 hover:text-white border border-transparent"
              }`}
            >
              <TrendingDown size={16} /> Sell
            </button>
          </div>

          {/* Price Display */}
          <div className="bg-[#1A1B1E] rounded-xl p-4 border border-[#2A2B2E]">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500 uppercase">Current Price</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                coin.price_change_percentage_24h >= 0
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}>
                {coin.price_change_percentage_24h > 0 ? "+" : ""}
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              ${coin.current_price?.toLocaleString()}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-white">
                Amount ({coin.symbol.toUpperCase()})
              </label>
              {mode === "sell" && holding && (
                <button
                  onClick={() => setAmount(holding.amount.toString())}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Max: {holding.amount.toFixed(6)}
                </button>
              )}
            </div>
            <input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setStatus("idle"); }}
              placeholder="0.00"
              className="w-full bg-[#1A1B1E] border border-[#2A2B2E] rounded-lg px-4 py-3 text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          {/* Stop Loss / Take Profit (Buy mode only) */}
          {mode === "buy" && (
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors mb-3"
              >
                <ShieldAlert size={14} />
                {showAdvanced ? "Hide" : "Set"} Stop Loss / Take Profit
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showAdvanced && (
                <div className="space-y-3 p-4 bg-[#1A1B1E] rounded-xl border border-[#2A2B2E]">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <ShieldAlert size={12} className="text-red-400" />
                      <label className="text-xs font-medium text-zinc-300">Stop Loss (USD)</label>
                      {slPercentage && <span className="text-xs text-red-400 ml-auto">-{slPercentage}%</span>}
                    </div>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      placeholder={`e.g. ${(coin.current_price * 0.9).toFixed(2)}`}
                      className="w-full bg-[#151619] border border-[#2A2B2E] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1">Auto-sells entire position if price drops to this level</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Target size={12} className="text-emerald-400" />
                      <label className="text-xs font-medium text-zinc-300">Take Profit (USD)</label>
                      {tpPercentage && <span className="text-xs text-emerald-400 ml-auto">+{tpPercentage}%</span>}
                    </div>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      placeholder={`e.g. ${(coin.current_price * 1.2).toFixed(2)}`}
                      className="w-full bg-[#151619] border border-[#2A2B2E] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1">Auto-sells entire position if price rises to this level</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {isValidAmount && (
            <div className="bg-[#1A1B1E] rounded-xl p-4 border border-[#2A2B2E] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Amount</span>
                <span className="text-white font-mono">{parsedAmount} {coin.symbol.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Price per unit</span>
                <span className="text-white font-mono">${coin.current_price?.toLocaleString()}</span>
              </div>
              {hasSL && mode === "buy" && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Stop Loss</span>
                  <span className="text-red-400 font-mono">${parsedSL.toLocaleString()}</span>
                </div>
              )}
              {hasTP && mode === "buy" && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Take Profit</span>
                  <span className="text-emerald-400 font-mono">${parsedTP.toLocaleString()}</span>
                </div>
              )}
              <div className="h-px bg-[#2A2B2E]" />
              <div className="flex justify-between text-sm font-bold">
                <span className="text-zinc-300">Total {mode === "buy" ? "Cost" : "Revenue"}</span>
                <span className={mode === "buy" ? "text-emerald-400" : "text-red-400"}>
                  ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Existing Holdings Info */}
          {holding && (
            <div className="bg-[#1A1B1E] rounded-xl p-3 border border-[#2A2B2E] space-y-1">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <ArrowDownUp size={12} />
                You hold <span className="text-white font-mono">{holding.amount.toFixed(6)} {holding.symbol}</span>
                at avg <span className="text-white font-mono">${holding.avgPrice.toLocaleString()}</span>
              </div>
              {(holding.stopLoss || holding.takeProfit) && (
                <div className="flex gap-3 text-[10px] mt-1">
                  {holding.stopLoss && <span className="text-red-400">SL: ${holding.stopLoss.toLocaleString()}</span>}
                  {holding.takeProfit && <span className="text-emerald-400">TP: ${holding.takeProfit.toLocaleString()}</span>}
                </div>
              )}
            </div>
          )}

          {/* Status Messages */}
          {status === "success" && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400 text-sm">
              <CheckCircle2 size={16} />
              {mode === "buy" ? "Purchase" : "Sale"} successful!
              {hasSL && mode === "buy" && " SL set."}
              {hasTP && mode === "buy" && " TP set."}
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleTrade}
            disabled={!isValidAmount || status === "loading" || status === "success"}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === "buy"
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {status === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {mode === "buy" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {mode === "buy" ? "Buy" : "Sell"} {coin.symbol.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
