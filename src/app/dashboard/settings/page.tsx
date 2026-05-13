"use client";

import {
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { COMPANY_INFO } from "@/lib/constants";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your account, company details, and platform preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="space-y-1">
          {[
            { icon: Building2, label: "Company", active: true },
            { icon: User, label: "Profile", active: false },
            { icon: Bell, label: "Notifications", active: false },
            { icon: Shield, label: "Security", active: false },
            { icon: Key, label: "API Keys", active: false },
            { icon: Mail, label: "Email Templates", active: false },
            { icon: Globe, label: "Export Settings", active: false },
            { icon: Palette, label: "Branding", active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                item.active
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Company Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Company Name</label>
                  <Input defaultValue={COMPANY_INFO.name} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Email</label>
                  <Input defaultValue={COMPANY_INFO.email} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">GST Number</label>
                  <Input defaultValue={COMPANY_INFO.gst} placeholder="Enter GST number" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">IEC Code</label>
                  <Input defaultValue={COMPANY_INFO.iec} placeholder="Enter IEC code" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Website</label>
                  <Input defaultValue={COMPANY_INFO.website} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Tagline</label>
                  <Input defaultValue={COMPANY_INFO.tagline} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 mb-1.5 block">Address</label>
                  <Input defaultValue={COMPANY_INFO.address} placeholder="Full company address" />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Quotation Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Quotation Defaults</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Default Currency</label>
                  <Input defaultValue="INR" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Default GST Rate</label>
                  <Input defaultValue="18%" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Quotation Validity (Days)</label>
                  <Input defaultValue="15" type="number" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Default Payment Terms</label>
                  <Input defaultValue="45 days from invoice" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 mb-1.5 block">Default Terms & Conditions</label>
                  <Input defaultValue="Prices valid for 15 days. Delivery within 7-10 working days." />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button>Save Defaults</Button>
              </div>
            </CardContent>
          </Card>

          {/* API Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  AI & API Integrations
                </CardTitle>
                <Badge variant="success">Connected</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "OpenAI API", status: "connected", key: "sk-...xxxx" },
                  { name: "WhatsApp Business", status: "pending", key: "Not configured" },
                  { name: "GeM Portal", status: "connected", key: "Registered" },
                  { name: "ECGC Nirvik", status: "connected", key: "Active" },
                ].map((api) => (
                  <div
                    key={api.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          api.status === "connected" ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                      <span className="text-sm text-white">{api.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{api.key}</span>
                      <Button variant="ghost" size="sm">Configure</Button>
                    </div>
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
