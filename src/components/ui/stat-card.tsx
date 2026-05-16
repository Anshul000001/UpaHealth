"use client";

import { cn } from "@/lib/utils";
import {
  IndianRupee, TrendingUp, FileText, Globe, Users, Package,
  Building2, Target, DollarSign, Ship, FileCheck, Zap, Bookmark,
  type LucideIcon,
} from "lucide-react";

const ICON_REGISTRY = {
  IndianRupee, TrendingUp, FileText, Globe, Users, Package,
  Building2, Target, DollarSign, Ship, FileCheck, Zap, Bookmark,
} as const satisfies Record<string, LucideIcon>;

export type StatIconName = keyof typeof ICON_REGISTRY;

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: StatIconName;
  iconColor?: string;
  accent?: string;
}

export function StatCard({
  title, value, change, changeType = "neutral", icon, iconColor = "text-cyan-400", accent,
}: StatCardProps) {
  const Icon = ICON_REGISTRY[icon];
  const accentMap: Record<string, string> = {
    "text-emerald-400": "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
    "text-cyan-400":    "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20",
    "text-blue-400":    "from-blue-500/10 to-blue-500/5 border-blue-500/20",
    "text-purple-400":  "from-purple-500/10 to-purple-500/5 border-purple-500/20",
    "text-amber-400":   "from-amber-500/10 to-amber-500/5 border-amber-500/20",
  };
  const gradientClass = accent ?? accentMap[iconColor] ?? "from-slate-800/50 to-slate-800/30 border-slate-700/30";

  return (
    <div className={cn("kpi-card group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5", gradientClass)}>
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br", gradientClass)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5", iconColor.replace("text-", "bg-"))} />
      </div>

      {/* Value */}
      <div className="space-y-1">
        <p className="metric-label">{title}</p>
        <p className="metric-value">{value}</p>
        {change && (
          <p className={cn("text-xs font-medium mt-1.5",
            changeType === "positive" ? "text-emerald-400" :
            changeType === "negative" ? "text-red-400" : "text-slate-500"
          )}>
            {changeType === "positive" && "↑ "}{changeType === "negative" && "↓ "}{change}
          </p>
        )}
      </div>

      {/* Hover shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 60%)" }} />
    </div>
  );
}
