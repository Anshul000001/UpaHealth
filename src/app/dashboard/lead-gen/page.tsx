"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Zap,
  Loader2,
  Users,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Lightbulb,
  CheckCircle2,
  Target,
  Sparkles,
  History,
  Send,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface GeneratedLead {
  id: string;
  name: string;
  type: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  estimatedValue: number;
  products: string[];
  city?: string;
  reasoning?: string;
}

interface SearchHistory {
  id: string;
  market: string;
  segment: string;
  productFocus: string;
  count: number;
  generatedCount: number;
  savedCount: number;
  createdAt: string;
}

interface EmailDraft {
  id: string;
  leadName: string;
  subject: string;
  body: string;
  status: string;
}

const MARKETS = ["India", "Kenya", "Tanzania", "Ethiopia", "UAE", "Saudi Arabia", "Bangladesh", "Sri Lanka", "Nepal", "Uganda", "Rwanda"];
const SEGMENTS = ["Hospital", "Hospital Chain", "Government", "Distributor", "Clinic", "Pharmacy Chain"];
const PRODUCT_FOCUS_OPTIONS = ["IV Infusion Sets", "IV Catheters / Cannulas", "Urology Catheters", "Surgical Instruments", "Anesthesia Accessories", "Wound Care / Bandages", "Disposable Gloves", "PPE Kits", "Rapid Test & Diagnostics", "Hospital Furniture", "Safety Syringes", "Respiratory Care"];

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  HOSPITAL: Building2,
  GOVERNMENT: Globe,
  DISTRIBUTOR: Users,
  HOSPITAL_CHAIN: Building2,
};

