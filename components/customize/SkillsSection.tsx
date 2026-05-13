'use client'

import { useState, useTransition } from 'react'
import { ArrowLeft, Zap, Plus, Trash2, Edit2, Check, X, ShieldAlert, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TOOL_OPTIONS } from './data'
import type { Skill } from './types'
import { createSkill, updateSkill, deleteSkill } from '@/app/actions/skills'
import { toast } from 'sonner'

const EMPTY_DRAFT = {
  name: '',
  description: '',
  endpoint_url: '',
  tools: [] as string[],
}

export function SkillsSection({ initialSkills }: { initialSkills: Skill[] }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Skill | null>(null)
  const [draft, setDraft] = useState({ ...EMPTY_DRAFT })
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setDraft({ ...EMPTY_DRAFT })
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(skill: Skill) {
    setDraft({
      name: skill.name,
      description: skill.description || '',
      endpoint_url: skill.endpoint_url || '',
      tools: skill.tools || [],
    })
    setEditing(skill)
    setFormOpen(true)
  }

  function save() {
    if (!draft.name.trim()) return

    startTransition(async () => {
      if (editing) {
        const { error } = await updateSkill(editing.id, draft)
        if (error) {
          toast.error(error)
          return
        }
        toast.success('Skill updated')
      } else {
        const { error } = await createSkill(draft)
        if (error) {
          toast.error(error)
          return
        }
        toast.success('Skill created')
      }
      setFormOpen(false)
      setEditing(null)
    })
  }

  function remove(id: string) {
    if (!confirm('Are you sure you want to delete this skill?')) return

    startTransition(async () => {
      const { error } = await deleteSkill(id)
      if (error) {
        toast.error(error)
      } else {
        toast.success('Skill deleted')
      }
    })
  }

  function toggleTool(tool: string) {
    setDraft((d) => ({
      ...d,
      tools: d.tools.includes(tool)
        ? d.tools.filter((t) => t !== tool)
        : [...d.tools, tool],
    }))
  }

  if (formOpen) {
    const isBuiltIn = editing?.source === 'built-in'

    return (
      <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFormOpen(false)}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-semibold">
            {editing ? (isBuiltIn ? 'View Built-in Skill' : 'Edit Skill') : 'New Skill'}
          </h2>
        </div>

        {isBuiltIn && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Built-in skills are read-only</p>
              <p className="text-amber-600/80 dark:text-amber-400/80 mt-0.5 text-xs">
                You can view the configuration but cannot modify or delete system skills.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              disabled={isBuiltIn || isPending}
              placeholder="e.g. Code Reviewer"
              className="px-3 py-2 rounded-lg bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <input
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              disabled={isBuiltIn || isPending}
              placeholder="What does this skill do?"
              className="px-3 py-2 rounded-lg bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Endpoint URL (Optional)</label>
            <input
              value={draft.endpoint_url}
              onChange={(e) => setDraft((d) => ({ ...d, endpoint_url: e.target.value }))}
              disabled={isBuiltIn || isPending}
              placeholder="https://your-api.com/skill"
              className="px-3 py-2 rounded-lg bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-50 font-mono"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">Allowed Tools</label>
            <div className="flex flex-wrap gap-2">
              {TOOL_OPTIONS.map((tool) => {
                const active = draft.tools.includes(tool)
                return (
                  <button
                    key={tool}
                    onClick={() => toggleTool(tool)}
                    disabled={isBuiltIn || isPending}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                      active
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-muted text-muted-foreground border-border hover:border-muted-foreground/50'
                    )}
                  >
                    {active && <Check className="w-3 h-3" />}
                    {tool}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {!isBuiltIn && (
            <button
              onClick={save}
              disabled={!draft.name.trim() || isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {editing ? 'Save Changes' : 'Create Skill'}
            </button>
          )}
          <button
            onClick={() => setFormOpen(false)}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-muted hover:bg-accent text-muted-foreground hover:text-foreground text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isBuiltIn ? <ArrowLeft className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            {isBuiltIn ? 'Go Back' : 'Cancel'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Skills</h2>
          <p className="text-sm text-muted-foreground">
            Reusable tools and logic blocks for your agents.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Skill
        </button>
      </div>

      {initialSkills.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10">
            <Zap className="w-7 h-7 text-amber-500" />
          </span>
          <div className="text-center">
            <p className="text-sm font-medium">No skills yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first skill to get started.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Skill
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {initialSkills.map((skill) => {
            const isBuiltIn = skill.source === 'built-in'

            return (
              <div
                key={skill.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border transition-all group",
                  isBuiltIn 
                    ? "bg-background border-border" 
                    : "bg-muted/60 border-border hover:border-muted-foreground/30"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg shrink-0 mt-0.5",
                  isBuiltIn ? "bg-muted text-muted-foreground" : "bg-amber-500/10 text-amber-500"
                )}>
                  {isBuiltIn ? <ShieldAlert className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                </span>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{skill.name}</p>
                    {isBuiltIn && (
                      <span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        Built-in
                      </span>
                    )}
                  </div>
                  
                  {skill.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {skill.description}
                    </p>
                  )}
                  {skill.tools && skill.tools.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {skill.tools.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => openEdit(skill)}
                    className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {!isBuiltIn && (
                    <button
                      onClick={() => remove(skill.id)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                    >
                      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
