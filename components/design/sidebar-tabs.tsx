"use client";
import { useDesignStore } from "@/store/design-store";
import { cn } from "@/lib/utils";
import type { ProjectType } from "@/types/design";

const TABS: { id: ProjectType; label: string }[] = [
  { id: "prototype", label: "Prototype" },
  { id: "slide_deck", label: "Slide deck" },
  { id: "template", label: "From template" },
  { id: "other", label: "Other" },
];

export function SidebarTabs() {
  const { activeTab, setActiveTab } = useDesignStore();
  return (
    <div role="tablist" aria-label="Project types" className="grid grid-cols-4 border-b border-border bg-surface-soft rounded-t-2xl overflow-hidden">
      {TABS.map(({ id, label }) => (
        <button key={id} role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)}
          className={cn("py-3 px-2 text-xs font-semibold text-center transition-colors", activeTab === id ? "bg-surface text-text" : "text-muted hover:text-text")}>
          {label}
        </button>
      ))}
    </div>
  );
}
