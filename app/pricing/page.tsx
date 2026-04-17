'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { XerefLogo } from '@/components/xeref-logo'
import { StartBuildingButton } from '@/components/start-building-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { MobileNav } from '@/components/mobile-nav'
import { createCheckout } from '@/app/actions/checkout'

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    monthly: { price: 'Free', period: 'forever' },
    annual: { price: 'Free', period: 'forever', savings: false },
    description: 'Get started with core agent building tools. No signup required.',
    featured: false,
    features: [
      { text: 'XerefClaw prompt builder', included: true },
      { text: 'Rate-limited API access', included: true },
      { text: 'Local-first — nothing stored in the cloud', included: true },
      { text: 'Antigravity IDE compatible output', included: true },
      { text: 'Projects & tasks', included: false },
      { text: 'Personal memory', included: false },
      { text: 'Deploy to channels', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: { price: '$17', period: '/mo' },
    annual: { price: '$170', period: '/yr', savings: true },
    description: 'Full productivity platform with memory, AI prioritization, and deployment.',
    featured: true,
    features: [
      { text: 'Everything in Basic', included: true },
      { text: 'Projects, Tasks, Notes, Daily Targets', included: true },
      { text: 'AI goal decomposition & prioritization', included: true },
      { text: 'Gemini Embedding 2 + Pinecone memory', included: true },
      { text: 'Deploy to 2 channels', included: true },
      { text: '3 saved workflows (cron/webhook)', included: true },
    ],
  },
  {
    id: 'ultra',
    name: 'Ultra',
    monthly: { price: '$77', period: '/mo' },
    annual: { price: '$770', period: '/yr', savings: true },
    description: 'Power users and teams. Full automation, unlimited memory, all channels.',
    featured: false,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited deploy channels', included: true },
      { text: 'Unlimited workflows & automation', included: true },
      { text: 'OCR Document Brain (18 file types)', included: true },
      { text: 'Unlimited memory namespaces', included: true },
      { text: 'Priority support', included: true },
    ],
  },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b backdrop-blur-sm sticky top-0 z-50 relative">
        <Link className="flex items-center justify-center font-bold text-lg" href="/">
          <XerefLogo className="h-8 w-8 mr-2" />
          xeref.ai
        </Link>
        <nav className="absolute left-1/2 -translate-x-1/2 hidden sm:flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-cyan-400 transition-colors" href="/builder">
            XerefClaw
          </Link>
          <Link className="text-sm font-medium text-cyan-400" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-cyan-400 transition-colors" href="/docs">
            Docs
          </Link>
        </nav>
        <div className="ml-auto flex gap-2 items-center">
          <div className="hidden sm:block">
            <StartBuildingButton size="sm" />
          </div>
          <MobileNav />
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-12 md:py-20 max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="secondary">Pricing</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight">Start for free. Scale as you grow.</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              No credit card required. Basic plan lets you explore without signing up.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-10">
            <div className="flex rounded-lg border bg-muted/30 p-1 gap-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                  !isAnnual
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  isAnnual
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Annual
                <span className="text-[11px] font-bold text-green-500">Save 2 months</span>
              </button>
            </div>
          </div>

          {/* Plans grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const pricing = isAnnual ? plan.annual : plan.monthly
              const showSavings = isAnnual && plan.annual.savings

              return (
                <div
                  key={plan.id}
                  className={`flex flex-col rounded-2xl border p-8 space-y-6 relative overflow-hidden ${
                    plan.featured ? 'border-primary/30 bg-primary/5' : 'bg-card'
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                        {plan.name}
                      </span>
                      {plan.featured && (
                        <Badge className="text-[10px] font-bold tracking-wide">MOST POPULAR</Badge>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-4xl font-extrabold">{pricing.price}</span>
                      <span className="text-muted-foreground text-sm">{pricing.period}</span>
                      {showSavings && (
                        <span className="inline-flex items-center rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 text-[11px] font-bold text-green-500">
                          2 months free
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li
                        key={f.text}
                        className={`flex items-start gap-2 text-sm ${!f.included ? 'opacity-40' : ''}`}
                      >
                        {f.included ? (
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 mt-0.5 shrink-0" />
                        )}
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  <div>
                    {plan.id === 'basic' ? (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/builder">Get Started Free</Link>
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={plan.featured ? 'default' : 'outline'}
                        disabled={isPending}
                        onClick={() =>
                          startTransition(() =>
                            createCheckout(plan.id as 'pro' | 'ultra', isAnnual ? 'annual' : 'monthly')
                          )
                        }
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Get {plan.name}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-10 space-y-4">
            <p className="text-sm text-muted-foreground">
              Questions?{' '}
              <Link href="/faq" className="underline underline-offset-2 hover:text-foreground">
                Check the FAQ
              </Link>{' '}
              or{' '}
              <a href="mailto:hello@xeref.ai" className="underline underline-offset-2 hover:text-foreground">
                get in touch
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t font-mono text-xs text-muted-foreground">
        <p>© 2026 XerefAI. All rights reserved.</p>
        <nav className="sm:ml-auto flex flex-wrap gap-4 sm:gap-6 justify-center">
          <Link className="hover:underline underline-offset-4" href="/docs">Docs</Link>
          <Link className="hover:underline underline-offset-4" href="/pricing">Pricing</Link>
          <Link className="hover:underline underline-offset-4" href="/changelog">Changelog</Link>
          <Link className="hover:underline underline-offset-4" href="/faq">FAQ</Link>
          <Link className="hover:underline underline-offset-4" href="/terms">Terms of Service</Link>
          <Link className="hover:underline underline-offset-4" href="/privacy">Privacy</Link>
        </nav>
      </footer>
    </div>
  )
}
