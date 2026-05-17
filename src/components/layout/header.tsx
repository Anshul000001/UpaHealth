"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, LogOut, Sparkles, Command, X, Package, Users, Factory, FileText, Loader2 } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResult {
  type: "product" | "lead" | "supplier";
  id: string;
  name: string;
  subtitle: string;
  href: string;
}

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "UH";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard shortcut Cmd+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Search debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const [productsRes, leadsRes, suppliersRes] = await Promise.all([
          fetch(`/api/products?search=${encodeURIComponent(query)}&pageSize=5`).then(r => r.json()),
          fetch(`/api/leads?search=${encodeURIComponent(query)}&pageSize=5`).then(r => r.json()),
          fetch(`/api/suppliers?search=${encodeURIComponent(query)}&pageSize=5`).then(r => r.json()),
        ]);

        const items: SearchResult[] = [];

        if (productsRes.success && productsRes.data) {
          for (const p of productsRes.data.slice(0, 3)) {
            items.push({ type: "product", id: p.id, name: p.name, subtitle: `${p.category} · ${p.sku}`, href: "/dashboard/products" });
          }
        }
        if (leadsRes.success && leadsRes.data) {
          for (const l of leadsRes.data.slice(0, 3)) {
            items.push({ type: "lead", id: l.id, name: l.name, subtitle: `${l.type} · ${l.stage}`, href: "/dashboard/crm" });
          }
        }
        if (suppliersRes.success && suppliersRes.data) {
          for (const s of suppliersRes.data.slice(0, 3)) {
            items.push({ type: "supplier", id: s.id, name: s.name, subtitle: s.location, href: "/dashboard/suppliers" });
          }
        }

        setResults(items);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(result: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  }

  const typeIcons = {
    product: Package,
    lead: Users,
    supplier: Factory,
  };

  const typeColors = {
    product: "text-cyan-400 bg-cyan-500/10",
    lead: "text-blue-400 bg-blue-500/10",
    supplier: "text-purple-400 bg-purple-500/10",
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-white/[0.06] bg-[#0B1220]/90 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-5">

        {/* Search */}
        <div ref={containerRef} className="relative w-96 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search products, leads, suppliers…"
            className="enterprise-input pl-9 pr-16 h-9 text-[13px]"
          />
          {query ? (
            <button
              onClick={() => { setQuery(""); setResults([]); }}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-slate-600">
            <Command className="w-3 h-3" />
            <span className="text-[10px]">K</span>
          </div>

          {/* Search Results Dropdown */}
          {open && (query.trim() || searching) && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-white/[0.08] bg-[#111827] shadow-2xl overflow-hidden z-50">
              {searching && (
                <div className="flex items-center gap-2 px-4 py-3 text-xs text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching…
                </div>
              )}

              {!searching && results.length === 0 && query.trim() && (
                <div className="px-4 py-4 text-center">
                  <p className="text-xs text-slate-500">No results for &ldquo;{query}&rdquo;</p>
                </div>
              )}

              {!searching && results.length > 0 && (
                <div className="py-1.5">
                  {results.map((result) => {
                    const Icon = typeIcons[result.type];
                    const colorClass = typeColors[result.type];
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelect(result)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white truncate">{result.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{result.subtitle}</p>
                        </div>
                        <span className="text-[9px] text-slate-600 uppercase font-semibold tracking-wider shrink-0">{result.type}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {!searching && results.length > 0 && (
                <div className="border-t border-white/[0.06] px-4 py-2 flex items-center justify-between">
                  <p className="text-[10px] text-slate-600">{results.length} results</p>
                  <p className="text-[10px] text-slate-600">ESC to close</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Mobile search */}
          <button
            onClick={() => inputRef.current?.focus()}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

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
