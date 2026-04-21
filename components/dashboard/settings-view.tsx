'use client'

import Link from 'next/link'
import { useState, useEffect, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap, Eye, EyeOff, RefreshCw, Copy, Check } from 'lucide-react'
import type { UserPlan } from '@/app/actions/profile'
import { getMcpToken, regenerateMcpToken } from '@/app/actions/profile'

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

  useEffect(() => {
    getMcpToken().then(setMcpToken).catch(() => null)
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
      </div>
    </section>
  )
}
