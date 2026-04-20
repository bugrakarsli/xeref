import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ArtifactStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ArtifactStatusBadgeProps {
  status: ArtifactStatus
  className?: string
}

const STATUS_CONFIG: Record<ArtifactStatus, { label: string; className: string }> = {
  published:  { label: 'Published',  className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  draft:      { label: 'Draft',      className: 'bg-muted/50 text-muted-foreground border-border' },
  error:      { label: 'Error',      className: 'bg-destructive/15 text-destructive border-destructive/30' },
  processing: { label: 'Processing', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
}

export function ArtifactStatusBadge({ status, className }: ArtifactStatusBadgeProps) {
  const { label, className: statusClass } = STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={cn('gap-1 text-xs', statusClass, className)}>
      {status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
      {label}
    </Badge>
  )
}
