import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Wallet, Copy, Check, ArrowRight } from "lucide-react";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string) => void;
}

export const WalletConnectModal = ({
  isOpen,
  onClose,
  onConnect,
}: WalletConnectModalProps) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  const isValidAddress = (addr: string) => {
    // Ethereum-style address: 0x followed by 40 hex chars
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!walletAddress.trim()) {
      setError("Please enter your wallet address");
      return;
    }

    if (!isValidAddress(walletAddress.trim())) {
      setError(
        "Invalid wallet address — must be 0x followed by 40 hex characters",
      );
      return;
    }

    setIsConnecting(true);
    // Simulate connection handshake
    await new Promise((r) => setTimeout(r, 1500));
    setIsConnecting(false);
    onConnect(walletAddress.trim());
    setWalletAddress("");
  };

  const DEMO_WALLETS = [
    {
      label: "Demo Wallet 1",
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    },
    {
      label: "Demo Wallet 2",
      address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    },
  ];

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
            className="relative w-full max-w-md mx-4 bg-nexus-bg border border-nexus-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative px-8 pt-8 pb-2">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Wallet size={20} className="text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Connect Wallet
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Enter your wallet address to connect
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConnect} className="relative px-8 pb-6 pt-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Wallet Address
                  </label>
                  <div className="relative">
                    <Wallet
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="0x71C7656EC7ab88b..."
                      className="w-full bg-nexus-card border border-nexus-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all relative overflow-hidden disabled:opacity-50 bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-nexus-card-hover" />
                  <span className="text-xs text-zinc-600">
                    or use a demo wallet
                  </span>
                  <div className="flex-1 h-px bg-nexus-card-hover" />
                </div>

                {/* Quick-connect demo wallets */}
                <div className="flex flex-col gap-2">
                  {DEMO_WALLETS.map((w) => (
                    <button
                      key={w.address}
                      type="button"
                      onClick={() => setWalletAddress(w.address)}
                      className="flex items-center justify-between px-4 py-3 bg-nexus-card border border-nexus-border rounded-lg hover:border-emerald-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Wallet size={14} className="text-emerald-500" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm text-white font-medium">
                            {w.label}
                          </div>
                          <div className="text-xs text-zinc-500 font-mono">
                            {w.address.substring(0, 6)}...
                            {w.address.substring(w.address.length - 4)}
                          </div>
                        </div>
                      </div>
                      <ArrowRight
                        size={14}
                        className="text-zinc-600 group-hover:text-emerald-400 transition-colors"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
