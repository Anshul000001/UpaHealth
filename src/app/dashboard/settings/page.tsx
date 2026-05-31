"use client";

import { useState, useEffect } from "react";
import {
  User, Building2, Bell, Shield, Key, Hash,
  CheckCircle2, Save, RefreshCw, Sparkles, Loader2,
  Activity, XCircle, Brain,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";

interface DiagCheck {
  name: string;
  status: "ok" | "error";
  detail: string;
}

type Tab = "company" | "quotation" | "numbering" | "notifications" | "integrations" | "profile" | "diagnostics";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<Tab>("company");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [diagChecks, setDiagChecks] = useState<DiagCheck[]>([]);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagHealthy, setDiagHealthy] = useState<boolean | null>(null);

  // Helper: get current financial year string
  function getCurrentFY(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    if (month >= 3) return `${year}-${(year + 1).toString().slice(2)}`;
    return `${year - 1}-${year.toString().slice(2)}`;
  }

  // Load settings from Supabase
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => { if (data.success) setSettings(data.data); })
      .catch(() => {})
      .finally(() => setLoadingSettings(false));
  }, []);

  function get(key: string, fallback: string = "") {
    return settings[key] ?? fallback;
  }

  function set(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function saveAll() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function runDiagnostics() {
    setDiagLoading(true);
    setDiagChecks([]);
    setDiagHealthy(null);
    try {
      const res = await fetch("/api/ai/diagnose");
      const data = await res.json();
      if (data.success) {
        setDiagChecks(data.data.checks);
        setDiagHealthy(data.data.healthy);
      }
    } catch {
      setDiagChecks([{ name: "System", status: "error", detail: "Failed to run diagnostics" }]);
      setDiagHealthy(false);
    } finally {
      setDiagLoading(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
    { id: "company", label: "Company", icon: Building2 },
    { id: "quotation", label: "Quotation", icon: Key },
    { id: "numbering", label: "Reference Numbers", icon: Hash },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Sparkles },
    { id: "profile", label: "Profile", icon: User },
    { id: "diagnostics", label: "AI Diagnostics", icon: Brain },
  ];

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">All settings saved to Supabase</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1.5 text-xs text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Saved to Supabase</span>}
          <Button size="sm" onClick={saveAll} disabled={saving}>
            {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Save className="w-3.5 h-3.5" /> Save All</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab Nav */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${activeTab === tab.id ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">

          {/* ─── COMPANY ──────────────────────────────────────────── */}
          {activeTab === "company" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-cyan-400" /> Company Information</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "companyName", label: "Company Name", fallback: "UpaHealth Supplies" },
                    { key: "companyEmail", label: "Email", fallback: "adminupahealthsupplies@gmail.com" },
                    { key: "phone", label: "Phone", fallback: "+91 92748 42737" },
                    { key: "website", label: "Website", fallback: "www.upahealthsupplies.com" },
                    { key: "gst", label: "GST Number", fallback: "PENDING" },
                    { key: "iec", label: "IEC Code", fallback: "PENDING" },
                    { key: "tagline", label: "Tagline", fallback: "Your Path to Wellness" },
                    { key: "exportMarkets", label: "Export Markets", fallback: "Kenya, Tanzania, UAE, Saudi Arabia" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="text-xs text-slate-400 mb-1.5 block">{f.label}</label>
                      <Input value={get(f.key, f.fallback)} onChange={(e) => set(f.key, e.target.value)} />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-400 mb-1.5 block">Address</label>
                    <Input value={get("address", "India")} onChange={(e) => set("address", e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={saveAll} disabled={saving}><Save className="w-3.5 h-3.5" /> Save</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── QUOTATION ───────────────────────────────────────── */}
          {activeTab === "quotation" && (
            <Card>
              <CardHeader><CardTitle>Quotation Defaults</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Default Currency</label>
                    <Select value={get("defaultCurrency", "INR")} onChange={(e) => set("defaultCurrency", e.target.value)}>
                      <option value="INR">₹ INR</option><option value="USD">$ USD</option><option value="EUR">€ EUR</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Default GST Rate (%)</label>
                    <Select value={get("defaultGstRate", "18")} onChange={(e) => set("defaultGstRate", e.target.value)}>
                      <option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Validity (Days)</label>
                    <Input type="number" value={get("quotationValidity", "15")} onChange={(e) => set("quotationValidity", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Payment Terms</label>
                    <Input value={get("paymentTerms", "45 days from invoice")} onChange={(e) => set("paymentTerms", e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-400 mb-1.5 block">Terms & Conditions</label>
                    <textarea value={get("termsConditions", "Prices valid for 15 days. Delivery within 7-10 working days.")} onChange={(e) => set("termsConditions", e.target.value)} rows={3}
                      className="w-full rounded-lg border border-slate-600/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none resize-none" />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={saveAll} disabled={saving}><Save className="w-3.5 h-3.5" /> Save</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── REFERENCE NUMBERS ────────────────────────────────── */}
          {activeTab === "numbering" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-cyan-400" /> Company Reference Numbers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-400 mb-4">
                  Configure your company reference prefix and numbering format. All quotations, catalogs, and projects will use sequential numbering that resets each financial year (April–March).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Company Prefix</label>
                    <Input
                      value={get("companyRefPrefix", "UH")}
                      onChange={(e) => set("companyRefPrefix", e.target.value.toUpperCase())}
                      placeholder="e.g., UH, UPA, UPAHEALTH"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Used in all reference numbers (e.g., UH/2025-26/QT/0001)</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Financial Year</label>
                    <Input value={getCurrentFY()} disabled className="opacity-60" />
                    <p className="text-[10px] text-slate-500 mt-1">Auto-detected (April to March)</p>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-slate-800/30 border border-white/[0.06]">
                  <p className="text-xs font-medium text-white mb-3">Reference Number Format Preview</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { type: "QT", label: "Quotation", example: `${get("companyRefPrefix", "UH")}/${getCurrentFY()}/QT/0001` },
                      { type: "CAT", label: "Catalog", example: `${get("companyRefPrefix", "UH")}/${getCurrentFY()}/CAT/0001` },
                      { type: "PRJ", label: "Project", example: `${get("companyRefPrefix", "UH")}/${getCurrentFY()}/PRJ/0001` },
                      { type: "RFQ", label: "RFQ", example: `${get("companyRefPrefix", "UH")}/${getCurrentFY()}/RFQ/0001` },
                      { type: "REQ", label: "Requirement", example: `${get("companyRefPrefix", "UH")}/${getCurrentFY()}/REQ/0001` },
                      { type: "PO", label: "Purchase Order", example: `${get("companyRefPrefix", "UH")}/${getCurrentFY()}/PO/0001` },
                    ].map((item) => (
                      <div key={item.type} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-white/5">
                        <span className="text-xs text-slate-400">{item.label}</span>
                        <code className="text-xs text-cyan-400 font-mono">{item.example}</code>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 font-medium mb-1">How it works</p>
                  <ul className="text-[10px] text-slate-400 space-y-1 list-disc list-inside">
                    <li>Numbers auto-increment sequentially for each document type</li>
                    <li>Counters reset at the start of each financial year (1st April)</li>
                    <li>Format: <code className="text-cyan-400">PREFIX/FY/TYPE/SERIAL</code></li>
                    <li>Easy to search and track any document by its reference number</li>
                  </ul>
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={saveAll} disabled={saving}><Save className="w-3.5 h-3.5" /> Save</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── NOTIFICATIONS ────────────────────────────────────── */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-amber-400" /> Notifications</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { key: "notifyLeads", label: "New Lead Alerts", desc: "Notify when AI generates new leads" },
                    { key: "notifyTenders", label: "Tender Matches", desc: "Alert on new tender matches" },
                    { key: "notifyQuotations", label: "Quotation Updates", desc: "Notify on status changes" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-white/[0.06]">
                      <div><p className="text-sm font-medium text-white">{item.label}</p><p className="text-xs text-slate-500 mt-0.5">{item.desc}</p></div>
                      <button onClick={() => set(item.key, get(item.key, "true") === "true" ? "false" : "true")}
                        className={`relative w-10 h-5 rounded-full transition-colors ${get(item.key, "true") === "true" ? "bg-cyan-500" : "bg-slate-600"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${get(item.key, "true") === "true" ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={saveAll} disabled={saving}><Save className="w-3.5 h-3.5" /> Save</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── INTEGRATIONS ─────────────────────────────────────── */}
          {activeTab === "integrations" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-cyan-400" /> AI & Integrations</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "NVIDIA NIM (Llama 3.1)", status: "connected", detail: "AI Assistant, Lead Gen, CRM Scoring, Export Intel" },
                    { name: "Supabase PostgreSQL", status: "connected", detail: "Database, Settings, All data storage" },
                    { name: "Gmail SMTP", status: "connected", detail: "Email sending" },
                    { name: "Vercel", status: "connected", detail: "Hosting, Edge, Speed Insights" },
                    { name: "GeM + CPPP + MoHFW", status: "connected", detail: "Government tender scanning" },
                    { name: "WhatsApp Business", status: "planned", detail: "Requires Meta approval" },
                    { name: "LinkedIn API", status: "planned", detail: "Requires partner access" },
                  ].map((api) => (
                    <div key={api.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${api.status === "connected" ? "bg-emerald-400" : "bg-slate-500"}`} />
                        <div><p className="text-sm text-white">{api.name}</p><p className="text-[10px] text-slate-500">{api.detail}</p></div>
                      </div>
                      <Badge variant={api.status === "connected" ? "success" : "default"} className="text-[10px]">{api.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── PROFILE ──────────────────────────────────────────── */}
          {activeTab === "profile" && (
            <ProfileSection session={session} />
          )}

          {/* ─── AI DIAGNOSTICS ───────────────────────────────────── */}
          {activeTab === "diagnostics" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-cyan-400" /> System Diagnostics</CardTitle>
                  {diagHealthy !== null && (
                    <Badge variant={diagHealthy ? "success" : "danger"} className="text-[10px]">
                      {diagHealthy ? "ALL SYSTEMS OK" : "ISSUES FOUND"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-400 mb-4">Run a full system health check — tests Supabase, NVIDIA AI, all tables, and connections.</p>
                <Button onClick={runDiagnostics} disabled={diagLoading} className="mb-4">
                  {diagLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running…</> : <><Activity className="w-3.5 h-3.5" /> Run Full Diagnostics</>}
                </Button>

                {diagChecks.length > 0 && (
                  <div className="space-y-2">
                    {diagChecks.map((check) => (
                      <div key={check.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          {check.status === "ok" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                          <div><p className="text-sm text-white">{check.name}</p><p className="text-[10px] text-slate-500">{check.detail}</p></div>
                        </div>
                        <Badge variant={check.status === "ok" ? "success" : "danger"} className="text-[10px]">{check.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {diagChecks.length === 0 && !diagLoading && (
                  <div className="text-center py-8">
                    <Brain className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Click "Run Full Diagnostics" to check all systems</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ session }: { session: ReturnType<typeof useSession>["data"] }) {
  const [name, setName] = useState(session?.user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function updateProfile() {
    setStatus("saving"); setMsg("");
    try {
      const body: Record<string, string> = {};
      if (name !== session?.user?.name) body.name = name;
      if (newPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword; }
      if (Object.keys(body).length === 0) { setMsg("No changes"); setStatus("idle"); return; }

      const res = await fetch("/api/auth/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { setStatus("success"); setMsg(data.data.message); setCurrentPassword(""); setNewPassword(""); }
      else { setStatus("error"); setMsg(data.error?.message ?? "Failed"); }
    } catch { setStatus("error"); setMsg("Network error"); }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-blue-400" /> Profile</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/30 border border-white/[0.06]">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{session?.user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "UH"}</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{session?.user?.name ?? "Admin"}</p>
            <p className="text-sm text-slate-400">{session?.user?.email}</p>
            <Badge variant="info" className="text-[10px] mt-1">{session?.user?.role ?? "ADMIN"}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="text-xs text-slate-400 mb-1.5 block">Display Name</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="text-xs text-slate-400 mb-1.5 block">Email (login ID)</label><Input defaultValue={session?.user?.email ?? ""} disabled className="opacity-60" /></div>
        </div>
        <div className="pt-4 border-t border-white/[0.06]">
          <p className="text-sm font-medium text-white mb-3">Change Password</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-slate-400 mb-1.5 block">Current Password</label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
            <div><label className="text-xs text-slate-400 mb-1.5 block">New Password (min 6)</label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
          </div>
        </div>
        {msg && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${status === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : status === "error" ? "bg-red-500/10 border border-red-500/30 text-red-400" : "text-slate-400"}`}>
            {status === "success" ? <CheckCircle2 className="w-4 h-4" /> : status === "error" ? <Shield className="w-4 h-4" /> : null} {msg}
          </div>
        )}
        <div className="flex justify-end">
          <Button onClick={updateProfile} disabled={status === "saving"}>
            {status === "saving" ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Save className="w-3.5 h-3.5" /> Update Profile</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
