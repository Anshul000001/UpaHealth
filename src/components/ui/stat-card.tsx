"use client";

import { Card } from "./card";
import { cn } from "@/lib/utils";
import {
  IndianRupee,
  TrendingUp,
  FileText,
  Globe,
  Users,
  Package,
  Building2,
  Target,
  DollarSign,
  Ship,
  FileCheck,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon registry — keeps the StatCard usable from Server Components.
 * Server components can't pass component references across the network
 * boundary, so we expose a string-based API and resolve here.
 */
const ICON_REGISTRY = {
  IndianRupee,
  TrendingUp,
  FileText,
  Globe,
  Users,
  Package,
  Building2,
  Target,
  DollarSign,
  Ship,
  FileCheck,
} as const satisfies Record<string, LucideIcon>;

export type StatIconName = keyof typeof ICON_REGISTRY;

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: StatIconName;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  iconColor = "text-cyan-400",
}: StatCardProps) {
  const Icon = ICON_REGISTRY[icon];
  return (
    <Card className="relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {change && (
              <p
                className={cn(
                  "text-xs font-medium",
                  changeType === "positive" && "text-emerald-400",
                  changeType === "negative" && "text-red-400",
                  changeType === "neutral" && "text-slate-400"
                )}
              >
                {change}
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl bg-slate-800/80", iconColor)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </Card>
  );
}
