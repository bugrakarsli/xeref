'use client'

import { toast } from 'sonner'
import { Users, Copy, Gift, UserPlus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const steps = [
  { icon: UserPlus, label: 'Share your unique referral link' },
  { icon: Users, label: 'Your friend signs up and creates their first agent' },
  { icon: Gift, label: 'You both get 1 month of Xeref Pro free' },
]

export function ReferralView() {
  return (
    <section aria-label="Referral Program" className="flex flex-col flex-1 p-6 md:p-8 max-w-2xl w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Referral Program</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Invite friends and earn rewards together.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Overview card */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex gap-3 items-start">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Give free Pro, get free Pro</p>
              <p className="text-sm text-muted-foreground">
                Share your referral link with friends. When they sign up and build their first agent,
                you both get 1 month of Xeref Pro — no credit card needed.
              </p>
            </div>
          </div>
        </div>

        {/* Referral link */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold mb-3">Your Referral Link</h2>
          <div className="flex gap-2">
            <Input
              value="https://xeref.ai/ref/your-code"
              readOnly
              className="flex-1 font-mono text-xs text-muted-foreground"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => toast.info('Referral links coming soon!')}
              aria-label="Copy referral link"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Referral codes will be available once the program launches.
          </p>
        </div>

        {/* How it works */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">How it works</h2>
          <ol className="flex flex-col gap-3">
            {steps.map(({ icon: Icon, label }, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                  {i + 1}
                </span>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
