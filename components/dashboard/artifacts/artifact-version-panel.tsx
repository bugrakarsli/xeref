'use client'

import type { ArtifactVersion } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ArtifactVersionPanelProps {
  versions: ArtifactVersion[]
  activeIndex: number
  onVersionChange: (index: number) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function ArtifactVersionPanel({ versions, activeIndex, onVersionChange }: ArtifactVersionPanelProps) {
  return (
    <div className="flex flex-col gap-1 p-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        {versions.length} version{versions.length !== 1 ? 's' : ''}
      </p>
      {[...versions].reverse().map((v, reversedIdx) => {
        const actualIdx = versions.length - 1 - reversedIdx
        const isActive = actualIdx === activeIndex
        return (
          <button
            key={v.version}
            onClick={() => onVersionChange(actualIdx)}
            className={cn(
              'flex items-start gap-3 rounded-lg px-3 py-2.5 text-left w-full transition-colors border',
              isActive
                ? 'bg-primary/10 border-primary/30'
                : 'border-transparent hover:bg-accent',
            )}
          >
            <div className={cn(
              'shrink-0 rounded-full w-6 h-6 flex items-center justify-center text-xs font-mono font-bold mt-0.5',
              isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}>
              {v.version}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium', isActive ? 'text-foreground' : 'text-foreground/80')}>
                {v.label ?? `Version ${v.version}`}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(v.createdAt)}</p>
            </div>
            {isActive && (
              <span className="text-xs text-primary font-medium shrink-0 mt-0.5">Current</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
