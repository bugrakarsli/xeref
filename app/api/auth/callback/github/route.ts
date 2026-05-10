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

  console.log('[github/callback] received — code:', !!code, 'state:', !!stateParam)

  if (!code || !clientId || !clientSecret) {
    console.error('[github/callback] missing params — code:', !!code, 'clientId:', !!clientId, 'clientSecret:', !!clientSecret)
    return NextResponse.json({ error: 'Missing code or configuration' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const cookieState = cookieStore.get(OAUTH_STATE_COOKIE)?.value

  let verified: ReturnType<typeof verifyState>
  try {
    verified = stateParam ? verifyState(stateParam, cookieState) : null
  } catch (err) {
    console.error('[github/callback] verifyState threw — check CONNECTIONS_ENCRYPTION_KEY:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'State verification failed — server configuration error' },
      { status: 500 }
    )
  }

  if (!verified) {
    console.error('[github/callback] state invalid or cookie missing — cookiePresent:', !!cookieState)
    return NextResponse.json(
      { error: 'Invalid or expired OAuth state — please try connecting again' },
      { status: 400 }
    )
  }

  console.log('[github/callback] state verified for userId:', verified.userId, 'returnTo:', verified.returnTo)
  cookieStore.delete(OAUTH_STATE_COOKIE)

  // Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })
  const tokenData = await tokenRes.json()
  if (tokenData.error || !tokenData.access_token) {
    console.error('[github/callback] token exchange failed:', tokenData.error, tokenData.error_description)
    return NextResponse.json(
      { error: tokenData.error_description || tokenData.error || 'Token exchange failed' },
      { status: 400 }
    )
  }
  console.log('[github/callback] token exchange succeeded, scopes:', tokenData.scope)

  // Fetch the GitHub login so the UI can display "Connected as @octocat" (best-effort).
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
    // metadata is best-effort; the token still works without it
  }

  const scopes: string[] = typeof tokenData.scope === 'string'
    ? tokenData.scope.split(',').filter(Boolean)
    : []

  const returnBase = verified.returnTo || '/customize/connectors'

  try {
    await upsertConnection({
      userId: verified.userId,
      provider: 'github',
      kind: 'oauth',
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token ?? null,
      scopes,
      metadata: ghLogin ? { login: ghLogin } : {},
    })
    console.log('[github/callback] connection upserted, login:', ghLogin ?? '(unavailable)')
  } catch (err) {
    console.error('[github/callback] upsertConnection failed — check CONNECTIONS_ENCRYPTION_KEY and SUPABASE_SERVICE_ROLE_KEY:', err instanceof Error ? err.message : err)
    return NextResponse.redirect(new URL(`${returnBase}?error=connection_failed`, origin))
  }

  // Clear any legacy cookie from before this migration so it doesn't shadow the DB row.
  cookieStore.delete('gh_token')

  const redirectTo = new URL(`${returnBase}?connected=github`, origin)
  console.log('[github/callback] redirecting to:', redirectTo.toString())
  return NextResponse.redirect(redirectTo)
}
