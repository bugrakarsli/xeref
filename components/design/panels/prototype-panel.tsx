"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDesignStore } from "@/store/design-store";
import { Input } from "@/components/design/ui/input";
import { Button } from "@/components/design/ui/button";
import { cn } from "@/lib/utils";
import type { PrototypeMode } from "@/types/design";

const MODES: { id: PrototypeMode; label: string; desc: string }[] = [
  { id: "wireframe", label: "Wireframe", desc: "Rough flows and ideas quickly" },
  { id: "high_fidelity", label: "High fidelity", desc: "Polished mockups with brand components" },
];

export function PrototypePanelContent() {
  const { prototypeName, setPrototypeName, prototypeMode, setPrototypeMode, resetLauncher, setMainTab } = useDesignStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!prototypeName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prototypeName,
          project_type: "prototype",
          prototype_mode: prototypeMode,
          use_speaker_notes: false,
          template_id: null,
          design_system_id: null,
          visibility: "org",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error || "Couldn't create project");
        return;
      }
      toast.success("Prototype created");
      resetLauncher();
      setMainTab("your_designs");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight">New prototype</h2>
      <Input placeholder="Project name" value={prototypeName} onChange={(e) => setPrototypeName(e.target.value)} aria-label="Prototype project name" />
      <div className="grid grid-cols-2 gap-3">
        {MODES.map(({ id, label, desc }) => (
          <button key={id} onClick={() => setPrototypeMode(id)}
            className={cn("rounded-xl border p-2.5 text-left transition-all", prototypeMode === id ? "border-accent shadow-[inset_0_0_0_1px_var(--accent)]" : "border-border bg-surface-soft hover:border-border-strong")}>
            <div className="h-20 rounded-lg border border-dashed border-border bg-surface-muted mb-2" />
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-muted mt-0.5">{desc}</p>
          </button>
        ))}
      </div>
      <Button variant="primary" fullWidth disabled={!prototypeName.trim() || loading} onClick={handleCreate}>
        {loading ? "Creating…" : "Create"}
      </Button>
    </div>
  );
}
