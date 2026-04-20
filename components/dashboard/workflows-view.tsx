'use client'

import { useState, useEffect, useTransition } from 'react'
import { GitFork, Brain, ToggleLeft, ToggleRight, Plus, Trash2, X, Link, Clock, Pencil, Activity, CheckCircle2, XCircle, ChevronRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getUserWorkflows, updateWorkflow, seedDefaultWorkflows, createWorkflow, deleteWorkflow, getWorkflowExecutions, runWorkflow, updateExecutionResult, deleteExecution } from '@/app/actions/workflows'
import type { WorkflowExecution } from '@/app/actions/workflows'
import type { Workflow } from '@/lib/types'

const TRIGGER_OPTIONS: { value: string; label: string }[] = [
  { value: 'chat_message_sent', label: 'When a chat message is sent' },
  { value: 'task_created', label: 'When a task is created' },
  { value: 'task_completed', label: 'When a task is completed' },
  { value: 'schedule', label: 'Run workflow on a schedule' },
  { value: 'scheduled_daily', label: 'Daily at 9:00 AM' },
  { value: 'scheduled_weekly', label: 'Every Monday' },
  { value: 'cron', label: 'Cron schedule (custom)' },
  { value: 'webhook', label: 'Incoming webhook' },
]

const SCHEDULE_TRIGGERS = new Set(['schedule', 'scheduled_daily', 'scheduled_weekly', 'cron'])

function parseCronToHuman(expr: string): string {
  if (!expr.trim()) return ''
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return expr

  const [min, hour, dom, , dow] = parts
  const pad = (n: string) => n.padStart(2, '0')

  if (dow !== '*' && dom === '*') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const day = days[parseInt(dow, 10)] ?? dow
    if (min !== '*' && hour !== '*') return `Every ${day} at ${pad(hour)}:${pad(min)}`
  }
  if (dom === '*' && dow === '*') {
    if (min !== '*' && hour !== '*') return `Every day at ${pad(hour)}:${pad(min)}`
    if (min.startsWith('*/')) return `Every ${min.slice(2)} minutes`
    if (hour.startsWith('*/')) return `Every ${hour.slice(2)} hours`
  }
  return expr
}

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

function needsCronInput(trigger: string) {
  return trigger === 'cron' || trigger === 'schedule'
}

interface WorkflowsViewProps {
  projectCount?: number
}

