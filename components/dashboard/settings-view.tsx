import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

interface SettingsViewProps {
  userEmail: string
  userName: string
}

export function SettingsView({ userEmail, userName }: SettingsViewProps) {
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
                <p className="text-sm font-medium">Xeref Free</p>
                <Badge variant="secondary">Current Plan</Badge>
              </div>
              <ul className="text-xs text-muted-foreground space-y-0.5 mt-2">
                <li>• Up to 3 saved agents</li>
                <li>• XerefClaw prompt builder</li>
                <li>• Rate-limited API access</li>
                <li>• Local-first, no cloud storage</li>
              </ul>
            </div>
          </div>
          <Button size="sm" asChild className="gap-2">
            <Link href="/pricing">
              <Zap className="h-4 w-4" />
              Upgrade Plan
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
