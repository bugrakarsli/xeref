import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Terminal, Cpu, Bot, Code } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b backdrop-blur-sm sticky top-0 z-50">
        <Link className="flex items-center justify-center font-bold text-lg" href="/">
          <Bot className="h-6 w-6 mr-2 text-primary" />
          Xeref-Claw
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/builder">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
            About OpenClaw
          </Link>
          <Button size="sm" asChild>
            <Link href="/builder">Start Building</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/10 to-background pointer-events-none" />
          
          <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
            <Badge variant="secondary" className="mb-4">v1.0.0 Beta • Powered by XerefAI</Badge>
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 pb-2">
              Build Your Custom AI Agent <br className="hidden sm:inline" /> in Minutes
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl dark:text-gray-400 mt-4 mb-8">
              Select the features you need—messaging, memory, tools, and voice—and generate a ready-to-paste prompt for your AI IDE. No coding required to start.
            </p>
            <div className="space-x-4">
              <Button size="lg" className="h-12 px-8" asChild>
                <Link href="/builder">
                  Start Building <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8" asChild>
                <Link href="https://github.com/BugraKarsli1" target="_blank">
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
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
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t font-mono text-xs text-muted-foreground">
        <p>© 2026 XerefAI. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
