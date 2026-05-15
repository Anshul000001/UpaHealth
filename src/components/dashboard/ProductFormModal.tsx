"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { PRODUCT_CATEGORIES, SUPPLIER_CERTIFICATIONS } from "@/lib/constants";

const UNITS = ["piece", "box", "carton", "pack", "roll", "pair", "set", "kit", "vial", "ampoule"];

interface Supplier {
  id: string;
  name: string;
}

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  category: string;
  sku: string;
  costPrice: string;
  sellingPrice: string;
  exportPrice: string;
  moq: string;
  unit: string;
  supplierId: string;
  leadTime: string;
  certifications: string[];
  exportAvailable: boolean;
  stock: string;
  targetMargin: string;
  competitorPriceMin: string;
  competitorPriceMax: string;
}

const defaultForm: FormData = {
  name: "",
  category: "",
  sku: "",
  costPrice: "",
  sellingPrice: "",
  exportPrice: "",
  moq: "",
  unit: "piece",
  supplierId: "",
  leadTime: "",
  certifications: [],
  exportAvailable: true,
  stock: "0",
  targetMargin: "",
  competitorPriceMin: "",
  competitorPriceMax: "",
};

export function ProductFormModal({ open, onClose }: ProductFormModalProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch suppliers when modal opens
  useEffect(() => {
    if (!open) return;
    fetch("/api/suppliers?pageSize=100")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setSuppliers(res.data);
      })
      .catch(() => {});
  }, [open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setForm(defaultForm);
      setErrors({});
      setApiError(null);
    }
  }, [open]);

  if (!open) return null;

  function set(field: keyof FormData, value: string | boolean | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function toggleCert(cert: string) {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    const payload = {
      name: form.name,
      category: form.category,
      sku: form.sku,
      costPrice: parseFloat(form.costPrice),
      sellingPrice: parseFloat(form.sellingPrice),
      exportPrice: parseFloat(form.exportPrice),
      moq: parseInt(form.moq, 10),
      unit: form.unit,
      supplierId: form.supplierId,
      leadTime: form.leadTime,
      certifications: form.certifications,
      exportAvailable: form.exportAvailable,
      stock: parseInt(form.stock, 10) || 0,
      ...(form.targetMargin ? { targetMargin: parseFloat(form.targetMargin) } : {}),
      ...(form.competitorPriceMin ? { competitorPriceMin: parseFloat(form.competitorPriceMin) } : {}),
      ...(form.competitorPriceMax ? { competitorPriceMax: parseFloat(form.competitorPriceMax) } : {}),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.error?.fields) {
          const fieldErrors: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(data.error.fields)) {
            fieldErrors[key] = (msgs as string[])[0];
          }
          setErrors(fieldErrors);
        } else {
          setApiError(data.error?.message ?? "Failed to create product");
        }
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700/50 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/50 bg-slate-900 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Add New Product</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {apiError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {apiError}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Product Name <span className="text-red-400">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Surgical Drape Kit"
                required
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                SKU <span className="text-red-400">*</span>
              </label>
              <Input
                value={form.sku}
                onChange={(e) => set("sku", e.target.value.toUpperCase())}
                placeholder="e.g. SDK-001"
                required
              />
              {errors.sku && <p className="mt-1 text-xs text-red-400">{errors.sku}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Category <span className="text-red-400">*</span>
              </label>
              <Select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                required
              >
                <option value="">Select category</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
              {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Supplier <span className="text-red-400">*</span>
              </label>
              <Select
                value={form.supplierId}
                onChange={(e) => set("supplierId", e.target.value)}
                required
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
              {errors.supplierId && <p className="mt-1 text-xs text-red-400">{errors.supplierId}</p>}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Pricing</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Cost Price (₹) <span className="text-red-400">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPrice}
                  onChange={(e) => set("costPrice", e.target.value)}
                  placeholder="0.00"
                  required
                />
                {errors.costPrice && <p className="mt-1 text-xs text-red-400">{errors.costPrice}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Selling Price (₹) <span className="text-red-400">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={(e) => set("sellingPrice", e.target.value)}
                  placeholder="0.00"
                  required
                />
                {errors.sellingPrice && <p className="mt-1 text-xs text-red-400">{errors.sellingPrice}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Export Price ($) <span className="text-red-400">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.exportPrice}
                  onChange={(e) => set("exportPrice", e.target.value)}
                  placeholder="0.00"
                  required
                />
                {errors.exportPrice && <p className="mt-1 text-xs text-red-400">{errors.exportPrice}</p>}
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Inventory</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  MOQ <span className="text-red-400">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={form.moq}
                  onChange={(e) => set("moq", e.target.value)}
                  placeholder="100"
                  required
                />
                {errors.moq && <p className="mt-1 text-xs text-red-400">{errors.moq}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Unit <span className="text-red-400">*</span>
                </label>
                <Select
                  value={form.unit}
                  onChange={(e) => set("unit", e.target.value)}
                  required
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Stock</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Lead Time <span className="text-red-400">*</span>
                </label>
                <Input
                  value={form.leadTime}
                  onChange={(e) => set("leadTime", e.target.value)}
                  placeholder="7-10 days"
                  required
                />
                {errors.leadTime && <p className="mt-1 text-xs text-red-400">{errors.leadTime}</p>}
              </div>
            </div>
          </div>

          {/* Optional fields */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Optional — Competitor Pricing & Margin
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Target Margin (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.targetMargin}
                  onChange={(e) => set("targetMargin", e.target.value)}
                  placeholder="30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Competitor Min (₹)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.competitorPriceMin}
                  onChange={(e) => set("competitorPriceMin", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Competitor Max (₹)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.competitorPriceMax}
                  onChange={(e) => set("competitorPriceMax", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Certifications</p>
            <div className="flex flex-wrap gap-2">
              {SUPPLIER_CERTIFICATIONS.map((cert) => {
                const active = form.certifications.includes(cert);
                return (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => toggleCert(cert)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                        : "border-slate-600/50 bg-slate-800/50 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {cert}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set("exportAvailable", !form.exportAvailable)}
              className={`relative h-5 w-9 rounded-full transition-colors ${
                form.exportAvailable ? "bg-cyan-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  form.exportAvailable ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-sm text-slate-300">Available for export</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-700/50 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Add Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
