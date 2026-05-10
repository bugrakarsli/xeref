import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { OAUTH_STATE_COOKIE, verifyState } from '@/lib/connections/oauth-state'
import { upsertConnection } from '@/lib/connections/store'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/customize/connectors?error=access_denied', origin))
  }

  const clientId = process.env.NOTION_OAUTH_CLIENT_ID
  const clientSecret = process.env.NOTION_OAUTH_CLIENT_SECRET

  if (!code || !clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing code or configuration' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const cookieState = cookieStore.get(OAUTH_STATE_COOKIE)?.value

  let verified: ReturnType<typeof verifyState>
  try {
    verified = stateParam ? verifyState(stateParam, cookieState) : null
  } catch (err) {
    console.error('[notion/callback] verifyState failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'State verification failed' }, { status: 500 })
  }

  if (!verified) {
    return NextResponse.json({ error: 'Invalid or expired OAuth state' }, { status: 400 })
  }

  cookieStore.delete(OAUTH_STATE_COOKIE)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
  const redirectUri = `${siteUrl}/api/connections/notion/callback`

  // Notion uses Basic auth for token exchange
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const tokenRes = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, grant_type: 'authorization_code', redirect_uri: redirectUri }),
  })

  const tokenData = await tokenRes.json()
  if (tokenData.error || !tokenData.access_token) {
    console.error('[notion/callback] token exchange failed:', tokenData.error)
    return NextResponse.json({ error: 'Token exchange failed' }, { status: 400 })
  }

  try {
    await upsertConnection({
      userId: verified.userId,
      provider: 'notion',
      kind: 'oauth',
      accessToken: tokenData.access_token,
      scopes: [],
      metadata: {
        workspace_name: tokenData.workspace_name ?? null,
        workspace_id: tokenData.workspace_id ?? null,
        owner_name: tokenData.owner?.user?.name ?? null,
      },
    })
  } catch (err) {
    console.error('[notion/callback] upsertConnection failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed to save Notion connection' }, { status: 500 })
  }

  return NextResponse.redirect(new URL(verified.returnTo || '/customize/connectors', origin))
}
