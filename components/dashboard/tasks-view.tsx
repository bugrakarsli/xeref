'use client'

import { useState, useEffect, useTransition } from 'react'
import { CheckSquare, Plus, Trash2, ChevronDown } from 'lucide-react'
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
import { createTask, getUserTasks, updateTask, deleteTask } from '@/app/actions/tasks'
import type { Task } from '@/lib/types'

type StatusFilter = 'all' | 'todo' | 'in_progress' | 'done'

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

interface TasksViewProps {
  projectCount?: number
}

export function TasksView({ projectCount }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium')
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getUserTasks()
      .then(setTasks)
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    startTransition(async () => {
      try {
        const task = await createTask(title, { priority: newPriority })
        setTasks((prev) => [task, ...prev])
        setNewTitle('')
        setShowForm(false)
        toast.success('Task created')
      } catch (err) {
        console.error('[TasksView] createTask failed:', err)
        const msg = err instanceof Error ? err.message : 'Unknown error'
        toast.error(`Failed to create task: ${msg}`)
      }
    })
  }

  async function handleStatusCycle(task: Task) {
    const nextStatus = STATUS_CYCLE[task.status]
    startTransition(async () => {
      try {
        const updated = await updateTask(task.id, { status: nextStatus })
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      } catch {
        toast.error('Failed to update task')
      }
    })
  }

  async function handleDelete(task: Task) {
    startTransition(async () => {
      try {
        await deleteTask(task.id)
        setTasks((prev) => prev.filter((t) => t.id !== task.id))
        toast.success('Task deleted')
      } catch {
        toast.error('Failed to delete task')
      }
    })
  }

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }

  return (
    <section aria-label="All Tasks" className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
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
        <Button size="sm" className="gap-2 shrink-0" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="flex gap-2 mb-4">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Task title…"
            className="flex-1"
            autoFocus
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="gap-1.5 capitalize">
                {newPriority}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(['low', 'medium', 'high'] as Task['priority'][]).map((p) => (
                <DropdownMenuItem key={p} onClick={() => setNewPriority(p)} className="capitalize">
                  {p}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="submit" size="sm" disabled={!newTitle.trim() || isPending}>
            Create
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </form>
      )}

      {/* Status filter tabs */}
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
              <div className="col-span-2 text-xs text-muted-foreground truncate">
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
              </div>
              <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(task)}
                  className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Delete task"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
