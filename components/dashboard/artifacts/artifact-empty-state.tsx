import { Archive } from 'lucide-react'
import type { ArtifactFilterType } from '@/lib/types'

interface ArtifactEmptyStateProps {
  filterType: ArtifactFilterType
  searchQuery: string
}

export function ArtifactEmptyState({ filterType, searchQuery }: ArtifactEmptyStateProps) {
  const message = searchQuery
    ? `No artifacts match "${searchQuery}"`
    : filterType === 'all'
    ? 'No artifacts yet. Create your first artifact to get started.'
    : `No ${filterType} artifacts found.`

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted/50 p-4 mb-4">
        <Archive className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">No artifacts</p>
      <p className="text-xs text-muted-foreground max-w-xs">{message}</p>
    </div>
  )
}
