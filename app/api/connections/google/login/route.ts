import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createState, OAUTH_STATE_COOKIE } from '@/lib/connections/oauth-state'
import { PROVIDERS, isProviderConfigured } from '@/lib/connections/registry'

export async function GET(request: Request) {
  if (!isProviderConfigured('google')) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

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
  const redirectUri = `${siteUrl}/api/connections/google/callback`

  const authorize = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authorize.searchParams.set('client_id', process.env.GOOGLE_OAUTH_CLIENT_ID!)
  authorize.searchParams.set('redirect_uri', redirectUri)
  authorize.searchParams.set('response_type', 'code')
  authorize.searchParams.set('access_type', 'offline')
  authorize.searchParams.set('prompt', 'consent')
  authorize.searchParams.set('include_granted_scopes', 'true')
  authorize.searchParams.set('scope', PROVIDERS.google.scopes.join(' '))
  authorize.searchParams.set('state', state)

  return NextResponse.redirect(authorize.toString())
}
