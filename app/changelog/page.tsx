import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { XerefLogo } from '@/components/xeref-logo';
import { StartBuildingButton } from '@/components/start-building-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/mobile-nav';
import { changelogEntries } from '@/lib/changelog-entries';

const typeStyles: Record<string, string> = {
  New: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Improved: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
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
          <Link
            className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            href="/"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </Link>
          <div className="hidden sm:flex gap-2 items-center">
            <StartBuildingButton size="sm" showLoginButton />
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
              {changelogEntries.map((entry) => (
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
          <div className="text-center mt-16 space-y-3">
            <p className="text-sm text-muted-foreground">AI Automations by Bugra Karsli</p>
            <Button variant="outline" asChild>
              <a href="https://www.skool.com/bugrakarsli-ai-automations/about" target="_blank" rel="noopener noreferrer">
                Learn More
              </a>
            </Button>
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
