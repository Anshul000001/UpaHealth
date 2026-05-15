"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface ProductCategoryFilterProps {
  onFilterChange: (category: string) => void;
  activeCategory: string;
  productCounts: Record<string, number>;
}

export function ProductCategoryFilter({
  onFilterChange,
  activeCategory,
  productCounts,
}: ProductCategoryFilterProps) {
  const [expanded, setExpanded] = useState(false);

  // Only show categories that have products
  const categoriesWithProducts = PRODUCT_CATEGORIES.filter(
    (cat) => (productCounts[cat] ?? 0) > 0
  );

  const visibleCategories = expanded
    ? categoriesWithProducts
    : categoriesWithProducts.slice(0, 6);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Filter by Category
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onFilterChange("all")}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
            activeCategory === "all"
              ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
              : "border-slate-600/50 bg-slate-800/50 text-slate-400 hover:border-slate-500"
          }`}
        >
          All Products
        </button>
        {visibleCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onFilterChange(cat)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              activeCategory === cat
                ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                : "border-slate-600/50 bg-slate-800/50 text-slate-400 hover:border-slate-500"
            }`}
          >
            {cat}
            <span className="ml-1.5 text-[10px] opacity-60">
              ({productCounts[cat] ?? 0})
            </span>
          </button>
        ))}
        {categoriesWithProducts.length > 6 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-300 transition-all"
          >
            {expanded ? "Show less" : `+${categoriesWithProducts.length - 6} more`}
          </button>
        )}
      </div>
    </div>
  );
}
