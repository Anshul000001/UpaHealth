import {
  TrendingUp, Users, ArrowUpRight, Clock, AlertCircle,
  CheckCircle2, Sparkles, Activity, Globe, Package,
  FileText, Zap, ChevronRight,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getDashboardMetrics, getRevenueByMonth, getTopProducts } from "@/lib/services/analytics-service";
import { getLeads } from "@/lib/services/lead-service";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  let metrics = { totalRevenue: 0, activeQuotations: 0, conversionRate: 0, totalProducts: 0, activeSuppliers: 0, exportOrders: 0, pendingRFQs: 0, totalLeads: 0, monthlyGrowth: 0 };
  let revenueByMonth: { month: string; revenue: number; orders: number }[] = [];
  let topProducts: { name: string; revenue: number; units: number }[] = [];
  let leads: Awaited<ReturnType<typeof getLeads>>["data"] = [];
  let productCount = 0;
  let tenderCount = 0;

  try {
    const [m, r, tp, lr, pc, tc] = await Promise.all([
      getDashboardMetrics(),
      getRevenueByMonth(),
      getTopProducts(5),
      getLeads({ pageSize: 6 }),
      prisma.product.count(),
      prisma.tender.count({ where: { status: "open" } }),
    ]);
    metrics = m;
    revenueByMonth = r;
    topProducts = tp;
    leads = lr.data;
    productCount = pc;
    tenderCount = tc;
  } catch (err) {
    console.error("[Dashboard] DB query failed:", err);
  }

  const maxRevenue = revenueByMonth.length > 0 ? Math.max(...revenueByMonth.map((r) => r.revenue), 1) : 1;
  const firstName = session.user.name?.split(" ")[0] ?? "Admin";

  const stageColors: Record<string, string> = {
    Lead: "bg-slate-500", "RFQ Received": "bg-blue-500", "Quotation Sent": "bg-cyan-500",
    Negotiation: "bg-amber-500", "Order Confirmed": "bg-emerald-500",
    "Closed Won": "bg-emerald-600", "Closed Lost": "bg-red-500",
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Welcome Banner ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-r from-[#0B1220] via-[#111827] to-[#0B1220] p-6">
        {/* Background grid */}
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
        {/* Glow */}
        <div className="absolute top-0 left-1/4 w-64 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-24 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="section-label text-cyan-500">UpaHealth Enterprise</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="section-label">AI Procurement OS</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Good morning, {firstName}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Your AI procurement intelligence is active — {tenderCount} open tenders, {metrics.totalLeads} leads in pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-glow" />
              <span className="text-xs text-emerald-400 font-semibold">15 AI Agents Active</span>
            </div>
            <Link href="/dashboard/quotations">
              <Button size="sm">
                <Sparkles className="w-3.5 h-3.5" /> New Quotation
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── KPI Strip ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={metrics.totalRevenue > 0 ? `₹${(metrics.totalRevenue / 100000).toFixed(1)}L` : "₹0"}
          change="From accepted quotations"
          changeType={metrics.totalRevenue > 0 ? "positive" : "neutral"}
          icon="IndianRupee"
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Active Quotations"
          value={metrics.activeQuotations}
          change="Draft + Sent"
          changeType="neutral"
          icon="FileText"
          iconColor="text-cyan-400"
        />
        <StatCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          change="Accepted / Total"
          changeType={metrics.conversionRate > 20 ? "positive" : "neutral"}
          icon="TrendingUp"
          iconColor="text-blue-400"
        />
        <StatCard
          title="Open Tenders"
          value={tenderCount}
          change="Government opportunities"
          changeType={tenderCount > 0 ? "positive" : "neutral"}
          icon="Globe"
          iconColor="text-purple-400"
        />
      </div>

      {/* ── Secondary KPIs ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Products", value: productCount, icon: Package, color: "text-cyan-400", href: "/dashboard/products" },
          { label: "Total Leads", value: metrics.totalLeads, icon: Users, color: "text-blue-400", href: "/dashboard/crm" },
          { label: "Export Orders", value: metrics.exportOrders, icon: Globe, color: "text-purple-400", href: "/dashboard/export" },
          { label: "Pending RFQs", value: metrics.pendingRFQs, icon: FileText, color: "text-amber-400", href: "/dashboard/rfq" },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#111827] border border-white/[0.06] hover:border-cyan-500/20 transition-all group cursor-pointer">
              <div className={`w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-none">{item.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.label}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 ml-auto transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Main Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <p className="text-[11px] text-slate-500 mt-0.5">Monthly accepted quotation revenue</p>
              </div>
              <Badge variant="info">Live</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {revenueByMonth.length > 0 ? (
              <div className="h-52 flex items-end gap-2 pt-4">
                {revenueByMonth.map((item, i) => {
                  const h = Math.max((item.revenue / maxRevenue) * 180, 4);
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="relative w-full">
                        <div
                          className="sparkline-bar w-full rounded-t-md transition-all duration-300 group-hover:opacity-90"
                          style={{ height: `${h}px` }}
                        />
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-[#1E293B] border border-white/10 px-2 py-1 rounded-lg text-[10px] text-white whitespace-nowrap z-10 shadow-lg">
                          ₹{(item.revenue / 100000).toFixed(1)}L · {item.orders} orders
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-600">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-slate-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400 font-medium">No revenue data yet</p>
                  <p className="text-xs text-slate-600 mt-1">Revenue appears after quotations are accepted</p>
                </div>
                <Link href="/dashboard/quotations">
                  <Button size="sm" variant="outline">Create Quotation</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Intelligence Panel */}
        <Card className="ai-panel">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI Intelligence
              </CardTitle>
              <Link href="/dashboard/ai">
                <span className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors">Open →</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { icon: AlertCircle, text: "Scan government tenders for new healthcare opportunities", color: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/15", href: "/dashboard/export" },
              { icon: Users, text: "Use AI Lead Gen to discover hospital buyers in your target markets", color: "text-cyan-400", bg: "bg-cyan-500/8 border-cyan-500/15", href: "/dashboard/lead-gen" },
              { icon: CheckCircle2, text: "131 products from Vivan Surgical ready for quotation", color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/15", href: "/dashboard/products" },
              { icon: TrendingUp, text: "Export Intelligence: East Africa & GCC markets active", color: "text-purple-400", bg: "bg-purple-500/8 border-purple-500/15", href: "/dashboard/export" },
              { icon: Zap, text: "15 AI agents monitoring procurement opportunities 24/7", color: "text-blue-400", bg: "bg-blue-500/8 border-blue-500/15", href: "/dashboard/agents" },
            ].map((insight, i) => (
              <Link key={i} href={insight.href}>
                <div className={`flex items-start gap-3 p-3 rounded-xl border ${insight.bg} hover:opacity-90 transition-opacity cursor-pointer`}>
                  <insight.icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${insight.color}`} />
                  <p className="text-[12px] text-slate-300 leading-relaxed">{insight.text}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Pipeline + Products ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* CRM Pipeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Pipeline</CardTitle>
                <p className="text-[11px] text-slate-500 mt-0.5">{leads.length} leads shown</p>
              </div>
              <Link href="/dashboard/crm">
                <Button variant="ghost" size="sm">View All <ChevronRight className="w-3 h-3 ml-1" /></Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {leads.length > 0 ? (
              <div className="space-y-2">
                {leads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-white/[0.04] hover:border-cyan-500/15 transition-all group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-white truncate group-hover:text-cyan-300 transition-colors">{lead.name}</p>
                        <p className="text-[11px] text-slate-500">{lead.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-[13px] font-semibold text-white">₹{(lead.estimatedValue / 100000).toFixed(1)}L</p>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${stageColors[lead.stage] ?? "bg-slate-500"}`} />
                        <span className="text-[11px] text-slate-400">{lead.stage}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No leads yet</p>
                <Link href="/dashboard/lead-gen" className="inline-flex items-center gap-1.5 mt-3 text-xs text-cyan-400 hover:text-cyan-300">
                  <Zap className="w-3 h-3" /> Generate with AI
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Products</CardTitle>
                <p className="text-[11px] text-slate-500 mt-0.5">By revenue from accepted quotations</p>
              </div>
              <Link href="/dashboard/products">
                <Button variant="ghost" size="sm">View All <ChevronRight className="w-3 h-3 ml-1" /></Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-2">
                {topProducts.map((product, i) => {
                  const pct = topProducts[0].revenue > 0 ? (product.revenue / topProducts[0].revenue) * 100 : 0;
                  return (
                    <div key={product.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[11px] font-bold text-slate-600 w-4">#{i + 1}</span>
                          <p className="text-[13px] text-white truncate">{product.name}</p>
                        </div>
                        <p className="text-[13px] font-semibold text-emerald-400 shrink-0 ml-2">₹{(product.revenue / 100000).toFixed(1)}L</p>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center">
                <Package className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Revenue data appears after quotations are accepted</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Actions ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Scan Tenders", desc: "GeM + CPPP + MoHFW", icon: Globe, href: "/dashboard/export", color: "from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40" },
          { label: "Generate Leads", desc: "AI-powered discovery", icon: Zap, href: "/dashboard/lead-gen", color: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/40" },
          { label: "New Quotation", desc: "131 products ready", icon: FileText, href: "/dashboard/quotations", color: "from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40" },
          { label: "AI Assistant", desc: "NVIDIA Llama 3.1", icon: Sparkles, href: "/dashboard/ai", color: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40" },
        ].map((action) => (
          <Link key={action.label} href={action.href}>
            <div className={`p-4 rounded-xl bg-gradient-to-br border transition-all cursor-pointer group ${action.color}`}>
              <action.icon className="w-5 h-5 text-slate-300 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-[13px] font-semibold text-white">{action.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
