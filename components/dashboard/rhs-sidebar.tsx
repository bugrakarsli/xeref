'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Keyboard, Search } from 'lucide-react'
import { latestVersion } from '@/lib/changelog-entries'
import { ShortcutsDialog } from '@/components/dashboard/shortcuts-dialog'

interface RhsSidebarProps {
  onOpenSearch?: () => void
}

export function RhsSidebar({ onOpenSearch }: RhsSidebarProps) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

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

      {/* Shortcuts button + changelog badge */}
      <div className="flex flex-col items-center gap-2 pb-4">
        <button
          onClick={() => setShortcutsOpen(true)}
          title="Keyboard shortcuts"
          className="group relative flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Keyboard className="h-4 w-4" />
          <span className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow opacity-0 group-hover:opacity-100 transition-opacity">
            Shortcuts
          </span>
        </button>

        <Link
          href="/changelog"
          className="flex items-center gap-1 rounded-full border border-primary/30 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/60 hover:text-foreground"
          title="Changelog"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {latestVersion}
        </Link>
      </div>

      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </aside>
  )
}
