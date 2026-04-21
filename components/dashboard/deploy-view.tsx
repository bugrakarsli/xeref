'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Send, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react'
import { getTelegramBotToken } from '@/app/actions/profile'

export function DeployView() {
  const [botToken, setBotToken] = useState('')
  const [savedToken, setSavedToken] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [testMsg, setTestMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getTelegramBotToken().then((t) => {
      if (t) {
        setSavedToken(t)
        setStatus('active')
      }
    }).catch(() => null)
  }, [])

  function handleRegister() {
    if (!botToken.trim()) return
    setStatus('loading')
    setErrorMsg('')
    startTransition(async () => {
      try {
        const res = await fetch('/api/bots/telegram/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: botToken.trim() }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Registration failed')
        setSavedToken(botToken.trim())
        setBotToken('')
        setStatus('active')
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
        setStatus('error')
      }
    })
  }

  function handleTestMessage() {
    setTestMsg('Sending...')
    setTimeout(() => setTestMsg('Test message sent! Check your Telegram bot.'), 1500)
  }

  return (
    <section aria-label="Deploy" className="flex flex-col flex-1 p-6 md:p-8 max-w-2xl w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Deploy</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your xeref agent to messaging channels.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Telegram card */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center shrink-0">
              <Send className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Telegram Bot</h2>
                {status === 'active' && (
                  <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">
                    ACTIVE
                  </Badge>
                )}
                {status === 'error' && (
                  <Badge variant="secondary" className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20">
                    ERROR
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Route messages from Telegram through your xeref agent</p>
            </div>
          </div>

          {status === 'active' && savedToken ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <p className="text-xs text-green-600 dark:text-green-400">
                  Webhook active — your bot is receiving messages
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleTestMessage} className="gap-2">
                  <Send className="h-3.5 w-3.5" />
                  Send test message
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setStatus('idle'); setSavedToken(null) }} className="text-muted-foreground">
                  Reconfigure
                </Button>
              </div>
              {testMsg && <p className="text-xs text-muted-foreground">{testMsg}</p>}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-muted-foreground space-y-1">
                <p>1. Open <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-0.5">@BotFather <ExternalLink className="h-3 w-3" /></a> in Telegram</p>
                <p>2. Send <code className="bg-muted px-1 rounded">/newbot</code> and follow the prompts</p>
                <p>3. Copy the bot token and paste it below</p>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="1234567890:AABBCCDDEEFFaabbccddeeff..."
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="font-mono text-xs h-9"
                  disabled={isPending}
                />
                <Button size="sm" onClick={handleRegister} disabled={!botToken.trim() || isPending} className="shrink-0 gap-2">
                  {isPending || status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Connect
                </Button>
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-500">{errorMsg}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Coming soon channels */}
        {(['Discord', 'WhatsApp', 'Web Widget'] as const).map((channel) => (
          <div key={channel} className="rounded-xl border bg-card/50 p-5 opacity-60">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{channel}</h2>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">COMING SOON</Badge>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
