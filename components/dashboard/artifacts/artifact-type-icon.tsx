import { Code2, FileText, Table2, MessageSquare, GitFork, Image as ImageIcon } from 'lucide-react'
import type { ArtifactType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ArtifactTypeIconProps {
  type: ArtifactType
  className?: string
}

const TYPE_ICONS: Record<ArtifactType, React.ComponentType<{ className?: string }>> = {
  code: Code2,
  document: FileText,
  image: ImageIcon,
  data: Table2,
  prompt: MessageSquare,
  workflow: GitFork,
}

export function ArtifactTypeIcon({ type, className }: ArtifactTypeIconProps) {
  const Icon = TYPE_ICONS[type]
  return <Icon className={cn('h-4 w-4', className)} />
}
