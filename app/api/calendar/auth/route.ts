import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
].join(' ')

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  // Resolve client ID: per-user first, then env var fallback
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let clientId: string | null = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('google_oauth_client_id')
      .eq('id', user.id)
      .single()
    clientId = (data as { google_oauth_client_id?: string | null } | null)?.google_oauth_client_id ?? null
  }

  // Fall back to server env var
  if (!clientId) clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID ?? null

  if (!clientId || !siteUrl) {
    return NextResponse.redirect(`${siteUrl}/?calendar_error=not_configured`)
  }

  const redirectUri = `${siteUrl}/api/calendar/callback`

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  )
}
