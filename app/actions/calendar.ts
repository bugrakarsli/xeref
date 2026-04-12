'use server'

import { createClient } from '@/lib/supabase/server'

export interface CalendarEvent {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  description?: string
  location?: string
  colorId?: string
}

export interface GoogleToken {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  scope?: string
  expiry_date?: number
}

export async function getCalendarConnection(): Promise<{ connected: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { connected: false }

  const { data } = await supabase
    .from('profiles')
    .select('google_calendar_token')
    .eq('id', user.id)
    .single()

  return { connected: !!data?.google_calendar_token }
}

export async function saveGoogleOAuthCredentials(clientId: string, clientSecret: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  await supabase
    .from('profiles')
    .update({ google_oauth_client_id: clientId.trim(), google_oauth_client_secret: clientSecret.trim() })
    .eq('id', user.id)
}

export async function getGoogleOAuthCredentials(): Promise<{ clientId: string | null; clientSecret: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { clientId: null, clientSecret: null }
  const { data } = await supabase
    .from('profiles')
    .select('google_oauth_client_id, google_oauth_client_secret')
    .eq('id', user.id)
    .single()
  return {
    clientId: (data as { google_oauth_client_id?: string | null } | null)?.google_oauth_client_id ?? null,
    clientSecret: (data as { google_oauth_client_secret?: string | null } | null)?.google_oauth_client_secret ?? null,
  }
}

export async function disconnectCalendar(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('profiles')
    .update({ google_calendar_token: null })
    .eq('id', user.id)
}

async function refreshAccessToken(refreshToken: string): Promise<GoogleToken | null> {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) return null
  return res.json()
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('google_calendar_token')
    .eq('id', user.id)
    .single()

  if (!profile?.google_calendar_token) return []

  let token = profile.google_calendar_token as GoogleToken

  // Refresh if expired
  const isExpired = token.expiry_date && token.expiry_date < Date.now() + 60_000
  if (isExpired && token.refresh_token) {
    const refreshed = await refreshAccessToken(token.refresh_token)
    if (refreshed) {
      token = {
        ...token,
        access_token: refreshed.access_token,
        expiry_date: Date.now() + (refreshed.expires_in ?? 3600) * 1000,
      }
      await supabase
        .from('profiles')
        .update({ google_calendar_token: token })
        .eq('id', user.id)
    }
  }

  const now = new Date()
  const timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const timeMax = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString()

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=100`,
    { headers: { Authorization: `Bearer ${token.access_token}` } }
  )

  if (!res.ok) return []
  const data = await res.json()
  return (data.items ?? []) as CalendarEvent[]
}
