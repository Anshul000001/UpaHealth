"use client";

import { useState, useRef } from "react";
import {
  Upload, FileText, Sparkles, CheckCircle2, Bot, File,
  Loader2, AlertCircle, X, Send, Edit3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ParsedItem {
  raw: string;
  productName: string;
  quantity: number;
  unit: string;
  specifications: string;
  matchedProductId: string | null;
  matchedProductName: string | null;
  matchedSku: string | null;
  unitPrice: number | null;
  estimatedTotal: number | null;
  confidence: "high" | "medium" | "low";
}

interface RFQResult {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCountry: string;
  rfqDate: string;
  deliveryRequired: string;
  currency: "INR" | "USD";
  items: ParsedItem[];
  totalEstimate: number;
  matchedItemCount: number;
  totalItemCount: number;
  notes: string;
}

export default function RFQPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RFQResult | null>(null);
  const [sourceName, setSourceName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function parseFile(file: File) {
    setError(null);
    setResult(null);
    setLoading(true);
    setSourceName(file.name);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/ai/rfq-parse", { method: "POST", body: form });
      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || "Parsing failed");
        return;
      }
      setResult(data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function parsePastedText() {
    if (!pasteText.trim()) return;
    setError(null);
    setResult(null);
    setLoading(true);
    setSourceName("Pasted RFQ text");

    try {
      const res = await fetch("/api/ai/rfq-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || "Parsing failed");
        return;
      }
      setResult(data.data);
      setShowPaste(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }

  function reset() {
    setResult(null);
    setError(null);
    setSourceName("");
    setPasteText("");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI RFQ Parser</h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload an RFQ — AI extracts products, quantities, and matches them to your catalog
          </p>
        </div>
        {result && (
          <Button variant="outline" onClick={reset} size="sm">
            <X className="w-3.5 h-3.5" /> New RFQ
          </Button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-400 font-medium">Parsing failed</p>
            <p className="text-xs text-red-300 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload zone OR results */}
      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-8">
                {showPaste ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Paste RFQ Text</h3>
                      <button onClick={() => setShowPaste(false)} className="text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder="Paste your RFQ text here. Example:&#10;&#10;ABC Hospital&#10;Email: procurement@abchospital.com&#10;&#10;We need:&#10;1. IV Cannula 20G — 5000 pcs&#10;2. PPE Kits — 200 sets&#10;3. Surgical gloves Medium — 100 boxes&#10;&#10;Delivery: within 2 weeks"
                      rows={14}
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none font-mono disabled:opacity-50"
                    />
                    <div className="flex items-center gap-2">
                      <Button onClick={parsePastedText} disabled={loading || !pasteText.trim()}>
                        {loading ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Parsing…</>
                        ) : (
                          <><Sparkles className="w-3.5 h-3.5" /> Parse with AI</>
                        )}
                      </Button>
                      <span className="text-xs text-slate-500">{pasteText.length.toLocaleString()} characters</span>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                      isDragging ? "border-cyan-500 bg-cyan-500/5" : "border-slate-700 hover:border-slate-600"
                    } ${loading ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt,.eml,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) parseFile(file);
                      }}
                    />
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
                      {loading ? (
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8 text-cyan-400" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {loading ? "Parsing RFQ…" : "Drop your RFQ here"}
                    </h3>
                    <p className="text-sm text-slate-400 mb-6">
                      {loading ? `Reading ${sourceName}` : "Supports PDF, Word (.docx), and plain text (.txt, .eml)"}
                    </p>
                    {!loading && (
                      <div className="flex items-center justify-center gap-3">
                        <Button onClick={() => fileInputRef.current?.click()}>
                          <Upload className="w-3.5 h-3.5" /> Browse Files
                        </Button>
                        <Button variant="outline" onClick={() => setShowPaste(true)}>
                          <Edit3 className="w-3.5 h-3.5" /> Paste RFQ Text
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-slate-600 mt-4">Max file size: 10 MB</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  AI Processing Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { step: 1, title: "Extract", desc: "Read PDF/DOCX/text", icon: File },
                    { step: 2, title: "Parse", desc: "AI identifies items", icon: Bot },
                    { step: 3, title: "Match", desc: "Match against catalog", icon: Sparkles },
                    { step: 4, title: "Quote", desc: "Generate quotation", icon: FileText },
                  ].map((item) => (
                    <div key={item.step} className="text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3">
                        <item.icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>How it works</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "Upload PDF/DOCX or paste RFQ text",
                    "AI reads buyer name, email, products",
                    "Each item matched to your Romsons catalog",
                    "See estimated total in INR or USD",
                    "Convert to a quotation in one click",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-xs text-slate-300">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <ParsedRFQResult result={result} sourceName={sourceName} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Parsed result card
// ─────────────────────────────────────────────────────────────────
function ParsedRFQResult({ result, sourceName }: { result: RFQResult; sourceName: string }) {
  const symbol = result.currency === "INR" ? "₹" : "$";
  const [creating, setCreating] = useState(false);
  const [createdQuotation, setCreatedQuotation] = useState<{ id: string; quotationId: string } | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  async function generateQuotation() {
    const matchedItems = result.items.filter(
      (it) => it.matchedProductId && it.unitPrice && it.unitPrice > 0
    );
    if (matchedItems.length === 0) {
      setCreateError("No matched items with prices to convert. Add items to your catalog first.");
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const payload = {
        buyerName: result.buyerName,
        buyerEmail: result.buyerEmail || undefined,
        buyerCountry: result.buyerCountry,
        currency: result.currency,
        validityDays: 30,
        freight: 0,
        notes: result.notes || `Auto-generated from RFQ: ${sourceName}`,
        lineItems: matchedItems.map((it) => ({
          productId: it.matchedProductId!,
          productName: it.matchedProductName || it.productName,
          quantity: it.quantity,
          unitPrice: it.unitPrice!,
          costPrice: it.unitPrice! * 0.8, // estimated cost (20% margin)
          gstRate: result.currency === "INR" ? 12 : 0,
          discount: 0,
        })),
      };

      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setCreateError(data.error?.message || "Failed to create quotation");
        return;
      }
      setCreatedQuotation({ id: data.data.id, quotationId: data.data.quotationId });
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Network error");
    } finally {
      setCreating(false);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RFQ-${result.buyerName.replace(/\s+/g, "-")}-${result.rfqDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Buyer header */}
      <Card className="border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Parsed Successfully</h3>
                <Badge variant="info" className="text-[10px]">{sourceName}</Badge>
              </div>
              <p className="text-xs text-slate-400">
                {result.matchedItemCount} of {result.totalItemCount} items matched to catalog
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Estimated Total</p>
              <p className="text-2xl font-bold text-white">
                {symbol}{result.totalEstimate.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500">{result.currency}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/[0.06]">
            <Field label="Buyer" value={result.buyerName} />
            <Field label="Email" value={result.buyerEmail || "—"} />
            <Field label="Phone" value={result.buyerPhone || "—"} />
            <Field label="Country" value={result.buyerCountry} />
            <Field label="RFQ Date" value={result.rfqDate} />
            <Field label="Delivery" value={result.deliveryRequired} />
            <Field label="Currency" value={result.currency} />
            <Field label="Items" value={`${result.totalItemCount} line items`} />
          </div>
        </CardContent>
      </Card>

      {/* Quotation creation result */}
      {createdQuotation && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Quotation created: {createdQuotation.quotationId}</p>
            <p className="text-xs text-emerald-300">Ready to view and send to buyer</p>
          </div>
          <Button size="sm" onClick={() => window.location.href = "/dashboard/quotations"}>
            View Quotation
          </Button>
        </div>
      )}
      {createError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-400 font-medium">Could not create quotation</p>
            <p className="text-xs text-red-300 mt-0.5">{createError}</p>
          </div>
        </div>
      )}

      {/* Line items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {result.items.map((item, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border ${
                  item.matchedProductId
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-amber-500/20 bg-amber-500/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.matchedProductId ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span className="text-sm font-medium text-white">
                        {item.matchedProductName || item.productName}
                      </span>
                      {item.matchedSku && (
                        <span className="text-[10px] text-slate-500 font-mono">{item.matchedSku}</span>
                      )}
                      <Badge
                        variant={
                          item.confidence === "high" ? "success" :
                          item.confidence === "medium" ? "warning" : "danger"
                        }
                        className="text-[9px]"
                      >
                        {item.confidence}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 flex-wrap">
                      <span>Qty: <strong className="text-white">{item.quantity.toLocaleString()} {item.unit}s</strong></span>
                      {item.unitPrice && (
                        <span>Unit: {symbol}{item.unitPrice}</span>
                      )}
                      {item.specifications && (
                        <span className="text-slate-500">{item.specifications}</span>
                      )}
                    </div>
                    {item.raw && item.raw !== item.productName && (
                      <p className="text-[10px] text-slate-600 mt-1 italic line-clamp-1">
                        Raw: {item.raw}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {item.estimatedTotal !== null ? (
                      <p className="text-sm font-bold text-emerald-400">
                        {symbol}{item.estimatedTotal.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-400">No price</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {result.notes && (
            <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-white/[0.06]">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Notes</p>
              <p className="text-xs text-slate-300">{result.notes}</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
            <Button onClick={generateQuotation} disabled={creating || !!createdQuotation}>
              {creating ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…</>
              ) : createdQuotation ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Quotation Created</>
              ) : (
                <><Send className="w-3.5 h-3.5" /> Generate Quotation</>
              )}
            </Button>
            <Button variant="outline" onClick={exportJson}>
              <FileText className="w-3.5 h-3.5" /> Export JSON
            </Button>
            <span className="text-xs text-slate-500 ml-auto">
              {result.items.filter((i) => i.matchedProductId && i.unitPrice).length} items will be added to quotation
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-xs text-white mt-0.5 truncate" title={value}>{value}</p>
    </div>
  );
}
