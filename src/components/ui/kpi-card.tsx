import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  icon?: LucideIcon;
  iconColor?: string;
  accent?: "cyan" | "emerald" | "blue" | "violet" | "amber";
  className?: string;
}

const ACCENT_MAP = {
  cyan:    { bg: "bg-[#06B6D4]/10", text: "text-[#06B6D4]", border: "border-[#06B6D4]/20" },
  emerald: { bg: "bg-[#10B981]/10", text: "text-[#10B981]", border: "border-[#10B981]/20" },
  blue:    { bg: "bg-[#2563EB]/10", text: "text-[#60A5FA]", border: "border-[#2563EB]/20" },
  violet:  { bg: "bg-[#7C3AED]/10", text: "text-[#A78BFA]", border: "border-[#7C3AED]/20" },
  amber:   { bg: "bg-[#F59E0B]/10", text: "text-[#FBBF24]", border: "border-[#F59E0B]/20" },
};

export function KPICard({
  label, value, sub, trend, trendValue, icon: Icon,
  accent = "cyan", className,
}: KPICardProps) {
  const a = ACCENT_MAP[accent];

  return (
    <div className={cn("kpi-card p-5", className)}>
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <p className="metric-label">{label}</p>
        {Icon && (
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", a.bg, `border ${a.border}`)}>
            <Icon className={cn("w-4 h-4", a.text)} />
          </div>
        )}
      </div>

      {/* Value */}
      <p className="metric-value mb-1">{value}</p>

      {/* Sub / trend */}
      {(sub || trendValue) && (
        <div className="flex items-center gap-1.5 mt-2">
          {trend && trendValue && (
            <span className={cn(
              "text-[11px] font-semibold px-1.5 py-0.5 rounded",
              trend === "up"   && "text-[#10B981] bg-[#10B981]/10",
              trend === "down" && "text-[#EF4444] bg-[#EF4444]/10",
              trend === "flat" && "text-slate-400 bg-slate-800",
            )}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
            </span>
          )}
          {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
        </div>
      )}
    </div>
  );
}
