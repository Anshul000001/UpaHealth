import {
  Users,
  Mail,
  Calendar,
  ArrowRight,
  Building2,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { getLeads } from "@/lib/services/lead-service";
import { PIPELINE_STAGES } from "@/lib/constants";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AddContactButton } from "@/components/dashboard/CRMClient";

export const dynamic = "force-dynamic";

export default async function CRMPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { data: leads, total } = await getLeads({ pageSize: 50 });

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
            Track hospitals, distributors, and export buyers
          </p>
        </div>
        <AddContactButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Pipeline Value"
          value={`₹${(totalValue / 100000).toFixed(1)}L`}
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

      {/* Pipeline View */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Pipeline stages bar */}
          <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
            {PIPELINE_STAGES.map((stage) => {
              const count = leads.filter((l) => l.stage === stage).length;
              return (
                <div
                  key={stage}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    count > 0 ? "bg-slate-800 text-white border border-slate-700" : "text-slate-600"
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

          {/* Leads List */}
          <div className="space-y-3">
            {leads.map((lead) => {
              const isOverdue = lead.nextFollowUp && new Date(lead.nextFollowUp) < now;
              return (
                <div
                  key={lead.id}
                  className={`flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border transition-all cursor-pointer group ${
                    isOverdue ? "border-amber-500/30 hover:border-amber-500/50" : "border-white/5 hover:border-cyan-500/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                      {lead.type === "HOSPITAL" ? (
                        <Building2 className="w-5 h-5 text-cyan-400" />
                      ) : lead.type === "GOVERNMENT" ? (
                        <Globe className="w-5 h-5 text-purple-400" />
                      ) : (
                        <Users className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {lead.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Users className="w-3 h-3" /> {lead.contactPerson}
                        </span>
                        {lead.email && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {lead.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        ₹{(lead.estimatedValue / 100000).toFixed(1)}L
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1 justify-end">
                        {lead.products.slice(0, 2).map((p) => (
                          <Badge key={p} variant="default" className="text-[10px]">{p}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-right min-w-[130px]">
                      <Badge
                        variant={
                          lead.stage === "Negotiation" ? "warning"
                          : lead.stage === "Quotation Sent" ? "info"
                          : lead.stage === "RFQ Received" ? "success"
                          : "default"
                        }
                      >
                        {lead.stage}
                      </Badge>
                      {lead.nextFollowUp && (
                        <p className={`text-[10px] mt-1 flex items-center gap-1 justify-end ${isOverdue ? "text-amber-400" : "text-slate-500"}`}>
                          <Calendar className="w-3 h-3" />
                          {isOverdue ? "OVERDUE: " : "Follow up: "}
                          {new Date(lead.nextFollowUp).toLocaleDateString("en-IN")}
                        </p>
                      )}
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
