import Link from 'next/link';
import { XerefLogo } from '@/components/xeref-logo';
import { StartBuildingButton } from '@/components/start-building-button';
import { Badge } from '@/components/ui/badge';

const faqs = [
  {
    q: 'Do I need to create an account to use xeref.ai?',
    a: 'No. You can browse all 48+ features and generate prompts without signing in. An account is only required if you want to save and reload named project configurations.',
  },
  {
    q: 'What is a "CLAWS" feature?',
    a: 'CLAWS is a methodology for structuring autonomous AI agents: Connect (channels), Listen (perception), Archive (memory), Wire (tools), Sense (intelligence), and Agent Architecture (scaffolding). Every feature in the builder maps to one of these categories.',
  },
  {
    q: 'Where does my data go?',
    a: 'Prompt generation happens entirely in your browser — no feature selections are sent to our servers unless you explicitly save a project. Saved projects are stored in Supabase under your user account with Row Level Security, so only you can access them.',
  },
  {
    q: 'Which AI IDE does the generated prompt work with?',
    a: 'Prompts are optimized for Antigravity IDE with Gemini 3. They follow a structured system prompt format that any modern AI IDE or API should understand, but Antigravity is the primary target.',
  },
  {
    q: 'Can I use the generated prompt with ChatGPT, Claude, or another LLM?',
    a: 'Yes. The prompt is plain text and can be pasted into any system prompt field. Results will vary depending on the model\'s capabilities — some advanced agent features require a sufficiently capable model.',
  },
  {
    q: 'How many features can I select at once?',
    a: 'There is no hard limit. Keep in mind that selecting many features will produce a longer prompt. For best results, focus on features that directly match your use case.',
  },
  {
    q: 'Is xeref.ai open source?',
    a: 'The builder UI (xeref-claw) is open source. Visit our GitHub page to explore the code, report issues, or contribute.',
  },
  {
    q: 'When is the Pro plan launching?',
    a: 'Pro is in active development. It will include project version history, team sharing, and priority support. Check the Pricing page to follow progress.',
  },
];

export default function FAQPage() {
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
          <Link className="text-sm font-medium hover:underline underline-offset-4 hidden sm:inline" href="/pricing">
            Pricing
          </Link>
          <StartBuildingButton size="sm" />
        </nav>
      </header>

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-12 md:py-20 max-w-3xl mx-auto">
          <div className="mb-12 space-y-3">
            <Badge variant="secondary">FAQ</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight">Frequently asked questions</h1>
            <p className="text-muted-foreground text-lg">
              Quick answers to the most common questions about xeref.ai.
            </p>
          </div>

          <div className="space-y-0 divide-y divide-border">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between gap-4 font-semibold text-base select-none">
                  {item.q}
                  <span className="text-muted-foreground shrink-0 transition-transform group-open:rotate-45 text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-12 rounded-xl border bg-muted/30 p-6 text-center space-y-3">
            <p className="font-semibold">Still have a question?</p>
            <p className="text-sm text-muted-foreground">
              Reach out at{' '}
              <a href="mailto:hello@xeref.ai" className="underline underline-offset-2 hover:text-foreground">
                hello@xeref.ai
              </a>{' '}
              or open an issue on{' '}
              <a
                href="https://github.com/BugraKarsli"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                GitHub
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
  );
}
