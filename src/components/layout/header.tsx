"use client";

import { Bell, Search, LogOut, Sparkles, Command } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "UH";

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-white/[0.06] bg-[#0B1220]/90 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-5">

        {/* Search */}
        <div className="relative w-80 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            placeholder="Search products, leads, tenders…"
            className="enterprise-input pl-9 pr-16 h-9 text-[13px]"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-slate-600">
            <Command className="w-3 h-3" />
            <span className="text-[10px]">K</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 ml-auto">
          {/* AI Assist */}
          <Link
            href="/dashboard/ai"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#06B6D4] border border-[#06B6D4]/20 bg-[#06B6D4]/5 hover:bg-[#06B6D4]/10 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Assist
          </Link>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="notif-dot" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/[0.08] mx-1" />

          {/* User */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:block text-right">
              <p className="text-[12px] font-semibold text-slate-200 leading-tight">{user?.name ?? "User"}</p>
              <p className="text-[10px] text-slate-500 leading-tight">{user?.role ?? "—"}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#2563EB] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-[11px]">{initials}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
