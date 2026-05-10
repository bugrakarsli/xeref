'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PROVIDERS, type ProviderId } from '@/lib/connections/registry'
import { getTelegramBotToken, clearTelegramBotToken } from '@/app/actions/profile'
import {
  Github,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  Database,
  Globe,
  Triangle,
} from 'lucide-react'

// Map UI card id → connect URL
const CONNECT_URLS: Record<string, string> = {
  github: '/api/github/login?returnTo=/customize/connectors',
  gmail: '/api/connections/google/login?returnTo=/customize/connectors',
  gcal: '/api/connections/google/login?returnTo=/customize/connectors',
  notion: '/api/connections/notion/login?returnTo=/customize/connectors',
  slack: '/api/connections/slack/login?returnTo=/customize/connectors',
  supabase: '',   // PAT — handled via modal (future)
  webhook: '',    // custom — handled via modal (future)
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

const PROVIDER_LABELS: Record<string, string> = {
  github: 'GitHub', google: 'Google', notion: 'Notion',
  slack: 'Slack', vercel: 'Vercel',
}

function TelegramCard() {
  const router = useRouter()
  const [token, setToken] = useState<string | null | undefined>(undefined)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    getTelegramBotToken().then(setToken).catch(() => setToken(null))
  }, [])

  async function handleDisconnect() {
    setDisconnecting(true)
    try {
      await clearTelegramBotToken()
      setToken(null)
      toast.success('Telegram bot disconnected')
    } catch {
      toast.error('Failed to disconnect')
    } finally {
      setDisconnecting(false)
    }
  }

  const connected = !!token
  const maskedToken = token ? `${token.slice(0, 10)}:${'•'.repeat(16)}` : null

  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-xl border transition-all',
      connected ? 'bg-muted/60 border-border' : 'bg-muted/30 border-border hover:border-muted-foreground/30'
    )}>
      <span className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-background border border-border shrink-0">
        <Send className="w-4 h-4 text-blue-400" />
        {connected && (
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-background flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-green-400" />
          </span>
        )}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Telegram Bot</p>
        <p className="text-xs text-muted-foreground truncate">
          {token === undefined
            ? 'Loading…'
            : connected
            ? `Webhook active — ${maskedToken}`
            : 'Route messages from Telegram through your xeref agent'}
        </p>
      </div>

      {token === undefined ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
      ) : connected ? (
        <button
          onClick={handleDisconnect}
          disabled={disconnecting}
          className={cn(
            'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            'bg-muted hover:bg-destructive/15 text-muted-foreground hover:text-destructive',
            disconnecting && 'opacity-50 cursor-not-allowed'
          )}
        >
          {disconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Disconnect'}
        </button>
      ) : (
        <button
          onClick={() => router.push('/?view=deploy')}
          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-blue-500/15 hover:bg-blue-500/25 text-blue-400"
        >
          Configure
        </button>
      )}
    </div>
  )
}

export function ConnectorsSection() {
  const searchParams = useSearchParams()
  const [providers, setProviders] = useState<ProviderState[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Show toast on redirect-back from OAuth callbacks
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
          : 'Failed to connect. Check that CONNECTIONS_ENCRYPTION_KEY and SUPABASE_SERVICE_ROLE_KEY are set in your environment, and that the user_connections migration has been applied.'
      )
      window.history.replaceState({}, '', '/customize/connectors')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    fetchConnections()
  }, [fetchConnections])

  async function disconnect(providerId: ProviderId) {
    setDisconnecting(providerId)
    try {
      const res = await fetch(`/api/connections/${providerId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Disconnect failed')
      await fetchConnections()
    } catch {
      setError('Failed to disconnect. Please try again.')
    } finally {
      setDisconnecting(null)
    }
  }

  // Flatten providers → UI cards
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
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  )

  const connected = filtered.filter((c) => c.connected)
  const available = filtered.filter((c) => !c.connected)

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Connectors</h2>
        <p className="text-sm text-muted-foreground">
          Connect external services so your agents can act on your behalf.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search connectors…"
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Channels — Telegram (profile-based, not OAuth) */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Channels
        </p>
        <TelegramCard />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading connections…
        </div>
      ) : (
        <>
          {connected.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Connected ({connected.length})
              </p>
              <div className="flex flex-col gap-2">
                {connected.map((c) => (
                  <ConnectorCard
                    key={c.id}
                    card={c}
                    disconnecting={disconnecting === c.providerId}
                    onDisconnect={() => disconnect(c.providerId)}
                  />
                ))}
              </div>
            </div>
          )}

          {available.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Available ({available.length})
              </p>
              <div className="flex flex-col gap-2">
                {available.map((c) => (
                  <ConnectorCard
                    key={c.id}
                    card={c}
                    disconnecting={false}
                    onDisconnect={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">
              No connectors match &ldquo;{search}&rdquo;.
            </p>
          )}
        </>
      )}
    </div>
  )
}

function ConnectorCard({
  card,
  disconnecting,
  onDisconnect,
}: {
  card: UiCard
  disconnecting: boolean
  onDisconnect: () => void
}) {
  const Icon = CARD_ICONS[card.id] ?? Globe
  const connectUrl = CONNECT_URLS[card.id]

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border transition-all',
        card.connected
          ? 'bg-muted/60 border-border'
          : 'bg-muted/30 border-border hover:border-muted-foreground/30'
      )}
    >
      <span className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-background border border-border shrink-0">
        <Icon className={cn('w-4 h-4', CARD_COLORS[card.id])} />
        {card.connected && (
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-background flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-green-400" />
          </span>
        )}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{card.name}</p>
        <p className="text-xs text-muted-foreground truncate">{card.description}</p>
        {card.connected && card.scopes.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {card.scopes.map((s) => (
              <span
                key={s}
                className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        {card.connected && (card.metadata?.login as string) && (
          <p className="text-[10px] text-muted-foreground mt-1">
            Connected as{' '}
            <span className="font-medium text-foreground">@{card.metadata.login as string}</span>
          </p>
        )}
      </div>

      {card.connected ? (
        <button
          onClick={onDisconnect}
          disabled={disconnecting}
          className={cn(
            'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            'bg-muted hover:bg-destructive/15 text-muted-foreground hover:text-destructive',
            disconnecting && 'opacity-50 cursor-not-allowed'
          )}
        >
          {disconnecting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            'Disconnect'
          )}
        </button>
      ) : connectUrl ? (
        <a
          href={connectUrl}
          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-blue-500/15 hover:bg-blue-500/25 text-blue-400"
        >
          Connect
        </a>
      ) : (
        <button
          disabled
          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground/50 cursor-not-allowed"
          title="Coming soon"
        >
          Connect
        </button>
      )}
    </div>
  )
}
