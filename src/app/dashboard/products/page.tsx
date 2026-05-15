import {
  Package,
  Globe,
  Shield,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/services/product-service";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { AddProductButton } from "@/components/dashboard/ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { data: products, total } = await getProducts({ pageSize: 50 });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Database</h1>
          <p className="text-slate-400 text-sm mt-1">
            {total} products across {PRODUCT_CATEGORIES.length} categories
          </p>
        </div>
        <AddProductButton />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const margin = ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100;
          return (
            <Card key={product.id} className="hover:border-cyan-500/30 transition-all cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    {product.stock === 0 && (
                      <Badge variant="danger" className="text-[10px]">Out of Stock</Badge>
                    )}
                    {product.exportAvailable && (
                      <Badge variant="info" className="text-[10px]">
                        <Globe className="w-3 h-3 mr-1" /> Export
                      </Badge>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-500 mb-1">{product.sku}</p>
                <p className="text-xs text-slate-600 mb-3">{product.supplier.name}</p>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 rounded bg-slate-800/50">
                    <p className="text-[10px] text-slate-500">Selling Price</p>
                    <p className="text-sm font-medium text-white">₹{product.sellingPrice}</p>
                  </div>
                  <div className="p-2 rounded bg-slate-800/50">
                    <p className="text-[10px] text-slate-500">Export Price</p>
                    <p className="text-sm font-medium text-white">${product.exportPrice}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400">{margin.toFixed(0)}% margin</span>
                  </div>
                  <span className="text-xs text-slate-500">MOQ: {product.moq.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500">Stock: {product.stock.toLocaleString()} {product.unit}s</span>
                  <span className="text-xs text-slate-500">Lead: {product.leadTime}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {product.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700"
                    >
                      <Shield className="w-2.5 h-2.5" /> {cert}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
