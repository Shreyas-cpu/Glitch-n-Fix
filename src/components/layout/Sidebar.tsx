import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, TrendingUp, Activity, Settings, LogOut } from "lucide-react";

export type TabType = "dashboard" | "activity" | "trending" | "settings";

interface SidebarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export default function Sidebar({ activeTab, onChangeTab }: SidebarProps) {
  const menuItems = [
    { id: "dashboard" as TabType, label: "Terminal", icon: LayoutDashboard },
    { id: "trending" as TabType, label: "Trending", icon: TrendingUp },
    { id: "activity" as TabType, label: "Activity", icon: Activity },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0A0A0B] border-r border-[#141414] z-50 p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Activity size={20} className="text-black" />
        </div>
        <span className="text-white font-bold text-xl tracking-tight">NEXUS</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <button className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-400 transition-colors mt-auto">
        <LogOut size={20} />
        <span className="font-medium">Disconnect</span>
      </button>
    </aside>
  );
}