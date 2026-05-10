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

  const clientId = process.env.SLACK_OAUTH_CLIENT_ID
  const clientSecret = process.env.SLACK_OAUTH_CLIENT_SECRET

  if (!code || !clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing code or configuration' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const cookieState = cookieStore.get(OAUTH_STATE_COOKIE)?.value

  let verified: ReturnType<typeof verifyState>
  try {
    verified = stateParam ? verifyState(stateParam, cookieState) : null
  } catch (err) {
    console.error('[slack/callback] verifyState failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'State verification failed' }, { status: 500 })
  }

  if (!verified) {
    return NextResponse.json({ error: 'Invalid or expired OAuth state' }, { status: 400 })
  }

  cookieStore.delete(OAUTH_STATE_COOKIE)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
  const redirectUri = `${siteUrl}/api/connections/slack/callback`

  const tokenRes = await fetch('https://slack.com/api/oauth.v2.access', {
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
  if (!tokenData.ok || !tokenData.access_token) {
    console.error('[slack/callback] token exchange failed:', tokenData.error)
    return NextResponse.json({ error: tokenData.error || 'Token exchange failed' }, { status: 400 })
  }

  const scopes: string[] = typeof tokenData.scope === 'string'
    ? tokenData.scope.split(',').filter(Boolean)
    : []

  try {
    await upsertConnection({
      userId: verified.userId,
      provider: 'slack',
      kind: 'oauth',
      accessToken: tokenData.access_token,
      scopes,
      metadata: {
        team_name: tokenData.team?.name ?? null,
        team_id: tokenData.team?.id ?? null,
        bot_user_id: tokenData.bot_user_id ?? null,
      },
    })
  } catch (err) {
    console.error('[slack/callback] upsertConnection failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed to save Slack connection' }, { status: 500 })
  }

  return NextResponse.redirect(new URL(verified.returnTo || '/customize/connectors', origin))
}
