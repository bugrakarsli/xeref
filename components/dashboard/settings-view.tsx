'use client'

import Link from 'next/link'
import { useState, useEffect, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, Eye, EyeOff, RefreshCw, Copy, Check, Send, Unlink } from 'lucide-react'
import type { UserPlan } from '@/app/actions/profile'
import { getMcpToken, regenerateMcpToken } from '@/app/actions/profile'
import {
  getTelegramLinkStatus,
  generateTelegramPairingCode,
  unlinkTelegram,
  type TelegramLinkStatus,
} from '@/app/actions/telegram'

const PLAN_CONFIG: Record<UserPlan, { label: string; features: string[] }> = {
  free: {
    label: 'Xeref Free',
    features: [
      'Up to 3 saved agents',
      'XerefClaw prompt builder',
      'Rate-limited API access',
      'Local-first, no cloud storage',
    ],
  },
  pro: {
    label: 'Xeref Pro',
    features: [
      'Unlimited saved agents',
      'XerefClaw prompt builder',
      'Priority API access',
      'Cloud sync & storage',
      'Sonnet 4.6 model access',
    ],
  },
  ultra: {
    label: 'Xeref Ultra',
    features: [
      'Everything in Pro',
      'Opus 4.6 model access',
      'Highest priority API access',
      'Early access to new features',
      'Dedicated support',
    ],
  },
}

interface SettingsViewProps {
  userEmail: string
  userName: string
  userPlan?: UserPlan
}

export function SettingsView({ userEmail, userName, userPlan = 'free' }: SettingsViewProps) {
  const plan = PLAN_CONFIG[userPlan]
  const [mcpToken, setMcpToken] = useState<string | null>(null)
  const [showToken, setShowToken] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [tgStatus, setTgStatus] = useState<TelegramLinkStatus | null>(null)
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)

  useEffect(() => {
    getMcpToken().then(setMcpToken).catch(() => null)
    getTelegramLinkStatus().then(setTgStatus).catch(() => null)
  }, [])

  function handleRegenerate() {
    startTransition(async () => {
      const token = await regenerateMcpToken()
      setMcpToken(token)
      setShowToken(true)
    })
  }

  function handleCopy() {
    if (!mcpToken) return
    navigator.clipboard.writeText(mcpToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleGeneratePairingCode() {
    startTransition(async () => {
      const code = await generateTelegramPairingCode()
      setPairingCode(code)
    })
  }

  function handleCopyCode() {
    if (!pairingCode) return
    navigator.clipboard.writeText(pairingCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  function handleUnlinkTelegram() {
    startTransition(async () => {
      await unlinkTelegram()
      setTgStatus({ linked: false, telegramUsername: null })
      setPairingCode(null)
    })
  }

  const maskedToken = mcpToken ? `${mcpToken.slice(0, 10)}${'•'.repeat(30)}` : null

  return (
    <section aria-label="Settings" className="flex flex-col flex-1 p-6 md:p-8 max-w-2xl w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and subscription.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Account card */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Account</h2>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{userEmail}</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">Display Name</p>
              <p className="text-sm font-medium">{userName || '—'}</p>
            </div>
          </div>
        </div>

        {/* Plan card */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Plan</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium">{plan.label}</p>
                <Badge variant="secondary">Current Plan</Badge>
              </div>
              <ul className="text-xs text-muted-foreground space-y-0.5 mt-2">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
          </div>
          {userPlan === 'free' && (
            <Button size="sm" asChild className="gap-2">
              <Link href="/pricing">
                <Zap className="h-4 w-4" />
                Upgrade Plan
              </Link>
            </Button>
          )}
          {userPlan === 'pro' && (
            <Button size="sm" variant="outline" asChild className="gap-2">
              <Link href="/pricing">
                <Zap className="h-4 w-4" />
                Upgrade to Ultra
              </Link>
            </Button>
          )}
        </div>

        {/* MCP Token card */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold mb-1">MCP Server Token</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Use this bearer token to call the Xeref MCP endpoint from external agents.{' '}
            <code className="bg-muted px-1 py-0.5 rounded text-[11px]">POST /api/mcp</code>
          </p>

          {mcpToken ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs font-mono truncate">
                  {showToken ? mcpToken : maskedToken}
                </code>
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => setShowToken((v) => !v)} aria-label="Toggle visibility">
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleCopy} aria-label="Copy token">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button size="sm" variant="outline" className="gap-2 w-fit" onClick={handleRegenerate} disabled={isPending}>
                <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>
          ) : (
            <Button size="sm" className="gap-2" onClick={handleRegenerate} disabled={isPending}>
              <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
              Generate Token
            </Button>
          )}
        </div>
        {/* Telegram card */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Send className="h-4 w-4" />
            <h2 className="text-sm font-semibold">Telegram Bot</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Link your Telegram account to chat with your xeref assistant from Telegram.
          </p>

          {tgStatus?.linked ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Linked</Badge>
                {tgStatus.telegramUsername && (
                  <span className="text-xs text-muted-foreground">@{tgStatus.telegramUsername}</span>
                )}
              </div>
              <Button size="sm" variant="outline" className="gap-2 w-fit text-destructive" onClick={handleUnlinkTelegram} disabled={isPending}>
                <Unlink className="h-4 w-4" />
                Unlink Telegram
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pairingCode ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground">
                    Send this code to the xeref bot on Telegram: <strong>/start {pairingCode}</strong>
                    <br />Valid for 10 minutes.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs font-mono truncate">
                      /start {pairingCode}
                    </code>
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleCopyCode} aria-label="Copy pairing command">
                      {codeCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ) : null}
              <Button size="sm" variant={pairingCode ? 'outline' : 'default'} className="gap-2 w-fit" onClick={handleGeneratePairingCode} disabled={isPending}>
                <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                {pairingCode ? 'Regenerate Code' : 'Generate Pairing Code'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
