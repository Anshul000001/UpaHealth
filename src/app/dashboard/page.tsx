import {
  TrendingUp,
  Users,
  ArrowUpRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
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

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [metrics, revenueByMonth, topProducts, leadsResult] = await Promise.all([
    getDashboardMetrics(),
    getRevenueByMonth(),
    getTopProducts(5),
    getLeads({ pageSize: 5 }),
  ]);

  const leads = leadsResult.data;
  const maxRevenue = revenueByMonth.length > 0 ? Math.max(...revenueByMonth.map((r) => r.revenue), 1) : 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {session.user.name?.split(" ")[0] ?? "Admin"}
            </h1>
            <p className="text-slate-400 mt-1">
              Your AI procurement intelligence is running. Here&apos;s today&apos;s overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow" />
              <span className="text-xs text-emerald-400 font-medium">AI Active</span>
            </div>
            <Link href="/dashboard/quotations">
              <Button size="sm">
                <Sparkles className="w-3.5 h-3.5" /> New Quotation
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={metrics.totalRevenue > 0 ? `₹${(metrics.totalRevenue / 100000).toFixed(1)}L` : "₹0"}
          change="From accepted quotations"
          changeType="positive"
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
          change="Accepted / Total quotations"
          changeType={metrics.conversionRate > 20 ? "positive" : "neutral"}
          icon="TrendingUp"
          iconColor="text-blue-400"
        />
        <StatCard
          title="Export Orders"
          value={metrics.exportOrders}
          change="Non-INR accepted"
          changeType="neutral"
          icon="Globe"
          iconColor="text-purple-400"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Overview</CardTitle>
              <Badge variant="info">Live Data</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {revenueByMonth.length > 0 ? (
              <>
                <div className="h-64 flex items-end gap-3 px-4">
                  {revenueByMonth.map((item) => (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500/80 to-blue-500/60 transition-all hover:from-cyan-400 hover:to-blue-400"
                        style={{ height: `${Math.max((item.revenue / maxRevenue) * 200, 4)}px` }}
                      />
                      <span className="text-xs text-slate-500">{item.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    <span>Revenue from accepted quotations</span>
                  </div>
                  <span className="text-xs text-slate-500">Last 6 months</span>
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                No accepted quotations yet — revenue will appear here
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  icon: AlertCircle,
                  text: "KEMSA Kenya tender closing soon — quotation ready for submission",
                  color: "text-amber-400",
                },
                {
                  icon: Clock,
                  text: "Follow up with Al Noor Hospital — check CRM for overdue leads",
                  color: "text-cyan-400",
                },
                {
                  icon: CheckCircle2,
                  text: "IV Set pricing competitive — strong export position",
                  color: "text-emerald-400",
                },
                {
                  icon: TrendingUp,
                  text: "Surgical drape demand up in East Africa Q2",
                  color: "text-purple-400",
                },
              ].map((insight) => (
                <div
                  key={insight.text}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-white/5"
                >
                  <insight.icon className={`w-4 h-4 mt-0.5 shrink-0 ${insight.color}`} />
                  <p className="text-xs text-slate-300 leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRM Pipeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Pipeline</CardTitle>
              <Link href="/dashboard/crm">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {leads.length > 0 ? (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-white/5 hover:border-cyan-500/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                        <Users className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{lead.name}</p>
                        <p className="text-xs text-slate-500">{lead.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        ₹{(lead.estimatedValue / 100000).toFixed(1)}L
                      </p>
                      <Badge
                        variant={
                          lead.stage === "Quotation Sent" ? "info"
                          : lead.stage === "Negotiation" ? "warning"
                          : lead.stage === "RFQ Received" ? "success"
                          : "default"
                        }
                      >
                        {lead.stage}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center py-8">No leads yet</p>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Products by Revenue</CardTitle>
              <Link href="/dashboard/products">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, i) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-cyan-400">#{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.units.toLocaleString()} units sold</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-emerald-400">
                      ₹{(product.revenue / 100000).toFixed(1)}L
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center py-8">
                Revenue data appears after quotations are accepted
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
