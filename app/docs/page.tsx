import Link from 'next/link';
import { XerefLogo } from '@/components/xeref-logo';
import { StartBuildingButton } from '@/components/start-building-button';
import { Badge } from '@/components/ui/badge';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: [
      {
        heading: '1. Open XerefClaw',
        body: 'Click "XerefClaw" on the landing page or navigate to /builder. No account is required to browse and configure features.',
      },
      {
        heading: '2. Select Your Features',
        body: 'Browse 48+ features organized across the CLAWS categories. Click any card to add it to your basket. Use the search bar or category filter to narrow down options.',
      },
      {
        heading: '3. Generate Your Prompt',
        body: 'Once you\'ve selected your features, open the basket and click "Generate Prompt". The output is a ready-to-paste system prompt for Antigravity IDE.',
      },
      {
        heading: '4. Save Your Configuration (optional)',
        body: 'Sign in with Google or a magic link to save named project configurations. Access them from any device.',
      },
    ],
  },
  {
    id: 'claws',
    title: 'The CLAWS Methodology',
    content: [
      {
        heading: 'Connect',
        body: 'Integrations that let your agent communicate: Telegram, Discord, Slack, WhatsApp, email, and more. Start here to define your agent\'s input/output channels.',
      },
      {
        heading: 'Listen',
        body: 'Perception capabilities: voice input, document parsing, web browsing, screen capture. Controls what raw information your agent can ingest.',
      },
      {
        heading: 'Archive',
        body: 'Memory and persistence: vector stores (Pinecone, Qdrant), conversation history, knowledge bases. Gives your agent long-term context.',
      },
      {
        heading: 'Wire',
        body: 'External tool integrations: Notion, GitHub, Google Calendar, search APIs, code execution. Defines what your agent can act on.',
      },
      {
        heading: 'Sense',
        body: 'Intelligence layers: multi-model routing, reasoning, summarization, sentiment analysis. Upgrades how your agent processes and responds.',
      },
      {
        heading: 'Agent Architecture',
        body: 'Core scaffolding: scheduling, multi-agent orchestration, error recovery, streaming. Defines how your agent is structured and managed.',
      },
    ],
  },
  {
    id: 'faq-link',
    title: 'More Questions?',
    content: [
      {
        heading: 'Check the FAQ',
        body: 'Visit the FAQ page for answers to common questions about the platform, data privacy, and feature compatibility.',
      },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b backdrop-blur-sm sticky top-0 z-50">
        <Link className="flex items-center justify-center font-bold text-lg" href="/">
          <XerefLogo className="h-8 w-8 mr-2" />
          xeref.ai
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/builder">
            XerefClaw
          </Link>
          <Link className="text-sm font-medium text-primary underline underline-offset-4" href="/docs">
            Docs
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 hidden sm:inline" href="/pricing">
            Pricing
          </Link>
          <StartBuildingButton size="sm" />
        </nav>
      </header>

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-12 md:py-20 max-w-3xl mx-auto">
          <div className="mb-10 space-y-3">
            <Badge variant="secondary">Documentation</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight">How xeref.ai works</h1>
            <p className="text-muted-foreground text-lg">
              Everything you need to configure, generate, and deploy your custom AI agent.
            </p>
          </div>

          {/* Table of contents */}
          <nav className="mb-12 p-4 rounded-xl border bg-muted/30 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">On this page</p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block text-sm hover:text-primary transition-colors py-0.5"
              >
                {s.title}
              </a>
            ))}
          </nav>

          <div className="space-y-16">
            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b">{section.title}</h2>
                <div className="space-y-6">
                  {section.content.map((item) => (
                    <div key={item.heading}>
                      <h3 className="font-semibold text-base mb-1">{item.heading}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
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
