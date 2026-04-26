import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listConnectionsForUser } from '@/lib/connections/store'
import { isProviderConfigured, PROVIDERS, type ProviderId } from '@/lib/connections/registry'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const rows = await listConnectionsForUser(user.id)
  const connectedByProvider = new Map(rows.map((r) => [r.provider, r]))

  const providers = (Object.keys(PROVIDERS) as ProviderId[]).map((id) => {
    const def = PROVIDERS[id]
    const row = connectedByProvider.get(id)
    return {
      id,
      name: def.name,
      kind: def.kind,
      configured: isProviderConfigured(id),
      connected: !!row,
      scopes: row?.scopes ?? [],
      metadata: row?.metadata ?? {},
      uiCards: def.uiCards,
    }
  })

  return NextResponse.json({ providers })
}
