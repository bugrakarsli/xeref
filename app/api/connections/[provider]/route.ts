import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteConnection, getConnectionWithSecrets } from '@/lib/connections/store'
import { PROVIDERS, type ProviderId } from '@/lib/connections/registry'

function isProviderId(v: string): v is ProviderId {
  return v in PROVIDERS
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  if (!isProviderId(provider)) {
    return NextResponse.json({ error: 'unknown provider' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Best-effort token revocation per provider (continue on failure).
  try {
    const conn = await getConnectionWithSecrets(user.id, provider)
    if (conn?.access_token) {
      await revokeUpstream(provider, conn.access_token)
    }
  } catch (err) {
    console.error(`Upstream revoke failed for ${provider}:`, err)
  }

  await deleteConnection(user.id, provider)
  return NextResponse.json({ ok: true })
}

async function revokeUpstream(provider: ProviderId, token: string): Promise<void> {
  switch (provider) {
    case 'github': {
      const clientId = process.env.GITHUB_APP_CLIENT_ID
      const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET
      if (!clientId || !clientSecret) return
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      await fetch(`https://api.github.com/applications/${clientId}/grant`, {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'xeref-app',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: token }),
      })
      return
    }
    case 'google': {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
        method: 'POST',
      })
      return
    }
    case 'slack': {
      await fetch('https://slack.com/api/auth.revoke', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      return
    }
    case 'notion':
    case 'supabase':
    case 'webhook':
      return
  }
}
