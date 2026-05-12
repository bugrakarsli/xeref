"use client";
import { cn } from "@/lib/utils";
import type { DesignProject, ProjectType } from "@/types/design";

const TYPE_LABELS: Record<ProjectType, string> = {
  prototype: "Prototype",
  slide_deck: "Slide deck",
  template: "Template",
  other: "Other",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function ProjectCard({ project }: { project: DesignProject }) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-[var(--shadow-soft)] overflow-hidden hover:border-border-strong transition-colors cursor-pointer">
      <div className="h-28 bg-surface-muted flex items-center justify-center border-b border-border">
        <span className="text-xs text-muted">
          {TYPE_LABELS[project.project_type]}
        </span>
      </div>
      <div className="p-3.5">
        <p className="text-sm font-semibold truncate">{project.name}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted">
            {TYPE_LABELS[project.project_type]}
          </span>
          {project.prototype_mode && (
            <span className="text-xs text-muted capitalize">{project.prototype_mode.replace("_", " ")}</span>
          )}
          <span className="text-xs text-muted ml-auto">{timeAgo(project.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}

interface ProjectsGridProps {
  items: DesignProject[];
  emptyLabel?: string;
  emptyAction?: React.ReactNode;
}

export function ProjectsGrid({ items, emptyLabel = "Nothing here yet.", emptyAction }: ProjectsGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted text-sm">
        <p>{emptyLabel}</p>
        {emptyAction}
      </div>
    );
  }
  return (
    <div className={cn("grid gap-4", "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4")}>
      {items.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}
