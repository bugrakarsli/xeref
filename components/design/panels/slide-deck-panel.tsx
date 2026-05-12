"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as Switch from "@radix-ui/react-switch";
import { useDesignStore } from "@/store/design-store";
import { Input } from "@/components/design/ui/input";
import { Button } from "@/components/design/ui/button";

export function SlideDeckPanelContent() {
  const { slideDeckName, setSlideDeckName, useSpeakerNotes, setUseSpeakerNotes, resetLauncher, setMainTab } = useDesignStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!slideDeckName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: slideDeckName,
          project_type: "slide_deck",
          prototype_mode: null,
          use_speaker_notes: useSpeakerNotes,
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
      toast.success("Slide deck created");
      resetLauncher();
      setMainTab("your_designs");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight">New slide deck</h2>
      <Input placeholder="Project name" value={slideDeckName} onChange={(e) => setSlideDeckName(e.target.value)} aria-label="Slide deck project name" />
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-soft px-3.5 py-3">
        <div>
          <p className="text-sm font-semibold">Use speaker notes</p>
          <p className="text-xs text-muted">Less text on slides</p>
        </div>
        <Switch.Root checked={useSpeakerNotes} onCheckedChange={setUseSpeakerNotes} id="speaker-notes"
          className="w-12 h-6 rounded-full border border-border-strong bg-surface-muted data-[state=checked]:bg-accent transition-colors">
          <Switch.Thumb className="block w-5 h-5 rounded-full bg-white shadow translate-x-0.5 transition-transform data-[state=checked]:translate-x-[26px]" />
        </Switch.Root>
      </div>
      <Button variant="primary" fullWidth disabled={!slideDeckName.trim() || loading} onClick={handleCreate}>
        {loading ? "Creating…" : "Create"}
      </Button>
    </div>
  );
}
