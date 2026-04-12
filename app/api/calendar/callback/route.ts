import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${siteUrl}/?calendar_error=access_denied`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${siteUrl}/login`)
  }

  // Resolve credentials: per-user first, then env var fallback
  const { data: profile } = await supabase
    .from('profiles')
    .select('google_oauth_client_id, google_oauth_client_secret')
    .eq('id', user.id)
    .single()

  const clientId =
    (profile as { google_oauth_client_id?: string | null } | null)?.google_oauth_client_id ??
    process.env.GOOGLE_CALENDAR_CLIENT_ID ?? null

  const clientSecret =
    (profile as { google_oauth_client_secret?: string | null } | null)?.google_oauth_client_secret ??
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET ?? null

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${siteUrl}/?calendar_error=not_configured`)
  }

  const redirectUri = `${siteUrl}/api/calendar/callback`

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

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${siteUrl}/?calendar_error=token_failed`)
  }

  const tokens = await tokenRes.json()

  await supabase
    .from('profiles')
    .update({
      google_calendar_token: {
        ...tokens,
        expiry_date: Date.now() + (tokens.expires_in ?? 3600) * 1000,
      },
    })
    .eq('id', user.id)

  return NextResponse.redirect(`${siteUrl}/?calendar_connected=true`)
}
