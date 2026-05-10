'use client'

import { useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, BrainCircuit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentStatus = 'AT WORK' | 'CONTROL PANEL' | 'ALWAYS THINKING' | 'IDLE'
type AgentTeam = 'Orchestrator' | 'Top-Level' | 'Angler' | 'Crewless' | 'Content' | 'Infra' | 'Bridge' | 'Custom'

interface Agent {
  id: string
  name: string
  emoji: string
  role: string
  team: AgentTeam
  tools: string
  status: AgentStatus
  dynamic?: boolean
}

const STORAGE_KEY = 'xeref_dynamic_agents'

// ─── Static agent data ────────────────────────────────────────────────────────

const STATIC_AGENTS: Agent[] = [
  { id: 'bugra',   name: 'Bugra',   emoji: '🧭', role: 'Commander · Founder',          team: 'Top-Level',   tools: 'n8n, LangChain, Make',                         status: 'CONTROL PANEL'   },
  { id: 'xeref',   name: 'Xeref',   emoji: '🧠', role: 'Second Brain · AI Orchestrator', team: 'Orchestrator', tools: 'LangGraph, n8n, Supabase Memory, GPT-4.1 mini', status: 'ALWAYS THINKING' },
  { id: 'dan',     name: 'Dan',     emoji: '♟️', role: 'Chief Strategy',               team: 'Top-Level',   tools: 'GPT-4.1 mini, Notion API, Airtable',           status: 'AT WORK'         },
  { id: 'chase',   name: 'Chase',   emoji: '📥', role: 'Inbox Ops',                   team: 'Top-Level',   tools: 'Gmail API, GPT-4.1 mini, Superhuman',          status: 'IDLE'            },
  { id: 'jack',    name: 'Jack',    emoji: '🎣', role: 'Angler Ops',                  team: 'Angler',      tools: 'Clay, Apollo, Smartlead',                      status: 'IDLE'            },
  { id: 'vinny',   name: 'Vinny',   emoji: '📊', role: 'Google Ads',                  team: 'Angler',      tools: 'Google Ads API, GPT-4.1 mini, Opteo',          status: 'AT WORK'         },
  { id: 'alex',    name: 'Alex',    emoji: '🤝', role: 'Sales',                       team: 'Crewless',    tools: 'HubSpot, Close CRM, GPT-4.1 mini',             status: 'IDLE'            },
  { id: 'sabrina', name: 'Sabrina', emoji: '📦', role: 'Delivery',                    team: 'Crewless',    tools: 'Notion, Slack, ClickUp',                       status: 'IDLE'            },
  { id: 'kate',    name: 'Kate',    emoji: '📡', role: 'Outreach',                    team: 'Content',     tools: 'Podchaser, Hunter.io, GPT-4.1 mini',           status: 'IDLE'            },
  { id: 'leila',   name: 'Leila',   emoji: '✍️', role: 'Content',                     team: 'Content',     tools: 'GPT-4.1 mini, Jasper, Buffer',                 status: 'IDLE'            },
  { id: 'james',   name: 'James',   emoji: '🔍', role: 'Research',                    team: 'Content',     tools: 'Perplexity API, Tavily, Exa',                  status: 'IDLE'            },
  { id: 'admin',   name: 'Admin',   emoji: '🛠️', role: 'Sys Admin',                   team: 'Infra',       tools: 'Doppler, Datadog, Uptime Robot',               status: 'IDLE'            },
  { id: 'fred',    name: 'Fred',    emoji: '💰', role: 'Financial',                   team: 'Bridge',      tools: 'Creem API, QuickBooks, GPT-4.1 mini',          status: 'IDLE'            },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(status: AgentStatus) {
  switch (status) {
    case 'AT WORK':         return 'text-emerald-400'
    case 'ALWAYS THINKING': return 'text-violet-400'
    case 'CONTROL PANEL':   return 'text-cyan-400'
    case 'IDLE':            return 'text-muted-foreground'
  }
}

function teamColor(team: AgentTeam) {
  switch (team) {
    case 'Orchestrator': return 'border-emerald-500/40 bg-emerald-500/5'
    case 'Top-Level':    return 'border-cyan-500/40 bg-cyan-500/5'
    case 'Angler':       return 'border-orange-400/40 bg-orange-400/5'
    case 'Crewless':     return 'border-yellow-400/40 bg-yellow-400/5'
    case 'Content':      return 'border-pink-500/40 bg-pink-500/5'
    case 'Infra':        return 'border-indigo-400/40 bg-indigo-400/5'
    case 'Bridge':       return 'border-green-400/40 bg-green-400/5'
    default:             return 'border-violet-500/40 bg-violet-500/5'
  }
}

// ─── Agent Card ───────────────────────────────────────────────────────────────

function AgentCard({
  agent,
  onEdit,
  onDelete,
}: {
  agent: Agent
  onEdit: (a: Agent) => void
  onDelete: (id: string) => void
}) {
  const tools = agent.tools.split(',').map((t) => t.trim()).filter(Boolean)
  return (
    <div
      className={cn(
        'group relative rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg',
        teamColor(agent.team)
      )}
    >
      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onEdit(agent)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={() => onDelete(agent.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl leading-none">{agent.emoji}</span>
        <span className="font-bold text-sm tracking-wide uppercase">{agent.name}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2 leading-snug">{agent.role}</p>
      <div className={cn('text-xs font-semibold mb-2', statusColor(agent.status))}>
        ● {agent.status}
      </div>
      <div className="flex flex-wrap gap-1">
        {tools.slice(0, 3).map((t) => (
          <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">
            {t}
          </Badge>
        ))}
        {tools.length > 3 && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            +{tools.length - 3}
          </Badge>
        )}
      </div>
    </div>
  )
}

// ─── Team Section ─────────────────────────────────────────────────────────────

const TEAM_ORDER: AgentTeam[] = ['Orchestrator', 'Top-Level', 'Angler', 'Crewless', 'Content', 'Infra', 'Bridge', 'Custom']

function teamLabel(team: AgentTeam) {
  return team
}

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM: Omit<Agent, 'id' | 'dynamic'> = {
  name: '',
  emoji: '🤖',
  role: '',
  team: 'Content',
  tools: '',
  status: 'IDLE',
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function AgentTeamView() {
  const [allAgents, setAllAgents] = useState<Agent[]>(() => {
    if (typeof window === 'undefined') return STATIC_AGENTS
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return [...STATIC_AGENTS, ...JSON.parse(saved)]
    } catch {}
    return STATIC_AGENTS
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<Omit<Agent, 'id' | 'dynamic'>>(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)

  const saveDynamic = useCallback((agents: Agent[]) => {
    const dynamic = agents.filter((a) => a.dynamic)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamic)) } catch {}
  }, [])

  // Group agents by team
  const grouped = TEAM_ORDER.reduce<Record<string, Agent[]>>((acc, team) => {
    const members = allAgents.filter((a) => a.team === team)
    if (members.length) acc[team] = members
    return acc
  }, {})

  function openCreate() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(agent: Agent) {
    setEditId(agent.id)
    setForm({ name: agent.name, emoji: agent.emoji, role: agent.role, team: agent.team, tools: agent.tools, status: agent.status })
    setModalOpen(true)
  }

  function handleDelete(id: string) {
    const isStatic = STATIC_AGENTS.some((a) => a.id === id)
    if (isStatic) {
      const updated = allAgents.filter((a) => a.id !== id)
      setAllAgents(updated)
      saveDynamic(updated)
      toast.success('Agent removed from view')
      return
    }
    const updated = allAgents.filter((a) => a.id !== id)
    setAllAgents(updated)
    saveDynamic(updated)
    toast.success('Agent deleted')
  }

  function handleSubmit() {
    if (!form.name.trim()) return

    if (editId) {
      const updated = allAgents.map((a) =>
        a.id === editId ? { ...a, ...form } : a
      )
      setAllAgents(updated)
      saveDynamic(updated)
      toast.success(`${form.name} updated`)
    } else {
      const newAgent: Agent = { ...form, id: `agent_${Date.now()}`, dynamic: true }
      const updated = [...allAgents, newAgent]
      setAllAgents(updated)
      saveDynamic(updated)
      toast.success(`${form.name} added to team`)
    }

    setModalOpen(false)
  }

  const totalAgents = allAgents.length

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-6 w-6 text-primary shrink-0" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Xeref Agent Team</h1>
            <p className="text-xs text-muted-foreground">{totalAgents} agents · Bugra Karsli · March 2026</p>
          </div>
        </div>
        <Button size="sm" onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Create Agent
        </Button>
      </div>

      {/* Alert */}
      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-xs text-yellow-300/80 leading-relaxed">
        <span className="font-semibold text-yellow-400">⚡ Updates:</span>
        {' '}GPT-4o → <strong>GPT-4.1 mini</strong> ($0.40/1M tokens, 1M ctx) ·
        {' '}Stripe → <strong>Creem API</strong> (3.9%+$0.40/tx, MoR) ·
        {' '}Instantly → <strong>Smartlead</strong> ($39/mo, unlimited mailboxes) ·
        {' '}<strong>Xeref 🧠</strong> added as Second Brain / Orchestrator
      </div>

      {/* Agent grid by team */}
      {(Object.entries(grouped) as [AgentTeam, Agent[]][]).map(([team, agents]) => (
        <section key={team}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {teamLabel(team)}
            </span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{agents.length}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Tool Stack Table */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tool Stack</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agent</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tools</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team</th>
              </tr>
            </thead>
            <tbody>
              {allAgents.map((agent, i) => (
                <tr
                  key={agent.id}
                  className={cn('border-b last:border-0 transition-colors hover:bg-muted/30', i % 2 === 0 ? '' : 'bg-muted/10')}
                >
                  <td className="px-4 py-2.5 font-medium">
                    {agent.emoji} {agent.name}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{agent.role}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {agent.tools.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">{t}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{agent.team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create / Edit Agent Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Agent' : 'Create Agent'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Agent Name</Label>
                <Input
                  placeholder="e.g. Nova"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Emoji</Label>
                <Input
                  placeholder="🤖"
                  maxLength={4}
                  value={form.emoji}
                  onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input
                placeholder="e.g. SEO Specialist"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Team</Label>
                <Select
                  value={form.team}
                  onValueChange={(v) => setForm((f) => ({ ...f, team: v as AgentTeam }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['Orchestrator','Top-Level','Angler','Crewless','Content','Infra','Bridge','Custom'] as AgentTeam[]).map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as AgentStatus }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['AT WORK','CONTROL PANEL','ALWAYS THINKING','IDLE'] as AgentStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tools <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
              <Input
                placeholder="GPT-4.1 mini, n8n, Notion API"
                value={form.tools}
                onChange={(e) => setForm((f) => ({ ...f, tools: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name.trim()}>
              {editId ? 'Save Changes' : 'Create Agent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
