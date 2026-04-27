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
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const url = new URL(request.url)
  const returnTo = url.searchParams.get('returnTo') || '/customize/connectors'

  let state: string
  let cookieValue: string
  try {
    ;({ state, cookieValue } = createState(user.id, returnTo))
  } catch (err) {
    console.error('[github/login] createState failed — check CONNECTIONS_ENCRYPTION_KEY:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'OAuth state generation failed — server configuration error' },
      { status: 500 }
    )
  }

  const cookieStore = await cookies()
  cookieStore.set(OAUTH_STATE_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })

  // Explicit redirect_uri ensures GitHub uses our callback regardless of what is
  // set as the default in the OAuth App settings.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin
  const redirectUri = `${siteUrl}/api/auth/callback/github`

  const authorize = new URL('https://github.com/login/oauth/authorize')
  authorize.searchParams.set('client_id', clientId)
  authorize.searchParams.set('redirect_uri', redirectUri)
  authorize.searchParams.set('scope', 'repo read:user')
  authorize.searchParams.set('state', state)

  console.log('[github/login] starting OAuth flow, redirect_uri:', redirectUri)
  return NextResponse.redirect(authorize.toString())
}
