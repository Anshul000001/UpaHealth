"use client";

import { useState, useEffect } from "react";
import {
  Package, Download, Plus, Trash2, Loader2, FileText,
  CheckCircle2, ShoppingCart, Search, Sparkles, Brain,
  AlertCircle, Edit3,
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
  customMoq: number; // Admin-set minimum
}

interface AISuggestion {
  totalValue: string;
  suggestion: string;
  discount: string;
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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);

  useEffect(() => {
    fetch("/api/products?pageSize=200")
      .then((r) => r.json())
      .then((data) => { if (data.success) setProducts(data.data); })
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
    setSelected([...selected, { product, quantity: product.moq, customMoq: product.moq }]);
    setAiSuggestion(null);
  }

  function removeProduct(id: string) {
    setSelected(selected.filter((s) => s.product.id !== id));
    setAiSuggestion(null);
  }

  function updateQuantity(id: string, qty: number) {
    setSelected(selected.map((s) => {
      if (s.product.id !== id) return s;
      const minAllowed = s.customMoq;
      const finalQty = Math.max(minAllowed, qty);
      return { ...s, quantity: finalQty };
    }));
    setAiSuggestion(null);
  }

  function updateCustomMoq(id: string, moq: number) {
    setSelected(selected.map((s) => {
      if (s.product.id !== id) return s;
      const newMoq = Math.max(1, moq);
      const newQty = Math.max(newMoq, s.quantity);
      return { ...s, customMoq: newMoq, quantity: newQty };
    }));
    setAiSuggestion(null);
  }

  function getTotal() {
    return selected.reduce((sum, s) => {
      const price = currency === "INR" ? s.product.sellingPrice : s.product.exportPrice;
      return sum + price * s.quantity;
    }, 0);
  }

  async function getAISuggestion() {
    if (selected.length === 0) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const items = selected.map(s => ({
        name: s.product.name,
        qty: s.quantity,
        moq: s.customMoq,
        price: currency === "INR" ? s.product.sellingPrice : s.product.exportPrice,
        unit: s.product.unit,
      }));
      const total = getTotal();

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `I'm creating a product requirement sheet for a buyer. Here are the selected items:

${items.map((item, i) => `${i+1}. ${item.name} — Qty: ${item.qty} ${item.unit}s @ ${currency === "INR" ? "₹" : "$"}${item.price} each (Min MOQ: ${item.moq})`).join("\n")}

Total order value: ${currency === "INR" ? "₹" : "$"}${total.toLocaleString()}
Buyer: ${buyerName || "Not specified"}
Currency: ${currency}

Give me:
1. A quick assessment of this order (1 sentence)
2. A bulk discount suggestion if applicable (1 sentence)
3. Any MOQ optimization tip (1 sentence)

Keep it very short — 3 lines max.`
          }],
        }),
      });
      const data = await res.json();
      if (data.success) {
        const text = data.data.reply;
        setAiSuggestion({
          totalValue: `${currency === "INR" ? "₹" : "$"}${total.toLocaleString()}`,
          suggestion: text,
          discount: total > 100000 ? "Bulk discount may apply" : "",
        });
      }
    } catch { /* ignore */ }
    finally { setAiLoading(false); }
  }

  function downloadCatalogue() {
    const currSymbol = currency === "INR" ? "₹" : "$";
    const date = new Date().toLocaleDateString("en-IN");

    let content = `UPAHEALTH SUPPLIES — PRODUCT REQUIREMENT SHEET\n`;
    content += `${"━".repeat(76)}\n\n`;
    content += `Date: ${date}\n`;
    content += `Currency: ${currency}\n`;
    if (buyerName) content += `Buyer/Supplier: ${buyerName}\n`;
    if (buyerEmail) content += `Email: ${buyerEmail}\n`;
    content += `\n${"━".repeat(76)}\n`;
    content += `SELECTED PRODUCTS (${selected.length} items)\n`;
    content += `${"━".repeat(76)}\n\n`;

    selected.forEach((s, i) => {
      const price = currency === "INR" ? s.product.sellingPrice : s.product.exportPrice;
      const lineTotal = price * s.quantity;
      content += `${i + 1}. ${s.product.name}\n`;
      content += `   SKU: ${s.product.sku} | Category: ${s.product.category}\n`;
      content += `   Minimum Order (MOQ): ${s.customMoq} ${s.product.unit}s | Lead Time: ${s.product.leadTime}\n`;
      content += `   Unit Price: ${currSymbol}${price} | Qty Ordered: ${s.quantity.toLocaleString()} ${s.product.unit}s\n`;
      content += `   Line Total: ${currSymbol}${lineTotal.toLocaleString()}\n`;
      content += `   Certifications: ${s.product.certifications.join(", ") || "Standard"}\n`;
      content += `   Export: ${s.product.exportAvailable ? "Yes" : "No"}\n\n`;
    });

    content += `${"━".repeat(76)}\n`;
    content += `TOTAL ORDER VALUE: ${currSymbol}${getTotal().toLocaleString()} (${selected.length} products)\n`;
    content += `${"━".repeat(76)}\n\n`;

    if (notes) content += `NOTES:\n${notes}\n\n`;
    if (aiSuggestion) content += `AI RECOMMENDATION:\n${aiSuggestion.suggestion}\n\n`;

    content += `${"━".repeat(76)}\n`;
    content += `UpaHealth Supplies | adminupahealthsupplies@gmail.com\n`;
    content += `India's AI-Enabled Healthcare Sourcing Partner\n`;
    content += `www.upahealthsupplies.com\n`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `UpaHealth-Requirement-${buyerName || "Sheet"}-${date.replace(/\//g, "-")}.txt`;
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
            Select products, set MOQ, get AI pricing — download requirement sheet
          </p>
        </div>
        {selected.length > 0 && (
          <Badge variant="info" className="text-xs">{selected.length} products selected</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product picker */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU..." className="pl-10" />
            </div>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-56">
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>
          ) : filtered.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Package className="w-8 h-8 text-slate-700 mx-auto mb-2" /><p className="text-sm text-slate-500">No products found</p></CardContent></Card>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map((product) => {
                const isSelected = selected.some((s) => s.product.id === product.id);
                return (
                  <div key={product.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? "border-cyan-500/30 bg-cyan-500/5" : "border-white/[0.06] bg-[#111827]/50 hover:border-slate-600"}`}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-slate-500">{product.sku}</span>
                          <span className="text-[10px] text-amber-400 font-medium">MOQ: {product.moq.toLocaleString()} {product.unit}s</span>
                          <span className="text-[10px] text-emerald-400">₹{product.sellingPrice} / ${product.exportPrice}</span>
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <Badge variant="success" className="text-[10px] shrink-0">Added ✓</Badge>
                    ) : (
                      <button onClick={() => addProduct(product)} className="shrink-0 p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected + Config */}
        <div className="space-y-4">
          {/* Buyer Info */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Buyer / Supplier Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><label className="text-xs text-slate-400 mb-1 block">Name</label><Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Hospital / Distributor" /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Email</label><Input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} placeholder="buyer@hospital.com" /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Currency</label>
                <Select value={currency} onChange={(e) => setCurrency(e.target.value as "INR" | "USD")}>
                  <option value="INR">₹ INR (India)</option><option value="USD">$ USD (Export)</option>
                </Select>
              </div>
              <div><label className="text-xs text-slate-400 mb-1 block">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special requirements..." rows={2}
                  className="w-full rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none resize-none" />
              </div>
            </CardContent>
          </Card>

          {/* Selected Products with MOQ controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Selected ({selected.length})</CardTitle>
                {selected.length > 0 && <button onClick={() => { setSelected([]); setAiSuggestion(null); }} className="text-[10px] text-red-400 hover:text-red-300">Clear</button>}
              </div>
            </CardHeader>
            <CardContent>
              {selected.length === 0 ? (
                <div className="text-center py-6"><FileText className="w-8 h-8 text-slate-700 mx-auto mb-2" /><p className="text-xs text-slate-500">Click + on products to add</p></div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {selected.map((s) => {
                    const price = currency === "INR" ? s.product.sellingPrice : s.product.exportPrice;
                    const symbol = currency === "INR" ? "₹" : "$";
                    const belowMoq = s.quantity < s.customMoq;
                    return (
                      <div key={s.product.id} className="p-3 rounded-lg bg-slate-800/50 border border-white/[0.06]">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-xs font-medium text-white leading-snug">{s.product.name}</p>
                          <button onClick={() => removeProduct(s.product.id)} className="shrink-0 text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                        </div>

                        {/* MOQ Setting */}
                        <div className="flex items-center gap-2 mb-2 p-2 rounded bg-amber-500/5 border border-amber-500/20">
                          <Edit3 className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="text-[10px] text-amber-300 font-medium">Min MOQ:</span>
                          <input type="number" min={1} value={s.customMoq}
                            onChange={(e) => updateCustomMoq(s.product.id, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-0.5 rounded bg-slate-900 border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400" />
                          <span className="text-[10px] text-slate-500">{s.product.unit}s</span>
                          {s.customMoq !== s.product.moq && (
                            <span className="text-[9px] text-slate-600 ml-auto">(default: {s.product.moq})</span>
                          )}
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">Order Qty:</span>
                          <input type="number" min={s.customMoq} value={s.quantity}
                            onChange={(e) => updateQuantity(s.product.id, parseInt(e.target.value) || s.customMoq)}
                            className="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500" />
                          <span className="text-[10px] text-slate-500">{s.product.unit}s</span>
                        </div>

                        {belowMoq && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-red-400">
                            <AlertCircle className="w-3 h-3" /> Below minimum order
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
                          <span className="text-[10px] text-slate-500">{symbol}{price} × {s.quantity.toLocaleString()}</span>
                          <span className="text-xs font-bold text-emerald-400">{symbol}{(price * s.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total + AI + Download */}
              {selected.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Total</span>
                    <span className="text-lg font-bold text-white">{currency === "INR" ? "₹" : "$"}{getTotal().toLocaleString()}</span>
                  </div>

                  {/* NVIDIA AI Button */}
                  <Button size="sm" variant="outline" onClick={getAISuggestion} disabled={aiLoading} className="w-full">
                    {aiLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> AI Analyzing…</> : <><Brain className="w-3.5 h-3.5" /> Get AI Pricing Advice</>}
                  </Button>

                  {/* AI Suggestion */}
                  {aiSuggestion && (
                    <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] text-cyan-400 font-semibold uppercase">NVIDIA AI</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{aiSuggestion.suggestion}</p>
                    </div>
                  )}

                  <Button onClick={downloadCatalogue} className="w-full">
                    <Download className="w-4 h-4" /> Download Requirement Sheet
                  </Button>
                  {generated && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Downloaded</div>
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
