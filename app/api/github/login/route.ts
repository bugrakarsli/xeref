import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createState, OAUTH_STATE_COOKIE } from '@/lib/connections/oauth-state'

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_APP_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'GITHUB_APP_CLIENT_ID not configured' }, { status: 500 })
  }

  // Require an authenticated xeref user — we associate the resulting GitHub token with their row.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
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

  const authorize = new URL('https://github.com/login/oauth/authorize')
  authorize.searchParams.set('client_id', clientId)
  authorize.searchParams.set('scope', 'repo read:user')
  authorize.searchParams.set('state', state)

  return NextResponse.redirect(authorize.toString())
}
