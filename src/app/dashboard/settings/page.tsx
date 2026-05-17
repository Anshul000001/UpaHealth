"use client";

import { useState, useEffect } from "react";
import {
  User, Building2, Bell, Shield, Key, Mail, Globe,
  CheckCircle2, Save, RefreshCw, Sparkles, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";

interface Settings {
  companyName: string;
  companyEmail: string;
  gst: string;
  iec: string;
  website: string;
  tagline: string;
  address: string;
  phone: string;
  defaultCurrency: string;
  defaultGstRate: string;
  quotationValidity: string;
  paymentTerms: string;
  termsConditions: string;
  emailSignature: string;
  exportMarkets: string;
  notifyLeads: boolean;
  notifyTenders: boolean;
  notifyQuotations: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  companyName: "UpaHealth Supplies",
  companyEmail: "adminupahealthsupplies@gmail.com",
  gst: "PENDING",
  iec: "PENDING",
  website: "www.upahealthsupplies.com",
  tagline: "Your Path to Wellness",
  address: "India",
  phone: "",
  defaultCurrency: "INR",
  defaultGstRate: "18",
  quotationValidity: "15",
  paymentTerms: "45 days from invoice",
  termsConditions: "Prices valid for 15 days. Delivery within 7-10 working days. Subject to availability.",
  emailSignature: "UpaHealth Supplies Team\nadminupahealthsupplies@gmail.com\nwww.upahealthsupplies.com",
  exportMarkets: "Kenya, Tanzania, UAE, Saudi Arabia, Bangladesh, Ethiopia",
  notifyLeads: true,
  notifyTenders: true,
  notifyQuotations: true,
};

type Tab = "company" | "quotation" | "notifications" | "integrations" | "profile";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<Tab>("company");
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("upahealth_settings");
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch { /* use defaults */ }
  }, []);

  function save() {
    localStorage.setItem("upahealth_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function update(key: keyof Settings, value: string | boolean) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function resetDefaults() {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem("upahealth_settings");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
    { id: "company", label: "Company", icon: Building2 },
    { id: "quotation", label: "Quotation", icon: Key },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Sparkles },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage company details, quotation defaults, and integrations</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          <Button variant="secondary" size="sm" onClick={resetDefaults}>
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </Button>
          <Button size="sm" onClick={save}>
            <Save className="w-3.5 h-3.5" /> Save All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab Nav */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">

          {/* ─── COMPANY TAB ──────────────────────────────────────── */}
          {activeTab === "company" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Company Name</label>
                    <Input value={settings.companyName} onChange={(e) => update("companyName", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Email</label>
                    <Input value={settings.companyEmail} onChange={(e) => update("companyEmail", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Phone</label>
                    <Input value={settings.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Website</label>
                    <Input value={settings.website} onChange={(e) => update("website", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">GST Number</label>
                    <Input value={settings.gst} onChange={(e) => update("gst", e.target.value)} placeholder="22AAAAA0000A1Z5" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">IEC Code</label>
                    <Input value={settings.iec} onChange={(e) => update("iec", e.target.value)} placeholder="0123456789" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Tagline</label>
                    <Input value={settings.tagline} onChange={(e) => update("tagline", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Export Markets</label>
                    <Input value={settings.exportMarkets} onChange={(e) => update("exportMarkets", e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-400 mb-1.5 block">Address</label>
                    <Input value={settings.address} onChange={(e) => update("address", e.target.value)} placeholder="Full company address" />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={save}><Save className="w-3.5 h-3.5" /> Save Company Info</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── QUOTATION TAB ────────────────────────────────────── */}
          {activeTab === "quotation" && (
            <Card>
              <CardHeader>
                <CardTitle>Quotation Defaults</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Default Currency</label>
                    <Select value={settings.defaultCurrency} onChange={(e) => update("defaultCurrency", e.target.value)}>
                      <option value="INR">₹ INR</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                      <option value="GBP">£ GBP</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Default GST Rate (%)</label>
                    <Select value={settings.defaultGstRate} onChange={(e) => update("defaultGstRate", e.target.value)}>
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Quotation Validity (Days)</label>
                    <Input type="number" value={settings.quotationValidity} onChange={(e) => update("quotationValidity", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Payment Terms</label>
                    <Input value={settings.paymentTerms} onChange={(e) => update("paymentTerms", e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-400 mb-1.5 block">Default Terms & Conditions</label>
                    <textarea
                      value={settings.termsConditions}
                      onChange={(e) => update("termsConditions", e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-slate-600/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none resize-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-400 mb-1.5 block">Email Signature</label>
                    <textarea
                      value={settings.emailSignature}
                      onChange={(e) => update("emailSignature", e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-slate-600/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={save}><Save className="w-3.5 h-3.5" /> Save Quotation Defaults</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── NOTIFICATIONS TAB ────────────────────────────────── */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { key: "notifyLeads" as const, label: "New Lead Alerts", desc: "Get notified when AI generates new leads" },
                    { key: "notifyTenders" as const, label: "Tender Matches", desc: "Alert when new tenders match your products" },
                    { key: "notifyQuotations" as const, label: "Quotation Updates", desc: "Notify on quotation status changes" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-white/[0.06]">
                      <div>
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => update(item.key, !settings[item.key])}
                        className={`relative w-10 h-5 rounded-full transition-colors ${settings[item.key] ? "bg-cyan-500" : "bg-slate-600"}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings[item.key] ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={save}><Save className="w-3.5 h-3.5" /> Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── INTEGRATIONS TAB ─────────────────────────────────── */}
          {activeTab === "integrations" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  AI & API Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "NVIDIA NIM (Llama 3.1)", status: "connected", detail: "AI Assistant, Lead Gen, Tender Scoring" },
                    { name: "Supabase PostgreSQL", status: "connected", detail: "Database, Auth, Storage" },
                    { name: "Gmail SMTP", status: "connected", detail: "Email sending from Communications" },
                    { name: "Vercel", status: "connected", detail: "Hosting, Edge Functions, Speed Insights" },
                    { name: "GeM Portal", status: "connected", detail: "Government tender scanning" },
                    { name: "CPPP eProcure", status: "connected", detail: "Central procurement tenders" },
                    { name: "WhatsApp Business", status: "planned", detail: "Coming soon — requires Meta approval" },
                    { name: "LinkedIn API", status: "planned", detail: "Coming soon — requires partner access" },
                    { name: "Instagram Graph API", status: "planned", detail: "Coming soon — requires Meta Business" },
                  ].map((api) => (
                    <div key={api.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${api.status === "connected" ? "bg-emerald-400" : "bg-slate-500"}`} />
                        <div>
                          <p className="text-sm text-white">{api.name}</p>
                          <p className="text-[10px] text-slate-500">{api.detail}</p>
                        </div>
                      </div>
                      <Badge variant={api.status === "connected" ? "success" : "default"} className="text-[10px]">
                        {api.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── PROFILE TAB ──────────────────────────────────────── */}
          {activeTab === "profile" && (
            <ProfileSection session={session} />
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
  const [profileStatus, setProfileStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [profileMsg, setProfileMsg] = useState("");

  async function updateProfile() {
    setProfileStatus("saving");
    setProfileMsg("");
    try {
      const body: Record<string, string> = {};
      if (name !== session?.user?.name) body.name = name;
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      if (Object.keys(body).length === 0) {
        setProfileMsg("No changes to save");
        setProfileStatus("idle");
        return;
      }

      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setProfileStatus("success");
        setProfileMsg(data.data.message);
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setProfileStatus("error");
        setProfileMsg(data.error?.message ?? "Failed to update");
      }
    } catch {
      setProfileStatus("error");
      setProfileMsg("Network error");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Avatar + Info */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/30 border border-white/[0.06]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {session?.user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "UH"}
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{session?.user?.name ?? "Admin"}</p>
                <p className="text-sm text-slate-400">{session?.user?.email ?? ""}</p>
                <Badge variant="info" className="text-[10px] mt-1">{session?.user?.role ?? "ADMIN"}</Badge>
              </div>
            </div>

            {/* Editable Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Display Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Email (cannot change)</label>
                <Input defaultValue={session?.user?.email ?? ""} disabled className="opacity-60" />
              </div>
            </div>

            {/* Change Password */}
            <div className="pt-4 border-t border-white/[0.06]">
              <p className="text-sm font-medium text-white mb-3">Change Password</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Current Password</label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">New Password</label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
                </div>
              </div>
            </div>

            {/* Status */}
            {profileMsg && (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${profileStatus === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : profileStatus === "error" ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-slate-800 text-slate-400"}`}>
                {profileStatus === "success" ? <CheckCircle2 className="w-4 h-4" /> : profileStatus === "error" ? <Shield className="w-4 h-4" /> : null}
                {profileMsg}
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={updateProfile} disabled={profileStatus === "saving"}>
                {profileStatus === "saving" ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Save className="w-3.5 h-3.5" /> Update Profile</>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
