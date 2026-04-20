'use client'

import type { Artifact } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArtifactTypeIcon } from './artifact-type-icon'
import { ArtifactStatusBadge } from './artifact-status-badge'
import { ArtifactCapabilitiesBadges } from './artifact-capabilities-badge'

interface ArtifactListItemProps {
  artifact: Artifact
  isSelected: boolean
  onClick: () => void
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ArtifactListItem({ artifact, isSelected, onClick }: ArtifactListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-3 rounded-lg border transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isSelected
          ? 'bg-primary/10 border-primary/30 text-foreground'
          : 'bg-transparent border-transparent',
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'shrink-0 mt-0.5 rounded-md p-1.5',
          isSelected ? 'bg-primary/20' : 'bg-muted/60',
        )}>
          <ArtifactTypeIcon
            type={artifact.type}
            className={cn('h-4 w-4', isSelected ? 'text-primary' : 'text-muted-foreground')}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-medium truncate">{artifact.title}</span>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatRelativeDate(artifact.updatedAt)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{artifact.description}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <ArtifactStatusBadge status={artifact.status} />
            <ArtifactCapabilitiesBadges capabilities={artifact.capabilities} />
          </div>
        </div>
      </div>
    </button>
  )
}
