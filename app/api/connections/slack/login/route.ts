import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createState, OAUTH_STATE_COOKIE } from '@/lib/connections/oauth-state'
import { isProviderConfigured, PROVIDERS } from '@/lib/connections/registry'

export async function GET(request: Request) {
  if (!isProviderConfigured('slack')) {
    return NextResponse.json({ error: 'Slack OAuth not configured' }, { status: 500 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const url = new URL(request.url)
  const returnTo = url.searchParams.get('returnTo') || '/customize/connectors'
  const { state, cookieValue } = createState(user.id, returnTo)

  const cookieStore = await cookies()
  cookieStore.set(OAUTH_STATE_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })

  const isDev = process.env.NODE_ENV === 'development'
  const siteUrl = isDev ? url.origin : (process.env.NEXT_PUBLIC_SITE_URL || url.origin)
  const redirectUri = `${siteUrl}/api/connections/slack/callback`

  const authorize = new URL('https://slack.com/oauth/v2/authorize')
  authorize.searchParams.set('client_id', process.env.SLACK_OAUTH_CLIENT_ID!)
  authorize.searchParams.set('redirect_uri', redirectUri)
  authorize.searchParams.set('scope', PROVIDERS.slack.scopes.join(','))
  authorize.searchParams.set('state', state)

  return NextResponse.redirect(authorize.toString())
}
