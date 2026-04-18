import { Bot, Plug, Database } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ArtifactCapability } from '@/lib/types'

interface ArtifactCapabilitiesBadgesProps {
  capabilities: ArtifactCapability[]
}

const CAPABILITY_CONFIG: Record<ArtifactCapability, {
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = {
  'ai-powered':      { label: 'AI',      icon: Bot },
  'mcp-enabled':     { label: 'MCP',     icon: Plug },
  'storage-enabled': { label: 'Storage', icon: Database },
}

export function ArtifactCapabilitiesBadges({ capabilities }: ArtifactCapabilitiesBadgesProps) {
  if (capabilities.length === 0) return null
  return (
    <>
      {capabilities.map((cap) => {
        const { label, icon: Icon } = CAPABILITY_CONFIG[cap]
        return (
          <Badge key={cap} variant="outline" className="gap-1 text-xs bg-primary/5 text-primary border-primary/20">
            <Icon className="h-3 w-3" />
            {label}
          </Badge>
        )
      })}
    </>
  )
}
