"use client";
import { useDesignStore } from "@/store/design-store";
import { Input } from "@/components/design/ui/input";
import { Button } from "@/components/design/ui/button";
import { cn } from "@/lib/utils";

const BUILTIN = [{ id: "animation", label: "Animation", desc: "Timeline-based motion design" }];

export function TemplatePanelContent() {
  const { templateName, setTemplateName, selectedTemplateId, setSelectedTemplateId } = useDesignStore();
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
      <Button variant="primary" fullWidth disabled={!templateName.trim() || !selectedTemplateId}>Create from template</Button>
    </div>
  );
}
