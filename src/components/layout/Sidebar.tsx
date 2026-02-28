import React from "react";
import { LayoutDashboard, Activity, TrendingUp, Settings } from "lucide-react";

export type TabType = "dashboard" | "activity" | "trending" | "settings";

const tabs: { id: TabType; icon: React.ElementType }[] = [
  { id: "dashboard", icon: LayoutDashboard },
  { id: "activity", icon: Activity },
  { id: "trending", icon: TrendingUp },
  { id: "settings", icon: Settings },
];

interface SidebarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export default function Sidebar({ activeTab, onChangeTab }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0A0A0B] border-r border-[#141414] flex flex-col items-center py-8 gap-6 z-50">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-lg">
        N
      </div>
      <nav className="flex flex-col gap-2 mt-4">
        {tabs.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChangeTab(id)}
            className={`p-3 rounded-xl transition-all ${
              activeTab === id
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-zinc-600 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={20} />
          </button>
        ))}
      </nav>
    </aside>
  );
}
