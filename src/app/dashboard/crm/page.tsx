import {
  Users,
  Mail,
  Calendar,
  ArrowRight,
  Building2,
  Globe,
  Phone,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { getLeads } from "@/lib/services/lead-service";
import { PIPELINE_STAGES } from "@/lib/constants";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AddContactButton } from "@/components/dashboard/CRMClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CRMPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { data: leads, total } = await getLeads({ pageSize: 100 });

  const totalValue = leads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const hospitals = leads.filter((l) => l.type === "HOSPITAL").length;
  const exportBuyers = leads.filter((l) => l.type === "GOVERNMENT" || l.type === "HOSPITAL_CHAIN").length;

  const stageColors: Record<string, string> = {
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

  const now = new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Healthcare CRM</h1>
          <p className="text-slate-400 text-sm mt-1">
            {total > 0
              ? `${total} active leads — hospitals, distributors, and export buyers`
              : "No leads yet — add contacts manually or use AI Lead Gen"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/lead-gen"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-colors"
          >
            ⚡ AI Lead Gen
          </Link>
          <AddContactButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Pipeline Value"
          value={totalValue > 0 ? `₹${(totalValue / 100000).toFixed(1)}L` : "₹0"}
          icon="IndianRupee"
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Active Leads"
          value={total}
          icon="Users"
          iconColor="text-cyan-400"
        />
        <StatCard
          title="Hospitals"
          value={hospitals}
          icon="Building2"
          iconColor="text-blue-400"
        />
        <StatCard
          title="Export Buyers"
          value={exportBuyers}
          icon="Globe"
          iconColor="text-purple-400"
        />
      </div>

      {/* Empty state */}
      {total === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400 mb-1">No leads in your pipeline yet</p>
            <p className="text-xs text-slate-600 mb-4 max-w-sm mx-auto">
              Add contacts manually using the button above, or use AI Lead Gen to automatically discover hospitals, distributors, and government buyers.
            </p>
            <Link
              href="/dashboard/lead-gen"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              ⚡ Generate Leads with AI
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Pipeline + Leads */}
      {total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Pipeline stages */}
            <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-2 flex-wrap">
              {PIPELINE_STAGES.map((stage) => {
                const count = leads.filter((l) => l.stage === stage).length;
                return (
                  <div
                    key={stage}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                      count > 0
                        ? "bg-slate-800 text-white border border-slate-700"
                        : "text-slate-600 border border-slate-800"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${stageColors[stage] ?? "bg-slate-600"}`} />
                    {stage}
                    {count > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-700 text-[10px]">{count}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Leads list */}
            <div className="space-y-2">
              {leads.map((lead) => {
                const isOverdue = lead.nextFollowUp && new Date(lead.nextFollowUp) < now;
                return (
                  <div
                    key={lead.id}
                    className={`flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border transition-all cursor-pointer group ${
                      isOverdue
                        ? "border-amber-500/30 hover:border-amber-500/50"
                        : "border-white/5 hover:border-cyan-500/20"
                    }`}
                  >
                    {/* Left: icon + info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                        {lead.type === "HOSPITAL" || lead.type === "HOSPITAL_CHAIN" ? (
                          <Building2 className="w-5 h-5 text-cyan-400" />
                        ) : lead.type === "GOVERNMENT" ? (
                          <Globe className="w-5 h-5 text-purple-400" />
                        ) : (
                          <Users className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                          {lead.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Users className="w-3 h-3" /> {lead.contactPerson}
                          </span>
                          {lead.email && (
                            <span className="text-xs text-slate-500 flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3" /> {lead.email}
                            </span>
                          )}
                          {lead.phone && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {lead.phone}
                            </span>
                          )}
                        </div>
                        {lead.products.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {lead.products.slice(0, 2).map((p) => (
                              <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                <Package className="w-2.5 h-2.5 inline mr-0.5" />{p}
                              </span>
                            ))}
                            {lead.products.length > 2 && (
                              <span className="text-[10px] text-slate-600">+{lead.products.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: value + stage + follow-up */}
                    <div className="flex items-center gap-4 shrink-0 ml-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-white">
                          ₹{(lead.estimatedValue / 100000).toFixed(1)}L
                        </p>
                        <p className="text-[10px] text-slate-500">est. value</p>
                      </div>

                      <div className="text-right">
                        <Badge
                          variant={
                            lead.stage === "Negotiation" ? "warning"
                            : lead.stage === "Quotation Sent" ? "info"
                            : lead.stage === "RFQ Received" ? "success"
                            : lead.stage === "Closed Won" ? "success"
                            : lead.stage === "Closed Lost" ? "danger"
                            : "default"
                          }
                        >
                          {lead.stage}
                        </Badge>
                        {lead.nextFollowUp && (
                          <p className={`text-[10px] mt-1 flex items-center gap-1 justify-end ${isOverdue ? "text-amber-400" : "text-slate-500"}`}>
                            <Calendar className="w-3 h-3" />
                            {isOverdue ? "OVERDUE" : new Date(lead.nextFollowUp).toLocaleDateString("en-IN")}
                          </p>
                        )}
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors hidden md:block" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
