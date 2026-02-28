import React from "react";
import { Wallet, Search, LogOut, User, Coins, Unplug } from "lucide-react";

interface WalletInfo {
  address: string;
  balance: number;
}

interface HeaderProps {
  walletConnected: boolean;
  walletInfo: WalletInfo | null;
  isAuthenticated: boolean;
  userEmail: string;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

function shortenAddress(addr: string) {
  return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);
}

export default function Header({
  walletConnected,
  walletInfo,
  isAuthenticated,
  userEmail,
  onConnectWallet,
  onDisconnectWallet,
  onLoginClick,
  onLogout,
  searchQuery,
  setSearchQuery,
}: HeaderProps) {
  const handleWalletClick = () => {
    if (!isAuthenticated) {
      onLoginClick();
      return;
    }
    if (walletConnected) {
      onDisconnectWallet();
    } else {
      onConnectWallet();
    }
  };

  return (
    <header className="h-20 border-b border-[#141414] flex items-center justify-between px-8 bg-nexus-bg/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Nexus Terminal
        </h1>

        <div className="h-4 w-[1px] bg-zinc-800" />

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <div
            className={`w-2 h-2 rounded-full ${walletConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"}`}
          />
          {walletConnected ? "Mainnet Connected" : "Not Connected"}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
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
            className="bg-nexus-card border border-[#141414] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all w-56"
          />
        </div>

        {/* Wallet Balance Card */}
        {walletConnected && walletInfo && (
          <div className="flex items-center gap-3 px-4 py-2 bg-nexus-card border border-emerald-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Coins size={16} className="text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 leading-none">
                  Balance
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono leading-tight">
                  {walletInfo.balance.toFixed(4)} ETH
                </span>
              </div>
            </div>
            <div className="w-px h-8 bg-nexus-card-hover" />
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 leading-none">
                Address
              </span>
              <span className="text-xs font-mono text-zinc-300 leading-tight">
                {shortenAddress(walletInfo.address)}
              </span>
            </div>
          </div>
        )}

        {/* Auth status */}
        {isAuthenticated && !walletConnected && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-nexus-card border border-nexus-border rounded-lg">
            <User size={14} className="text-emerald-400" />
            <span className="text-xs text-zinc-400 font-mono max-w-[100px] truncate">
              {userEmail}
            </span>
          </div>
        )}

        {/* Wallet / Auth button */}
        <button
          onClick={handleWalletClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            walletConnected
              ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
              : isAuthenticated
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"
          }`}
        >
          {walletConnected ? (
            <>
              <Unplug size={16} /> Disconnect
            </>
          ) : isAuthenticated ? (
            <>
              <Wallet size={16} /> Connect Wallet
            </>
          ) : (
            <>
              <Wallet size={16} /> Sign In to Connect
            </>
          )}
        </button>

        {/* Logout */}
        {isAuthenticated && (
          <button
            onClick={onLogout}
            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
