"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { useDesignStore } from "@/store/design-store";
import { Button } from "@/components/design/ui/button";
import { Input } from "@/components/design/ui/input";

export function CreateDesignSystemModal({ open }: { open: boolean }) {
  const closeModal = useDesignStore((s) => s.closeModal);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/design-systems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: desc }),
      });
      if (!res.ok) throw new Error("Failed");
      closeModal(); setName(""); setDesc("");
    } finally { setLoading(false); }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && closeModal()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border shadow-[var(--shadow-card)] p-6">
            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-muted text-muted flex items-center justify-center hover:bg-border-strong" aria-label="Close">
                <X size={16} />
              </button>
            </Dialog.Close>
            <Dialog.Title className="text-2xl font-extrabold tracking-tight mb-1">New design system</Dialog.Title>
            <Dialog.Description className="text-muted text-sm mb-6">Teach Xeref your brand&apos;s colors, typography, and component patterns.</Dialog.Description>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="ds-name">System name</label>
                <Input id="ds-name" placeholder="e.g. Xeref Brand System" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="ds-desc">
                  Description <span className="text-faint">(optional)</span>
                </label>
                <Input id="ds-desc" placeholder="What products or teams does this cover?" value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={closeModal}>Cancel</Button>
              <Button variant="accent" disabled={!name.trim() || loading} onClick={handleCreate}>
                {loading ? "Creating…" : "Create system"}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
