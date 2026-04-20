'use client'

import { Search, Archive } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Artifact, ArtifactFilterType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArtifactListItem } from './artifact-list-item'
import { ArtifactEmptyState } from './artifact-empty-state'

const FILTER_OPTIONS: { value: ArtifactFilterType; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'code',     label: 'Code' },
  { value: 'document', label: 'Docs' },
  { value: 'data',     label: 'Data' },
  { value: 'prompt',   label: 'Prompts' },
  { value: 'image',    label: 'Images' },
  { value: 'workflow', label: 'Workflows' },
]

function SkeletonItem() {
  return (
    <div className="px-3 py-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5 rounded-md w-8 h-8 bg-muted/60" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex justify-between gap-2">
            <div className="h-3 bg-muted/60 rounded w-2/3" />
            <div className="h-3 bg-muted/40 rounded w-10" />
          </div>
          <div className="h-3 bg-muted/40 rounded w-full" />
          <div className="h-3 bg-muted/40 rounded w-3/4" />
          <div className="flex gap-1.5">
            <div className="h-5 bg-muted/50 rounded w-16" />
            <div className="h-5 bg-muted/30 rounded w-10" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface ArtifactListProps {
  artifacts: Artifact[]
  selectedId: string | null
  filterType: ArtifactFilterType
  searchQuery: string
  loading: boolean
  onSearchChange: (q: string) => void
  onFilterChange: (type: ArtifactFilterType) => void
  onSelect: (artifact: Artifact) => void
  hidden: boolean
}

export function ArtifactList({
  artifacts, selectedId, filterType, searchQuery, loading,
  onSearchChange, onFilterChange, onSelect, hidden,
}: ArtifactListProps) {
  return (
    <div className={cn(
      'flex flex-col shrink-0 border-r w-full md:w-80 min-h-0',
      hidden && 'hidden md:flex',
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
        <Archive className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Artifacts</span>
        <span className="ml-auto text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
          {loading ? '…' : artifacts.length}
        </span>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search artifacts…"
            className="pl-8 h-8 text-xs bg-muted/30"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-0.5 px-3 py-2 border-b overflow-x-auto shrink-0 [scrollbar-width:none]">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={cn(
              'shrink-0 text-xs px-2.5 py-1 rounded-md transition-colors whitespace-nowrap',
              filterType === value
                ? 'bg-primary/15 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-0.5 p-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonItem key={i} />)
            : artifacts.length === 0
            ? <ArtifactEmptyState filterType={filterType} searchQuery={searchQuery} />
            : artifacts.map((a) => (
              <ArtifactListItem
                key={a.id}
                artifact={a}
                isSelected={a.id === selectedId}
                onClick={() => onSelect(a)}
              />
            ))}
        </div>
      </ScrollArea>
    </div>
  )
}
