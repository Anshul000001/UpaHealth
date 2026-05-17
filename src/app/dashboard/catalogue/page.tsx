"use client";

import { useState, useEffect } from "react";
import {
  Package, Download, Plus, Trash2, Loader2, FileText,
  Send, CheckCircle2, ShoppingCart, Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  sellingPrice: number;
  exportPrice: number;
  moq: number;
  unit: string;
  leadTime: string;
  certifications: string[];
  exportAvailable: boolean;
}

interface SelectedProduct {
  product: Product;
  quantity: number;
}

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<SelectedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    fetch("/api/products?pageSize=200")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProducts(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map((p) => p.category))].sort();

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  function addProduct(product: Product) {
    if (selected.find((s) => s.product.id === product.id)) return;
    setSelected([...selected, { product, quantity: product.moq }]);
  }

  function removeProduct(id: string) {
    setSelected(selected.filter((s) => s.product.id !== id));
  }

  function updateQuantity(id: string, qty: number) {
    setSelected(selected.map((s) => s.product.id === id ? { ...s, quantity: Math.max(1, qty) } : s));
  }

  function getTotal() {
    return selected.reduce((sum, s) => {
      const price = currency === "INR" ? s.product.sellingPrice : s.product.exportPrice;
      return sum + price * s.quantity;
    }, 0);
  }

  function downloadCatalogue() {
    const currSymbol = currency === "INR" ? "₹" : "$";
    const date = new Date().toLocaleDateString("en-IN");

    let content = `UPAHEALTH SUPPLIES — PRODUCT REQUIREMENT SHEET\n`;
    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    content += `Date: ${date}\n`;
    content += `Currency: ${currency}\n`;
    if (buyerName) content += `Buyer/Supplier: ${buyerName}\n`;
    if (buyerEmail) content += `Email: ${buyerEmail}\n`;
    content += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    content += `SELECTED PRODUCTS (${selected.length} items)\n`;
    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    selected.forEach((s, i) => {
      const price = currency === "INR" ? s.product.sellingPrice : s.product.exportPrice;
      const lineTotal = price * s.quantity;
      content += `${i + 1}. ${s.product.name}\n`;
      content += `   SKU: ${s.product.sku} | Category: ${s.product.category}\n`;
      content += `   MOQ: ${s.product.moq} ${s.product.unit}s | Lead Time: ${s.product.leadTime}\n`;
      content += `   Unit Price: ${currSymbol}${price} | Qty: ${s.quantity.toLocaleString()} ${s.product.unit}s\n`;
      content += `   Line Total: ${currSymbol}${lineTotal.toLocaleString()}\n`;
      content += `   Certifications: ${s.product.certifications.join(", ") || "—"}\n`;
      content += `   Export Available: ${s.product.exportAvailable ? "Yes" : "No"}\n\n`;
    });

    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    content += `TOTAL: ${currSymbol}${getTotal().toLocaleString()} (${selected.length} products)\n`;
    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (notes) content += `NOTES:\n${notes}\n\n`;

    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    content += `UpaHealth Supplies | adminupahealthsupplies@gmail.com\n`;
    content += `India's AI-Enabled Healthcare Sourcing Partner\n`;
    content += `www.upahealthsupplies.com\n`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `UpaHealth-Catalogue-${buyerName || "Requirement"}-${date.replace(/\//g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setGenerated(true);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-cyan-400" />
            Product Catalogue
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Select products to create a requirement sheet — send to buyers or suppliers for quotation
          </p>
        </div>
        {selected.length > 0 && (
          <Badge variant="info" className="text-xs">{selected.length} products selected</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product picker */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search + Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="pl-10"
              />
            </div>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-56">
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>

          {/* Product list */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : filtered.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Package className="w-8 h-8 text-slate-700 mx-auto mb-2" /><p className="text-sm text-slate-500">No products found</p></CardContent></Card>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map((product) => {
                const isSelected = selected.some((s) => s.product.id === product.id);
                return (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "border-cyan-500/30 bg-cyan-500/5"
                        : "border-white/[0.06] bg-[#111827]/50 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500">{product.sku}</span>
                          <span className="text-[10px] text-slate-600">•</span>
                          <span className="text-[10px] text-slate-500">MOQ: {product.moq.toLocaleString()} {product.unit}s</span>
                          <span className="text-[10px] text-slate-600">•</span>
                          <span className="text-[10px] text-emerald-400">₹{product.sellingPrice} / ${product.exportPrice}</span>
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <Badge variant="success" className="text-[10px] shrink-0">Added ✓</Badge>
                    ) : (
                      <button
                        onClick={() => addProduct(product)}
                        className="shrink-0 p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                        title="Add to catalogue"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected products + buyer info */}
        <div className="space-y-4">
          {/* Buyer Info */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Buyer / Supplier Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Name</label>
                <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Hospital / Distributor name" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Email</label>
                <Input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} placeholder="buyer@hospital.com" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Currency</label>
                <Select value={currency} onChange={(e) => setCurrency(e.target.value as "INR" | "USD")}>
                  <option value="INR">₹ INR (India)</option>
                  <option value="USD">$ USD (Export)</option>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special requirements, delivery terms..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-600/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Selected Products ({selected.length})</CardTitle>
                {selected.length > 0 && (
                  <button onClick={() => setSelected([])} className="text-[10px] text-red-400 hover:text-red-300">Clear all</button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selected.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Click + on products to add them here</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {selected.map((s) => {
                    const price = currency === "INR" ? s.product.sellingPrice : s.product.exportPrice;
                    const symbol = currency === "INR" ? "₹" : "$";
                    return (
                      <div key={s.product.id} className="p-2.5 rounded-lg bg-slate-800/50 border border-white/[0.06]">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-xs font-medium text-white leading-snug">{s.product.name}</p>
                          <button onClick={() => removeProduct(s.product.id)} className="shrink-0 text-red-400 hover:text-red-300">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">Qty:</span>
                          <input
                            type="number"
                            min={1}
                            value={s.quantity}
                            onChange={(e) => updateQuantity(s.product.id, parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                          />
                          <span className="text-[10px] text-slate-500">{s.product.unit}s</span>
                          <span className="text-[10px] text-slate-500 ml-auto">MOQ: {s.product.moq}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-slate-500">{symbol}{price} × {s.quantity.toLocaleString()}</span>
                          <span className="text-xs font-bold text-emerald-400">{symbol}{(price * s.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total + Download */}
              {selected.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Total</span>
                    <span className="text-lg font-bold text-white">
                      {currency === "INR" ? "₹" : "$"}{getTotal().toLocaleString()}
                    </span>
                  </div>
                  <Button onClick={downloadCatalogue} className="w-full">
                    <Download className="w-4 h-4" /> Download Requirement Sheet
                  </Button>
                  {generated && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Downloaded successfully
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
