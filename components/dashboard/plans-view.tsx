'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Plan, PlanPhase, PlanTask, PlanKpi } from '@/lib/types'
import { ChevronDown, ChevronRight, Plus, Trash2, Sparkles, Loader2, FileText } from 'lucide-react'

// ── Inline editable cell ────────────────────────────────────────────────────

function EditableCell({
  value,
  onSave,
  multiline = false,
  className,
}: {
  value: string
  onSave: (val: string) => void
  multiline?: boolean
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null)

  useEffect(() => { setDraft(value) }, [value])

  function commit() {
    setEditing(false)
    if (draft.trim() !== value) onSave(draft.trim())
  }

  if (!editing) {
    return (
      <span
        className={cn('cursor-text hover:bg-accent/30 rounded px-1 py-0.5 transition-colors', className)}
        onClick={() => { setEditing(true); setTimeout(() => ref.current?.focus(), 0) }}
      >
        {value || <span className="text-muted-foreground/40 italic">—</span>}
      </span>
    )
  }

  if (multiline) {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
        rows={3}
        className={cn('w-full rounded border bg-background px-1 py-0.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-ring', className)}
      />
    )
  }

  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
      className={cn('w-full rounded border bg-background px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring', className)}
    />
  )
}

// ── Phase section ────────────────────────────────────────────────────────────

const TASK_COLS: { key: keyof PlanTask; label: string; multiline?: boolean; width: string }[] = [
  { key: 'title',        label: 'Task',          width: 'w-36 min-w-[9rem]' },
  { key: 'skill',        label: 'Skill',         width: 'w-28 min-w-[7rem]' },
  { key: 'description',  label: 'Description',   width: 'flex-1 min-w-[12rem]', multiline: true },
  { key: 'role',         label: 'Role',          width: 'w-32 min-w-[8rem]' },
  { key: 'timeline',     label: 'Timeline',      width: 'w-24 min-w-[6rem]' },
  { key: 'deliverables', label: 'Deliverables',  width: 'w-40 min-w-[10rem]', multiline: true },
]

