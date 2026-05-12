"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDesignStore } from "@/store/design-store";
import { Input } from "@/components/design/ui/input";
import { Button } from "@/components/design/ui/button";
import { cn } from "@/lib/utils";

const BUILTIN = [{ id: "animation", label: "Animation", desc: "Timeline-based motion design" }];

export function TemplatePanelContent() {
  const { templateName, setTemplateName, selectedTemplateId, setSelectedTemplateId, resetLauncher, setMainTab } = useDesignStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!templateName.trim() || !selectedTemplateId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          project_type: "template",
          prototype_mode: null,
          use_speaker_notes: false,
          template_id: selectedTemplateId,
          design_system_id: null,
          visibility: "org",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error || "Couldn't create project");
        return;
      }
      toast.success("Project created from template");
      resetLauncher();
      setMainTab("your_designs");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight">Start from a template</h2>
      <Input placeholder="Project name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} aria-label="Template project name" />
      <div className="space-y-2">
        {BUILTIN.map((t) => (
          <button key={t.id} onClick={() => setSelectedTemplateId(t.id)}
            className={cn("w-full flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all", selectedTemplateId === t.id ? "border-accent bg-surface-muted" : "border-border bg-surface-soft hover:border-border-strong")}>
            <span className={cn("w-4 h-4 rounded-full border-2 flex-shrink-0", selectedTemplateId === t.id ? "border-accent bg-accent" : "border-border")} />
            <span>
              <span className="block text-sm font-semibold">{t.label}</span>
              <span className="block text-xs text-muted">{t.desc}</span>
            </span>
          </button>
        ))}
      </div>
      <a className="block text-xs text-muted underline" href="#">How to create a template</a>
      <Button variant="primary" fullWidth disabled={!templateName.trim() || !selectedTemplateId || loading} onClick={handleCreate}>
        {loading ? "Creating…" : "Create from template"}
      </Button>
    </div>
  );
}
