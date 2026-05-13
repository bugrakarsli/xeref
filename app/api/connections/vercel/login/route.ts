import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createState, OAUTH_STATE_COOKIE } from '@/lib/connections/oauth-state'
import { PROVIDERS, isProviderConfigured } from '@/lib/connections/registry'

export async function GET(request: Request) {
  if (!isProviderConfigured('vercel')) {
    return NextResponse.json({ error: 'Vercel OAuth not configured' }, { status: 500 })
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin
  const redirectUri = `${siteUrl}/api/connections/vercel/callback`

  const authorize = new URL('https://vercel.com/oauth/authorize')
  authorize.searchParams.set('client_id', process.env.VERCEL_CLIENT_ID!)
  authorize.searchParams.set('redirect_uri', redirectUri)
  authorize.searchParams.set('state', state)

  return NextResponse.redirect(authorize.toString())
}
