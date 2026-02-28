import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "./Card";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
}

export const StatCard = ({ title, value, change, icon: Icon }: StatCardProps) => (
  <Card className="p-6 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
      <Icon size={24} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
        {title}
      </p>
      <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
    </div>
    <div
      className={`flex items-center gap-1 text-sm font-medium ${
        change >= 0 ? "text-emerald-400" : "text-red-400"
      }`}
    >
      {change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
      {Math.abs(change).toFixed(1)}%
    </div>
  </Card>
);