export function WorkflowsView({ projectCount }: WorkflowsViewProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Create form
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTrigger, setNewTrigger] = useState(TRIGGER_OPTIONS[0].value)
  const [newTriggerDescription, setNewTriggerDescription] = useState('')
  const [newAction, setNewAction] = useState(ACTION_OPTIONS[0].value)
  const [cronExpr, setCronExpr] = useState('0 9 * * *')

  // Executions log
  const [showLogs, setShowLogs] = useState(false)
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  // Edit form
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editTrigger, setEditTrigger] = useState('')
  const [editTriggerDescription, setEditTriggerDescription] = useState('')
  const [editAction, setEditAction] = useState('')
  const [editCronExpr, setEditCronExpr] = useState('0 9 * * *')

  // Run Now modal
  const [runModalWorkflow, setRunModalWorkflow] = useState<Workflow | null>(null)
  const [runMessage, setRunMessage] = useState('')
  const [runMessageError, setRunMessageError] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  // Two-stage delete confirmation
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)

  // Cron validation
  const [cronError, setCronError] = useState(false)
  const [editCronError, setEditCronError] = useState(false)

  // Log editing
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [editLogText, setEditLogText] = useState('')
  const [savingLog, setSavingLog] = useState(false)

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

  async function toggleLogs() {
    if (showLogs) { setShowLogs(false); return }
    setShowLogs(true)
    setLogsLoading(true)
    try {
      const data = await getWorkflowExecutions()
      setExecutions(data)
    } catch {
      toast.error('Failed to load execution logs')
    } finally {
      setLogsLoading(false)
    }
  }

  function openRunModal(workflow: Workflow) {
    setRunModalWorkflow(workflow)
    setRunMessage('')
  }

  async function handleRunNow() {
    if (!runModalWorkflow) return
    const needsMessage = runModalWorkflow.trigger === 'chat_message_sent'
    if (needsMessage && !runMessage.trim()) { setRunMessageError(true); return }
    setIsRunning(true)
    try {
      await runWorkflow(runModalWorkflow.id, needsMessage ? { userMessage: runMessage.trim() } : undefined)
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === runModalWorkflow.id
            ? { ...w, last_run_at: new Date().toISOString(), last_run_result: 'Triggered manually' }
            : w
        )
      )
      toast.success(`"${runModalWorkflow.name}" triggered`)
      setRunModalWorkflow(null)
      setRunMessage('')
      if (showLogs) {
        const data = await getWorkflowExecutions()
        setExecutions(data)
      }
    } catch {
      toast.error('Failed to run workflow')
    } finally {
      setIsRunning(false)
    }
  }

  async function handleSaveLog(id: string) {
    setSavingLog(true)
    try {
      await updateExecutionResult(id, editLogText)
      setExecutions((prev) =>
        prev.map((ex) =>
          ex.id === id ? { ...ex, metadata: { ...ex.metadata, result: editLogText } } : ex
        )
      )
      setEditingLogId(null)
    } catch {
      toast.error('Failed to save log')
    } finally {
      setSavingLog(false)
    }
  }

  async function handleDeleteLog(id: string) {
    try {
      await deleteExecution(id)
      setExecutions((prev) => prev.filter((ex) => ex.id !== id))
      setEditingLogId(null)
    } catch {
      toast.error('Failed to delete log entry')
    }
  }

  function openEdit(workflow: Workflow) {
    setEditingId(workflow.id)
    setEditName(workflow.name)
    setEditTrigger(workflow.trigger)
    setEditTriggerDescription(workflow.trigger_description ?? '')
    setEditAction(workflow.action)
    setEditCronExpr(workflow.cron_expression ?? '0 9 * * *')
  }

  function handleEditTriggerChange(trigger: string) {
    setEditTrigger(trigger)
    if (SCHEDULE_TRIGGERS.has(trigger) && editAction === 'save_memory') {
      setEditAction('create_task')
    }
  }

  function handleNewTriggerChange(trigger: string) {
    setNewTrigger(trigger)
    if (SCHEDULE_TRIGGERS.has(trigger) && newAction === 'save_memory') {
      setNewAction('create_task')
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    const triggerDescription = newTriggerDescription.trim()
    if (!name) return
    if (needsCronInput(newTrigger) && cronExpr.trim().split(/\s+/).length !== 5) { setCronError(true); return }
    startTransition(async () => {
      try {
        const workflow = await createWorkflow(name, newTrigger, newAction, {
          cron_expression: needsCronInput(newTrigger) ? cronExpr : undefined,
          trigger_description: triggerDescription || undefined,
        })
        setWorkflows((prev) => [...prev, workflow])
        setNewName('')
        setNewTrigger(TRIGGER_OPTIONS[0].value)
        setNewTriggerDescription('')
        setNewAction(ACTION_OPTIONS[0].value)
        setCronExpr('0 9 * * *')
        setShowForm(false)
        toast.success('Workflow created')
      } catch (err) {
        toast.error(`Failed to create workflow: ${err instanceof Error ? err.message : String(err)}`)
      }
    })
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    const name = editName.trim()
    const triggerDescription = editTriggerDescription.trim()
    if (!name) return
    if (needsCronInput(editTrigger) && editCronExpr.trim().split(/\s+/).length !== 5) { setEditCronError(true); return }
    startTransition(async () => {
      try {
        const updated = await updateWorkflow(editingId, {
          name,
          trigger: editTrigger,
          trigger_description: triggerDescription || null,
          action: editAction,
          cron_expression: needsCronInput(editTrigger) ? editCronExpr : null,
        })
        setWorkflows((prev) => prev.map((w) => (w.id === updated.id ? updated : w)))
        setEditingId(null)
        toast.success('Workflow saved')
      } catch {
        toast.error('Failed to save workflow')
      }
    })
  }

  return (
    <section aria-label="Workflows" className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 gap-y-3">
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

          <div className="flex flex-col gap-1">
            <label htmlFor="new-workflow-name" className="text-xs text-muted-foreground font-medium">Workflow name</label>
            <Input
              id="new-workflow-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Workflow name…"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="new-workflow-trigger" className="text-xs text-muted-foreground font-medium">When to run</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button id="new-workflow-trigger" type="button" variant="outline" size="sm" className="justify-start w-full truncate">
                  {TRIGGER_LABELS[newTrigger]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                {TRIGGER_OPTIONS.map((o) => (
                  <DropdownMenuItem
                    key={o.value}
                    onClick={() => handleNewTriggerChange(o.value)}
                    className={cn('cursor-pointer', newTrigger === o.value && 'bg-accent')}
                  >
                    {o.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <textarea
              id="new-workflow-trigger-description"
              value={newTriggerDescription}
              onChange={(e) => setNewTriggerDescription(e.target.value)}
              placeholder="Describe exactly when this should run… *"
              rows={2}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          {needsCronInput(newTrigger) && (() => {
            const cronHuman = parseCronToHuman(cronExpr)
            return (
              <div className="flex flex-col gap-1">
                <label htmlFor="new-workflow-cron" className="text-xs text-muted-foreground font-medium">Cron expression</label>
                <Input
                  id="new-workflow-cron"
                  value={cronExpr}
                  onChange={(e) => { setCronExpr(e.target.value); setCronError(false) }}
                  placeholder="0 9 * * *"
                  className="font-mono text-sm"
                  aria-invalid={cronError}
                  aria-describedby={cronError ? 'new-cron-error' : undefined}
                />
                {cronError && (
                  <p id="new-cron-error" role="alert" className="text-xs text-destructive">
                    Enter a valid 5-field cron expression (e.g. 0 9 * * 1)
                  </p>
                )}
                {!cronError && cronHuman !== cronExpr && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {cronHuman}
                  </p>
                )}
              </div>
            )
          })()}

          <div className="flex flex-col gap-1">
            <label htmlFor="new-workflow-action" className="text-xs text-muted-foreground font-medium">What to do</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button id="new-workflow-action" type="button" variant="outline" size="sm" className="justify-start w-full truncate">
                  {ACTION_LABELS[newAction]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {ACTION_OPTIONS.map((o) => {
                  const disabled = SCHEDULE_TRIGGERS.has(newTrigger) && o.value === 'save_memory'
                  return (
                    <DropdownMenuItem
                      key={o.value}
                      onClick={() => setNewAction(o.value)}
                      disabled={disabled}
                      className={cn(
                        'cursor-pointer',
                        newAction === o.value && 'bg-accent',
                        disabled && 'opacity-40 cursor-not-allowed'
                      )}
                    >
                      {o.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!newName.trim() || isPending}>
              {isPending ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      )}

      {/* Description card — click to view execution logs */}
      <div className="mb-6">
        <button
          type="button"
          onClick={toggleLogs}
          aria-expanded={showLogs}
          aria-controls="execution-logs-panel"
          className={cn(
            'group w-full text-left rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-primary/5',
            showLogs && 'rounded-b-none border-b-0 border-primary/40 bg-primary/5'
          )}
        >
          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors group-hover:bg-primary/20">
              <GitFork className="h-5 w-5 text-primary group-hover:hidden" />
              <Activity className="h-5 w-5 text-primary hidden group-hover:block" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Automate your agent pipelines</p>
              <p className="text-sm text-muted-foreground">
                {typeof projectCount === 'number' && projectCount > 0
                  ? `You have ${projectCount} agent${projectCount !== 1 ? 's' : ''} ready to automate. Toggle workflows on or off to control which automations are active.`
                  : 'Workflows run automatically when triggered by chat or agent activity. Toggle each one on or off as needed.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5">
              <Activity className="h-3.5 w-3.5" />
              <span>Executions</span>
              <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', showLogs && 'rotate-90')} />
            </div>
          </div>
        </button>

        {/* Execution logs panel */}
        {showLogs && (
          <div id="execution-logs-panel" className="rounded-b-xl border border-t-0 border-primary/40 bg-card/50 divide-y divide-border">
            <div className="px-5 py-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Recent Executions</p>
              <button
                type="button"
                onClick={async () => {
                  setLogsLoading(true)
                  try { setExecutions(await getWorkflowExecutions()) } catch { toast.error('Refresh failed') } finally { setLogsLoading(false) }
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Refresh
              </button>
            </div>

            {logsLoading ? (
              <div role="status" aria-live="polite" className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</div>
            ) : executions.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Activity className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No executions yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Runs will appear here each time a workflow fires.</p>
              </div>
            ) : (
              <div className="relative divide-y divide-border max-h-80 overflow-y-auto [mask-image:linear-gradient(to_bottom,black_calc(100%-2rem),transparent_100%)]">
                {executions.map((ex) => {
                  const wf = workflows.find((w) => w.id === ex.metadata?.workflow_id)
                  const failed = ex.metadata?.result?.toLowerCase().startsWith('fail')
                  const isEditingLog = editingLogId === ex.id
                  return (
                    <div key={ex.id} className="group/log px-5 py-3 flex items-start gap-3">
                      {failed ? (
                        <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {wf?.name ?? ex.metadata?.workflow_id ?? 'Workflow'}
                        </p>
                        {isEditingLog ? (
                          <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-2">
                              <input
                                autoFocus
                                value={editLogText}
                                onChange={(e) => setEditLogText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveLog(ex.id)
                                  if (e.key === 'Escape') setEditingLogId(null)
                                }}
                                className="flex-1 text-xs bg-muted border border-border rounded px-2 py-0.5 outline-none focus:border-primary/60"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveLog(ex.id)}
                                disabled={savingLog}
                                className="text-xs text-primary hover:text-primary/80"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingLogId(null)}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                Cancel
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteLog(ex.id)}
                              className="self-start text-xs text-destructive hover:text-destructive/80 flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground truncate">{ex.metadata?.result}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-mono">
                          {ex.metadata?.trigger} → {ex.metadata?.action}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        <button
                          type="button"
                          aria-label="Edit log entry"
                          onClick={() => {
                            setEditingLogId(ex.id)
                            setEditLogText(ex.metadata?.result ?? '')
                          }}
                          className="opacity-0 group-hover/log:opacity-100 focus:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-[10px] text-muted-foreground/60 font-mono whitespace-nowrap">
                          {new Date(ex.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Workflow list */}
      {loading ? (
        <div role="status" aria-live="polite" className="flex items-center justify-center flex-1 py-12 text-sm text-muted-foreground">
          Loading workflows…
        </div>
      ) : workflows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <GitFork className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium">No workflows yet</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Create your first automation to run actions triggered by agent activity.
          </p>
          <Button size="sm" className="gap-2 mt-1" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Create Workflow
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="flex flex-col">
              <div
                className={cn(
                  'group rounded-xl border p-5 flex items-center gap-4 transition-all',
                  editingId === workflow.id ? 'rounded-b-none border-b-0' : '',
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
                    {workflow.cron_expression && (
                      <span className="ml-1 font-mono text-[10px] bg-muted px-1 rounded">{parseCronToHuman(workflow.cron_expression)}</span>
                    )}
                    {' → '}
                    <span className="text-foreground/60">{ACTION_LABELS[workflow.action] ?? workflow.action}</span>
                  </p>
                  {workflow.trigger_description && (
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5 italic">{workflow.trigger_description}</p>
                  )}
                  {workflow.trigger === 'webhook' && workflow.webhook_secret && (
                    <button
                      type="button"
                      className="flex items-center gap-1 mt-1 text-[10px] text-primary/70 hover:text-primary transition-colors"
                      onClick={() => {
                        const webhookUrl = `${location.origin}/api/webhooks/workflow?secret=${workflow.webhook_secret}`
                        navigator.clipboard.writeText(webhookUrl)
                        toast.success('Webhook URL copied')
                      }}
                    >
                      <Link className="h-2.5 w-2.5" />
                      Copy webhook URL
                    </button>
                  )}
                  {workflow.last_run_at && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      Last run: {new Date(workflow.last_run_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                      {workflow.last_run_result && ` — ${workflow.last_run_result}`}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openRunModal(workflow)}
                    disabled={isPending}
                    aria-label="Run workflow"
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 group-focus-within:opacity-100 transition-opacity h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Play className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEdit(workflow)}
                    aria-label="Edit workflow"
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 group-focus-within:opacity-100 transition-opacity h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle(workflow)}
                    disabled={isPending}
                    aria-label={workflow.enabled ? 'Disable workflow' : 'Enable workflow'}
                    className="transition-colors rounded focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    {workflow.enabled ? (
                      <ToggleRight className="h-8 w-8 text-primary" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Inline edit form */}
              {editingId === workflow.id && (
                <form
                  onSubmit={handleSaveEdit}
                  className="rounded-b-xl border border-t-0 border-primary/20 bg-card/50 p-5 flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Edit Workflow Template</p>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="edit-workflow-name" className="text-xs text-muted-foreground font-medium">Workflow name</label>
                    <Input
                      id="edit-workflow-name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Workflow name…"
                      autoFocus
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="edit-workflow-trigger" className="text-xs text-muted-foreground font-medium">When to run</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button id="edit-workflow-trigger" type="button" variant="outline" size="sm" className="justify-start w-full truncate">
                          {TRIGGER_LABELS[editTrigger] ?? editTrigger}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-72">
                        {TRIGGER_OPTIONS.map((o) => (
                          <DropdownMenuItem
                            key={o.value}
                            onClick={() => handleEditTriggerChange(o.value)}
                            className={cn('cursor-pointer', editTrigger === o.value && 'bg-accent')}
                          >
                            {o.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <textarea
                      id="edit-workflow-trigger-description"
                      value={editTriggerDescription}
                      onChange={(e) => setEditTriggerDescription(e.target.value)}
                      placeholder="Describe exactly when this should run… *"
                      rows={2}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                  </div>

                  {needsCronInput(editTrigger) && (() => {
                    const editCronHuman = parseCronToHuman(editCronExpr)
                    return (
                      <div className="flex flex-col gap-1">
                        <label htmlFor="edit-workflow-cron" className="text-xs text-muted-foreground font-medium">Cron expression</label>
                        <Input
                          id="edit-workflow-cron"
                          value={editCronExpr}
                          onChange={(e) => { setEditCronExpr(e.target.value); setEditCronError(false) }}
                          placeholder="0 9 * * *"
                          className="font-mono text-sm"
                          aria-invalid={editCronError}
                          aria-describedby={editCronError ? 'edit-cron-error' : undefined}
                        />
                        {editCronError && (
                          <p id="edit-cron-error" role="alert" className="text-xs text-destructive">
                            Enter a valid 5-field cron expression (e.g. 0 9 * * 1)
                          </p>
                        )}
                        {!editCronError && editCronHuman !== editCronExpr && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {editCronHuman}
                          </p>
                        )}
                      </div>
                    )
                  })()}

                  <div className="flex flex-col gap-1">
                    <label htmlFor="edit-workflow-action" className="text-xs text-muted-foreground font-medium">What to do</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button id="edit-workflow-action" type="button" variant="outline" size="sm" className="justify-start w-full truncate">
                          {ACTION_LABELS[editAction] ?? editAction}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64">
                        {ACTION_OPTIONS.map((o) => {
                          const disabled = SCHEDULE_TRIGGERS.has(editTrigger) && o.value === 'save_memory'
                          return (
                            <DropdownMenuItem
                              key={o.value}
                              onClick={() => setEditAction(o.value)}
                              disabled={disabled}
                              className={cn(
                                'cursor-pointer',
                                editAction === o.value && 'bg-accent',
                                disabled && 'opacity-40 cursor-not-allowed'
                              )}
                            >
                              {o.label}
                            </DropdownMenuItem>
                          )
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {confirmingDeleteId === workflow.id ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isPending}
                        onClick={() => { handleDelete(workflow); setEditingId(null); setConfirmingDeleteId(null) }}
                        className="gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Click again to confirm
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={() => setConfirmingDeleteId(workflow.id)}
                        className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    )}
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" disabled={!editName.trim() || isPending}>
                        {isPending ? 'Saving…' : 'Save Workflow'}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Run Now Modal */}
      <Dialog open={!!runModalWorkflow} onOpenChange={(open) => { if (!open) { setRunModalWorkflow(null); setRunMessage(''); setRunMessageError(false) } }}>
        <DialogContent aria-label="Run workflow now" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Run &ldquo;{runModalWorkflow?.name}&rdquo; Now</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            {runModalWorkflow?.trigger === 'chat_message_sent' && (
              <>
                <label htmlFor="run-message" className="text-sm font-medium">User Message</label>
                <textarea
                  id="run-message"
                  value={runMessage}
                  onChange={(e) => { setRunMessage(e.target.value); setRunMessageError(false) }}
                  placeholder="Type the message that should trigger this workflow…"
                  rows={4}
                  autoFocus
                  required
                  aria-required="true"
                  aria-invalid={runMessageError}
                  aria-describedby={runMessageError ? 'run-message-error' : undefined}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
                {runMessageError && (
                  <p id="run-message-error" role="alert" className="text-xs text-destructive">A message is required to trigger this workflow.</p>
                )}
                {!runMessageError && <p className="text-xs text-muted-foreground">Required. This emulates the chat message trigger.</p>}
              </>
            )}
            {runModalWorkflow?.trigger !== 'chat_message_sent' && (
              <p className="text-sm text-muted-foreground">
                This will manually trigger the workflow once. Execution will appear in the logs panel.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setRunModalWorkflow(null); setRunMessage('') }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isRunning || (runModalWorkflow?.trigger === 'chat_message_sent' && !runMessage.trim())}
              onClick={handleRunNow}
            >
              {isRunning ? 'Running…' : 'Run Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
