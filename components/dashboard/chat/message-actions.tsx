'use client'

import { useState } from 'react'
import { Copy, Check, Pencil, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

interface UserMessageActionsProps {
  content: string
  onEdit: () => void
}

export function UserMessageActions({ content, onEdit }: UserMessageActionsProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const ok = await copyToClipboard(content)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="opacity-0 group-hover/message:opacity-100 transition-opacity flex items-center gap-0.5 justify-end mt-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-foreground"
        onClick={handleCopy}
        title="Copy message"
        type="button"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-foreground"
        onClick={onEdit}
        title="Edit message"
        type="button"
      >
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  )
}

interface AssistantMessageActionsProps {
  content: string
  messageId: string
  onEdit: () => void
  onRetry?: () => void
}

export function AssistantMessageActions({ content, messageId, onEdit, onRetry }: AssistantMessageActionsProps) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  async function handleCopy() {
    const ok = await copyToClipboard(content)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleFeedback(type: 'up' | 'down') {
    if (feedback === type) {
      setFeedback(null)
      return
    }
    setFeedback(type)
    toast.success(type === 'up' ? 'Thanks for the feedback!' : "Sorry about that. We'll improve.")
    // Future: call saveFeedback(messageId, type) server action
    void messageId
  }

  return (
    <div className="opacity-0 group-hover/message:opacity-100 transition-opacity flex items-center gap-0.5 justify-start mt-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-foreground"
        onClick={handleCopy}
        title="Copy response"
        type="button"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-6 w-6 transition-colors',
          feedback === 'up'
            ? 'text-emerald-400 hover:text-emerald-300'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => handleFeedback('up')}
        title="Good response"
        type="button"
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-6 w-6 transition-colors',
          feedback === 'down'
            ? 'text-destructive hover:text-destructive/80'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => handleFeedback('down')}
        title="Poor response"
        type="button"
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-foreground"
        onClick={onEdit}
        title="Edit response"
        type="button"
      >
        <Pencil className="h-3 w-3" />
      </Button>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          title="Retry"
          className="group/retry flex items-center gap-1 h-6 rounded px-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-3 w-3 shrink-0" />
          <span className="max-w-0 overflow-hidden group-hover/retry:max-w-[36px] transition-all duration-200 text-xs whitespace-nowrap">
            Retry
          </span>
        </button>
      )}
    </div>
  )
}
