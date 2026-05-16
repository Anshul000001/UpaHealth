"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/logo";
import {
  LayoutDashboard, FileText, Upload, Package, Factory,
  Users, Globe, BarChart3, Bot, Settings, ChevronLeft,
  ChevronRight, Mail, Zap, Target, Sparkles,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Procurement",
    items: [
      { label: "Quotations", href: "/dashboard/quotations", icon: FileText },
      { label: "RFQ Parser", href: "/dashboard/rfq", icon: Upload, badge: "AI" },
      { label: "Products", href: "/dashboard/products", icon: Package },
      { label: "Suppliers", href: "/dashboard/suppliers", icon: Factory },
    ],
  },
  {
    label: "Sales & CRM",
    items: [
      { label: "CRM", href: "/dashboard/crm", icon: Users },
      { label: "Lead Gen AI", href: "/dashboard/lead-gen", icon: Target, badge: "AI" },
      { label: "Communications", href: "/dashboard/communications", icon: Mail },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Export Intel", href: "/dashboard/export", icon: Globe, badge: "AI" },
      { label: "AI Agents", href: "/dashboard/agents", icon: Zap, badge: "15" },
      { label: "AI Assistant", href: "/dashboard/ai", icon: Sparkles, badge: "AI" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-white/[0.06] bg-[#0B1220]/95 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center justify-between px-4 border-b border-white/[0.06]">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <LogoMark size={26} />
            <div className="leading-tight min-w-0">
              <span className="block text-white font-bold text-[13px] tracking-tight">
                <span className="text-blue-300">Upa</span>
                <span className="text-teal-300">Health</span>
              </span>
              <span className="text-[8px] text-teal-400/60 uppercase tracking-[0.18em] font-semibold">
                Procurement OS
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <LogoMark size={26} />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0 p-1.5 rounded-md hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-colors"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation — grouped */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600 px-3 mb-1.5">
                {group.label}
              </p>
            )}
            {collapsed && <div className="h-px bg-white/[0.04] mx-2 mb-1.5" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all relative",
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-cyan-400" />
                    )}
                    <item.icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                      )}
                    />
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold",
                              item.badge === "AI"
                                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                                : "bg-slate-700 text-slate-300"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom AI Status */}
      {!collapsed && (
        <div className="shrink-0 p-3 border-t border-white/[0.06]">
          <div className="rounded-xl bg-gradient-to-br from-cyan-500/8 via-blue-500/5 to-purple-500/5 border border-cyan-500/15 p-3 relative overflow-hidden">
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-glow" />
              <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <p className="text-[11px] font-semibold text-cyan-300">NVIDIA AI</p>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              15 agents active · Llama 3.1
            </p>
          </div>
        </div>
      )}

      {/* Collapsed bottom indicator */}
      {collapsed && (
        <div className="shrink-0 p-2 border-t border-white/[0.06] flex justify-center">
          <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow" title="AI Active" />
        </div>
      )}
    </aside>
  );
}
