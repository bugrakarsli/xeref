import { AlertCircle } from 'lucide-react'

interface ArtifactErrorStateProps {
  updatedAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function ArtifactErrorState({ updatedAt }: ArtifactErrorStateProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 mx-4 mt-3 shrink-0">
      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-destructive">Processing failed</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          This artifact encountered an error during processing. Last attempt: {formatDate(updatedAt)}.
        </p>
      </div>
    </div>
  )
}
