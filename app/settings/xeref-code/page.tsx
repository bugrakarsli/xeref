'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { DEFAULT_XEREF_CODE } from '@/lib/types'
import type { XerefCodeAppearanceSettings, XerefCodeGeneralSettings, XerefCodeWebSettings } from '@/lib/types'
import { cn } from '@/lib/utils'

type XerefCodeSettings = XerefCodeAppearanceSettings & XerefCodeGeneralSettings & XerefCodeWebSettings

const CODE_FONTS = [
  { value: null, label: 'System default' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  { value: 'Fira Code', label: 'Fira Code' },
  { value: 'Source Code Pro', label: 'Source Code Pro' },
  { value: 'Cascadia Code', label: 'Cascadia Code' },
  { value: 'Menlo', label: 'Menlo' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        checked ? 'bg-primary' : 'bg-input'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-lg',
          'transform transition duration-200',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-0">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{title}</h2>
      <div className="rounded-lg border bg-card px-4">{children}</div>
    </section>
  )
}

export default function XerefCodeSettingsPage() {
  const [settings, setSettings] = useState<XerefCodeSettings>(DEFAULT_XEREF_CODE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings/xeref-code')
      .then(r => r.json())
      .then(d => { setSettings({ ...DEFAULT_XEREF_CODE, ...d }); setLoading(false) })
  }, [])

  const save = useCallback(async (patch: Partial<XerefCodeSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }))
    try {
      const res = await fetch('/api/settings/xeref-code', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
      toast.success('Saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Xeref Code</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Appearance and behaviour settings for the code workspace.</p>
      </div>

      <Section title="Appearance">
        <Row label="Editor font" description="Font used in the code editor and terminal.">
          <select
            value={settings.code_font ?? ''}
            onChange={e => save({ code_font: e.target.value || null })}
            className="rounded-md border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {CODE_FONTS.map(f => (
              <option key={f.value ?? '__default'} value={f.value ?? ''}>{f.label}</option>
            ))}
          </select>
        </Row>
        <Row label="Preview" description="How your selected font looks in the editor.">
          <span
            style={{ fontFamily: settings.code_font ?? 'inherit' }}
            className="text-sm text-muted-foreground select-none"
          >
            const x = 42; // hello
          </span>
        </Row>
      </Section>

      <Section title="General">
        <Row label="Classify session states" description="Automatically tag sessions as active, idle, or stale.">
          <Toggle checked={settings.classify_session_states} onChange={v => save({ classify_session_states: v })} />
        </Row>
      </Section>

      <Section title="Xeref Code on the Web">
        <Row label="Require repo access for shared sessions" description="Viewers must have repository read access to view shared sessions.">
          <Toggle
            checked={settings.require_repo_access_for_shared_sessions}
            onChange={v => save({ require_repo_access_for_shared_sessions: v })}
          />
        </Row>
        <Row label="Show your name on shared sessions" description="Display your display name on publicly shared session pages.">
          <Toggle
            checked={settings.show_name_on_shared_sessions}
            onChange={v => save({ show_name_on_shared_sessions: v })}
          />
        </Row>
      </Section>
    </div>
  )
}
