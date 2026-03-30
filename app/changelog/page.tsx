import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { XerefLogo } from '@/components/xeref-logo';
import { StartBuildingButton } from '@/components/start-building-button';
import { Badge } from '@/components/ui/badge';
import { MobileNav } from '@/components/mobile-nav';

const entries = [
  {
    version: 'v1.3.0',
    date: 'March 31, 2026',
    badge: 'Latest',
    sections: [
      {
        type: 'Fixed',
        color: 'text-amber-400',
        items: [
          'Chat responses now render correctly — migrated to AI SDK v6 parts-based message format (UIMessage.parts)',
          'Dynamic model routing (opus-plan, best) now correctly reads user message content from AI SDK v6 format',
          'Assistant messages properly persisted to database after streaming completes',
          'Chat history loaded from database now renders correctly with v6 UIMessage parts format',
        ],
      },
      {
        type: 'Architecture',
        color: 'text-blue-400',
        items: [
          'Upgraded to AI SDK v6 (ai@6, @ai-sdk/react@3) — replaced legacy useChat api/body options with DefaultChatTransport',
          'Server route now uses toUIMessageStreamResponse() replacing deprecated toDataStreamResponse()',
          'Per-request body (model + projectId) passed via sendMessage options for accurate project context per message',
        ],
      },
    ],
  },
  {
    version: 'v1.2.0',
    date: 'March 31, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Dynamic Model Routing — auto-switches active LLM natively in the web chat input',
          'Opus Plan Mode (Ultra exclusive) — dynamically uses Opus 4.6 for planning and Sonnet 4.6 otherwise',
          '/model opusplan text command to instantly lock into architectural deep-reasoning setups',
        ],
      },
      {
        type: 'Architecture',
        color: 'text-blue-400',
        items: [
          'Configured default model globally to Haiku 4.5 for optimized low-latency chats',
          'Intelligent AI Goal Decomposition backend router evaluates semantics to pick the best model tier automatically',
          'Deployed subagent definitions securely encapsulating Opus 4.6 architecture constraints',
        ],
      },
      {
        type: 'Fixed',
        color: 'text-amber-400',
        items: [
          'Resolved DropdownMenu radix ID hydration mismatch on sidebar user avatar menu',
        ],
      },
    ],
  },
  {
    version: 'v1.1.0',
    date: 'March 30, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Creem payment integration — subscribe to Pro or Ultra directly from the pricing page',
          'Checkout success page with subscription confirmation',
          'Webhook handler for real-time subscription status updates',
          'Learn More button linking to Skool community',
        ],
      },
      {
        type: 'Fixed',
        color: 'text-amber-400',
        items: [
          'Pricing page no longer redirects authenticated users back to the dashboard',
          'StartBuildingButton auth redirect only triggers when signing in through the dialog',
        ],
      },
    ],
  },
  {
    version: 'v1.0.0 Beta',
    date: 'March 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          '48+ agent features organized by the CLAWS methodology (Connect, Listen, Archive, Wire, Sense, Agent Architecture)',
          'Visual feature builder — browse, search, and filter capabilities',
          'One-click prompt generation for Antigravity IDE',
          'Magic link + Google OAuth sign-in',
          'Named project save and restore (signed-in users)',
          'Dark-only design system with OKLch color variables',
          'Responsive layout with Framer Motion feature card animations',
        ],
      },
      {
        type: 'Architecture',
        color: 'text-blue-400',
        items: [
          'Next.js 16 App Router with React 19 and Babel React Compiler',
          'Supabase backend — Postgres + RLS for projects and usage events',
          'Tailwind v4 with `@import "tailwindcss"` syntax',
          'shadcn/ui components (new-york style, neutral base)',
          'Vercel deployment with Edge-compatible proxy session refresh',
        ],
      },
    ],
  },
];

const typeStyles: Record<string, string> = {
  New: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Architecture: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Fixed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Removed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function ChangelogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b backdrop-blur-sm sticky top-0 z-50 relative">
        <Link className="flex items-center justify-center font-bold text-lg" href="/">
          <XerefLogo className="h-8 w-8 mr-2" />
          xeref.ai
        </Link>
        <Link
          className="ml-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          href="/"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </Link>
        <nav className="absolute left-1/2 -translate-x-1/2 hidden sm:flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/builder">
            XerefClaw
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/docs">
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
        <div className="container px-4 md:px-6 py-12 md:py-20 max-w-3xl mx-auto">
          <div className="mb-12 space-y-3">
            <Badge variant="secondary">Changelog</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight">What&apos;s new</h1>
            <p className="text-muted-foreground text-lg">
              Release history for xeref.ai — from newest to oldest.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 top-2 bottom-0 w-px bg-border ml-[7px]" />

            <div className="space-y-12">
              {entries.map((entry) => (
                <div key={entry.version} className="relative pl-8">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-bold">{entry.version}</h2>
                      {entry.badge && <Badge>{entry.badge}</Badge>}
                      <span className="text-sm text-muted-foreground font-mono">{entry.date}</span>
                    </div>

                    {entry.sections.map((section) => (
                      <div key={section.type}>
                        <span className={`inline-block text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded border mb-3 ${typeStyles[section.type] ?? 'bg-muted text-muted-foreground border-border'}`}>
                          {section.type}
                        </span>
                        <ul className="space-y-2">
                          {section.items.map((item) => (
                            <li key={item} className="text-sm text-muted-foreground flex gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
  );
}
