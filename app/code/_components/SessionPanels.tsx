'use client'

import { useEffect, useState } from 'react'
import { Columns2, Check, X, FileDiff, ListChecks, ClipboardList } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { getUserTasks } from '@/app/actions/tasks'
import type { Task } from '@/lib/types'

export type PanelKey = 'diff' | 'tasks' | 'plan'

const PANEL_ORDER: PanelKey[] = ['diff', 'tasks', 'plan']

const PANEL_LABELS: Record<PanelKey, string> = {
  diff: 'Diff',
  tasks: 'Tasks',
  plan: 'Plan',
}

const PANEL_ICONS: Record<PanelKey, typeof FileDiff> = {
  diff: FileDiff,
  tasks: ListChecks,
  plan: ClipboardList,
}

export function useSessionPanels() {
  const [selected, setSelected] = useLocalStorage<PanelKey[]>('code:session:panels', [])

  const togglePanel = (key: PanelKey) => {
    setSelected((curr) => {
      const has = curr.includes(key)
      if (has) return curr.filter((k) => k !== key)
      // Keep canonical order so layout is deterministic regardless of click order
      const next = [...curr, key]
      return PANEL_ORDER.filter((k) => next.includes(k))
    })
  }

  const closePanel = (key: PanelKey) => {
    setSelected((curr) => curr.filter((k) => k !== key))
  }

  return { selected, togglePanel, closePanel }
}

export function SessionViewsMenu({
  selected,
  onToggle,
}: {
  selected: PanelKey[]
  onToggle: (key: PanelKey) => void
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Views"
                className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus:outline-none"
              >
                <Columns2 size={16} />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Views</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PANEL_ORDER.map((key) => {
              const Icon = PANEL_ICONS[key]
              const active = selected.includes(key)
              return (
                <DropdownMenuItem
                  key={key}
                  onSelect={(e) => {
                    e.preventDefault()
                    onToggle(key)
                  }}
                  className="flex items-center gap-2 text-xs"
                >
                  <Check size={12} className={active ? 'opacity-100' : 'opacity-0'} />
                  <Icon size={12} className="opacity-70" />
                  {PANEL_LABELS[key]}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent side="bottom">Views</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function PanelShell({
  title,
  icon: Icon,
  onClose,
  children,
}: {
  title: string
  icon: typeof FileDiff
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-full min-h-0 border-l bg-card">
      <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Icon size={12} />
          <span>{title}</span>
        </div>
        <button
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="flex items-center justify-center rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus:outline-none"
        >
          <X size={12} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-3 text-xs">{children}</div>
    </div>
  )
}

function DiffPanelBody() {
  return (
    <div className="h-full flex items-center justify-center text-muted-foreground text-center">
      <p>No file changes to display yet.</p>
    </div>
  )
}

function TasksPanelBody() {
  const [tasks, setTasks] = useState<Task[] | null>(null)
  useEffect(() => {
    getUserTasks().then(setTasks).catch(() => setTasks([]))
  }, [])

  if (tasks === null) {
    return <p className="text-muted-foreground">Loading…</p>
  }
  if (tasks.length === 0) {
    return <p className="text-muted-foreground">No tasks yet.</p>
  }
  return (
    <ul className="space-y-1.5">
      {tasks.slice(0, 30).map((t) => (
        <li key={t.id} className="flex items-start gap-2">
          <span
            className={
              'mt-1 inline-block size-1.5 rounded-full shrink-0 ' +
              (t.status === 'done'
                ? 'bg-green-500'
                : t.status === 'in_progress'
                  ? 'bg-yellow-500'
                  : 'bg-muted-foreground/50')
            }
          />
          <span className={t.status === 'done' ? 'line-through text-muted-foreground' : ''}>
            {t.title}
          </span>
        </li>
      ))}
    </ul>
  )
}

function PlanPanelBody() {
  return (
    <div className="text-muted-foreground space-y-2">
      <p>Plan view.</p>
      <p className="text-[11px]">
        A structured plan for this session will appear here once the agent writes one.
      </p>
    </div>
  )
}

function renderPanel(key: PanelKey, onClose: () => void) {
  const Icon = PANEL_ICONS[key]
  const title = PANEL_LABELS[key]
  if (key === 'diff') return <PanelShell title={title} icon={Icon} onClose={onClose}><DiffPanelBody /></PanelShell>
  if (key === 'tasks') return <PanelShell title={title} icon={Icon} onClose={onClose}><TasksPanelBody /></PanelShell>
  return <PanelShell title={title} icon={Icon} onClose={onClose}><PlanPanelBody /></PanelShell>
}

export function SessionRightPanels({
  selected,
  onClose,
}: {
  selected: PanelKey[]
  onClose: (key: PanelKey) => void
}) {
  if (selected.length === 0) return null

  // 1 → single column with one panel
  // 2 → single column, stacked (top/bottom)
  // 3 → first column stacked (panels[0], panels[1]); second column (panels[2])
  const firstColumn = selected.slice(0, 2)
  const secondColumn = selected.slice(2, 3)

  return (
    <>
      <div className="hidden md:flex flex-col w-80 shrink-0 min-h-0">
        {firstColumn.map((key, i) => (
          <div
            key={key}
            className={'flex-1 min-h-0 ' + (i > 0 ? 'border-t' : '')}
          >
            {renderPanel(key, () => onClose(key))}
          </div>
        ))}
      </div>
      {secondColumn.length > 0 && (
        <div className="hidden md:flex flex-col w-80 shrink-0 min-h-0">
          {secondColumn.map((key) => (
            <div key={key} className="flex-1 min-h-0">
              {renderPanel(key, () => onClose(key))}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
