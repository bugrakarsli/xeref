"use client";
import { useDesignStore } from "@/store/design-store";
import { Button } from "@/components/design/ui/button";
import { cn } from "@/lib/utils";
import type { DesignSystem, ProjectTemplate } from "@/types/design";

type MainTab = "recent" | "your_designs" | "examples" | "design_systems";
const TABS: { id: MainTab; label: string }[] = [
  { id: "recent", label: "Recent" },
  { id: "your_designs", label: "Your designs" },
  { id: "examples", label: "Examples" },
  { id: "design_systems", label: "Design systems" },
];

export function MainContent({ orgName, designSystems, templates }: { orgName: string; designSystems: DesignSystem[]; templates: ProjectTemplate[] }) {
  const { mainTab, setMainTab, openCreateDesignSystem } = useDesignStore();
  return (
    <main className="flex-1 overflow-y-auto p-8" id="main-content">
      <nav className="flex gap-2 flex-wrap mb-8" aria-label="Sections">
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setMainTab(id)}
            className={cn("px-4 py-2.5 rounded-xl border font-semibold text-sm transition-colors", mainTab === id ? "bg-surface border-border-strong text-text" : "bg-surface-soft border-border text-muted hover:text-text")}>
            {label}
          </button>
        ))}
      </nav>

      {mainTab === "design_systems" && (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight mb-1">Organization settings</h2>
            <p className="text-muted">Manage design systems and templates for everyone in {orgName}.</p>
          </div>

          <section className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Design systems</p>
            <div className="rounded-2xl border border-border bg-surface shadow-[var(--shadow-soft)] overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold">Create new design system</p>
                  <p className="text-sm text-muted">Teach Xeref your brand and product.</p>
                </div>
                <Button variant="accent" size="sm" onClick={openCreateDesignSystem}>Create</Button>
              </div>
              {designSystems.length > 0 && (
                <ul className="border-t border-border divide-y divide-border">
                  {designSystems.map((ds) => (
                    <li key={ds.id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="font-semibold text-sm">{ds.name}</p>
                        {ds.description && <p className="text-xs text-muted mt-0.5">{ds.description}</p>}
                      </div>
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", ds.is_active ? "bg-green-900/40 text-green-400" : "bg-surface-muted text-muted")}>
                        {ds.is_active ? "Active" : "Inactive"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Templates</p>
            <div className="rounded-2xl border border-border bg-surface shadow-[var(--shadow-soft)]">
              {templates.length === 0
                ? <div className="flex items-center justify-center min-h-24 px-6 py-8"><p className="text-muted text-sm text-center">No templates yet. Create one from any project via Share &rarr; File type.</p></div>
                : <ul className="divide-y divide-border">{templates.map((t) => (
                  <li key={t.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      {t.description && <p className="text-xs text-muted mt-0.5">{t.description}</p>}
                    </div>
                    <span className="text-xs text-muted border border-border rounded-full px-2 py-0.5">{t.project_type}</span>
                  </li>
                ))}</ul>
              }
            </div>
          </section>
          <p className="text-xs text-muted">Everyone in your organization can view these settings.</p>
        </>
      )}
      {mainTab !== "design_systems" && (
        <div className="flex items-center justify-center h-64 text-muted text-sm">This view is coming in the next release.</div>
      )}
    </main>
  );
}
