'use client'

import { Archive, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Artifact } from '@/lib/types'
import { ArtifactTypeIcon } from './artifact-type-icon'
import { ArtifactStatusBadge } from './artifact-status-badge'
import { ArtifactCapabilitiesBadges } from './artifact-capabilities-badge'
import { ArtifactPreview } from './artifact-preview'

interface ArtifactPublicViewProps {
  artifact: Artifact | null
}

export function ArtifactPublicView({ artifact }: ArtifactPublicViewProps) {
  if (!artifact) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-background text-foreground dark">
        <div className="rounded-full bg-muted/50 p-4 mb-4">
          <Archive className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-semibold mb-2">Artifact not found</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          This artifact may have been deleted or is not publicly shared.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </main>
    )
  }

  const version = artifact.versions[artifact.currentVersion] ?? artifact.versions[0]

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground dark">
      <header className="border-b px-6 py-4 flex items-center gap-3 max-w-4xl mx-auto w-full">
        <div className="shrink-0 rounded-md bg-muted/60 p-2">
          <ArtifactTypeIcon type={artifact.type} className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold truncate">{artifact.title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{artifact.description}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <ArtifactStatusBadge status={artifact.status} />
            <ArtifactCapabilitiesBadges capabilities={artifact.capabilities} />
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0" asChild>
          <Link href="/">
            <ExternalLink className="h-3.5 w-3.5" />
            Open in xeref
          </Link>
        </Button>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full border-x min-h-[400px] flex flex-col">
        <ArtifactPreview artifact={artifact} version={version} />
      </div>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        Shared via{' '}
        <a href="https://xeref.ai" className="text-primary hover:underline">
          xeref.ai
        </a>
      </footer>
    </main>
  )
}
