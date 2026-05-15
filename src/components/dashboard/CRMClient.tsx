"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadFormModal } from "./LeadFormModal";

export function AddContactButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="w-3.5 h-3.5" /> Add Contact
      </Button>
      <LeadFormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
