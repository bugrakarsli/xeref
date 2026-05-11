'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Plus, Loader2, AlertCircle, Send, ChevronDown, HardDrive, FolderOpen, X, ShieldCheck, Hand, ShieldOff, ChevronRight, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PROVIDERS, type ProviderId } from '@/lib/connections/registry'
import { getTelegramBotToken, clearTelegramBotToken } from '@/app/actions/profile'
import {
  Github, Mail, Calendar, FileText, MessageSquare, Database, Globe, Triangle,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'

const CONNECT_URLS: Record<string, string> = {
  github: '/api/github/login?returnTo=/customize/connectors',
  gmail: '/api/connections/google/login?returnTo=/customize/connectors',
  gcal: '/api/connections/google/login?returnTo=/customize/connectors',
  notion: '/api/connections/notion/login?returnTo=/customize/connectors',
  slack: '/api/connections/slack/login?returnTo=/customize/connectors',
  supabase: '',
  webhook: '',
  vercel: '/api/connections/vercel/login?returnTo=/customize/connectors',
}

const CARD_ICONS: Record<string, React.ElementType> = {
  github: Github,
  gmail: Mail,
  gcal: Calendar,
  notion: FileText,
  slack: MessageSquare,
  supabase: Database,
  webhook: Globe,
  vercel: Triangle,
  telegram: Send,
}

const CARD_COLORS: Record<string, string> = {
  github: 'text-foreground',
  gmail: 'text-red-400',
  gcal: 'text-blue-400',
  notion: 'text-foreground',
  slack: 'text-purple-400',
  supabase: 'text-green-400',
  webhook: 'text-cyan-400',
  vercel: 'text-foreground',
  telegram: 'text-blue-400',
}

const CARD_DETAIL: Record<string, { description: string; features: string[] }> = {
  github: {
    description: 'Connect your GitHub account to give your agents access to repositories, issues, and pull requests across all your projects.',
    features: [
      'Read and write repository files',
      'Access open issues and pull requests',
      'Create branches, commits, and code reviews',
      'Sync repository context into agent projects',
    ],
  },
  gmail: {
    description: 'Connect Gmail to let your agents read your inbox and send emails on your behalf.',
    features: [
      'Read emails and conversation threads',
      'Search through your inbox',
      'Send emails and replies',
      'Manage labels and filters',
    ],
  },
  gcal: {
    description: 'Connect Google Calendar to allow your agents to check your schedule and create or modify events.',
    features: [
      'View upcoming events and availability',
      'Create and edit calendar events',
      'Accept or decline invitations',
      'Set reminders and recurring events',
    ],
  },
  notion: {
    description: 'Connect Notion to give your agents access to your workspace pages and databases.',
    features: [
      'Read and search Notion pages',
      'Create and update page content',
      'Query and filter databases',
      'Add comments and mentions',
    ],
  },
  slack: {
    description: 'Connect Slack to let your agents read channels and send messages to your team.',
    features: [
      'Read channel messages and threads',
      'Send messages to channels or DMs',
      'Search across workspaces',
      'Post structured blocks and attachments',
    ],
  },
  vercel: {
    description: 'Connect Vercel to allow your agents to manage deployments, monitor builds, and update projects.',
    features: [
      'View deployment status and logs',
      'Trigger new deployments',
      'Manage environment variables',
      'Inspect build output and errors',
    ],
  },
  supabase: {
    description: 'Connect a Supabase project with a personal access token so your agents can query and manage your data.',
    features: [
      'Query tables and views',
      'Run SQL operations',
      'Manage storage buckets',
      'Monitor database usage',
    ],
  },
  webhook: {
    description: 'Register custom HTTP endpoints that your agents can call to integrate with any external service.',
    features: [
      'Call any HTTP endpoint from agents',
      'Pass custom headers and payloads',
      'Chain multiple webhooks together',
      'Test endpoints with live requests',
    ],
  },
  telegram: {
    description: 'Connect a Telegram bot to route messages from Telegram directly to your xeref agents.',
    features: [
      'Receive messages from any Telegram chat',
      'Reply through your configured agent',
      'Trigger workflows from Telegram commands',
      'Send files and media back to users',
    ],
  },
}

const PROVIDER_LABELS: Record<string, string> = {
  github: 'GitHub', google: 'Google', notion: 'Notion',
  slack: 'Slack', vercel: 'Vercel',
}

interface ProviderState {
  id: ProviderId
  name: string
  kind: string
  configured: boolean
  connected: boolean
  scopes: string[]
  metadata: Record<string, unknown>
  uiCards: { id: string; name: string; description: string }[]
}

interface UiCard {
  id: string
  name: string
  description: string
  connected: boolean
  configured: boolean
  providerId: ProviderId
  providerKind: string
  scopes: string[]
  metadata: Record<string, unknown>
}

type SelectedItem = { type: 'card'; card: UiCard } | { type: 'telegram' } | { type: 'filesystem' } | null

type ToolPermission = 'always-allow' | 'ask' | 'blocked'

interface FsTool { id: string; label: string }
interface FsGroup { label: string; tools: FsTool[] }

const FS_GROUPS: FsGroup[] = [
  {
    label: 'Read-only tools',
    tools: [
      { id: 'read_text_file', label: 'Read Text File' },
      { id: 'read_multiple_files', label: 'Read Multiple Files' },
      { id: 'list_directory', label: 'List Directory' },
      { id: 'list_directory_with_sizes', label: 'List Directory with Sizes' },
      { id: 'directory_tree', label: 'Directory Tree' },
      { id: 'search_files', label: 'Search Files' },
      { id: 'get_file_info', label: 'Get File Info' },
      { id: 'list_allowed_directories', label: 'List Allowed Directories' },
    ],
  },
  {
    label: 'Write/delete tools',
    tools: [
      { id: 'write_file', label: 'Write File' },
      { id: 'edit_file', label: 'Edit File' },
      { id: 'create_directory', label: 'Create Directory' },
      { id: 'move_file', label: 'Move File' },
    ],
  },
  {
    label: 'Other tools',
    tools: [
      { id: 'copy_file_to_claude', label: 'Copy file to Claude' },
    ],
  },
]

const FS_TOOL_DESCRIPTIONS: Record<string, string> = {
  read_text_file: 'Read the full contents of a single text file',
  read_multiple_files: 'Read several files at once in a single call',
  list_directory: 'List files and folders inside a directory',
  list_directory_with_sizes: 'List directory contents including file sizes',
  directory_tree: 'Recursively display a folder structure as a tree',
  search_files: 'Find files by name pattern or content within allowed directories',
  get_file_info: 'Return metadata (size, modified date, type) for a file',
  list_allowed_directories: 'Return which directories the agent is permitted to access',
  write_file: 'Create or overwrite a file with new content',
  edit_file: 'Apply targeted edits to an existing file',
  create_directory: 'Create a new folder at the specified path',
  move_file: 'Move or rename a file or folder',
  copy_file_to_claude: 'Upload a local file into the Claude conversation context',
}

const DEFAULT_FS_PERMISSIONS: Record<string, ToolPermission> = Object.fromEntries(
  FS_GROUPS.flatMap(g => g.tools.map(t => [t.id, 'ask' as ToolPermission]))
)

interface FilesystemSettings {
  enabled: boolean
  directories: string[]
  toolPermissions: Record<string, ToolPermission>
}

const FS_STORAGE_KEY = 'xeref:filesystem-settings'

function loadFsSettings(): FilesystemSettings {
  try {
    const raw = localStorage.getItem(FS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as FilesystemSettings
      return {
        ...parsed,
        // merge so new tools get a default and removed tools don't linger
        toolPermissions: { ...DEFAULT_FS_PERMISSIONS, ...parsed.toolPermissions },
      }
    }
  } catch {}
  return { enabled: false, directories: [], toolPermissions: { ...DEFAULT_FS_PERMISSIONS } }
}

function saveFsSettings(s: FilesystemSettings) {
  try { localStorage.setItem(FS_STORAGE_KEY, JSON.stringify(s)) } catch {}
}

export function ConnectorsSection() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [providers, setProviders] = useState<ProviderState[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selected, setSelected] = useState<SelectedItem>(null)
  const [telegramToken, setTelegramToken] = useState<string | null | undefined>(undefined)
  const [telegramDisconnecting, setTelegramDisconnecting] = useState(false)
  const [fsSettings, setFsSettings] = useState<FilesystemSettings>({ enabled: false, directories: [], toolPermissions: { ...DEFAULT_FS_PERMISSIONS } })

  useEffect(() => { setFsSettings(loadFsSettings()) }, [])

  useEffect(() => {
    const connectedProvider = searchParams.get('connected')
    const oauthError = searchParams.get('error')
    if (connectedProvider) {
      const label = PROVIDER_LABELS[connectedProvider] ?? connectedProvider
      toast.success(`${label} connected successfully!`)
      window.history.replaceState({}, '', '/customize/connectors')
    } else if (oauthError) {
      toast.error(
        oauthError === 'access_denied'
          ? 'Connection cancelled.'
          : 'Failed to connect. Check environment variables and migration are applied.'
      )
      window.history.replaceState({}, '', '/customize/connectors')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    getTelegramBotToken().then(setTelegramToken).catch(() => setTelegramToken(null))
  }, [])

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch('/api/connections')
      if (!res.ok) throw new Error('Failed to load connections')
      const json = await res.json()
      setProviders(json.providers)
      setError(null)
    } catch {
      setError('Could not load connections. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchConnections() }, [fetchConnections])

  async function disconnect(providerId: ProviderId) {
    setDisconnecting(providerId)
    try {
      const res = await fetch(`/api/connections/${providerId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Disconnect failed')
      await fetchConnections()
      setSelected(null)
    } catch {
      setError('Failed to disconnect. Please try again.')
    } finally {
      setDisconnecting(null)
    }
  }

  async function disconnectTelegram() {
    setTelegramDisconnecting(true)
    try {
      await clearTelegramBotToken()
      setTelegramToken(null)
      toast.success('Telegram bot disconnected')
      setSelected(null)
    } catch {
      toast.error('Failed to disconnect')
    } finally {
      setTelegramDisconnecting(false)
    }
  }

  const allCards: UiCard[] = providers.flatMap((p) =>
    p.uiCards.map((card) => ({
      ...card,
      connected: p.connected,
      configured: p.configured,
      providerId: p.id,
      providerKind: p.kind,
      scopes: p.scopes,
      metadata: p.metadata,
    }))
  )

  const filtered = allCards.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  )

  const telegramCard = {
    id: 'telegram',
    name: 'Telegram Bot',
    connected: !!telegramToken,
  }

  const showTelegram = !search || telegramCard.name.toLowerCase().includes(search.toLowerCase())
  const showFilesystem = !search || 'filesystem'.includes(search.toLowerCase())

  return (
    <div className="flex min-h-screen">
      {/* Left panel — sticky so it stays in view while right panel scrolls */}
      <div className="w-64 border-r flex flex-col shrink-0 sticky top-0 h-screen overflow-hidden">
        <div className="flex items-center gap-1 px-4 py-3 border-b">
          {searchOpen ? (
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              onBlur={() => { if (!search) setSearchOpen(false) }}
              placeholder="Search…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          ) : (
            <span className="flex-1 text-sm font-semibold">Connectors</span>
          )}
          <button
            onClick={() => setSearchOpen(v => !v)}
            className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => toast.info('Browse the connector list below to add more.')}
            className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {error && (
            <div className="mx-2 mb-2 flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 rounded-md px-2 py-1.5">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading…
            </div>
          ) : (
            <>
              {/* Web group */}
              {filtered.length > 0 && (
                <div className="mb-1">
                  <div className="flex items-center gap-1.5 px-3 py-1">
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground font-medium">Web</span>
                  </div>
                  {filtered.map(card => (
                    <ListItem
                      key={card.id}
                      id={card.id}
                      name={card.name}
                      connected={card.connected}
                      active={selected?.type === 'card' && selected.card.id === card.id}
                      onClick={() => setSelected({ type: 'card', card })}
                    />
                  ))}
                </div>
              )}

              {/* Channels group */}
              {showTelegram && (
                <div className="mb-1">
                  <div className="flex items-center gap-1.5 px-3 py-1">
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground font-medium">Channels</span>
                  </div>
                  <ListItem
                    id="telegram"
                    name="Telegram Bot"
                    connected={!!telegramToken}
                    active={selected?.type === 'telegram'}
                    onClick={() => setSelected({ type: 'telegram' })}
                  />
                </div>
              )}

              {/* Desktop group */}
              {showFilesystem && (
                <div className="mb-1">
                  <div className="flex items-center gap-1.5 px-3 py-1">
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground font-medium">Desktop</span>
                  </div>
                  <ListItem
                    id="filesystem"
                    name="Filesystem"
                    connected={fsSettings.enabled}
                    active={selected?.type === 'filesystem'}
                    onClick={() => setSelected({ type: 'filesystem' })}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto">
        {selected === null ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Select a connector to view details
          </div>
        ) : selected.type === 'telegram' ? (
          <TelegramDetail
            token={telegramToken}
            disconnecting={telegramDisconnecting}
            onDisconnect={disconnectTelegram}
            onConfigure={() => router.push('/?view=deploy')}
          />
        ) : selected.type === 'filesystem' ? (
          <FilesystemDetail
            settings={fsSettings}
            onChange={next => { setFsSettings(next); saveFsSettings(next) }}
            onClose={() => setSelected(null)}
          />
        ) : (
          <CardDetail
            card={selected.card}
            disconnecting={disconnecting === selected.card.providerId}
            onDisconnect={() => disconnect(selected.card.providerId)}
          />
        )}
      </div>
    </div>
  )
}

function ListItem({
  id, name, connected, active, onClick,
}: {
  id: string; name: string; connected: boolean; active: boolean; onClick: () => void
}) {
  const Icon = CARD_ICONS[id] ?? Globe
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 w-full rounded-md mx-1 px-2 py-1.5 text-sm transition-colors text-left',
        active ? 'bg-muted text-foreground' : 'text-foreground/80 hover:bg-muted/50 hover:text-foreground',
      )}
      style={{ width: 'calc(100% - 8px)' }}
    >
      <Icon className={cn('h-4 w-4 shrink-0', CARD_COLORS[id])} />
      <span className="flex-1 truncate">{name}</span>
      {connected && (
        <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
      )}
    </button>
  )
}

function CardDetail({
  card, disconnecting, onDisconnect,
}: {
  card: UiCard
  disconnecting: boolean
  onDisconnect: () => void
}) {
  const Icon = CARD_ICONS[card.id] ?? Globe
  const detail = CARD_DETAIL[card.id]
  const connectUrl = CONNECT_URLS[card.id]

  return (
    <div className="p-8 max-w-xl">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-border bg-muted flex items-center justify-center shrink-0">
            <Icon className={cn('h-5 w-5', CARD_COLORS[card.id])} />
          </div>
          <h2 className="text-lg font-semibold">{card.name}</h2>
        </div>
        {card.connected ? (
          <button
            onClick={onDisconnect}
            disabled={disconnecting}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium border border-border transition-colors',
              'bg-background hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30',
              disconnecting && 'opacity-50 cursor-not-allowed'
            )}
          >
            {disconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Disconnect'}
          </button>
        ) : connectUrl ? (
          <a
            href={connectUrl}
            className="px-4 py-1.5 rounded-lg text-sm font-medium border border-border bg-background hover:bg-muted transition-colors"
          >
            Connect
          </a>
        ) : (
          <button
            disabled
            className="px-4 py-1.5 rounded-lg text-sm font-medium border border-border bg-muted text-muted-foreground cursor-not-allowed"
            title="Coming soon"
          >
            Connect
          </button>
        )}
      </div>

      {card.connected && (card.metadata?.login as string) && (
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Connected as <span className="font-medium text-foreground">@{card.metadata.login as string}</span>
        </div>
      )}

      {detail && (
        <>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{detail.description}</p>
          <ul className="flex flex-col gap-2">
            {detail.features.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </>
      )}

      {card.connected && card.scopes.length > 0 && (
        <div className="mt-6 pt-5 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2">Active scopes</p>
          <div className="flex flex-wrap gap-1.5">
            {card.scopes.map(s => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-md border border-border bg-muted text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TelegramDetail({
  token, disconnecting, onDisconnect, onConfigure,
}: {
  token: string | null | undefined
  disconnecting: boolean
  onDisconnect: () => void
  onConfigure: () => void
}) {
  const detail = CARD_DETAIL.telegram
  const connected = !!token
  const maskedToken = token ? `${token.slice(0, 10)}:${'•'.repeat(16)}` : null

  return (
    <div className="p-8 max-w-xl">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-border bg-muted flex items-center justify-center shrink-0">
            <Send className="h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold">Telegram Bot</h2>
        </div>
        {token === undefined ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mt-1" />
        ) : connected ? (
          <button
            onClick={onDisconnect}
            disabled={disconnecting}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium border border-border transition-colors',
              'bg-background hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30',
              disconnecting && 'opacity-50 cursor-not-allowed'
            )}
          >
            {disconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Disconnect'}
          </button>
        ) : (
          <button
            onClick={onConfigure}
            className="px-4 py-1.5 rounded-lg text-sm font-medium border border-border bg-background hover:bg-muted transition-colors"
          >
            Configure
          </button>
        )}
      </div>

      {connected && maskedToken && (
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Webhook active — <span className="font-mono">{maskedToken}</span>
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{detail.description}</p>
      <ul className="flex flex-col gap-2">
        {detail.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Filesystem connector ────────────────────────────────────────────────────

type PermOpt = { value: ToolPermission; label: string; icon: React.ElementType; color: string }
const PERM_OPTS: PermOpt[] = [
  { value: 'always-allow', label: 'Always allow',  icon: ShieldCheck, color: 'text-green-400' },
  { value: 'ask',          label: 'Ask each time', icon: Hand,        color: 'text-orange-400' },
  { value: 'blocked',      label: 'Never allow',   icon: ShieldOff,   color: 'text-red-400' },
]

function permLabel(p: ToolPermission) {
  return PERM_OPTS.find(o => o.value === p)?.label ?? 'Ask each time'
}

function permIcon(p: ToolPermission) {
  if (p === 'always-allow') return <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
  if (p === 'blocked') return <ShieldOff className="h-3.5 w-3.5 text-red-400" />
  return <Hand className="h-3.5 w-3.5 text-orange-400" />
}

function groupMode(tools: FsTool[], permissions: Record<string, ToolPermission>): ToolPermission | 'custom' {
  const perms = tools.map(t => permissions[t.id] ?? 'ask')
  if (perms.every(p => p === perms[0])) return perms[0]
  return 'custom'
}

function normalizePath(raw: string): string {
  const trimmed = raw.trim()
  // Normalize Windows-style drive paths: forward slashes → backslashes, strip trailing separator
  if (/^[A-Za-z]:/.test(trimmed)) {
    return trimmed.replace(/\//g, '\\').replace(/[/\\]+$/, '')
  }
  return trimmed.replace(/\/+$/, '')
}

function GroupPermPicker({ value, onChange }: { value: ToolPermission | 'custom'; onChange: (v: ToolPermission) => void }) {
  const activeOpt = PERM_OPTS.find(o => o.value === value)
  const isCustom = value === 'custom'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs px-2 py-1 rounded border border-border bg-background hover:bg-muted transition-colors">
          {isCustom ? (
            <>
              <ShieldCheck className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Custom</span>
            </>
          ) : (
            <>
              {activeOpt && <activeOpt.icon className={cn('h-3 w-3', activeOpt.color)} />}
              <span className="text-muted-foreground">{activeOpt?.label}</span>
            </>
          )}
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {isCustom && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Mixed — set all to:</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuRadioGroup value={isCustom ? '' : value} onValueChange={v => onChange(v as ToolPermission)}>
          {PERM_OPTS.map(o => (
            <DropdownMenuRadioItem key={o.value} value={o.value} className="gap-2">
              <o.icon className={cn('h-3.5 w-3.5 shrink-0', o.color)} />
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ToolPermPicker({ value, onChange }: { value: ToolPermission; onChange: (v: ToolPermission) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs px-2 py-1 rounded border border-border bg-background hover:bg-muted transition-colors min-w-[110px]">
          {permIcon(value)}
          <span className="text-muted-foreground">{permLabel(value)}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuRadioGroup value={value} onValueChange={v => onChange(v as ToolPermission)}>
          {PERM_OPTS.map(o => (
            <DropdownMenuRadioItem key={o.value} value={o.value} className="gap-2">
              <o.icon className={cn('h-3.5 w-3.5 shrink-0', o.color)} />
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function FilesystemDetail({
  settings, onChange, onClose,
}: {
  settings: FilesystemSettings
  onChange: (next: FilesystemSettings) => void
  onClose: () => void
}) {
  const [dirDraft, setDirDraft] = useState('')
  const [editingDir, setEditingDir] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ 'Read-only tools': true })
  const folderInputRef = useRef<HTMLInputElement>(null)

  function setEnabled(enabled: boolean) { onChange({ ...settings, enabled }) }

  function addDir() {
    const d = normalizePath(dirDraft)
    if (!d || settings.directories.includes(d)) return
    onChange({ ...settings, directories: [...settings.directories, d] })
    setDirDraft('')
  }

  function removeDir(dir: string) {
    onChange({ ...settings, directories: settings.directories.filter(d => d !== dir) })
  }

  function commitEdit(original: string) {
    const d = normalizePath(editDraft)
    if (d && d !== original && !settings.directories.includes(d)) {
      onChange({ ...settings, directories: settings.directories.map(x => x === original ? d : x) })
    }
    setEditingDir(null)
  }

  function handleFolderPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // webkitRelativePath = "folderName/..." — extract root folder name from full path if available
    const rel = file.webkitRelativePath
    const rootFolder = rel ? rel.split('/')[0] : file.name
    // We can only get the folder name, not the full path, from the browser API.
    // Prompt the user to confirm or edit before adding.
    setDirDraft(rootFolder)
    // reset so the same folder can be picked again
    e.target.value = ''
  }

  function setToolPerm(toolId: string, perm: ToolPermission) {
    onChange({ ...settings, toolPermissions: { ...settings.toolPermissions, [toolId]: perm } })
  }

  function setGroupPerm(group: FsGroup, perm: ToolPermission) {
    const next = { ...settings.toolPermissions }
    group.tools.forEach(t => { next[t.id] = perm })
    onChange({ ...settings, toolPermissions: next })
  }

  function resetPermissions() {
    onChange({ ...settings, toolPermissions: { ...DEFAULT_FS_PERMISSIONS } })
  }

  function handleUninstall() {
    onChange({ enabled: false, directories: [], toolPermissions: { ...DEFAULT_FS_PERMISSIONS } })
    toast.success('Filesystem connector reset')
    onClose()
  }

  function toggleGroup(label: string) {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const canAdd = dirDraft.trim().length > 0

  return (
    <TooltipProvider delayDuration={400}>
      <div className="p-8 max-w-xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl border border-border bg-muted flex items-center justify-center shrink-0">
            <HardDrive className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Filesystem</h2>
            <p className="text-xs text-muted-foreground">Local file access via MCP · settings saved locally</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Give your agents read and write access to directories on this machine. Configure which folders are accessible and what operations each tool is allowed to perform.
        </p>

        {/* Enabled / Uninstall */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 mb-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={settings.enabled}
              onCheckedChange={setEnabled}
              aria-label="Enable Filesystem connector"
            />
            <span className="text-sm font-medium">Enabled</span>
          </div>
          <button
            onClick={handleUninstall}
            className="px-4 py-1.5 rounded-lg text-sm font-medium border border-border bg-background hover:bg-muted transition-colors text-destructive/80 hover:text-destructive"
          >
            Uninstall
          </button>
        </div>

        {/* Warning: enabled but no directories */}
        {settings.enabled && settings.directories.length === 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-4 py-2.5 mb-4">
            <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
            <p className="text-xs text-orange-400">Enabled with no directories — the connector won&apos;t have access to anything.</p>
          </div>
        )}

        {/* Allowed Directories */}
        <div className="rounded-xl border border-border bg-card px-5 py-4 mb-6">
          <div className="mb-3">
            <p className="text-sm font-medium">
              Allowed Directories
              {settings.directories.length > 0 && (
                <span className="text-muted-foreground font-normal ml-1.5">({settings.directories.length})</span>
              )}
              <span className="text-orange-400 ml-1.5 text-xs">(Required)</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Directories the filesystem server can access</p>
          </div>

          {/* Directory list */}
          <div className="flex flex-col gap-2 mb-3">
            {settings.directories.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-5 text-xs text-muted-foreground">
                No directories added yet
              </div>
            ) : settings.directories.map(dir => (
              <div key={dir} className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 group">
                {editingDir === dir ? (
                  <input
                    autoFocus
                    value={editDraft}
                    onChange={e => setEditDraft(e.target.value)}
                    onBlur={() => commitEdit(dir)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEdit(dir)
                      if (e.key === 'Escape') setEditingDir(null)
                    }}
                    className="flex-1 text-sm font-mono bg-transparent outline-none border-b border-primary/50"
                  />
                ) : (
                  <button
                    className="flex-1 text-sm font-mono truncate text-left hover:text-foreground text-muted-foreground transition-colors"
                    onClick={() => { setEditingDir(dir); setEditDraft(dir) }}
                    title="Click to edit"
                  >
                    {dir}
                  </button>
                )}
                <button
                  onClick={() => removeDir(dir)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all shrink-0"
                  aria-label="Remove directory"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add directory row */}
          <input
            ref={folderInputRef}
            type="file"
            className="hidden"
            // @ts-expect-error webkitdirectory is not in React's types
            webkitdirectory=""
            onChange={handleFolderPick}
          />
          <div className="flex gap-2">
            <input
              value={dirDraft}
              onChange={e => setDirDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && canAdd) addDir() }}
              placeholder="Paste a directory path…"
              className="flex-1 text-sm bg-muted/40 border border-border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary/40 font-mono placeholder:text-muted-foreground placeholder:font-sans"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="p-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors shrink-0"
                  aria-label="Browse folder"
                >
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Browse folder</TooltipContent>
            </Tooltip>
            <button
              onClick={addDir}
              disabled={!canAdd}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm transition-colors disabled:opacity-40 disabled:pointer-events-none shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground/60 mt-2">Changes save automatically.</p>
        </div>

        {/* Tool permissions */}
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium">Tool permissions</p>
              <p className="text-xs text-muted-foreground mt-0.5">Choose when the agent is allowed to use each tool.</p>
            </div>
            <button
              onClick={resetPermissions}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md px-2.5 py-1 hover:bg-muted"
            >
              Reset to defaults
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {FS_GROUPS.map(group => {
              const mode = groupMode(group.tools, settings.toolPermissions)
              const expanded = expandedGroups[group.label] ?? false

              return (
                <div key={group.label} className="rounded-lg border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30">
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <ChevronRight className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', expanded && 'rotate-90')} />
                      <span className="text-sm font-medium">{group.label}</span>
                      <span className="text-xs text-muted-foreground ml-1">{group.tools.length}</span>
                    </button>
                    <GroupPermPicker
                      value={mode}
                      onChange={perm => setGroupPerm(group, perm)}
                    />
                  </div>

                  {expanded && (
                    <div className="divide-y divide-border">
                      {group.tools.map(tool => (
                        <div key={tool.id} className="flex items-center gap-2 px-3 py-2 pl-8">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex-1 text-sm text-muted-foreground cursor-default">{tool.label}</span>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-[220px]">
                              {FS_TOOL_DESCRIPTIONS[tool.id] ?? tool.label}
                            </TooltipContent>
                          </Tooltip>
                          <ToolPermPicker
                            value={settings.toolPermissions[tool.id] ?? 'ask'}
                            onChange={perm => setToolPerm(tool.id, perm)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
