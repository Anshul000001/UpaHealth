"use client";

import {
  Globe,
  ArrowUpRight,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { EXPORT_MARKETS } from "@/lib/constants";

export default function ExportPage() {
  const tenders = [
    {
      id: "TND-001",
      title: "Surgical Consumables Supply — KEMSA Kenya",
      org: "Kenya Medical Supplies Authority",
      deadline: "2025-05-20",
      value: "USD 450,000",
      status: "open",
      match: 92,
    },
    {
      id: "TND-002",
      title: "Hospital Disposables — Tanzania MSD",
      org: "Medical Stores Department Tanzania",
      deadline: "2025-06-01",
      value: "USD 280,000",
      status: "open",
      match: 87,
    },
    {
      id: "TND-003",
      title: "IV Sets & Cannulas — UAE MOH",
      org: "UAE Ministry of Health",
      deadline: "2025-05-25",
      value: "USD 620,000",
      status: "open",
      match: 78,
    },
    {
      id: "TND-004",
      title: "Surgical Kits — UNICEF Supply Division",
      org: "UNICEF Copenhagen",
      deadline: "2025-06-15",
      value: "USD 1,200,000",
      status: "upcoming",
      match: 65,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Export Intelligence</h1>
          <p className="text-slate-400 text-sm mt-1">
            AI-monitored global tenders, market intelligence, and export compliance
          </p>
        </div>
        <Button size="sm">
          <Globe className="w-3.5 h-3.5" /> Scan New Tenders
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Export Markets"
          value="6"
          icon="Globe"
          iconColor="text-purple-400"
        />
        <StatCard
          title="Open Tenders"
          value="12"
          change="4 high-match opportunities"
          changeType="positive"
          icon="FileCheck"
          iconColor="text-cyan-400"
        />
        <StatCard
          title="Export Revenue (YTD)"
          value="$42K"
          change="+156% vs last quarter"
          changeType="positive"
          icon="DollarSign"
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Shipments in Transit"
          value="2"
          icon="Ship"
          iconColor="text-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Markets */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Priority Export Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {EXPORT_MARKETS.map((market) => (
                  <div
                    key={market.region}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5 hover:border-cyan-500/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{market.region}</h3>
                        <p className="text-xs text-slate-500">
                          {market.countries.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          market.priority === "P1"
                            ? "success"
                            : market.priority === "P2"
                            ? "info"
                            : "default"
                        }
                      >
                        {market.priority} {market.priority === "P1" ? "— NOW" : market.priority === "P2" ? "— Year 2" : "— Year 3+"}
                      </Badge>
                      <ArrowUpRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Tender Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  AI Tender Alerts
                </CardTitle>
                <Badge variant="warning">4 new matches</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tenders.map((tender) => (
                  <div
                    key={tender.id}
                    className="p-4 rounded-xl bg-slate-800/30 border border-white/5 hover:border-cyan-500/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-white">{tender.title}</h3>
                          <Badge variant={tender.status === "open" ? "success" : "info"}>
                            {tender.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">{tender.org}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-slate-400">
                            Deadline: {tender.deadline}
                          </span>
                          <span className="text-xs font-medium text-emerald-400">
                            {tender.value}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 flex items-center justify-center">
                          <span className="text-sm font-bold text-cyan-400">{tender.match}%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">AI Match</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Export Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { item: "IEC Code", status: "active", detail: "Registered" },
                  { item: "FIEO Membership", status: "active", detail: "Active" },
                  { item: "ECGC Nirvik", status: "active", detail: "90% cover" },
                  { item: "RoDTEP Scheme", status: "pending", detail: "Application filed" },
                  { item: "ISO 13485", status: "active", detail: "Via suppliers" },
                  { item: "CE Mark", status: "active", detail: "Via suppliers" },
                  { item: "MHRA (UK)", status: "planned", detail: "Year 2 target" },
                ].map((item) => (
                  <div
                    key={item.item}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.status === "active"
                            ? "bg-emerald-400"
                            : item.status === "pending"
                            ? "bg-amber-400"
                            : "bg-slate-600"
                        }`}
                      />
                      <span className="text-xs text-white">{item.item}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{item.detail}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Export Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "India MedTech Export Target", value: "$20B by FY30" },
                  { label: "India-UK FTA", value: "Zero tariff (Jul 2025)" },
                  { label: "ECGC Credit Cover", value: "90% risk coverage" },
                  { label: "East Africa Market", value: "$800M+ (12-15% CAGR)" },
                  { label: "GCC Market", value: "$2B+ (8-10% CAGR)" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className="text-xs font-medium text-cyan-400">{item.value}</span>
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
