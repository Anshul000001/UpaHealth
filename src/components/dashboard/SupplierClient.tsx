"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupplierFormModal } from "./SupplierFormModal";

export function AddSupplierButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="w-3.5 h-3.5" /> Add Supplier
      </Button>
      <SupplierFormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
