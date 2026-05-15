"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

const LEAD_TYPES = [
  { value: "HOSPITAL", label: "Hospital" },
  { value: "GOVERNMENT", label: "Government" },
  { value: "DISTRIBUTOR", label: "Distributor" },
  { value: "HOSPITAL_CHAIN", label: "Hospital Chain" },
];

interface LeadFormModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  type: string;
  contactPerson: string;
  email: string;
  phone: string;
  estimatedValue: string;
  products: string[];
  nextFollowUp: string;
}

const defaultForm: FormData = {
  name: "",
  type: "",
  contactPerson: "",
  email: "",
  phone: "",
  estimatedValue: "",
  products: [],
  nextFollowUp: "",
};

export function LeadFormModal({ open, onClose }: LeadFormModalProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Reset form when modal closes
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

  function toggleProduct(product: string) {
    setForm((prev) => ({
      ...prev,
      products: prev.products.includes(product)
        ? prev.products.filter((p) => p !== product)
        : [...prev.products, product],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    const payload = {
      name: form.name,
      type: form.type,
      contactPerson: form.contactPerson,
      email: form.email || "",
      phone: form.phone || undefined,
      estimatedValue: parseFloat(form.estimatedValue) || 0,
      products: form.products,
      nextFollowUp: form.nextFollowUp || undefined,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
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
          setApiError(data.error?.message ?? "Failed to create contact");
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
          <h2 className="text-lg font-semibold text-white">Add New Contact</h2>
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
                Organization Name <span className="text-red-400">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. City Hospital Jaipur"
                required
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Type <span className="text-red-400">*</span>
              </label>
              <Select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                required
              >
                <option value="">Select type</option>
                {LEAD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
              {errors.type && <p className="mt-1 text-xs text-red-400">{errors.type}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Contact Person <span className="text-red-400">*</span>
              </label>
              <Input
                value={form.contactPerson}
                onChange={(e) => set("contactPerson", e.target.value)}
                placeholder="e.g. Dr. Rajesh Sharma"
                required
              />
              {errors.contactPerson && <p className="mt-1 text-xs text-red-400">{errors.contactPerson}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Email
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="procurement@hospital.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Phone
              </label>
              <Input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Estimated Value (₹)
              </label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={form.estimatedValue}
                onChange={(e) => set("estimatedValue", e.target.value)}
                placeholder="500000"
              />
            </div>
          </div>

          {/* Follow-up */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Next Follow-up Date
            </label>
            <Input
              type="date"
              value={form.nextFollowUp}
              onChange={(e) => set("nextFollowUp", e.target.value)}
            />
          </div>

          {/* Product Interest */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Product Interest
            </p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.map((cat) => {
                const active = form.products.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleProduct(cat)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
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
                  Add Contact
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
