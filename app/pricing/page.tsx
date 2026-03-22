import Link from 'next/link';
import { XerefLogo } from '@/components/xeref-logo';
import { StartBuildingButton } from '@/components/start-building-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const freeTier = {
  name: 'Free',
  price: '$0',
  description: 'Everything you need to build and generate agent prompts.',
  badge: 'Current plan',
  cta: 'Start Building',
  features: [
    'Access to all 48+ CLAWS features',
    'Unlimited prompt generation',
    'No account required to explore',
    'Local-first — nothing stored in the cloud',
    'Antigravity IDE compatible output',
  ],
};

const proTier = {
  name: 'Pro',
  price: '$9',
  period: '/mo',
  description: 'Collaboration, history, and team sharing — coming soon.',
  badge: 'Coming soon',
  features: [
    'Everything in Free',
    'Save unlimited named projects',
    'Project version history',
    'Share configurations with your team',
    'Priority support',
    'Early access to new features',
  ],
};

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b backdrop-blur-sm sticky top-0 z-50">
        <Link className="flex items-center justify-center font-bold text-lg" href="/">
          <XerefLogo className="h-8 w-8 mr-2" />
          xeref.ai
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/builder">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 hidden sm:inline" href="/docs">
            Docs
          </Link>
          <Link className="text-sm font-medium text-primary underline underline-offset-4" href="/pricing">
            Pricing
          </Link>
          <StartBuildingButton size="sm" />
        </nav>
      </header>

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-12 md:py-20 max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="secondary">Pricing</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight">Simple, honest pricing</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Start for free. No credit card, no limits on core features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free tier */}
            <div className="flex flex-col rounded-2xl border bg-card p-8 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{freeTier.name}</span>
                  <Badge variant="secondary">{freeTier.badge}</Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{freeTier.price}</span>
                  <span className="text-muted-foreground text-sm">forever</span>
                </div>
                <p className="text-sm text-muted-foreground">{freeTier.description}</p>
              </div>

              <ul className="space-y-3 flex-1">
                {freeTier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <StartBuildingButton size="default" />
            </div>

            {/* Pro tier */}
            <div className="flex flex-col rounded-2xl border border-primary/30 bg-primary/5 p-8 space-y-6 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{proTier.name}</span>
                  <Badge>{proTier.badge}</Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{proTier.price}</span>
                  <span className="text-muted-foreground text-sm">{proTier.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{proTier.description}</p>
              </div>

              <ul className="space-y-3 flex-1">
                {proTier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button disabled className="w-full opacity-60 cursor-not-allowed">
                Notify me when available
              </Button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
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
  );
}
