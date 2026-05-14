'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { DEFAULT_CAPABILITIES } from '@/lib/types'
import type { CapabilitiesSettings } from '@/lib/types'
import { cn } from '@/lib/utils'

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        checked ? 'bg-primary' : 'bg-input',
        disabled && 'cursor-not-allowed opacity-50'
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

export default function CapabilitiesPage() {
  const [settings, setSettings] = useState<CapabilitiesSettings>(DEFAULT_CAPABILITIES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings/capabilities')
      .then(r => r.json())
      .then(d => { setSettings({ ...DEFAULT_CAPABILITIES, ...d }); setLoading(false) })
  }, [])

  const save = useCallback(async (patch: Partial<CapabilitiesSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }))
    try {
      const res = await fetch('/api/settings/capabilities', {
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
        <h1 className="text-lg font-semibold">Capabilities</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Control what the AI can access and do on your behalf.</p>
      </div>

      <Section title="Memory">
        <Row label="Search memory" description="Reference your stored documents and memories when answering questions.">
          <Toggle checked={settings.memory_search_enabled} onChange={v => save({ memory_search_enabled: v })} />
        </Row>
        <Row label="Generate from history" description="Use your conversation history to build context and memory.">
          <Toggle checked={settings.memory_generate_from_history} onChange={v => save({ memory_generate_from_history: v })} />
        </Row>
      </Section>

      <Section title="General">
        <Row label="Tool access mode" description="How tools are loaded before the AI responds.">
          <select
            value={settings.tool_access_mode}
            onChange={e => save({ tool_access_mode: e.target.value as CapabilitiesSettings['tool_access_mode'] })}
            className="rounded-md border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="load_tools_when_needed">Load when needed</option>
            <option value="ask_before_using_tools">Ask before using</option>
            <option value="never_use_tools">Never use tools</option>
          </select>
        </Row>
        <Row label="Connector discovery" description="Allow the AI to suggest connecting new services.">
          <Toggle checked={settings.connector_discovery_enabled} onChange={v => save({ connector_discovery_enabled: v })} />
        </Row>
      </Section>

      <Section title="Visuals">
        <Row label="Artifacts" description="Render rich artifacts (code previews, diagrams) in responses.">
          <Toggle checked={settings.visuals_artifacts_enabled} onChange={v => save({ visuals_artifacts_enabled: v })} />
        </Row>
        <Row label="Inline visualizations" description="Show inline charts and data tables inside responses.">
          <Toggle checked={settings.visuals_inline_charts_enabled} onChange={v => save({ visuals_inline_charts_enabled: v })} />
        </Row>
      </Section>

      <Section title="Code execution">
        <Row label="Enable code execution" description="Allow the AI to run code and return results.">
          <Toggle checked={settings.code_execution_enabled} onChange={v => save({ code_execution_enabled: v })} />
        </Row>
        {settings.code_execution_enabled && (
          <>
            <Row label="Allow network egress" description="Permit code to make outbound network requests.">
              <Toggle checked={settings.network_egress_enabled} onChange={v => save({ network_egress_enabled: v })} />
            </Row>
            {settings.network_egress_enabled && (
              <Row label="Domain allowlist" description="Restrict which domains code can reach.">
                <select
                  value={settings.domain_allowlist_mode}
                  onChange={e => save({ domain_allowlist_mode: e.target.value as CapabilitiesSettings['domain_allowlist_mode'] })}
                  className="rounded-md border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="none">None (block all)</option>
                  <option value="package_managers_only">Package managers only</option>
                  <option value="all_domains">All domains</option>
                </select>
              </Row>
            )}
          </>
        )}
      </Section>
    </div>
  )
}
