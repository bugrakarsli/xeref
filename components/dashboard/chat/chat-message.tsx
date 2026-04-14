'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { XerefLogo } from '@/components/xeref-logo'
import { cn } from '@/lib/utils'
import { CheckCircle, ListTodo, Brain, AlertCircle } from 'lucide-react'
import { UserMessageActions, AssistantMessageActions } from './message-actions'

interface ToolResult {
  success?: boolean
  message?: string
  task?: { title: string; status: string; priority: string }
  tasks?: { title: string; status: string; priority: string }[]
  count?: number
  memories?: { content: string; saved_at: string }[]
}

interface MessagePart {
  type: string
  text?: string
  toolName?: string
  toolCallId?: string
  state?: string
  result?: ToolResult
  args?: Record<string, unknown>
}

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  parts?: MessagePart[]
  isStreaming?: boolean
  userName?: string
  messageId?: string
  onEdit?: (content: string) => void
}

function UserAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
      {initial}
    </div>
  )
}

function StreamingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 h-4">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
    </span>
  )
}

function ToolResultCard({ toolName, result }: { toolName: string; result: ToolResult }) {
  if (!result) return null

  const success = result.success !== false

  if (toolName === 'create_task' && result.task) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400 mt-1">
        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
        <span>Task created: <strong>{result.task.title}</strong> · {result.task.priority} priority</span>
      </div>
    )
  }

  if (toolName === 'list_tasks') {
    const tasks = result.tasks ?? []
    return (
      <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs mt-1 space-y-1">
        <div className="flex items-center gap-1.5 text-muted-foreground font-medium mb-1.5">
          <ListTodo className="h-3.5 w-3.5" />
          {result.count === 0 ? 'No tasks found' : `${result.count} task${result.count !== 1 ? 's' : ''}`}
        </div>
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-semibold',
              t.status === 'done' ? 'bg-emerald-500/15 text-emerald-400' :
              t.status === 'in_progress' ? 'bg-blue-500/15 text-blue-400' :
              'bg-muted text-muted-foreground'
            )}>{t.status.replace('_', ' ')}</span>
            <span className="truncate">{t.title}</span>
          </div>
        ))}
      </div>
    )
  }

  if (toolName === 'update_task') {
    return (
      <div className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs mt-1',
        success ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-destructive/20 bg-destructive/5 text-destructive'
      )}>
        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
        <span>{result.message ?? (result.task ? `Updated: ${result.task.title}` : 'Task updated')}</span>
      </div>
    )
  }

  if (toolName === 'save_memory') {
    return (
      <div className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs mt-1',
        success ? 'border-violet-500/20 bg-violet-500/5 text-violet-400' : 'border-muted bg-muted/30 text-muted-foreground'
      )}>
        <Brain className="h-3.5 w-3.5 shrink-0" />
        <span>{result.message ?? 'Memory saved'}</span>
      </div>
    )
  }

  if (toolName === 'recall_memories') {
    const memories = result.memories ?? []
    return (
      <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs mt-1 space-y-1">
        <div className="flex items-center gap-1.5 text-muted-foreground font-medium mb-1.5">
          <Brain className="h-3.5 w-3.5" />
          {memories.length === 0 ? 'No memories found' : `${memories.length} memor${memories.length !== 1 ? 'ies' : 'y'}`}
        </div>
        {memories.map((m, i) => (
          <div key={i} className="text-foreground/80 leading-snug border-l-2 border-violet-500/30 pl-2">
            {m.content}
          </div>
        ))}
      </div>
    )
  }

  if (toolName === 'rename_project') {
    return (
      <div className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs mt-1',
        success ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-destructive/20 bg-destructive/5 text-destructive'
      )}>
        {success ? <CheckCircle className="h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
        <span>{result.message ?? 'Project renamed'}</span>
      </div>
    )
  }

  // Generic fallback
  if (result.message) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground mt-1">
        {success ? <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />}
        <span>{result.message}</span>
      </div>
    )
  }

  return null
}

export function ChatMessage({ role, content, parts, isStreaming, userName = 'U', messageId, onEdit }: ChatMessageProps) {
  const isUser = role === 'user'

  // Collect tool results from parts
  const toolResults = (parts ?? []).filter(
    (p) => p.type === 'tool-invocation' && p.state === 'result' && p.result
  )

  return (
    <div className={cn('flex gap-3 px-4 py-3 group/message', isUser && 'justify-end')}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card border">
          <XerefLogo className="h-4 w-4" />
        </div>
      )}

      <div className={cn('flex flex-col gap-1', isUser ? 'items-end max-w-[80%]' : 'max-w-[80%]')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-card border rounded-bl-sm'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : isStreaming && !content ? (
            <StreamingDots />
          ) : (
            <div className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
              {isStreaming && <StreamingDots />}
            </div>
          )}
        </div>

        {/* Tool result cards */}
        {toolResults.map((part, i) => (
          <ToolResultCard
            key={i}
            toolName={part.toolName ?? ''}
            result={part.result as ToolResult}
          />
        ))}

        {/* Message action buttons */}
        {!isStreaming && content && (
          isUser ? (
            <UserMessageActions
              content={content}
              onEdit={() => onEdit?.(content)}
            />
          ) : (
            <AssistantMessageActions
              content={content}
              messageId={messageId ?? ''}
            />
          )
        )}
      </div>

      {isUser && <UserAvatar name={userName} />}
    </div>
  )
}
