import React from "react";
import { Wallet, Search } from "lucide-react";

interface HeaderProps {
  walletConnected: boolean;
  setWalletConnected: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export default function Header({
  walletConnected,
  setWalletConnected,
  searchQuery,
  setSearchQuery,
}: HeaderProps) {
  return (
    <header className="h-20 border-b border-[#141414] flex items-center justify-between px-8 bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Nexus Terminal
        </h1>

        <div className="h-4 w-[1px] bg-zinc-800" />

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Mainnet Connected
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#151619] border border-[#141414] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all w-64"
          />
        </div>

        <button
          onClick={() => setWalletConnected(!walletConnected)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            walletConnected
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-white text-black hover:bg-zinc-200"
          }`}
        >
          <Wallet size={16} />
          {walletConnected ? "0x71C...3E2" : "Connect Wallet"}
        </button>
      </div>
    </header>
  );
}