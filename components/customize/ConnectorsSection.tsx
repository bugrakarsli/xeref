'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { AVAILABLE_CONNECTORS } from './data'
import type { Connector } from './types'

export function ConnectorsSection() {
  const defaultConnected = AVAILABLE_CONNECTORS.filter((c) => c.connected).map((c) => c.id)
  const [connectedIds, setConnectedIds] = useLocalStorage<string[]>(
    'xeref:connectors',
    defaultConnected
  )
  const [search, setSearch] = useState('')

  const connectors: Connector[] = AVAILABLE_CONNECTORS.map((c) => ({
    ...c,
    connected: connectedIds.includes(c.id),
  }))

  function toggle(id: string) {
    setConnectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const filtered = connectors.filter(
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

      {connected.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Connected ({connected.length})
          </p>
          <div className="flex flex-col gap-2">
            {connected.map((c) => (
              <ConnectorCard key={c.id} connector={c} onToggle={toggle} />
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
              <ConnectorCard key={c.id} connector={c} onToggle={toggle} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">
          No connectors match &ldquo;{search}&rdquo;.
        </p>
      )}
    </div>
  )
}

function ConnectorCard({
  connector,
  onToggle,
}: {
  connector: Connector
  onToggle: (id: string) => void
}) {
  const Icon = connector.icon
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border transition-all',
        connector.connected
          ? 'bg-muted/60 border-border'
          : 'bg-muted/30 border-border hover:border-muted-foreground/30'
      )}
    >
      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-background border border-border shrink-0">
        <Icon className={cn('w-4 h-4', connector.color)} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{connector.name}</p>
        <p className="text-xs text-muted-foreground truncate">{connector.description}</p>
        {connector.connected && connector.scopes && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {connector.scopes.map((s) => (
              <span
                key={s}
                className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => onToggle(connector.id)}
        className={cn(
          'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
          connector.connected
            ? 'bg-muted hover:bg-destructive/15 text-muted-foreground hover:text-destructive'
            : 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-400'
        )}
      >
        {connector.connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  )
}
