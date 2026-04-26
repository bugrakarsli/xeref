import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { OAUTH_STATE_COOKIE, verifyState } from '@/lib/connections/oauth-state'
import { upsertConnection } from '@/lib/connections/store'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const clientId = process.env.GITHUB_APP_CLIENT_ID
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET

  if (!code || !clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing code or configuration' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const cookieState = cookieStore.get(OAUTH_STATE_COOKIE)?.value
  const verified = stateParam ? verifyState(stateParam, cookieState) : null
  if (!verified) {
    return NextResponse.json({ error: 'Invalid OAuth state' }, { status: 400 })
  }
  cookieStore.delete(OAUTH_STATE_COOKIE)

  // Exchange code for token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })
  const tokenData = await tokenRes.json()
  if (tokenData.error || !tokenData.access_token) {
    return NextResponse.json(
      { error: tokenData.error_description || tokenData.error || 'Token exchange failed' },
      { status: 400 }
    )
  }

  // Fetch the GitHub login so the UI can display "Connected as @octocat".
  let ghLogin: string | null = null
  try {
    const meRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'xeref-app',
      },
    })
    if (meRes.ok) {
      const me = await meRes.json()
      if (typeof me.login === 'string') ghLogin = me.login
    }
  } catch {
    // metadata is best-effort; the token still works.
  }

  const scopes: string[] = typeof tokenData.scope === 'string'
    ? tokenData.scope.split(',').filter(Boolean)
    : []

  await upsertConnection({
    userId: verified.userId,
    provider: 'github',
    kind: 'oauth',
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token ?? null,
    scopes,
    metadata: ghLogin ? { login: ghLogin } : {},
  })

  // Clear any legacy cookie from before this migration so it doesn't shadow the DB row.
  cookieStore.delete('gh_token')

  return NextResponse.redirect(new URL(verified.returnTo || '/customize/connectors', origin))
}
