'use client'

import { useState, useRef, useEffect } from 'react'
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
  isLast?: boolean
  onEdit?: (content: string) => void
  onRetry?: () => void
}

function UserAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
      {initial}
    </div>
  )
}

function ThinkingIndicator() {
  const letters = 'Thinking'.split('')
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-baseline text-sm font-medium">
        {letters.map((letter, i) => (
          <span
            key={i}
            style={{
              animation: 'rainbow-wave 2.4s linear infinite',
              animationDelay: `${i * 0.12}s`,
            }}
          >
            {letter}
          </span>
        ))}
      </span>
      <span className="inline-flex items-center gap-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
      </span>
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

export function ChatMessage({
  role,
  content,
  parts,
  isStreaming,
  userName = 'U',
  messageId,
  isLast,
  onEdit,
  onRetry
}: ChatMessageProps) {
  const isUser = role === 'user'
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const editRef = useRef<HTMLTextAreaElement>(null)

  // Sync editContent if content prop changes externally
  useEffect(() => {
    if (!isEditing) setEditContent(content)
  }, [content, isEditing])

  useEffect(() => {
    const handleTrigger = (e: CustomEvent) => {
      if (e.detail.messageId === messageId) {
        setIsEditing(true)
      }
    }
    window.addEventListener('xeref_edit_message', handleTrigger as EventListener)
    return () => window.removeEventListener('xeref_edit_message', handleTrigger as EventListener)
  }, [messageId])

  // Auto-resize + focus on enter edit mode
  useEffect(() => {
    if (isEditing && editRef.current) {
      const el = editRef.current
      el.focus()
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
      const len = el.value.length
      el.setSelectionRange(len, len)
    }
  }, [isEditing])

  function handleEditDone() {
    const trimmed = editContent.trim()
    if (trimmed && trimmed !== content) {
      onEdit?.(trimmed)
    }
    setIsEditing(false)
  }

  function handleEditKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEditDone()
    }
    if (e.key === 'Escape') {
      setEditContent(content)
      setIsEditing(false)
    }
  }

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
        {/* Inline edit mode */}
        {isEditing ? (
          <div className="flex flex-col gap-2 w-full min-w-[300px]">
            <textarea
              ref={editRef}
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = `${e.target.scrollHeight}px`
              }}
              onKeyDown={handleEditKeyDown}
              rows={1}
              className={cn(
                "w-full resize-none rounded-2xl border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary",
                isUser ? "rounded-br-sm border-primary/50" : "rounded-bl-sm border-muted"
              )}
            />
            <div className={cn("flex items-center gap-2", isUser ? "justify-end" : "justify-start")}>
              {!isUser && (
                <button
                  type="button"
                  onClick={handleEditDone}
                  className="text-xs font-medium bg-foreground text-background px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              )}
              <button
                type="button"
                onClick={() => { setEditContent(content); setIsEditing(false) }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent"
              >
                Cancel
              </button>
              {isUser && (
                <button
                  type="button"
                  onClick={handleEditDone}
                  className="text-xs font-medium bg-foreground text-background px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div
              onClick={() => {
                if (!isUser && isLast) {
                  setIsEditing(true)
                }
              }}
              className={cn(
                'relative rounded-2xl px-4 py-2.5 text-sm transition-all',
                isUser
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-card border rounded-bl-sm',
                !isUser && isLast && 'cursor-pointer hover:border-primary/50'
              )}
            >
              {!isUser && isLast && (
                <div className="absolute -top-3 -left-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-lg animate-in fade-in slide-in-from-bottom-1 duration-500">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-300"></span>
                  </span>
                  New! Click to edit
                </div>
              )}
              {isUser ? (
                <p className="whitespace-pre-wrap">{content}</p>
              ) : isStreaming && !content ? (
                <ThinkingIndicator />
              ) : (
                <div className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                  {isStreaming && <ThinkingIndicator />}
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
                  onEdit={() => setIsEditing(true)}
                />
              ) : (
                <AssistantMessageActions
                  content={content}
                  messageId={messageId ?? ''}
                  onEdit={() => setIsEditing(true)}
                  onRetry={onRetry}
                />
              )
            )}
          </>
        )}
      </div>

      {isUser && <UserAvatar name={userName} />}
    </div>
  )
}
