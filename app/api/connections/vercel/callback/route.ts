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
    console.error('[vercel/callback] OAuth error:', error)
    return NextResponse.redirect(new URL('/customize/connectors?error=access_denied', origin))
  }

  const clientId = process.env.VERCEL_CLIENT_ID
  const clientSecret = process.env.VERCEL_CLIENT_SECRET

  if (!code || !clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing code or configuration' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const cookieState = cookieStore.get(OAUTH_STATE_COOKIE)?.value

  let verified: ReturnType<typeof verifyState>
  try {
    verified = stateParam ? verifyState(stateParam, cookieState) : null
  } catch (err) {
    console.error('[vercel/callback] verifyState failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'State verification failed' }, { status: 500 })
  }

  if (!verified) {
    console.error('[vercel/callback] invalid state')
    return NextResponse.json({ error: 'Invalid or expired OAuth state' }, { status: 400 })
  }

  cookieStore.delete(OAUTH_STATE_COOKIE)

  // Exchange code for tokens
  const isDev = process.env.NODE_ENV === 'development'
  const siteUrl = isDev ? origin : (process.env.NEXT_PUBLIC_SITE_URL || origin)
  const redirectUri = `${siteUrl}/api/connections/vercel/callback`

  const tokenRes = await fetch('https://api.vercel.com/v2/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  })

  const tokenData = await tokenRes.json()
  if (tokenData.error || !tokenData.access_token) {
    console.error('[vercel/callback] token exchange failed:', tokenData.error)
    return NextResponse.json(
      { error: tokenData.error_description || 'Token exchange failed' },
      { status: 400 }
    )
  }

  try {
    await upsertConnection({
      userId: verified.userId,
      provider: 'vercel',
      kind: 'oauth',
      accessToken: tokenData.access_token,
      refreshToken: null,
      expiresAt: null, // Vercel tokens don't expire by default unless configured
      scopes: [],
      metadata: {
        teamId: tokenData.team_id,
        userId: tokenData.user_id,
        installationId: tokenData.installation_id,
      },
    })
  } catch (err) {
    console.error('[vercel/callback] upsertConnection failed:', err instanceof Error ? err.message : err)
    return NextResponse.redirect(new URL(`${verified.returnTo || '/customize/connectors'}?error=connection_failed`, origin))
  }

  return NextResponse.redirect(new URL(`${verified.returnTo || '/customize/connectors'}?connected=vercel`, origin))
}
