"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/logo";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Package,
  Factory,
  Users,
  Globe,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Mail,
  Zap,
  Target,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Quotations", href: "/dashboard/quotations", icon: FileText },
  { label: "RFQ Parser", href: "/dashboard/rfq", icon: Upload },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Suppliers", href: "/dashboard/suppliers", icon: Factory },
  { label: "CRM", href: "/dashboard/crm", icon: Users },
  { label: "Lead Gen AI", href: "/dashboard/lead-gen", icon: Target },
  { label: "Communications", href: "/dashboard/communications", icon: Mail },
  { label: "Export Intel", href: "/dashboard/export", icon: Globe },
  { label: "AI Agents", href: "/dashboard/agents", icon: Zap },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "AI Assistant", href: "/dashboard/ai", icon: Bot },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-white/10 bg-slate-950/95 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-white/10">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <LogoMark size={28} />
            <div className="leading-tight min-w-0">
              <span className="block text-white font-bold text-sm tracking-tight">
                <span className="text-blue-300">Upa</span>
                <span className="text-teal-300">Health</span>
              </span>
              <span className="text-[9px] text-teal-400/70 uppercase tracking-[0.15em]">
                Your Path to Wellness
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <LogoMark size={28} />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation — scrollable */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-0.5 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-cyan-400")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom AI badge */}
      {!collapsed && (
        <div className="shrink-0 p-3 border-t border-white/5">
          <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 p-3">
            <p className="text-xs text-cyan-400 font-medium">AI Powered</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              15 agents running 24/7
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
