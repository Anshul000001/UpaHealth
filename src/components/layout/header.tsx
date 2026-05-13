"use client";

import { Bell, Search, LogOut, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "UH";

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search products, suppliers, quotations..."
            className="pl-10 bg-slate-900/50 border-slate-700/50"
          />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Assist
          </Button>

          <button className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-700/50">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.name ?? "User"}</p>
              <div className="flex items-center justify-end gap-1">
                <Badge variant={user?.role === "ADMIN" ? "success" : "info"} className="text-[10px] py-0">
                  {user?.role ?? "—"}
                </Badge>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">{initials}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
