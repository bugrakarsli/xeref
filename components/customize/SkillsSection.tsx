'use client'

import { useState } from 'react'
import { ArrowLeft, Zap, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { TOOL_OPTIONS } from './data'
import type { Skill } from './types'

const EMPTY_DRAFT = {
  name: '',
  description: '',
  promptTemplate: '',
  tools: [] as string[],
}

export function SkillsSection() {
  const [skills, setSkills] = useLocalStorage<Skill[]>('xeref:skills', [])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Skill | null>(null)
  const [draft, setDraft] = useState({ ...EMPTY_DRAFT })

  function openCreate() {
    setDraft({ ...EMPTY_DRAFT })
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(skill: Skill) {
    setDraft({
      name: skill.name,
      description: skill.description,
      promptTemplate: skill.promptTemplate,
      tools: skill.tools,
    })
    setEditing(skill)
    setFormOpen(true)
  }

  function save() {
    if (!draft.name.trim()) return
    if (editing) {
      setSkills((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...editing, ...draft } : s))
      )
    } else {
      setSkills((prev) => [
        ...prev,
        { ...draft, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
      ])
    }
    setFormOpen(false)
    setEditing(null)
  }

  function remove(id: string) {
    setSkills((prev) => prev.filter((s) => s.id !== id))
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
            {editing ? 'Edit Skill' : 'New Skill'}
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Summarize Article"
              className="px-3 py-2 rounded-lg bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <input
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="What does this skill do?"
              className="px-3 py-2 rounded-lg bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Prompt Template</label>
            <textarea
              value={draft.promptTemplate}
              onChange={(e) => setDraft((d) => ({ ...d, promptTemplate: e.target.value }))}
              rows={5}
              placeholder="Write your prompt template. Use {{variable}} for dynamic values."
              className="px-3 py-2 rounded-lg bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none font-mono"
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
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
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
          <button
            onClick={save}
            disabled={!draft.name.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" />
            {editing ? 'Save Changes' : 'Create Skill'}
          </button>
          <button
            onClick={() => setFormOpen(false)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-muted hover:bg-accent text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
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
            Reusable prompt templates and tool chains for your agents.
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

      {skills.length === 0 ? (
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
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-start gap-4 p-4 rounded-xl bg-muted/60 border border-border hover:border-muted-foreground/30 transition-all group"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-amber-500" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{skill.name}</p>
                {skill.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {skill.description}
                  </p>
                )}
                {skill.tools.length > 0 && (
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
                <button
                  onClick={() => remove(skill.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
