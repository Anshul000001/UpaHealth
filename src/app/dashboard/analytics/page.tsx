"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  BarChart3,
  Users,
  FileText,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";

interface Metrics {
  totalRevenue: number;
  activeQuotations: number;
  conversionRate: number;
  totalProducts: number;
  activeSuppliers: number;
  exportOrders: number;
  pendingRFQs: number;
  totalLeads: number;
}

interface RevenueMonth {
  month: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  name: string;
  revenue: number;
  units: number;
}

interface PipelineStage {
  stage: string;
  count: number;
  value: number;
}

interface AnalyticsData {
  metrics: Metrics;
  revenueByMonth: RevenueMonth[];
  topProducts: TopProduct[];
  pipeline: PipelineStage[];
}

const STAGE_COLORS: Record<string, string> = {
  Lead: "bg-slate-500",
  "RFQ Received": "bg-blue-500",
  "Quotation Sent": "bg-cyan-500",
  Negotiation: "bg-amber-500",
  "Order Confirmed": "bg-emerald-500",
  Shipped: "bg-purple-500",
  Delivered: "bg-green-500",
  "Closed Won": "bg-emerald-600",
  "Closed Lost": "bg-red-500",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analytics/dashboard");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message ?? "Failed to load analytics");
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <p className="text-slate-400 text-sm">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={load} className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mx-auto">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const m = data!.metrics;
  const revenue = data!.revenueByMonth;
  const products = data!.topProducts;
  const pipeline = data!.pipeline;

  const maxRevenue = revenue.length > 0 ? Math.max(...revenue.map((r) => r.revenue)) : 1;
  const maxProductRevenue = products.length > 0 ? products[0].revenue : 1;
  const totalPipelineValue = pipeline.reduce((s, p) => s + p.value, 0);

  const isEmpty = m.totalRevenue === 0 && m.totalProducts === 0 && m.totalLeads === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Live data from your quotations, products, suppliers and pipeline
          </p>
        </div>
        <button
          onClick={load}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isEmpty && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-300">
          No data yet — add products, suppliers, leads and quotations to see live analytics here.
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={m.totalRevenue > 0 ? `₹${(m.totalRevenue / 100000).toFixed(1)}L` : "₹0"}
          change="From accepted quotations"
          changeType="neutral"
          icon="IndianRupee"
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Conversion Rate"
          value={`${m.conversionRate}%`}
          change={`${m.activeQuotations} active quotations`}
          changeType={m.conversionRate > 0 ? "positive" : "neutral"}
          icon="Target"
          iconColor="text-cyan-400"
        />
        <StatCard
          title="Products"
          value={m.totalProducts}
          change={`${m.activeSuppliers} active suppliers`}
          changeType="neutral"
          icon="Package"
          iconColor="text-blue-400"
        />
        <StatCard
          title="Total Leads"
          value={m.totalLeads}
          change={`${m.pendingRFQs} pending RFQs`}
          changeType={m.pendingRFQs > 0 ? "positive" : "neutral"}
          icon="Users"
          iconColor="text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Monthly Revenue Trend
              </CardTitle>
              {revenue.length > 0 && (
                <Badge variant="success">
                  <TrendingUp className="w-3 h-3 mr-1" /> Live Data
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {revenue.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No accepted quotations yet</p>
                  <p className="text-xs text-slate-600 mt-1">Revenue will appear here once quotations are accepted</p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-end gap-3 px-2 pb-2">
                {revenue.map((item) => {
                  const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 200 : 0;
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">₹{(item.revenue / 100000).toFixed(1)}L</span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 transition-all cursor-pointer relative group"
                        style={{ height: `${Math.max(height, 4)}px` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 border border-slate-700 px-2 py-1 rounded text-xs text-white whitespace-nowrap z-10">
                          {item.orders} order{item.orders !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline by Stage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              Pipeline by Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pipeline.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No leads yet</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {pipeline.map((stage) => (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${STAGE_COLORS[stage.stage] ?? "bg-slate-500"}`} />
                        <span className="text-xs text-white">{stage.stage}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">{stage.count} lead{stage.count !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                        style={{ width: totalPipelineValue > 0 ? `${(stage.value / totalPipelineValue) * 100}%` : "0%" }}
                      />
                    </div>
                    {stage.value > 0 && (
                      <p className="text-[10px] text-slate-600 mt-0.5">₹{(stage.value / 100000).toFixed(1)}L</p>
                    )}
                  </div>
                ))}
                <div className="pt-2 border-t border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total Pipeline</span>
                    <span className="text-white font-medium">₹{(totalPipelineValue / 100000).toFixed(1)}L</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products & KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              Top Products by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <Package className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No accepted quotations yet</p>
                  <p className="text-xs text-slate-600 mt-1">Top products will appear once quotations are accepted</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product, i) => {
                  const pct = maxProductRevenue > 0 ? (product.revenue / maxProductRevenue) * 100 : 0;
                  return (
                    <div key={product.name} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-5 shrink-0">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white truncate">{product.name}</span>
                          <span className="text-xs text-emerald-400 shrink-0 ml-2">
                            ₹{(product.revenue / 100000).toFixed(1)}L
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-600 mt-0.5">{product.units.toLocaleString()} units</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Business Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Revenue", value: m.totalRevenue > 0 ? `₹${(m.totalRevenue / 100000).toFixed(1)}L` : "—", positive: m.totalRevenue > 0 },
                { label: "Conversion Rate", value: `${m.conversionRate}%`, positive: m.conversionRate > 20 },
                { label: "Active Quotations", value: m.activeQuotations, positive: m.activeQuotations > 0 },
                { label: "Export Orders", value: m.exportOrders, positive: m.exportOrders > 0 },
                { label: "Products Listed", value: m.totalProducts, positive: m.totalProducts > 0 },
                { label: "Active Suppliers", value: m.activeSuppliers, positive: m.activeSuppliers > 0 },
                { label: "Total Leads", value: m.totalLeads, positive: m.totalLeads > 0 },
                { label: "Pending RFQs", value: m.pendingRFQs, positive: m.pendingRFQs > 0 },
              ].map((kpi) => (
                <div key={kpi.label} className="p-3 rounded-lg bg-slate-800/30 border border-white/5">
                  <p className="text-[10px] text-slate-500">{kpi.label}</p>
                  <p className="text-lg font-bold text-white mt-1">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {kpi.positive ? (
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-slate-600" />
                    )}
                    <span className={`text-[10px] ${kpi.positive ? "text-emerald-400" : "text-slate-600"}`}>
                      {kpi.positive ? "Active" : "Empty"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <p className="text-xs text-cyan-300 font-medium">
                  {isEmpty
                    ? "Start by adding products, suppliers and leads to see live analytics"
                    : `${m.activeQuotations} active quotation${m.activeQuotations !== 1 ? "s" : ""} in progress`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
