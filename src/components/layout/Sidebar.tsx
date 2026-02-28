import React from "react";
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  Settings,
  Wallet,
  LucideIcon,
} from "lucide-react";

export type TabType = "dashboard" | "portfolio" | "activity" | "trending" | "settings";

interface SidebarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

const navItems: { id: TabType; icon: LucideIcon; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "portfolio", icon: Wallet, label: "Portfolio" },
  { id: "activity", icon: Activity, label: "Activity" },
  { id: "trending", icon: TrendingUp, label: "Trending" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ activeTab, onChangeTab }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0A0A0B] border-r border-[#141414] flex flex-col items-center py-8 z-50">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-10">
        <span className="text-emerald-500 font-bold text-lg">N</span>
      </div>

      <nav className="flex flex-col gap-2 w-full px-4">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onChangeTab(id)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all w-full text-left ${
              activeTab === id
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-zinc-600 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={20} />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}