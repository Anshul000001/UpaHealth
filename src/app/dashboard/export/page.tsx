"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Globe,
  ArrowUpRight,
  Shield,
  AlertCircle,
  Loader2,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Zap,
  Building2,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { EXPORT_MARKETS } from "@/lib/constants";

interface Tender {
  id: string;
  externalId: string;
  source: string;
  title: string;
  organization: string;
  category?: string;
  value?: number;
  deadline?: string;
  publishedAt?: string;
  url?: string;
  aiMatchScore: number;
  aiSummary?: string;
  matchedProducts: string[];
  saved: boolean;
  status: string;
  createdAt: string;
}

const SOURCE_COLORS: Record<string, string> = {
  GeM: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  CPPP: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  MoHFW: "text-purple-400 border-purple-500/30 bg-purple-500/10",
};

function MatchRing({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-emerald-400 border-emerald-500/50" :
    score >= 60 ? "text-cyan-400 border-cyan-500/50" :
    score >= 40 ? "text-amber-400 border-amber-500/50" :
    "text-slate-400 border-slate-500/50";
  return (
    <div className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center shrink-0 ${color}`}>
      <span className="text-sm font-bold leading-none">{score}%</span>
      <span className="text-[9px] opacity-60 leading-none mt-0.5">match</span>
    </div>
  );
}

export default function ExportPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "saved" | "GeM" | "CPPP" | "MoHFW">("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadTenders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === "saved") params.set("saved", "true");
      else if (filter !== "all") params.set("source", filter);

      const res = await fetch(`/api/tenders?${params}`);
      const data = await res.json();
      if (data.success) setTenders(data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadTenders();
  }, [loadTenders]);

  async function handleScan() {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/tenders/scan", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setScanResult(data.data.message);
        await loadTenders();
      }
    } catch {
      setScanResult("Scan failed. Please try again.");
    } finally {
      setScanning(false);
    }
  }

  async function handleSave(id: string) {
    setSavingId(id);
    try {
      await fetch(`/api/tenders/${id}/save`, { method: "POST" });
      setTenders((prev) =>
        prev.map((t) => (t.id === id ? { ...t, saved: true } : t))
      );
    } finally {
      setSavingId(null);
    }
  }

  const highMatch = tenders.filter((t) => t.aiMatchScore >= 70).length;
  const savedCount = tenders.filter((t) => t.saved).length;
  const sources = [...new Set(tenders.map((t) => t.source))];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Export Intelligence</h1>
          <p className="text-slate-400 text-sm mt-1">
            AI-powered tender scanner — GeM, CPPP, MoHFW &amp; more
          </p>
        </div>
        <Button size="sm" onClick={handleScan} disabled={scanning}>
          {scanning ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning…</>
          ) : (
            <><Radio className="w-3.5 h-3.5" /> Scan New Tenders</>
          )}
        </Button>
      </div>

      {/* Scan result banner */}
      {scanResult && (
        <div className="flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <p className="text-sm text-cyan-300">{scanResult}</p>
          <button onClick={() => setScanResult(null)} className="ml-auto text-slate-500 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Tenders Found"
          value={tenders.length}
          icon="FileCheck"
          iconColor="text-cyan-400"
        />
        <StatCard
          title="High Match (≥70%)"
          value={highMatch}
          change="AI-scored opportunities"
          changeType="positive"
          icon="Zap"
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Sources Active"
          value={sources.length || 3}
          icon="Globe"
          iconColor="text-purple-400"
        />
        <StatCard
          title="Saved Tenders"
          value={savedCount}
          icon="Bookmark"
          iconColor="text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main tender list */}
        <div className="lg:col-span-2 space-y-4">

          {/* Source filter tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "saved", "GeM", "CPPP", "MoHFW"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === f
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                    : "border-slate-600/50 bg-slate-800/50 text-slate-400 hover:border-slate-500"
                }`}
              >
                {f === "all" ? "All Sources" : f === "saved" ? "⭐ Saved" : f}
              </button>
            ))}
            <button
              onClick={loadTenders}
              className="ml-auto rounded-lg border border-slate-600/50 bg-slate-800/50 p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tender cards */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : tenders.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Radio className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400 mb-1">No tenders yet</p>
                <p className="text-xs text-slate-600 mb-4">
                  Click "Scan New Tenders" to fetch live government tenders from GeM, CPPP &amp; MoHFW
                </p>
                <Button size="sm" onClick={handleScan} disabled={scanning}>
                  {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  {scanning ? "Scanning…" : "Scan Now"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tenders.map((tender) => (
                <Card key={tender.id} className={`transition-all ${tender.saved ? "border-amber-500/20" : "hover:border-cyan-500/20"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <MatchRing score={tender.aiMatchScore} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                            {tender.title}
                          </h3>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${SOURCE_COLORS[tender.source] ?? "text-slate-400 border-slate-600 bg-slate-800"}`}>
                              {tender.source}
                            </span>
                            <Badge variant={tender.status === "open" ? "success" : "default"} className="text-[10px]">
                              {tender.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {tender.organization}
                          </span>
                          {tender.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(tender.deadline).toLocaleDateString("en-IN")}
                            </span>
                          )}
                          {tender.value && (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <IndianRupee className="w-3 h-3" />
                              {(tender.value / 100000).toFixed(1)}L
                            </span>
                          )}
                        </div>

                        {tender.aiSummary && (
                          <p className="text-xs text-slate-400 mb-2 italic">
                            {tender.aiSummary}
                          </p>
                        )}

                        {tender.matchedProducts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {tender.matchedProducts.slice(0, 3).map((p) => (
                              <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                {p}
                              </span>
                            ))}
                            {tender.matchedProducts.length > 3 && (
                              <span className="text-[10px] text-slate-600">+{tender.matchedProducts.length - 3} more</span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {tender.url && (
                            <a
                              href={tender.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" /> View Tender
                            </a>
                          )}
                          {!tender.saved ? (
                            <button
                              onClick={() => handleSave(tender.id)}
                              disabled={savingId === tender.id}
                              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors ml-auto"
                            >
                              {savingId === tender.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Bookmark className="w-3 h-3" />
                              )}
                              Save
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-400 ml-auto">
                              <BookmarkCheck className="w-3 h-3" /> Saved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* AI Scanner Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                AI Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "GeM (Govt e-Marketplace)", status: "active", detail: "Live" },
                { label: "CPPP eProcure", status: "active", detail: "Live" },
                { label: "MoHFW Tenders", status: "active", detail: "Live" },
                { label: "NVIDIA Llama 3.1 AI", status: "active", detail: "Scoring" },
                { label: "State Portals", status: "planned", detail: "Coming soon" },
                { label: "UN/WHO Tenders", status: "planned", detail: "Coming soon" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                    <span className="text-xs text-white">{item.label}</span>
                  </div>
                  <span className={`text-[10px] ${item.status === "active" ? "text-emerald-400" : "text-slate-500"}`}>{item.detail}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Priority Markets */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Export Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {EXPORT_MARKETS.map((market) => (
                  <div key={market.region} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-white/5 hover:border-cyan-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-white">{market.region}</p>
                        <p className="text-[10px] text-slate-500">{market.countries.slice(0, 3).join(", ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={market.priority === "P1" ? "success" : market.priority === "P2" ? "info" : "default"} className="text-[10px]">
                        {market.priority}
                      </Badge>
                      <ArrowUpRight className="w-3 h-3 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Export Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { item: "IEC Code", status: "active", detail: "Registered" },
                  { item: "FIEO Membership", status: "active", detail: "Active" },
                  { item: "ECGC Nirvik", status: "active", detail: "90% cover" },
                  { item: "RoDTEP Scheme", status: "pending", detail: "Filed" },
                  { item: "ISO 13485", status: "active", detail: "Via suppliers" },
                  { item: "CE Mark", status: "active", detail: "Via suppliers" },
                  { item: "MHRA (UK)", status: "planned", detail: "Year 2" },
                ].map((item) => (
                  <div key={item.item} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.status === "active" ? "bg-emerald-400" : item.status === "pending" ? "bg-amber-400" : "bg-slate-600"}`} />
                      <span className="text-xs text-white">{item.item}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{item.detail}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
