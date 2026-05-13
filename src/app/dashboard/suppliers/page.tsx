import {
  Factory,
  MapPin,
  Shield,
  Star,
  TrendingUp,
  Clock,
  AlertTriangle,
  Plus,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSuppliers } from "@/lib/services/supplier-service";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { data: suppliers, total } = await getSuppliers({ pageSize: 50 });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Supplier Intelligence Engine</h1>
          <p className="text-slate-400 text-sm mt-1">
            {total} AI-scored supplier profiles with reliability and quality metrics
          </p>
        </div>
        <Button size="sm">
          <Plus className="w-3.5 h-3.5" /> Add Supplier
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          placeholder="Search suppliers by name, location, or product..."
          className="w-full rounded-lg border border-slate-600/50 bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
        />
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:border-cyan-500/30 transition-all">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <Factory className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{supplier.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {supplier.location}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-white">{supplier.trustScore}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">AI Trust Score</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span className="text-lg font-bold text-white">{supplier.reliabilityScore}%</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Reliability</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span className="text-lg font-bold text-white">{supplier.onTimeDelivery}%</span>
                  </div>
                  <p className="text-[10px] text-slate-500">On-Time</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span className="text-lg font-bold text-white">{supplier.qualityRejectionRate}%</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Rejection Rate</p>
                </div>
              </div>

              {/* Certifications */}
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2">Certifications</p>
                <div className="flex flex-wrap gap-1.5">
                  {supplier.certifications.map((cert) => (
                    <Badge key={cert} variant="success" className="text-[10px]">
                      <Shield className="w-2.5 h-2.5 mr-0.5" /> {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Products */}
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2">Product Categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {supplier.productCategories.map((cat) => (
                    <Badge key={cat} variant="default" className="text-[10px]">{cat}</Badge>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-xs text-slate-500">
                  {supplier.totalOrders} orders completed
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">View Profile</Button>
                  <Button variant="outline" size="sm">Request Quote</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
