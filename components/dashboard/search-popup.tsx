'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, MessageSquare, FolderOpen, CheckSquare, FileText } from 'lucide-react'
import type { Chat, Project, Task, Note, ViewKey } from '@/lib/types'
import { getUserTasks } from '@/app/actions/tasks'
import { getUserNotes } from '@/app/actions/notes'
import { cn } from '@/lib/utils'

interface SearchPopupProps {
  onClose: () => void
  chats: Chat[]
  projects: Project[]
  onChatSelect: (id: string) => void
  onViewChange: (view: ViewKey) => void
}

type ResultItem =
  | { kind: 'chat'; id: string; label: string }
  | { kind: 'project'; id: string; label: string }
  | { kind: 'task'; id: string; label: string }
  | { kind: 'note'; id: string; label: string }

const KIND_ICON = {
  chat: MessageSquare,
  project: FolderOpen,
  task: CheckSquare,
  note: FileText,
} as const

const KIND_LABEL = {
  chat: 'Chat',
  project: 'Project',
  task: 'Task',
  note: 'Note',
} as const

export function SearchPopup({ onClose, chats, projects, onChatSelect, onViewChange }: SearchPopupProps) {
  const [query, setQuery] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Focus input on mount and fetch tasks/notes
  useEffect(() => {
    inputRef.current?.focus()
    Promise.all([getUserTasks(), getUserNotes()]).then(([t, n]) => {
      setTasks(t)
      setNotes(n)
    })
  }, [])

  const results: ResultItem[] = (() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const matched: ResultItem[] = []

    for (const c of chats) {
      if (c.title.toLowerCase().includes(q)) matched.push({ kind: 'chat', id: c.id, label: c.title })
    }
    for (const p of projects) {
      if (p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
        matched.push({ kind: 'project', id: p.id, label: p.name })
      }
    }
    for (const t of tasks) {
      if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
        matched.push({ kind: 'task', id: t.id, label: t.title })
      }
    }
    for (const n of notes) {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
        matched.push({ kind: 'note', id: n.id, label: n.title })
      }
    }

    return matched.slice(0, 20)
  })()

  const select = useCallback((item: ResultItem) => {
    if (item.kind === 'chat') {
      onChatSelect(item.id)
    } else if (item.kind === 'project') {
      onViewChange('home')
    } else {
      onViewChange('tasks')
    }
    onClose()
  }, [onChatSelect, onViewChange, onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlighted(h => Math.min(h + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlighted(h => Math.max(h - 1, 0))
      } else if (e.key === 'Enter' && results[highlighted]) {
        e.preventDefault()
        select(results[highlighted])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [results, highlighted, select, onClose])


  // Scroll highlighted item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${highlighted}"]`) as HTMLElement | null
    el?.scrollIntoView({ block: 'nearest' })
  }, [highlighted])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-xl border border-border bg-background shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setHighlighted(0) }}
            placeholder="Search tasks and notes..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-72 overflow-y-auto">
          {query.trim() === '' ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Start typing to search.</p>
          ) : results.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No results found.</p>
          ) : (
            results.map((item, i) => {
              const Icon = KIND_ICON[item.kind]
              return (
                <button
                  key={`${item.kind}-${item.id}`}
                  data-idx={i}
                  onClick={() => select(item)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                    i === highlighted ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/50'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{KIND_LABEL[item.kind]}</span>
                </button>
              )
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground">
          <span><kbd className="font-sans">↑</kbd> <kbd className="font-sans">↓</kbd> to navigate &nbsp; <kbd className="font-sans">Enter</kbd> to select</span>
          <span><kbd className="font-sans">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  )
}
