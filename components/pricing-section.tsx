'use client'

import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StartBuildingButton } from '@/components/start-building-button'

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    monthly: { price: 'Free', period: 'forever' },
    annual: { price: 'Free', period: 'forever', badge: null },
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
    cta: (
      <Button variant="outline" className="w-full" asChild>
        <Link href="/builder">Try as guest</Link>
      </Button>
    ),
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: { price: '$17', period: '/mo' },
    annual: { price: '$170', period: '/yr', badge: '2 months free' },
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
    cta: <StartBuildingButton size="default" />,
  },
  {
    id: 'ultra',
    name: 'Ultra',
    monthly: { price: '$77', period: '/mo' },
    annual: { price: '$770', period: '/yr', badge: '2 months free' },
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
    cta: (
      <Button variant="outline" className="w-full" asChild>
        <Link href="/builder">Get Ultra</Link>
      </Button>
    ),
  },
]

export function PricingSection() {
  return (
    <Tabs defaultValue="monthly" className="w-full">
      <div className="flex justify-center mb-10">
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual">Annual</TabsTrigger>
        </TabsList>
      </div>

      {(['monthly', 'annual'] as const).map((period) => (
        <TabsContent key={period} value={period}>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const pricing = plan[period]
              const isAnnual = period === 'annual'
              const badge = isAnnual ? (plan.annual as { badge?: string | null }).badge : null

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
                      {badge && (
                        <span className="inline-flex items-center rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 text-[11px] font-bold text-green-500">
                          {badge}
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

                  <div>{plan.cta}</div>
                </div>
              )
            })}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
