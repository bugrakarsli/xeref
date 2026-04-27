'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Copy, Check, Download, Trash2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Artifact } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArtifactTypeIcon } from './artifact-type-icon'
import { ArtifactStatusBadge } from './artifact-status-badge'
import { ArtifactCapabilitiesBadges } from './artifact-capabilities-badge'
import { ArtifactPreview } from './artifact-preview'
import { ArtifactVersionPanel } from './artifact-version-panel'
import { ArtifactErrorState } from './artifact-error-state'

interface ArtifactDetailProps {
  artifact: Artifact | null
  selectedVersionIndex: number
  onVersionChange: (index: number) => void
  onBack: () => void
  visible: boolean
}

function NoSelection() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
      <div className="rounded-full bg-muted/50 p-4 mb-4">
        <Share2 className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">Select an artifact</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        Choose an artifact from the list to preview and manage it.
      </p>
    </div>
  )
}

export function ArtifactDetail({
  artifact, selectedVersionIndex, onVersionChange, onBack, visible,
}: ArtifactDetailProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'versions'>('preview')
  const [published, setPublished] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setPublished(artifact?.published ?? false)
    setLinkCopied(false)
    setActiveTab('preview')
  }, [artifact?.id])

  function handlePublishToggle(checked: boolean) {
    setPublished(checked)
    if (checked) {
      const url = artifact?.shareUrl ?? `https://xeref.ai/artifacts/my?id=${artifact?.id}`
      navigator.clipboard.writeText(url).catch(() => {})
      toast.success('Artifact published — share link copied!')
    } else {
      toast.success('Artifact unpublished')
    }
  }

  function handleCopyLink() {
    const url = artifact?.shareUrl ?? `https://xeref.ai/artifacts/my?id=${artifact?.id}`
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true)
      toast.success('Share link copied')
      setTimeout(() => setLinkCopied(false), 2000)
    }).catch(() => toast.error('Copy failed'))
  }

  return (
    <div className={cn(
      'flex flex-col flex-1 min-w-0 min-h-0',
      !visible && 'hidden md:flex',
    )}>
      {!artifact ? (
        <NoSelection />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-start gap-2 px-4 py-3 border-b shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden shrink-0 mt-0.5"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="shrink-0 rounded-md bg-muted/60 p-2 mt-0.5">
              <ArtifactTypeIcon type={artifact.type} className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold truncate">{artifact.title}</h2>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{artifact.description}</p>
              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                <ArtifactStatusBadge status={artifact.status} />
                <ArtifactCapabilitiesBadges capabilities={artifact.capabilities} />
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost" size="icon" className="h-8 w-8"
                onClick={() => toast('Download coming soon')}
                title="Download"
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 text-destructive/60 hover:text-destructive"
                onClick={() => toast.error('Delete not available in demo mode')}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Publish bar */}
          <div className="flex items-center gap-3 px-4 py-2 border-b bg-muted/20 shrink-0">
            <div className="flex items-center gap-2">
              <Switch
                checked={published}
                onCheckedChange={handlePublishToggle}
                id="publish-toggle"
                className="scale-90"
              />
              <label
                htmlFor="publish-toggle"
                className="text-xs text-muted-foreground cursor-pointer select-none"
              >
                {published ? 'Public' : 'Private'}
              </label>
            </div>
            {published && (
              <Button
                variant="outline" size="sm"
                className="h-6 text-xs gap-1 ml-auto"
                onClick={handleCopyLink}
              >
                {linkCopied
                  ? <Check className="h-3 w-3 text-emerald-400" />
                  : <Copy className="h-3 w-3" />}
                Copy link
              </Button>
            )}
          </div>

          {/* Error banner */}
          {artifact.status === 'error' && (
            <ArtifactErrorState updatedAt={artifact.updatedAt} />
          )}

          {/* Tab bar */}
          <div className="flex items-center gap-1 px-4 py-1.5 border-b shrink-0">
            <button
              onClick={() => setActiveTab('preview')}
              className={cn(
                'text-xs px-2.5 py-1 rounded-md transition-colors',
                activeTab === 'preview'
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={cn(
                'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors',
                activeTab === 'versions'
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              Versions
              {artifact.versions.length > 1 && (
                <span className="bg-muted/70 text-muted-foreground rounded-full px-1.5 text-xs leading-4">
                  {artifact.versions.length}
                </span>
              )}
            </button>
          </div>

          {/* Body */}
          {activeTab === 'preview' && (
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
              <ArtifactPreview
                artifact={artifact}
                version={artifact.versions[selectedVersionIndex] ?? artifact.versions[0]}
              />
            </div>
          )}
          {activeTab === 'versions' && (
            <ScrollArea className="flex-1 min-h-0">
              <ArtifactVersionPanel
                versions={artifact.versions}
                activeIndex={selectedVersionIndex}
                onVersionChange={onVersionChange}
              />
            </ScrollArea>
          )}
        </>
      )}
    </div>
  )
}
