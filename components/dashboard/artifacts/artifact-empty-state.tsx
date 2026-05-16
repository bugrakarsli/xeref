import { Archive, Plus, Loader2 } from 'lucide-react'
import type { ArtifactFilterType, ArtifactType } from '@/lib/types'

interface ArtifactEmptyStateProps {
  filterType: ArtifactFilterType
  searchQuery: string
  onCreate: (type?: ArtifactType) => void
  creating: boolean
}

export function ArtifactEmptyState({ filterType, searchQuery, onCreate, creating }: ArtifactEmptyStateProps) {
  const isBaseEmpty = filterType === 'all' && !searchQuery

  const message = searchQuery
    ? `No artifacts match "${searchQuery}"`
    : filterType === 'all'
    ? 'Create your first artifact to get started.'
    : `No ${filterType} artifacts found.`

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted/50 p-4 mb-4">
        <Archive className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">No artifacts</p>
      <p className="text-xs text-muted-foreground max-w-xs mb-4">{message}</p>
      {isBaseEmpty && (
        <button
          onClick={() => onCreate()}
          disabled={creating}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
        >
          {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Create artifact
        </button>
      )}
    </div>
  )
}
