'use client'

import { useState, useEffect, useTransition, useRef, useCallback } from 'react'
import { CheckSquare, Plus, Trash2, ChevronDown, FileText, Target, Pencil, Kanban, List as ListIcon, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createTask, getUserTasks, updateTask, deleteTask, getDailyTarget, setDailyGoal, incrementDailyCompleted } from '@/app/actions/tasks'
import { getUserNotes, createNote, updateNote, deleteNote } from '@/app/actions/notes'
import { getUserProjects } from '@/app/actions/projects'
import type { Task, Note, DailyTarget, Project } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TaskDialog } from './task-dialog'
import { KanbanSettingsDialog } from './kanban-settings-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type StatusFilter = 'all' | 'todo' | 'in_progress' | 'done'
type ViewTab = 'tasks' | 'notes'

const STATUS_CYCLE: Record<Task['status'], Task['status']> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
}

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-500/15 text-blue-400',
  high: 'bg-orange-500/15 text-orange-400',
}

const STATUS_COLORS: Record<Task['status'], string> = {
  todo: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-500/15 text-blue-400',
  done: 'bg-emerald-500/15 text-emerald-400',
}

// ── Daily Target Bar ────────────────────────────────────────────────────────

function DailyTargetBar({ target, onGoalChange }: { target: DailyTarget; onGoalChange: (n: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(target.goal))
  const pct = Math.min(100, Math.round((target.completed / Math.max(target.goal, 1)) * 100))
  const done = target.completed >= target.goal

  function commitEdit() {
    const n = parseInt(value, 10)
    if (!isNaN(n) && n > 0 && n !== target.goal) onGoalChange(n)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-3 bg-card border rounded-lg px-4 py-2.5">
      <Target className={cn('h-4 w-4 shrink-0', done ? 'text-emerald-400' : 'text-muted-foreground')} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Daily goal</span>
          <span className={cn('text-xs font-semibold', done ? 'text-emerald-400' : 'text-foreground')}>
            {target.completed} / {editing ? (
              <input
                className="w-8 bg-transparent border-b border-primary/60 text-center outline-none text-xs"
                value={value}
                autoFocus
                onChange={(e) => setValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
              />
            ) : (
              <button onClick={() => { setValue(String(target.goal)); setEditing(true) }} className="hover:text-primary transition-colors">
                {target.goal}
              </button>
            )}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', done ? 'bg-emerald-500' : 'bg-primary')}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Notes Panel ─────────────────────────────────────────────────────────────

function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [titleDraft, setTitleDraft] = useState('')
  const [contentDraft, setContentDraft] = useState('')
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selected = notes.find((n) => n.id === selectedId) ?? null

  useEffect(() => {
    getUserNotes()
      .then((n) => {
        setNotes(n)
        if (n.length > 0) {
          setSelectedId(n[0].id)
          setTitleDraft(n[0].title)
          setContentDraft(n[0].content)
        }
      })
      .catch(() => toast.error('Failed to load notes'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitleDraft(selected.title)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContentDraft(selected.content)
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveNote = useCallback((id: string, title: string, content: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      startTransition(async () => {
        try {
          const updated = await updateNote(id, { title, content })
          setNotes((prev) => prev.map((n) => n.id === id ? updated : n))
        } catch {
          toast.error('Failed to save note')
        }
      })
    }, 600)
  }, [])

  function handleContentBlur() {
    if (!selectedId) return
    saveNote(selectedId, titleDraft, contentDraft)
  }

  function handleTitleBlur() {
    if (!selectedId) return
    saveNote(selectedId, titleDraft, contentDraft)
  }

  function handleNewNote() {
    startTransition(async () => {
      try {
        const note = await createNote('Untitled')
        setNotes((prev) => [note, ...prev])
        setSelectedId(note.id)
        setTitleDraft(note.title)
        setContentDraft(note.content)
      } catch {
        toast.error('Failed to create note')
      }
    })
  }

  function handleDeleteNote(id: string) {
    startTransition(async () => {
      try {
        await deleteNote(id)
        setNotes((prev) => {
          const next = prev.filter((n) => n.id !== id)
          if (selectedId === id) {
            setSelectedId(next[0]?.id ?? null)
            setTitleDraft(next[0]?.title ?? '')
            setContentDraft(next[0]?.content ?? '')
          }
          return next
        })
      } catch {
        toast.error('Failed to delete note')
      }
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center flex-1 py-12 text-sm text-muted-foreground">Loading notes…</div>
  }

  return (
    <div className="flex flex-1 overflow-hidden gap-4 min-h-0">
      {/* Sidebar */}
      <div className="w-48 shrink-0 flex flex-col gap-1 overflow-y-auto">
        <Button size="sm" variant="outline" className="w-full gap-1.5 mb-2" onClick={handleNewNote} disabled={isPending}>
          <Plus className="h-3.5 w-3.5" />
          New note
        </Button>
        {notes.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No notes yet</p>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => { setSelectedId(note.id) }}
            className={cn(
              'group flex items-center gap-1.5 rounded-lg px-2.5 py-2 cursor-pointer transition-colors text-sm',
              note.id === selectedId ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate flex-1">{note.title || 'Untitled'}</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id) }}
              className="opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Delete note"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Editor */}
      {selected ? (
        <div className="flex flex-col flex-1 min-w-0 min-h-0 border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 border-b px-4 py-2.5 bg-card/50">
            <Pencil className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Note title…"
              className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/60"
            />
            <span className="text-[10px] text-muted-foreground/50 shrink-0">auto-saves on blur</span>
          </div>
          <textarea
            value={contentDraft}
            onChange={(e) => setContentDraft(e.target.value)}
            onBlur={handleContentBlur}
            placeholder="Start typing…"
            className="flex-1 resize-none bg-transparent p-4 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/40"
          />
        </div>
      ) : (
        <div className="flex flex-col flex-1 items-center justify-center gap-3 rounded-xl border border-dashed text-center p-12">
          <FileText className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Create a note to get started</p>
        </div>
      )}
    </div>
  )
}

// ── Main TasksView ──────────────────────────────────────────────────────────

interface TasksViewProps {
  projectCount?: number
}

export function TasksView({ projectCount }: TasksViewProps) {
  const [tab, setTab] = useState<ViewTab>('tasks')
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [projects, setProjects] = useState<Project[]>([])
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [kanbanSettingsOpen, setKanbanSettingsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingDueDateId, setEditingDueDateId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [dailyTarget, setDailyTarget] = useState<DailyTarget | null>(null)

  useEffect(() => {
    getUserTasks()
      .then(setTasks)
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false))

    getDailyTarget()
      .then(setDailyTarget)
      .catch(() => null)

    getUserProjects()
      .then(setProjects)
      .catch(() => null)
  }, [])

  useEffect(() => {
    const handleOpenDialog = () => {
      setEditingTask(null)
      setTaskDialogOpen(true)
    }
    window.addEventListener('xeref_open_task_dialog', handleOpenDialog)
    return () => window.removeEventListener('xeref_open_task_dialog', handleOpenDialog)
  }, [])

  const filtered = tasks
    .filter((t) => filter === 'all' || t.status === filter)
    .filter((t) => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((t) => projectFilter === 'all' || t.project_id === projectFilter)

  async function handleSaveTask(data: Partial<Task>) {
    startTransition(async () => {
      try {
        if (editingTask) {
          const updated = await updateTask(editingTask.id, data)
          setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
          toast.success('Task updated')
        } else {
          const task = await createTask(data.title as string, {
            description: data.description ?? undefined,
            priority: data.priority,
            due_date: data.due_date,
          })
          if (data.status && data.status !== 'todo') {
            const updated = await updateTask(task.id, { status: data.status })
            setTasks((prev) => [updated, ...prev])
          } else {
            setTasks((prev) => [task, ...prev])
          }
          toast.success('Task created')
        }
        setTaskDialogOpen(false)
        setEditingTask(null)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        toast.error(`Failed to save task: ${msg}`)
      }
    })
  }

  async function handleStatusCycle(task: Task) {
    const nextStatus = STATUS_CYCLE[task.status]
    const wasDone = task.status === 'done'
    const becomingDone = nextStatus === 'done'
    startTransition(async () => {
      try {
        const updated = await updateTask(task.id, { status: nextStatus })
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
        if (becomingDone && !wasDone) {
          await incrementDailyCompleted()
          setDailyTarget((prev) => prev ? { ...prev, completed: prev.completed + 1 } : prev)
        }
      } catch {
        toast.error('Failed to update task')
      }
    })
  }

  async function handleInlineDueDate(task: Task, value: string) {
    const due_date = value || null
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, due_date } : t)))
    setEditingDueDateId(null)
    try {
      await updateTask(task.id, { due_date })
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, due_date: task.due_date } : t)))
      toast.error('Failed to update due date')
    }
  }

  async function handleDelete(task: Task) {
    startTransition(async () => {
      try {
        await deleteTask(task.id)
        setTasks((prev) => prev.filter((t) => t.id !== task.id))
        toast.success('Task deleted')
        if (taskDialogOpen && editingTask?.id === task.id) {
          setTaskDialogOpen(false)
          setEditingTask(null)
        }
      } catch {
        toast.error('Failed to delete task')
      }
    })
  }

  async function handleGoalChange(n: number) {
    try {
      await setDailyGoal(n)
      setDailyTarget((prev) => prev ? { ...prev, goal: n } : prev)
    } catch {
      toast.error('Failed to update goal')
    }
  }

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }

  return (
    <section aria-label="Tasks & Notes" className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto min-h-0">
      {/* Top tabs */}
      <div className="flex items-center gap-1 mb-6 border-b pb-3">
        <button
          onClick={() => setTab('tasks')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            tab === 'tasks' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <CheckSquare className="h-4 w-4" />
          Tasks
        </button>
        <button
          onClick={() => setTab('notes')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            tab === 'notes' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <FileText className="h-4 w-4" />
          Notes
        </button>
      </div>

      {tab === 'notes' ? (
        <NotesPanel />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-start justify-between mb-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">All Tasks</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {tasks.length === 0
                  ? typeof projectCount === 'number' && projectCount > 0
                    ? `You have ${projectCount} agent${projectCount !== 1 ? 's' : ''} configured. Create tasks manually or via chat.`
                    : 'Manage your tasks or create them via chat.'
                  : `${counts.todo} to do · ${counts.in_progress} in progress · ${counts.done} done`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {dailyTarget && (
                <div className="w-48 mr-2">
                  <DailyTargetBar target={dailyTarget} onGoalChange={handleGoalChange} />
                </div>
              )}

              <div className="flex items-center rounded-md border p-0.5">
                <Button variant="ghost" size="sm" className={cn("px-2 py-1 h-7", viewMode === 'list' && "bg-accent")} onClick={() => setViewMode('list')}>
                  <ListIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className={cn("px-2 py-1 h-7", viewMode === 'kanban' && "bg-accent")} onClick={() => setViewMode('kanban')}>
                  <Kanban className="h-4 w-4" />
                </Button>
                {viewMode === 'kanban' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="px-2 py-1 h-7 ml-0.5 text-muted-foreground hover:text-foreground" onClick={() => setKanbanSettingsOpen(true)}>
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Customize kanban columns</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <Button size="sm" className="gap-2 ml-2" onClick={() => {
                setEditingTask(null)
                setTaskDialogOpen(true)
              }}>
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>

          {/* Search + project filter */}
          {viewMode === 'list' && (
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Search tasks…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-sm"
              />
              {projects.length > 0 && (
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="h-8 w-44 text-sm shrink-0">
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All projects</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Status filter tabs */}
          {viewMode === 'list' ? (
            <>
              <div className="flex gap-1 mb-4 border-b pb-2">
                {(['all', 'todo', 'in_progress', 'done'] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors',
                      filter === s
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {s.replace('_', ' ')}
                    <span className={cn(
                      'ml-1.5 text-[10px] font-bold px-1 py-0.5 rounded',
                      filter === s ? 'bg-background/50' : 'bg-muted'
                    )}>
                      {counts[s]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b mb-1">
                <span className="col-span-5">Task</span>
                <span className="col-span-2">Status</span>
                <span className="col-span-2">Priority</span>
                <span className="col-span-2">Due</span>
                <span className="col-span-1" />
              </div>

              {/* Task list */}
              {loading ? (
                <div className="flex items-center justify-center flex-1 py-12 text-sm text-muted-foreground">
                  Loading tasks…
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-3 rounded-xl border border-dashed mt-4 p-12 text-center">
                  <div className="rounded-full bg-muted p-4">
                    <CheckSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">
                    {filter === 'all' ? 'No tasks yet' : `No ${filter.replace('_', ' ')} tasks`}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    {filter === 'all'
                      ? 'Click "Add Task" or ask the chat assistant to create tasks for you.'
                      : `Switch to "All" to see tasks with other statuses.`}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y">
                  {filtered.map((task) => (
                    <div
                      key={task.id}
                      className="group grid grid-cols-12 gap-4 items-center px-3 py-3 hover:bg-accent/30 rounded-lg transition-colors"
                    >
                      <div className="col-span-5 flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => handleStatusCycle(task)}
                          className={cn(
                            'h-4 w-4 rounded border-2 shrink-0 transition-colors',
                            task.status === 'done'
                              ? 'bg-emerald-500 border-emerald-500'
                              : task.status === 'in_progress'
                              ? 'bg-blue-500/30 border-blue-500'
                              : 'border-muted-foreground hover:border-primary'
                          )}
                          aria-label="Cycle status"
                        >
                          {task.status === 'done' && (
                            <svg viewBox="0 0 12 12" className="w-full h-full text-white">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        <span className={cn('text-sm truncate', task.status === 'done' && 'line-through text-muted-foreground')}>
                          {task.title}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <Badge className={cn('text-[10px] capitalize cursor-pointer', STATUS_COLORS[task.status])} onClick={() => handleStatusCycle(task)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <Badge className={cn('text-[10px] capitalize', PRIORITY_COLORS[task.priority])}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        {editingDueDateId === task.id ? (
                          <input
                            type="date"
                            autoFocus
                            defaultValue={task.due_date ? task.due_date.split('T')[0] : ''}
                            onBlur={(e) => handleInlineDueDate(task, e.target.value)}
                            onChange={(e) => { if (e.target.value) handleInlineDueDate(task, e.target.value) }}
                            className="w-full text-xs bg-background border border-primary/40 rounded px-1.5 py-0.5 outline-none focus:border-primary"
                          />
                        ) : (
                          <button
                            onClick={() => setEditingDueDateId(task.id)}
                            className={cn(
                              'text-xs truncate hover:text-foreground transition-colors text-left w-full',
                              task.due_date ? 'text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            {task.due_date
                              ? new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                              : '—'}
                          </button>
                        )}
                      </div>
                      <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingTask(task)
                            setTaskDialogOpen(true)
                          }}
                          className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Edit task"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-start gap-4 overflow-x-auto pb-4 min-h-0 scrollbar-thin">
              {/* Basic Kanban Placeholder */}
              {(['todo', 'in_progress', 'done'] as Task['status'][]).map(status => {
                const columnTasks = tasks.filter(t => t.status === status)
                return (
                  <div key={status} className="flex flex-col flex-shrink-0 w-80 bg-accent/20 rounded-xl border border-border/50 p-4 h-full max-h-full">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          status === 'todo' ? "bg-blue-500" :
                          status === 'in_progress' ? "bg-amber-500" :
                          "bg-emerald-500"
                        )} />
                        <h3 className="font-semibold capitalize text-sm">
                          {status.replace('_', ' ')}
                        </h3>
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
                          {columnTasks.length}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setEditingTask({ status } as Task)
                          setTaskDialogOpen(true)
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-col gap-3 overflow-y-auto min-h-0 pr-1 pb-2 scrollbar-thin">
                      {columnTasks.map(task => (
                        <div 
                          key={task.id} 
                          className="bg-card hover:bg-accent/40 border border-border/50 rounded-xl p-4 shadow-sm flex flex-col gap-3 group cursor-pointer hover:border-primary/30 transition-all duration-200" 
                          onClick={() => { setEditingTask(task); setTaskDialogOpen(true); }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                              {task.title}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(task) }}
                              className="opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive transition-all p-1 hover:bg-destructive/10 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/10">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className={cn('text-[10px] h-5 px-2 capitalize font-medium', PRIORITY_COLORS[task.priority])}>
                                {task.priority}
                              </Badge>
                            </div>
                            {task.due_date && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                <span className="opacity-50">Due</span>
                                {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {columnTasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-muted-foreground/10 rounded-xl text-center">
                          <p className="text-xs text-muted-foreground/40 font-medium italic">
                            No tasks in this stage
                          </p>
                        </div>
                      )}

                      <button 
                        className="w-full py-2.5 rounded-xl border border-dashed border-border/50 text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 hover:border-primary/30 transition-all text-xs font-medium flex items-center justify-center gap-2 mt-1"
                        onClick={() => {
                          setEditingTask({ status } as Task)
                          setTaskDialogOpen(true)
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add New Task
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <TaskDialog
            open={taskDialogOpen}
            onOpenChange={setTaskDialogOpen}
            task={editingTask}
            onSave={handleSaveTask}
            onDelete={handleDelete}
          />
          <KanbanSettingsDialog
            open={kanbanSettingsOpen}
            onOpenChange={setKanbanSettingsOpen}
          />
        </>
      )}
    </section>
  )
}
