"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { PRODUCT_CATEGORIES, SUPPLIER_CERTIFICATIONS } from "@/lib/constants";

interface SupplierFormModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  location: string;
  contactPhone: string;
  email: string;
  certifications: string[];
  productCategories: string[];
  reliabilityScore: string;
  trustScore: string;
  onTimeDelivery: string;
  qualityRejectionRate: string;
}

const defaultForm: FormData = {
  name: "",
  location: "",
  contactPhone: "",
  email: "",
  certifications: [],
  productCategories: [],
  reliabilityScore: "",
  trustScore: "",
  onTimeDelivery: "",
  qualityRejectionRate: "",
};

export function SupplierFormModal({ open, onClose }: SupplierFormModalProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(defaultForm);
      setErrors({});
      setApiError(null);
    }
  }, [open]);

  if (!open) return null;

  function set(field: keyof FormData, value: string | string[]) {
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

  function toggleCategory(cat: string) {
    setForm((prev) => ({
      ...prev,
      productCategories: prev.productCategories.includes(cat)
        ? prev.productCategories.filter((c) => c !== cat)
        : [...prev.productCategories, cat],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    const payload = {
      name: form.name,
      location: form.location,
      contactPhone: form.contactPhone,
      email: form.email,
      certifications: form.certifications,
      productCategories: form.productCategories,
      reliabilityScore: parseFloat(form.reliabilityScore) || 0,
      trustScore: parseFloat(form.trustScore) || 0,
      onTimeDelivery: parseFloat(form.onTimeDelivery) || 0,
      qualityRejectionRate: parseFloat(form.qualityRejectionRate) || 0,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/suppliers", {
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
          setApiError(data.error?.message ?? "Failed to create supplier");
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
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700/50 bg-slate-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/50 bg-slate-900 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Add New Supplier</h2>
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
                Company Name <span className="text-red-400">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Gujarat MedPack Pvt Ltd"
                required
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Location <span className="text-red-400">*</span>
              </label>
              <Input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Ahmedabad, Gujarat"
                required
              />
              {errors.location && <p className="mt-1 text-xs text-red-400">{errors.location}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Contact Phone <span className="text-red-400">*</span>
              </label>
              <Input
                value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
                placeholder="+91 79 2345 6789"
                required
              />
              {errors.contactPhone && <p className="mt-1 text-xs text-red-400">{errors.contactPhone}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Email <span className="text-red-400">*</span>
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="sales@company.com"
                required
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Performance Metrics (0–100)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Reliability</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={form.reliabilityScore}
                  onChange={(e) => set("reliabilityScore", e.target.value)}
                  placeholder="85"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Trust Score</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={form.trustScore}
                  onChange={(e) => set("trustScore", e.target.value)}
                  placeholder="80"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">On-Time %</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={form.onTimeDelivery}
                  onChange={(e) => set("onTimeDelivery", e.target.value)}
                  placeholder="90"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Rejection %</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.qualityRejectionRate}
                  onChange={(e) => set("qualityRejectionRate", e.target.value)}
                  placeholder="1.5"
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

          {/* Product Categories */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Product Categories</p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.map((cat) => {
                const active = form.productCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-600/50 bg-slate-800/50 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
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
                  Add Supplier
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