export default function LeadGenPage() {
  const [market, setMarket] = useState("India");
  const [segment, setSegment] = useState("Hospital");
  const [productFocus, setProductFocus] = useState("IV Infusion Sets");
  const [count, setCount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<GeneratedLead[]>([]);
  const [result, setResult] = useState<{ generated: number; saved: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searches, setSearches] = useState<SearchHistory[]>([]);
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);
  const [emailLoading, setEmailLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<"generate" | "history" | "emails">("generate");

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/leads/searches");
      const data = await res.json();
      if (data.success) setSearches(data.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    setLeads([]);
    setEmailDraft(null);

    try {
      const res = await fetch("/api/leads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market, segment, productFocus, count: parseInt(count) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message ?? "Failed");
      setLeads(data.data.leads);
      setResult({ generated: data.data.generated, saved: data.data.saved });
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function generateEmail(leadId: string, leadName: string) {
    setEmailLoading(leadId);
    setEmailDraft(null);
    try {
      const res = await fetch(`/api/leads/${leadId}/email`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setEmailDraft({ ...data.data, leadName });
      }
    } finally {
      setEmailLoading(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            AI Lead Generation
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Discover buyers, save to CRM, generate outreach emails — all AI-powered
          </p>
        </div>
        <Badge variant="success" className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          NVIDIA Llama 3.1
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
        {([
          { id: "generate", label: "Generate Leads", icon: Zap },
          { id: "history", label: "Search History", icon: History },
          { id: "emails", label: "Email Drafts", icon: Mail },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === t.id
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.id === "history" && searches.length > 0 && (
              <span className="ml-1 text-[10px] bg-slate-700 px-1.5 py-0.5 rounded-full">{searches.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── GENERATE TAB ─────────────────────────────────────────── */}
      {tab === "generate" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Find New Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">Target Market</label>
                  <Select value={market} onChange={(e) => setMarket(e.target.value)}>
                    {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">Segment</label>
                  <Select value={segment} onChange={(e) => setSegment(e.target.value)}>
                    {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">Product Focus</label>
                  <Select value={productFocus} onChange={(e) => setProductFocus(e.target.value)}>
                    {PRODUCT_FOCUS_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">Count (max 20)</label>
                  <Input type="number" min="1" max="20" value={count} onChange={(e) => setCount(e.target.value)} />
                </div>
              </div>
              <Button onClick={generate} disabled={loading} className="w-full sm:w-auto">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Zap className="w-4 h-4" /> Generate Leads</>}
              </Button>
              {error && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
            </CardContent>
          </Card>

          {result && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300">
                Generated {result.generated} leads, saved {result.saved} to CRM. Market: {market} · Segment: {segment}
              </p>
            </div>
          )}

          {/* Email Draft Modal */}
          {emailDraft && (
            <Card className="border-cyan-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    AI Email Draft — {emailDraft.leadName}
                  </CardTitle>
                  <button onClick={() => setEmailDraft(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-sm font-medium text-white bg-slate-800/50 px-3 py-2 rounded-lg">{emailDraft.subject}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Body</p>
                  <div className="text-sm text-slate-300 bg-slate-800/50 px-4 py-3 rounded-lg whitespace-pre-line leading-relaxed">
                    {emailDraft.body}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="info" className="text-[10px]">Saved as draft</Badge>
                  <span className="text-[10px] text-slate-500">Ready to send via email provider</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lead Cards */}
          {leads.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Discovered Leads ({leads.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leads.map((lead, i) => {
                  const Icon = TYPE_ICONS[lead.type] ?? Users;
                  return (
                    <Card key={lead.id || i} className="hover:border-cyan-500/30 transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white truncate">{lead.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="default" className="text-[10px]">{lead.type}</Badge>
                              {lead.city && <span className="text-[10px] text-slate-500 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {lead.city}</span>}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-emerald-400">₹{(lead.estimatedValue / 100000).toFixed(1)}L</p>
                            <p className="text-[10px] text-slate-500">est. value</p>
                          </div>
                        </div>

                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-2 text-xs text-slate-400"><Users className="w-3 h-3" />{lead.contactPerson}</div>
                          {lead.email && <div className="flex items-center gap-2 text-xs text-slate-400"><Mail className="w-3 h-3" /><span className="truncate">{lead.email}</span></div>}
                          {lead.phone && <div className="flex items-center gap-2 text-xs text-slate-400"><Phone className="w-3 h-3" />{lead.phone}</div>}
                        </div>

                        {lead.products?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {lead.products.slice(0, 3).map((p) => (
                              <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{p}</span>
                            ))}
                          </div>
                        )}

                        {lead.reasoning && (
                          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-slate-800/30 border border-slate-700/30 mb-3">
                            <Lightbulb className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-400 italic">{lead.reasoning}</p>
                          </div>
                        )}

                        {/* Generate Email Button */}
                        {lead.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateEmail(lead.id, lead.name)}
                            disabled={emailLoading === lead.id}
                            className="w-full"
                          >
                            {emailLoading === lead.id ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Drafting email…</>
                            ) : (
                              <><Send className="w-3 h-3" /> Generate Outreach Email</>
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && leads.length === 0 && !result && (
            <Card>
              <CardContent className="py-16 text-center">
                <Zap className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400 mb-1">AI-Powered Lead Discovery</p>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Select market, segment, and product focus. AI will discover realistic buyer leads, save them to CRM, and you can generate personalized outreach emails for each.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ─── HISTORY TAB ──────────────────────────────────────────── */}
      {tab === "history" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Search History</h2>
            <button onClick={loadHistory} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          {searches.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><History className="w-8 h-8 text-slate-700 mx-auto mb-2" /><p className="text-sm text-slate-500">No searches yet</p></CardContent></Card>
          ) : (
            <div className="space-y-2">
              {searches.map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white">{s.market} · {s.segment} · {s.productFocus}</p>
                        <p className="text-[10px] text-slate-500">{new Date(s.createdAt).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emerald-400">{s.savedCount} saved</p>
                      <p className="text-[10px] text-slate-500">{s.generatedCount} generated</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── EMAILS TAB ───────────────────────────────────────────── */}
      {tab === "emails" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Generated Email Drafts</h2>
          {emailDraft ? (
            <Card className="border-cyan-500/30">
              <CardContent className="p-5">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">To: {emailDraft.leadName}</p>
                <p className="text-sm font-medium text-white mb-3">{emailDraft.subject}</p>
                <div className="text-sm text-slate-300 bg-slate-800/50 px-4 py-3 rounded-lg whitespace-pre-line leading-relaxed">{emailDraft.body}</div>
                <Badge variant="info" className="mt-3 text-[10px]">{emailDraft.status}</Badge>
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="py-12 text-center"><Mail className="w-8 h-8 text-slate-700 mx-auto mb-2" /><p className="text-sm text-slate-500">Generate an email from the leads tab to see it here</p></CardContent></Card>
          )}
        </div>
      )}
    </div>
  );
}