function PhaseSection({
  phase,
  onChange,
  onDelete,
}: {
  phase: PlanPhase
  onChange: (updated: PlanPhase) => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(true)

  function updateTask(taskId: string, key: keyof PlanTask, val: string) {
    onChange({
      ...phase,
      tasks: phase.tasks.map(t => t.id === taskId ? { ...t, [key]: val } : t),
    })
  }

  function addTask() {
    const id = `t_${Date.now()}`
    onChange({
      ...phase,
      tasks: [...phase.tasks, { id, title: 'New task', skill: '', description: '', role: '', timeline: '', deliverables: '' }],
    })
  }

  function deleteTask(taskId: string) {
    onChange({ ...phase, tasks: phase.tasks.filter(t => t.id !== taskId) })
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Phase header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b">
        <button
          onClick={() => setOpen(o => !o)}
          className="p-0.5 hover:bg-accent rounded transition-colors"
        >
          {open
            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
            : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </button>
        <div className="flex-1 flex items-center gap-3">
          <EditableCell
            value={phase.title}
            onSave={v => onChange({ ...phase, title: v })}
            className="text-sm font-semibold"
          />
          <EditableCell
            value={phase.subtitle}
            onSave={v => onChange({ ...phase, subtitle: v })}
            className="text-xs text-muted-foreground"
          />
        </div>
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-destructive/20 hover:text-destructive text-muted-foreground/40 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/20">
                  {TASK_COLS.map(col => (
                    <th key={col.key} className={cn('px-3 py-2 text-left font-medium text-muted-foreground', col.width)}>
                      {col.label}
                    </th>
                  ))}
                  <th className="w-8 px-2" />
                </tr>
              </thead>
              <tbody>
                {phase.tasks.map((task, i) => (
                  <tr key={task.id} className={cn('border-b last:border-0', i % 2 === 0 ? 'bg-background' : 'bg-muted/10')}>
                    {TASK_COLS.map(col => (
                      <td key={col.key} className={cn('px-3 py-1.5 align-top', col.width)}>
                        <EditableCell
                          value={task[col.key]}
                          onSave={v => updateTask(task.id, col.key, v)}
                          multiline={col.multiline}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1.5 align-top">
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-0.5 rounded hover:bg-destructive/20 hover:text-destructive text-muted-foreground/30 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addTask}
            className="flex items-center gap-1.5 px-4 py-2 w-full text-left text-xs text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors border-t"
          >
            <Plus className="h-3.5 w-3.5" />
            Add task
          </button>
        </>
      )}
    </div>
  )
}

// ── KPIs section ─────────────────────────────────────────────────────────────

function KpisSection({ kpis, onChange }: { kpis: PlanKpi[]; onChange: (kpis: PlanKpi[]) => void }) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="px-4 py-2.5 bg-muted/40 border-b">
        <h3 className="text-sm font-semibold">Key Performance Indicators</h3>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, ki) => (
          <div key={ki} className="flex flex-col gap-1.5">
            <EditableCell
              value={kpi.category}
              onSave={v => {
                const next = [...kpis]
                next[ki] = { ...next[ki], category: v }
                onChange(next)
              }}
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            />
            <ul className="space-y-1">
              {kpi.metrics.map((m, mi) => (
                <li key={mi} className="flex items-start gap-1.5">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                  <EditableCell
                    value={m}
                    onSave={v => {
                      const next = [...kpis]
                      next[ki] = { ...next[ki], metrics: next[ki].metrics.map((x, i) => i === mi ? v : x) }
                      onChange(next)
                    }}
                    className="text-xs"
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Plan detail ───────────────────────────────────────────────────────────────

function PlanDetail({ plan, onUpdate }: { plan: Plan; onUpdate: (updated: Plan) => void }) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const persist = useCallback((patch: Partial<Plan>) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/plans/${plan.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        })
        if (!res.ok) throw new Error()
      } catch {
        toast.error('Failed to save')
      }
    }, 800)
  }, [plan.id])

  function updatePhase(phaseId: string, updated: PlanPhase) {
    const content = { ...plan.content, phases: plan.content.phases.map(p => p.id === phaseId ? updated : p) }
    const next = { ...plan, content }
    onUpdate(next)
    persist({ content })
  }

  function deletePhase(phaseId: string) {
    const content = { ...plan.content, phases: plan.content.phases.filter(p => p.id !== phaseId) }
    const next = { ...plan, content }
    onUpdate(next)
    persist({ content })
  }

  function addPhase() {
    const id = `phase_${Date.now()}`
    const content = {
      ...plan.content,
      phases: [...plan.content.phases, { id, title: 'New Phase', subtitle: '', tasks: [] }],
    }
    const next = { ...plan, content }
    onUpdate(next)
    persist({ content })
  }

  function updateKpis(kpis: PlanKpi[]) {
    const content = { ...plan.content, kpis }
    const next = { ...plan, content }
    onUpdate(next)
    persist({ content })
  }

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      {/* Title */}
      <div>
        <EditableCell
          value={plan.title}
          onSave={v => {
            const next = { ...plan, title: v }
            onUpdate(next)
            persist({ title: v })
          }}
          className="text-xl font-bold"
        />
        <p className="text-sm text-muted-foreground mt-1">{plan.goal}</p>
      </div>

      {/* Phases */}
      {plan.content.phases.map(phase => (
        <PhaseSection
          key={phase.id}
          phase={phase}
          onChange={updated => updatePhase(phase.id, updated)}
          onDelete={() => deletePhase(phase.id)}
        />
      ))}

      <button
        onClick={addPhase}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed text-sm text-muted-foreground hover:text-foreground hover:border-border hover:bg-accent/30 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add phase
      </button>

      {/* KPIs */}
      {plan.content.kpis.length > 0 && (
        <KpisSection kpis={plan.content.kpis} onChange={updateKpis} />
      )}
    </div>
  )
}

// ── Generate form ─────────────────────────────────────────────────────────────

function GenerateForm({ onGenerated }: { onGenerated: (plan: Plan) => void }) {
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!goal.trim() || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Generation failed')
      }
      const plan = await res.json() as Plan
      onGenerated(plan)
      setGoal('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Generate new plan</span>
      </div>
      <textarea
        value={goal}
        onChange={e => setGoal(e.target.value)}
        placeholder="Describe your goal — e.g. 'Grow xeref.ai with SEO, content strategy, and paid ads'"
        rows={3}
        disabled={loading}
        className="rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!goal.trim() || loading}
        className="flex items-center justify-center gap-2 self-end px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? 'Generating…' : 'Generate plan'}
      </button>
    </form>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function PlansView() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [selected, setSelected] = useState<Plan | null>(null)
  const [loadingList, setLoadingList] = useState(true)

  useEffect(() => {
    fetch('/api/plans')
      .then(r => r.json())
      .then((data: unknown) => {
        const list = Array.isArray(data) ? (data as Plan[]) : []
        setPlans(list)
        if (list.length > 0) setSelected(list[0])
      })
      .finally(() => setLoadingList(false))
  }, [])

  function handleGenerated(plan: Plan) {
    setPlans(prev => [plan, ...prev])
    setSelected(plan)
  }

  function handleUpdate(updated: Plan) {
    setPlans(prev => prev.map(p => p.id === updated.id ? updated : p))
    setSelected(updated)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/plans/${id}`, { method: 'DELETE' })
    setPlans(prev => {
      const next = prev.filter(p => p.id !== id)
      setSelected(next[0] ?? null)
      return next
    })
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: plan list */}
      <div className="flex flex-col w-64 shrink-0 border-r bg-card overflow-y-auto">
        <div className="px-4 py-4 border-b">
          <h2 className="text-sm font-semibold">Execution Plans</h2>
        </div>

        {loadingList ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {plans.length === 0 && (
              <div className="px-4 py-6 text-xs text-muted-foreground text-center">
                No plans yet. Generate one below.
              </div>
            )}
            {plans.map(plan => (
              <button
                key={plan.id}
                onClick={() => setSelected(plan)}
                className={cn(
                  'flex items-start gap-2 px-4 py-3 border-b text-left hover:bg-accent/50 transition-colors group',
                  selected?.id === plan.id && 'bg-accent'
                )}
              >
                <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{plan.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{plan.goal}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(plan.id) }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-all shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Right: plan detail or generate form */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <PlanDetail plan={selected} onUpdate={handleUpdate} />
        ) : (
          <div className="max-w-xl mx-auto p-8">
            <div className="mb-6">
              <h1 className="text-lg font-semibold">Execution Plans</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Describe a goal and let Xeref generate a phased execution plan you can edit and track.
              </p>
            </div>
            <GenerateForm onGenerated={handleGenerated} />
          </div>
        )}

        {/* Generate form pinned at bottom when a plan is selected */}
        {selected && (
          <div className="max-w-2xl mx-auto px-6 pb-8">
            <GenerateForm onGenerated={handleGenerated} />
          </div>
        )}
      </div>
    </div>
  )
}
