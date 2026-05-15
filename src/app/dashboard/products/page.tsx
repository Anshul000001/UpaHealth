import { getProducts } from "@/lib/services/product-service";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { AddProductButton } from "@/components/dashboard/ProductsClient";
import { ProductGrid } from "@/components/dashboard/ProductGrid";

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

      {/* Category Filter + Product Grid */}
      <ProductGrid products={products} />
    </div>
  );
}
