import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Terminal, Cpu, Code } from 'lucide-react';
import { XerefLogo } from '@/components/xeref-logo';
import { StartBuildingButton } from '@/components/start-building-button';
import { MobileNav } from '@/components/mobile-nav';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b backdrop-blur-sm sticky top-0 z-50 relative">
        <Link className="flex items-center justify-center font-bold text-lg" href="/login">
          <XerefLogo className="h-8 w-8 mr-2" />
          xeref.ai
        </Link>
        <nav className="absolute left-1/2 -translate-x-1/2 hidden sm:flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/builder">
            XerefClaw
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/docs">
            Docs
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
            Pricing
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
        {/* Hero Section */}
        <section className="w-full py-12 md:py-20 lg:py-28 xl:py-32 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/10 to-background pointer-events-none" />

          {/* OG image — decorative bottom-left accent */}
          <div className="absolute bottom-8 left-6 w-72 md:w-96 opacity-25 pointer-events-none rounded-xl overflow-hidden shadow-2xl hidden lg:block z-0">
            <Image
              src="/xeref-ai-og-image.jpg"
              alt=""
              width={1200}
              height={630}
              className="w-full h-auto"
            />
          </div>

          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              NOW LIVE IN BETA
            </div>
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 pb-2">
              Build Your Custom AI Agent <br className="hidden sm:inline" /> in Minutes
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl dark:text-gray-400 mt-4 mb-8">
              Select the features you need—messaging, memory, tools, and voice—and generate a ready-to-paste prompt for your AI IDE. No coding required to start.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <StartBuildingButton size="lg" showArrow />
              <Button variant="outline" size="lg" className="h-12 px-8" asChild>
                <Link href="https://github.com/BugraKarsli" target="_blank">
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="w-full py-12 md:py-20 lg:py-28 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-xl bg-background shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-500/10 rounded-full text-blue-500 mb-2">
                  <Terminal className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Local-First</h3>
                <p className="text-sm text-center text-muted-foreground">
                  Your agent runs locally on your machine. No cloud dependency, complete privacy.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-xl bg-background shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-purple-500/10 rounded-full text-purple-500 mb-2">
                  <Cpu className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Modular Features</h3>
                <p className="text-sm text-center text-muted-foreground">
                  Pick and mix capabilities like Lego bricks. Add memory, browsing, or voice at any time.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-xl bg-background shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-amber-500/10 rounded-full text-amber-500 mb-2">
                  <Code className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Antigravity Ready</h3>
                <p className="text-sm text-center text-muted-foreground">
                  Optimized for Gemini 3 and the Antigravity IDE ecosystem. Just paste and run.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-12 md:py-20 lg:py-28">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <Badge variant="secondary" className="mb-3">What builders say</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Loved by developers</h2>
              <p className="mt-3 max-w-[600px] text-muted-foreground">
                From hobbyists to professionals — here&apos;s what people are building with xeref.ai.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  quote: "I built a Telegram bot that monitors my server logs and pings me on anomalies. Took 10 minutes to configure and paste into Antigravity.",
                  name: "Alex R.",
                  title: "Backend Engineer",
                  initials: "AR",
                  color: "bg-blue-500/20 text-blue-400",
                },
                {
                  quote: "The CLAWS methodology finally gave me a mental model for what my agent actually needs. Feature selection feels intentional, not random.",
                  name: "Mia T.",
                  title: "AI Researcher",
                  initials: "MT",
                  color: "bg-purple-500/20 text-purple-400",
                },
                {
                  quote: "Went from zero to a fully functional research assistant agent in an afternoon. The generated prompt was surprisingly production-ready.",
                  name: "James K.",
                  title: "Indie Hacker",
                  initials: "JK",
                  color: "bg-emerald-500/20 text-emerald-400",
                },
                {
                  quote: "I love that it's local-first. My agents have access to sensitive data and I needed something I could trust. xeref.ai nailed the privacy aspect.",
                  name: "Sara L.",
                  title: "Security Engineer",
                  initials: "SL",
                  color: "bg-amber-500/20 text-amber-400",
                },
                {
                  quote: "The modular approach is genius. I started with just messaging and memory, then added browsing a week later. Zero friction.",
                  name: "David M.",
                  title: "Product Manager",
                  initials: "DM",
                  color: "bg-rose-500/20 text-rose-400",
                },
                {
                  quote: "Finally a tool that respects that I know what I'm doing. No hand-holding, just clean feature selection and a prompt that actually works.",
                  name: "Yuki N.",
                  title: "Full-Stack Developer",
                  initials: "YN",
                  color: "bg-cyan-500/20 text-cyan-400",
                },
              ].map(({ quote, name, title, initials, color }) => (
                <div key={name} className="flex flex-col gap-4 border rounded-xl p-6 bg-background shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{quote}&rdquo;</p>
                  <div className="flex items-center gap-3 mt-auto pt-2 border-t border-border">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">{name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t font-mono text-xs text-muted-foreground">
        <p>© 2026 Xeref LLC. All rights reserved.</p>
        <nav className="sm:ml-auto flex flex-wrap gap-4 sm:gap-6 justify-center">
          <Link className="hover:underline underline-offset-4" href="/docs">Docs</Link>
          <Link className="hover:underline underline-offset-4" href="/pricing">Pricing</Link>
          <Link className="hover:underline underline-offset-4" href="/changelog">Changelog</Link>
          <Link className="hover:underline underline-offset-4" href="/faq">FAQ</Link>
          <Link className="hover:underline underline-offset-4" href="/about">About</Link>
          <Link className="hover:underline underline-offset-4" href="/terms">Terms of Service</Link>
          <Link className="hover:underline underline-offset-4" href="/privacy">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
