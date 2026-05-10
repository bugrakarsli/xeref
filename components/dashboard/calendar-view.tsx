'use client'

import { useState, useEffect, useTransition } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Unplug, ExternalLink, Copy, Check, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  getCalendarConnection,
  getCalendarEvents,
  disconnectCalendar,
  saveGoogleOAuthCredentials,
  getGoogleOAuthCredentials,
} from '@/app/actions/calendar'
import type { CalendarEvent } from '@/app/actions/calendar'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const EVENT_COLORS = [
  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'bg-rose-500/20 text-rose-400 border-rose-500/30',
]

function buildCalendarGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const rows: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}

function getEventDate(event: CalendarEvent): string {
  return (event.start.date ?? event.start.dateTime ?? '').split('T')[0]
}

function formatEventTime(event: CalendarEvent): string {
  if (event.start.date) return 'All day'
  if (!event.start.dateTime) return ''
  return new Date(event.start.dateTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="ml-1 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

export function CalendarView() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [connected, setConnected] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [isPending, startTransition] = useTransition()

  // OAuth config dialog
  const [oauthOpen, setOauthOpen] = useState(false)
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [hasStoredCreds, setHasStoredCreds] = useState(false)
  const [savingCreds, setSavingCreds] = useState(false)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const redirectUri = `${siteUrl}/api/calendar/callback`
  const jsOrigin = siteUrl

  const rows = buildCalendarGrid(year, month)
  const currentDay = today.getDate()
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  // Check Google Calendar connection status + handle OAuth callback params
  useEffect(() => {
    // Parse OAuth callback params from URL (avoids useSearchParams Suspense requirement)
    const params = new URLSearchParams(window.location.search)
    const calConnected = params.get('calendar_connected')
    const calError = params.get('calendar_error')

    if (calConnected === 'true') {
      toast.success('Google Calendar connected!')
      window.history.replaceState({}, '', window.location.pathname)
    } else if (calError) {
      const messages: Record<string, string> = {
        access_denied: 'Calendar access was denied.',
        token_failed: 'Failed to connect. Please try again.',
        not_configured: 'Google OAuth credentials are not configured. Click the settings icon to add them.',
      }
      toast.error(messages[calError] ?? 'Failed to connect to Google Calendar.')
      window.history.replaceState({}, '', window.location.pathname)
    }

    // Load stored OAuth credentials
    getGoogleOAuthCredentials().then(({ clientId: cid, clientSecret: cs }) => {
      if (cid) { setClientId(cid); setHasStoredCreds(true) }
      if (cs) setClientSecret(cs)
    }).catch(() => {})

    getCalendarConnection()
      .then(({ connected }) => {
        setConnected(connected)
        if (connected) {
          setLoadingEvents(true)
          return getCalendarEvents()
        }
      })
      .then((evts) => {
        if (evts) setEvents(evts)
      })
      .catch(() => {})
      .finally(() => {
        setLoadingStatus(false)
        setLoadingEvents(false)
      })
  }, [])

  async function handleSaveCredentials() {
    if (!clientId.trim() || !clientSecret.trim()) {
      toast.error('Both Client ID and Client Secret are required.')
      return
    }
    setSavingCreds(true)
    try {
      await saveGoogleOAuthCredentials(clientId.trim(), clientSecret.trim())
      setHasStoredCreds(true)
      toast.success('OAuth credentials saved.')
      setOauthOpen(false)
    } catch {
      toast.error('Failed to save credentials.')
    } finally {
      setSavingCreds(false)
    }
  }

  function handleConnect() {
    window.location.href = '/api/calendar/auth'
  }

  function handleDisconnect() {
    startTransition(async () => {
      try {
        await disconnectCalendar()
        setConnected(false)
        setEvents([])
        toast.success('Google Calendar disconnected.')
      } catch {
        toast.error('Failed to disconnect.')
      }
    })
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  // Build a map: dateStr → events[]
  const eventsByDate: Record<string, CalendarEvent[]> = {}
  for (const evt of events) {
    const dateStr = getEventDate(evt)
    if (!eventsByDate[dateStr]) eventsByDate[dateStr] = []
    eventsByDate[dateStr].push(evt)
  }

  return (
    <section aria-label="Calendar" className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule and review agent runs, deadlines, and deployment events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {loadingStatus ? (
            <Button variant="outline" size="sm" disabled>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Checking…
            </Button>
          ) : connected ? (
            <>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1.5">
                <CalendarDays className="h-3 w-3" />
                Google Calendar connected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={isPending}
                className="gap-1.5 text-muted-foreground hover:text-destructive h-7 text-xs"
              >
                <Unplug className="h-3 w-3" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={handleConnect}
            >
              <CalendarDays className="h-4 w-4" />
              Connect Google Calendar
            </Button>
          )}
          {/* OAuth config button — always visible when not connected */}
          {!connected && (
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-muted-foreground h-8 w-8 p-0"
              onClick={() => setOauthOpen(true)}
              aria-label="Configure OAuth"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Month header with navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold">{MONTHS[month]} {year}</h2>
          <div className="flex items-center gap-1">
            {loadingEvents && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground mr-2" />
            )}
            <button
              onClick={prevMonth}
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()) }}
              className="px-2 h-7 rounded-md text-xs font-medium hover:bg-accent transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Day-of-week row */}
        <div className="grid grid-cols-7 border-b">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        {rows.map((row, ri) => (
          <div key={ri} className={cn('grid grid-cols-7', ri < rows.length - 1 && 'border-b')}>
            {row.map((day, ci) => {
              const dateStr = day
                ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                : ''
              const dayEvents = dateStr ? (eventsByDate[dateStr] ?? []) : []

              return (
                <div
                  key={ci}
                  className={cn(
                    'min-h-[80px] p-2 text-sm',
                    ci < 6 && 'border-r',
                    !day && 'bg-muted/20',
                  )}
                >
                  {day && (
                    <>
                      <span
                        className={cn(
                          'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium mb-1',
                          isCurrentMonth && day === currentDay
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground',
                        )}
                      >
                        {day}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        {dayEvents.slice(0, 2).map((evt, ei) => (
                          <div
                            key={evt.id}
                            title={`${evt.summary}\n${formatEventTime(evt)}`}
                            className={cn(
                              'text-[10px] px-1 py-0.5 rounded border truncate leading-tight',
                              EVENT_COLORS[ei % EVENT_COLORS.length]
                            )}
                          >
                            {evt.summary}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[10px] text-muted-foreground pl-1">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {!connected && !loadingStatus && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          {hasStoredCreds
            ? 'OAuth credentials saved. Click "Connect Google Calendar" to authorize.'
            : <>Click the <Settings2 className="inline h-3 w-3 mx-0.5" /> icon to add your Google OAuth credentials, then connect.</>}
        </p>
      )}

      {/* OAuth Configuration Dialog */}
      <Dialog open={oauthOpen} onOpenChange={setOauthOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>OAuth Configuration</DialogTitle>
            <DialogDescription>
              Create a Google OAuth app and paste your credentials below. Each user brings their own OAuth client.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 text-xs text-muted-foreground mb-1">
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              Open OAuth Clients <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://developers.google.com/calendar/api/quickstart/js"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              Guide <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="client-id">Client ID</Label>
              <Input
                id="client-id"
                placeholder="your-client-id.apps.googleusercontent.com"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="client-secret">Client Secret</Label>
              <Input
                id="client-secret"
                type="password"
                placeholder="GOCSPX-…"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Required URLs in Google Cloud Console
              </p>

              <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3 text-xs">
                <p className="text-muted-foreground font-medium">Authorized JavaScript origins</p>
                <div className="flex items-center gap-1 font-mono text-foreground">
                  <span className="truncate">{jsOrigin}</span>
                  <CopyButton value={jsOrigin} />
                </div>
              </div>

              <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3 text-xs">
                <p className="text-muted-foreground font-medium">Authorized redirect URIs</p>
                <div className="flex items-center gap-1 font-mono text-foreground">
                  <span className="truncate">{redirectUri}</span>
                  <CopyButton value={redirectUri} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOauthOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCredentials} disabled={savingCreds}>
              {savingCreds && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
