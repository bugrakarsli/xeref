import Link from 'next/link'
import { Search } from 'lucide-react'
import { latestVersion } from '@/lib/changelog-entries'

interface RhsSidebarProps {
  onOpenSearch?: () => void
}

export function RhsSidebar({ onOpenSearch }: RhsSidebarProps) {
  return (
    <aside
      aria-label="Right sidebar"
      className="hidden lg:flex flex-col w-14 border-l bg-card shrink-0"
    >
      {/* Search button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onOpenSearch}
          title="Search"
          className="group relative flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow opacity-0 group-hover:opacity-100 transition-opacity">
            Search
          </span>
        </button>
      </div>

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
          {latestVersion}
        </Link>
      </div>
    </aside>
  )
}
