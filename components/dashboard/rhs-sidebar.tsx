import Link from 'next/link'

export function RhsSidebar() {
  return (
    <aside
      aria-label="Right sidebar"
      className="hidden lg:flex flex-col w-14 border-l bg-card shrink-0"
    >
      {/* Spacer */}
      <div className="flex-1" />

      {/* Changelog badge */}
      <div className="flex justify-center pb-4">
        <Link
          href="/changelog"
          className="flex items-center gap-1 rounded-full border border-primary/30 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/60 hover:text-foreground"
          title="Changelog"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          v1.7
        </Link>
      </div>
    </aside>
  )
}
