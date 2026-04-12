'use client'

import { useState, useEffect, useTransition } from 'react'
import { GitFork, Brain, ToggleLeft, ToggleRight, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getUserWorkflows, updateWorkflow, seedDefaultWorkflows, createWorkflow, deleteWorkflow } from '@/app/actions/workflows'
import type { Workflow } from '@/lib/types'

const TRIGGER_OPTIONS: { value: string; label: string }[] = [
  { value: 'chat_message_sent', label: 'When a chat message is sent' },
  { value: 'task_created', label: 'When a task is created' },
  { value: 'task_completed', label: 'When a task is completed' },
  { value: 'scheduled_daily', label: 'Daily at 9:00 AM' },
  { value: 'scheduled_weekly', label: 'Every Monday' },
]

const ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: 'save_memory', label: 'Save to memory' },
  { value: 'create_task', label: 'Create a task' },
  { value: 'run_agent', label: 'Run agent' },
  { value: 'send_notification', label: 'Send notification' },
]

const TRIGGER_LABELS: Record<string, string> = Object.fromEntries(
  TRIGGER_OPTIONS.map((o) => [o.value, o.label])
)

const ACTION_LABELS: Record<string, string> = Object.fromEntries(
  ACTION_OPTIONS.map((o) => [o.value, o.label])
)

const ACTION_ICONS: Record<string, React.ReactNode> = {
  save_memory: <Brain className="h-4 w-4 text-violet-400" />,
}

interface WorkflowsViewProps {
  projectCount?: number
}

export function WorkflowsView({ projectCount }: WorkflowsViewProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTrigger, setNewTrigger] = useState(TRIGGER_OPTIONS[0].value)
  const [newAction, setNewAction] = useState(ACTION_OPTIONS[0].value)

  useEffect(() => {
    async function load() {
      try {
        await seedDefaultWorkflows()
        const data = await getUserWorkflows()
        setWorkflows(data)
      } catch {
        toast.error('Failed to load workflows')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleToggle(workflow: Workflow) {
    startTransition(async () => {
      try {
        const updated = await updateWorkflow(workflow.id, { enabled: !workflow.enabled })
        setWorkflows((prev) => prev.map((w) => (w.id === updated.id ? updated : w)))
        toast.success(updated.enabled ? `"${workflow.name}" enabled` : `"${workflow.name}" disabled`)
      } catch {
        toast.error('Failed to update workflow')
      }
    })
  }

  function handleDelete(workflow: Workflow) {
    startTransition(async () => {
      try {
        await deleteWorkflow(workflow.id)
        setWorkflows((prev) => prev.filter((w) => w.id !== workflow.id))
        toast.success(`"${workflow.name}" deleted`)
      } catch {
        toast.error('Failed to delete workflow')
      }
    })
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    startTransition(async () => {
      try {
        const workflow = await createWorkflow(name, newTrigger, newAction)
        setWorkflows((prev) => [...prev, workflow])
        setNewName('')
        setNewTrigger(TRIGGER_OPTIONS[0].value)
        setNewAction(ACTION_OPTIONS[0].value)
        setShowForm(false)
        toast.success('Workflow created')
      } catch {
        toast.error('Failed to create workflow')
      }
    })
  }

  return (
    <section aria-label="Workflows" className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflows</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automate actions triggered by your agent activity.
          </p>
        </div>
        <Button size="sm" className="gap-2 shrink-0" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border bg-card p-5 mb-6 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">New Workflow</p>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Workflow name…"
            autoFocus
          />

          <div className="flex gap-3 flex-wrap">
            <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
              <label className="text-xs text-muted-foreground font-medium">Trigger</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="justify-start w-full truncate">
                    {TRIGGER_LABELS[newTrigger]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {TRIGGER_OPTIONS.map((o) => (
                    <DropdownMenuItem
                      key={o.value}
                      onClick={() => setNewTrigger(o.value)}
                      className={cn('cursor-pointer', newTrigger === o.value && 'bg-accent')}
                    >
                      {o.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
              <label className="text-xs text-muted-foreground font-medium">Action</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="justify-start w-full truncate">
                    {ACTION_LABELS[newAction]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {ACTION_OPTIONS.map((o) => (
                    <DropdownMenuItem
                      key={o.value}
                      onClick={() => setNewAction(o.value)}
                      className={cn('cursor-pointer', newAction === o.value && 'bg-accent')}
                    >
                      {o.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!newName.trim() || isPending}>
              Create
            </Button>
          </div>
        </form>
      )}

      {/* Description card */}
      <div className="rounded-xl border bg-card p-5 mb-6">
        <div className="flex gap-4 items-start">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <GitFork className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Automate your agent pipelines</p>
            <p className="text-sm text-muted-foreground">
              {typeof projectCount === 'number' && projectCount > 0
                ? `You have ${projectCount} agent${projectCount !== 1 ? 's' : ''} ready to automate. Toggle workflows on or off to control which automations are active.`
                : 'Workflows run automatically when triggered by chat or agent activity. Toggle each one on or off as needed.'}
            </p>
          </div>
        </div>
      </div>

      {/* Workflow list */}
      {loading ? (
        <div className="flex items-center justify-center flex-1 py-12 text-sm text-muted-foreground">
          Loading workflows…
        </div>
      ) : workflows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <GitFork className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium">No workflows yet</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Click "Create Workflow" to automate your first agent pipeline.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className={cn(
                'group rounded-xl border p-5 flex items-center gap-4 transition-all',
                workflow.enabled ? 'bg-card border-primary/20' : 'bg-muted/20 border-border opacity-70'
              )}
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                {ACTION_ICONS[workflow.action] ?? <GitFork className="h-4 w-4 text-muted-foreground" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium truncate">{workflow.name}</p>
                  {workflow.enabled ? (
                    <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">Paused</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground/60">{TRIGGER_LABELS[workflow.trigger] ?? workflow.trigger}</span>
                  {' → '}
                  <span className="text-foreground/60">{ACTION_LABELS[workflow.action] ?? workflow.action}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDelete(workflow)}
                  disabled={isPending}
                  aria-label="Delete workflow"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleToggle(workflow)}
                  disabled={isPending}
                  aria-label={workflow.enabled ? 'Disable workflow' : 'Enable workflow'}
                  className="transition-colors"
                >
                  {workflow.enabled ? (
                    <ToggleRight className="h-8 w-8 text-primary" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
