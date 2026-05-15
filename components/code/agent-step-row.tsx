'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessagePart {
  type: string
  toolName?: string
  args?: Record<string, unknown>
  result?: unknown
}

type StepKind = 'ran' | 'read' | 'edited'

interface AgentStep {
  kind: StepKind
  label: string
}

interface AgentStepRowProps {
  agentName: string
  parts: MessagePart[]
  elapsedMs?: number
  tokenCount?: number
}

function deriveSteps(parts: MessagePart[]): AgentStep[] {
  return parts
    .filter((p) => p.type === 'tool-invocation' && p.toolName)
    .map((p): AgentStep => {
      const tool = (p.toolName ?? '').toLowerCase()
      const args = p.args ?? {}

      if (tool === 'read' || tool === 'view') {
        return {
          kind: 'read',
          label: String(args.path ?? args.file_path ?? 'file'),
        }
      }

      if (tool === 'edit' || tool === 'write' || tool === 'str_replace_editor') {
        const path = String(args.path ?? args.file_path ?? 'file')
        const result = (p.result ?? {}) as { plus?: number; minus?: number }
        const diff =
          typeof result.plus === 'number' && typeof result.minus === 'number'
            ? ` +${result.plus} -${result.minus}`
            : ''
        return { kind: 'edited', label: `${path}${diff}` }
      }

      const cmd = String(args.description ?? args.command ?? p.toolName ?? 'command')
      return { kind: 'ran', label: cmd }
    })
}

function formatElapsed(ms: number): string {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}m ${r}s`
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function AgentStepRow({ agentName, parts, elapsedMs, tokenCount }: AgentStepRowProps) {
  const [open, setOpen] = useState(false)
  const steps = deriveSteps(parts)
  if (steps.length === 0) return null

  const readCount = steps.filter((s) => s.kind === 'read').length
  const ranCount = steps.filter((s) => s.kind === 'ran').length
  const editedCount = steps.filter((s) => s.kind === 'edited').length

  return (
    <div className="my-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left"
      >
        <ChevronRight
          size={12}
          className={cn('transition-transform shrink-0', open && 'rotate-90')}
        />
        <span className="font-medium">Running agent {agentName}</span>
        {readCount > 0 && <span>· Read · {readCount}</span>}
        {ranCount > 0 && <span>· Ran · {ranCount}</span>}
        {editedCount > 0 && <span>· Edited · {editedCount}</span>}
        <span className="ml-auto opacity-70 shrink-0">
          {elapsedMs != null && formatElapsed(elapsedMs)}
          {tokenCount != null && ` · ${formatTokens(tokenCount)} tokens`}
        </span>
      </button>

      {open && (
        <div className="mt-1 ml-4 border-l border-border pl-3 py-1 space-y-0.5 bg-muted/20 rounded-sm">
          <div className="text-[11px] text-muted-foreground/70">
            Ran {ranCount} commands, read {readCount} files
            {editedCount > 0 && `, edited ${editedCount} files`}
          </div>
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 font-mono text-xs">
              <span className="opacity-80 shrink-0">
                {s.kind === 'ran' ? 'Ran' : s.kind === 'read' ? 'Read' : 'Edited'}
              </span>
              <span
                className={cn(
                  'truncate',
                  s.kind === 'read' && 'text-red-400',
                  s.kind === 'edited' && 'text-green-400'
                )}
              >
                {s.label}
              </span>
              <ChevronRight size={10} className="ml-auto opacity-40 shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
