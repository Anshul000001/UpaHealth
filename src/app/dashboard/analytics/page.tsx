"use client";

import {
  TrendingUp,
  TrendingDown,
  Globe,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { mockAnalytics } from "@/lib/mock-data";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Revenue projections, conversion rates, and procurement intelligence
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue (YTD)"
          value="₹48.5L"
          change="+23.5% MoM growth"
          changeType="positive"
          icon="IndianRupee"
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Quotation Conversion"
          value="34.2%"
          change="+5.2% vs last month"
          changeType="positive"
          icon="Target"
          iconColor="text-cyan-400"
        />
        <StatCard
          title="Products in Catalogue"
          value="156"
          change="12 added this month"
          changeType="positive"
          icon="Package"
          iconColor="text-blue-400"
        />
        <StatCard
          title="Active Suppliers"
          value="12"
          change="Avg trust score: 91"
          changeType="neutral"
          icon="Users"
          iconColor="text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <Badge variant="success">
                <TrendingUp className="w-3 h-3 mr-1" /> Growing
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-end gap-4 px-4 pb-4">
              {mockAnalytics.revenueByMonth.map((item) => {
                const maxRevenue = Math.max(...mockAnalytics.revenueByMonth.map(r => r.revenue));
                const height = (item.revenue / maxRevenue) * 240;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-slate-400">₹{(item.revenue / 100000).toFixed(1)}L</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 transition-all cursor-pointer relative group"
                      style={{ height: `${height}px` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                        {item.orders} orders
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Export by Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              Export by Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.exportByRegion.map((region) => {
                const maxValue = Math.max(...mockAnalytics.exportByRegion.map(r => r.value));
                const percentage = (region.value / maxValue) * 100;
                return (
                  <div key={region.region}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-white">{region.region}</span>
                      <span className="text-xs text-slate-400">
                        ₹{(region.value / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{region.orders} orders</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-slate-800/30 border border-white/5">
              <p className="text-xs text-slate-400 mb-2">Total Export Revenue</p>
              <p className="text-xl font-bold gradient-text">
                ₹{(mockAnalytics.exportByRegion.reduce((s, r) => s + r.value, 0) / 100000).toFixed(1)}L
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAnalytics.topProducts.map((product, i) => {
                const maxRevenue = mockAnalytics.topProducts[0].revenue;
                const percentage = (product.revenue / maxRevenue) * 100;
                return (
                  <div key={product.name} className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 w-4">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white">{product.name}</span>
                        <span className="text-xs text-emerald-400">
                          ₹{(product.revenue / 100000).toFixed(1)}L
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Avg Order Value", value: "₹2.2L", change: "+12%", positive: true },
                { label: "Repeat Order Rate", value: "68%", change: "+8%", positive: true },
                { label: "Avg Delivery Time", value: "6.2 days", change: "-1.3 days", positive: true },
                { label: "Quality Rejection", value: "1.4%", change: "-0.3%", positive: true },
                { label: "Supplier Response", value: "4.2 hrs", change: "-2 hrs", positive: true },
                { label: "Tender Win Rate", value: "28%", change: "+5%", positive: true },
              ].map((kpi) => (
                <div key={kpi.label} className="p-3 rounded-lg bg-slate-800/30 border border-white/5">
                  <p className="text-[10px] text-slate-500">{kpi.label}</p>
                  <p className="text-lg font-bold text-white mt-1">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {kpi.positive ? (
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    )}
                    <span className={`text-[10px] ${kpi.positive ? "text-emerald-400" : "text-red-400"}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
