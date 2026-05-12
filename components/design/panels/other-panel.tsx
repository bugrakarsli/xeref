"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDesignStore } from "@/store/design-store";
import { Input } from "@/components/design/ui/input";
import { Button } from "@/components/design/ui/button";

export function OtherPanelContent() {
  const { otherName, setOtherName, resetLauncher, setMainTab } = useDesignStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!otherName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: otherName,
          project_type: "other",
          prototype_mode: null,
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
      toast.success("Project created");
      resetLauncher();
      setMainTab("your_designs");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight">New project</h2>
      <Input placeholder="Project name" value={otherName} onChange={(e) => setOtherName(e.target.value)} aria-label="Other project name" />
      <Button variant="primary" fullWidth disabled={!otherName.trim() || loading} onClick={handleCreate}>
        {loading ? "Creating…" : "Create"}
      </Button>
    </div>
  );
}
