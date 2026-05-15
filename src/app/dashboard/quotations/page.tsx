"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Download,
  Send,
  Calculator,
  Sparkles,
  FileText,
  IndianRupee,
  Package,
  CheckCircle2,
  Loader2,
  Mail,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { generateQuotationId } from "@/lib/utils";
import { CURRENCIES, GST_RATES } from "@/lib/constants";
import { generateQuotationPDF } from "@/lib/generate-pdf";

interface ProductOption {
  id: string;
  name: string;
  sellingPrice: number;
  exportPrice: number;
  costPrice: number;
  sku: string;
}

interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  discount: number;
  total: number;
}

export default function QuotationsPage() {
  const [quotationId] = useState(generateQuotationId());
  const [currency, setCurrency] = useState("INR");
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [freight, setFreight] = useState(0);
  const [validityDays, setValidityDays] = useState(15);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error">("idle");
  const [emailMessage, setEmailMessage] = useState("");

  // Fetch products from API on mount
  useEffect(() => {
    fetch("/api/products?pageSize=100")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setProducts(res.data.map((p: ProductOption & Record<string, unknown>) => ({
            id: p.id,
            name: p.name,
            sellingPrice: p.sellingPrice,
            exportPrice: p.exportPrice,
            costPrice: p.costPrice,
            sku: p.sku,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const addItem = () => {
    const newItem: QuotationItem = {
      id: `item-${Date.now()}`,
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      gstRate: 18,
      discount: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "productId") {
            const product = products.find((p) => p.id === value);
            if (product) {
              updated.productName = product.name;
              updated.unitPrice = currency === "INR" ? product.sellingPrice : product.exportPrice;
            }
          }
          const subtotal = updated.quantity * updated.unitPrice;
          const discountAmount = subtotal * (updated.discount / 100);
          const taxableAmount = subtotal - discountAmount;
          const gstAmount = taxableAmount * (updated.gstRate / 100);
          updated.total = taxableAmount + gstAmount;
          return updated;
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalDiscount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * (item.discount / 100),
    0
  );
  const totalGST = items.reduce((sum, item) => {
    const taxable = item.quantity * item.unitPrice * (1 - item.discount / 100);
    return sum + taxable * (item.gstRate / 100);
  }, 0);
  const grandTotal = subtotal - totalDiscount + totalGST + freight;

  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || "₹";

  const handleDownloadPDF = async () => {
    await generateQuotationPDF({
      quotationId,
      buyerName: buyerName || "Unnamed Buyer",
      buyerEmail,
      buyerAddress,
      currency,
      currencySymbol,
      validityDays,
      items,
      subtotal,
      totalDiscount,
      totalGST,
      freight,
      grandTotal,
      notes,
    });
    setPdfGenerated(true);
    setTimeout(() => setPdfGenerated(false), 3000);
  };

  const handleSendEmail = async () => {
    if (!buyerEmail) {
      setEmailStatus("error");
      setEmailMessage("Please enter buyer email address");
      setTimeout(() => setEmailStatus("idle"), 4000);
      return;
    }
    if (items.length === 0) {
      setEmailStatus("error");
      setEmailMessage("Please add at least one product to the quotation");
      setTimeout(() => setEmailStatus("idle"), 4000);
      return;
    }

    setEmailSending(true);
    setEmailStatus("idle");

    try {
      const res = await fetch("/api/communications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: buyerEmail,
          subject: `Quotation ${quotationId} from UpaHealth Supplies`,
          template: "quotation",
          templateData: {
            buyerName: buyerName || "Valued Customer",
            quotationId,
            grandTotal,
            currency,
            validityDays,
          },
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEmailStatus("success");
        setEmailMessage(`Quotation sent to ${buyerEmail}`);
      } else {
        setEmailStatus("error");
        setEmailMessage(data.error?.message || data.message || "Failed to send email");
      }
    } catch (err) {
      setEmailStatus("error");
      setEmailMessage((err as Error).message);
    } finally {
      setEmailSending(false);
      setTimeout(() => setEmailStatus("idle"), 5000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* PDF Success Toast */}
      {pdfGenerated && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          PDF downloaded successfully!
        </div>
      )}

      {/* Email Status Toast */}
      {emailStatus === "success" && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium animate-fade-in">
          <Mail className="w-4 h-4" />
          {emailMessage}
        </div>
      )}
      {emailStatus === "error" && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium animate-fade-in">
          <AlertCircle className="w-4 h-4" />
          {emailMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Quotation Generator</h1>
          <p className="text-slate-400 text-sm mt-1">
            Create professional quotations with AI-powered pricing intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Sparkles className="w-3.5 h-3.5" /> AI Suggest Pricing
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
            <Download className="w-3.5 h-3.5" /> Export PDF
          </Button>
          <Button size="sm" onClick={handleSendEmail} disabled={emailSending}>
            {emailSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {emailSending ? "Sending..." : "Send Quotation"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Quotation Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quotation Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Quotation Details
                </CardTitle>
                <Badge variant="info">{quotationId}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Buyer / Hospital Name</label>
                  <Input
                    placeholder="e.g., City Hospital Jaipur"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Buyer Email</label>
                  <Input
                    placeholder="procurement@hospital.com"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Currency</label>
                  <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.code} — {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Validity (Days)</label>
                  <Input
                    type="number"
                    value={validityDays}
                    onChange={(e) => setValidityDays(Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 mb-1.5 block">Buyer Address</label>
                  <Input
                    placeholder="Full address for quotation"
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button size="sm" onClick={addItem}>
                  <Plus className="w-3.5 h-3.5" /> Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-700 rounded-lg">
                  <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No items added yet</p>
                  <p className="text-slate-600 text-xs mt-1">Click &quot;Add Product&quot; to start building your quotation</p>
                  <Button size="sm" className="mt-4" onClick={addItem}>
                    <Plus className="w-3.5 h-3.5" /> Add First Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 font-medium px-2">
                    <div className="col-span-4">Product</div>
                    <div className="col-span-1">Qty</div>
                    <div className="col-span-2">Unit Price</div>
                    <div className="col-span-1">GST %</div>
                    <div className="col-span-1">Disc %</div>
                    <div className="col-span-2">Total</div>
                    <div className="col-span-1"></div>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg bg-slate-800/30 border border-white/5"
                    >
                      <div className="col-span-4">
                        <Select
                          value={item.productId}
                          onChange={(e) => updateItem(item.id, "productId", e.target.value)}
                        >
                          <option value="">Select product...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-1">
                        <Select
                          value={item.gstRate}
                          onChange={(e) => updateItem(item.id, "gstRate", Number(e.target.value))}
                        >
                          {GST_RATES.map((rate) => (
                            <option key={rate} value={rate}>
                              {rate}%
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={item.discount}
                          onChange={(e) => updateItem(item.id, "discount", Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-white px-2">
                          {currencySymbol}{item.total.toFixed(2)}
                        </p>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Terms & Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                placeholder="Payment terms, delivery conditions, special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-cyan-400" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white">{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Discount</span>
                  <span className="text-red-400">-{currencySymbol}{totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">GST</span>
                  <span className="text-white">{currencySymbol}{totalGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Freight</span>
                  <Input
                    type="number"
                    className="w-24 text-right"
                    value={freight}
                    onChange={(e) => setFreight(Number(e.target.value))}
                  />
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Grand Total</span>
                    <span className="text-xl font-bold gradient-text">
                      {currencySymbol}{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Margin Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
                Margin Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.filter(i => i.productId).map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  if (!product) return null;
                  const margin = ((item.unitPrice - product.costPrice) / item.unitPrice) * 100;
                  return (
                    <div key={item.id} className="p-3 rounded-lg bg-slate-800/30 border border-white/5">
                      <p className="text-xs text-slate-400 truncate">{product.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-500">
                          Cost: {currencySymbol}{product.costPrice}
                        </span>
                        <Badge variant={margin > 30 ? "success" : margin > 15 ? "warning" : "danger"}>
                          {margin.toFixed(1)}% margin
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {items.filter(i => i.productId).length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">
                    Add products to see margin analysis
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  size="sm"
                  onClick={handleDownloadPDF}
                >
                  <Download className="w-3.5 h-3.5" /> Download as PDF
                </Button>
                <Button variant="secondary" className="w-full justify-start" size="sm" onClick={handleSendEmail} disabled={emailSending}>
                  {emailSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {emailSending ? "Sending..." : "Email to Buyer"}
                </Button>
                <Button variant="secondary" className="w-full justify-start" size="sm">
                  <FileText className="w-3.5 h-3.5" /> Save as Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
