import React from "react";
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  Settings,
  User,
} from "lucide-react";

export type TabType =
  | "dashboard"
  | "activity"
  | "trending"
  | "profile"
  | "settings";

const tabs: { id: TabType; icon: React.ElementType; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "activity", icon: Activity, label: "Activity" },
  { id: "trending", icon: TrendingUp, label: "Trending" },
  { id: "profile", icon: User, label: "Profile" },
  { id: "settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export default function Sidebar({ activeTab, onChangeTab }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-nexus-bg border-r border-[#141414] flex flex-col items-start py-8 px-4 gap-6 z-50">
      <div className="flex items-center gap-3 px-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-lg">
          N
        </div>
        <span className="text-lg font-bold text-white tracking-tight">
          Nexus
        </span>
      </div>
      <nav className="flex flex-col gap-1.5 w-full mt-2">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onChangeTab(id)}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-left ${
              activeTab === id
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={20} />
            <span className="text-sm font-semibold">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
