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
    console.error('[google/callback] OAuth error:', error, searchParams.get('error_description'))
    return NextResponse.redirect(new URL('/customize/connectors?error=access_denied', origin))
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET

  if (!code || !clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing code or configuration' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const cookieState = cookieStore.get(OAUTH_STATE_COOKIE)?.value

  let verified: ReturnType<typeof verifyState>
  try {
    verified = stateParam ? verifyState(stateParam, cookieState) : null
  } catch (err) {
    console.error('[google/callback] verifyState failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'State verification failed' }, { status: 500 })
  }

  if (!verified) {
    console.error('[google/callback] invalid state — cookie present:', !!cookieState)
    return NextResponse.json({ error: 'Invalid or expired OAuth state' }, { status: 400 })
  }

  cookieStore.delete(OAUTH_STATE_COOKIE)

  // Exchange code for tokens
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
  const redirectUri = `${siteUrl}/api/connections/google/callback`

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const tokenData = await tokenRes.json()
  if (tokenData.error || !tokenData.access_token) {
    console.error('[google/callback] token exchange failed:', tokenData.error)
    return NextResponse.json(
      { error: tokenData.error_description || 'Token exchange failed' },
      { status: 400 }
    )
  }

  // Fetch user info for metadata
  let email: string | null = null
  try {
    const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    if (infoRes.ok) {
      const info = await infoRes.json()
      email = info.email ?? null
    }
  } catch { /* best-effort */ }

  const scopes: string[] = typeof tokenData.scope === 'string'
    ? tokenData.scope.split(' ').filter(Boolean)
    : []

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000)
    : null

  try {
    await upsertConnection({
      userId: verified.userId,
      provider: 'google',
      kind: 'oauth',
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token ?? null,
      expiresAt,
      scopes,
      metadata: email ? { email } : {},
    })
    console.log('[google/callback] connection saved for userId:', verified.userId)
  } catch (err) {
    console.error('[google/callback] upsertConnection failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed to save Google connection' }, { status: 500 })
  }

  return NextResponse.redirect(new URL(verified.returnTo || '/customize/connectors', origin))
}
