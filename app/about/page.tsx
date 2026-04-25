import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Cpu, LayoutDashboard, Send, Github, Youtube, Globe } from 'lucide-react';
import { XerefLogo } from '@/components/xeref-logo';
import { SiteFooter } from '@/components/site-footer';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto max-w-4xl py-12 px-4 flex-1">
        <div className="mb-8">
          <Button variant="ghost" className="pl-0 gap-2 mb-4 hover:bg-transparent" asChild>
            <Link href="/">
              <ArrowLeft size={16} /> <XerefLogo className="h-6 w-6 ml-1" /> <span className="font-bold">xeref.ai</span>
            </Link>
          </Button>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">About xeref.ai</h1>
          <p className="text-xl text-muted-foreground">
            An AI agent builder and productivity platform — from first prompt to production deployment.
          </p>
        </div>

        <div className="space-y-12">

          <section className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-4">The Vision</h2>
            <p className="leading-7">
              Most AI tools give you a generic assistant. <strong>xeref.ai</strong> lets you build <em>your own</em> — an agent that knows your workflow, connects to your tools, and remembers everything.
            </p>
            <p className="leading-7 mt-4">
              We believe the people who will get the most out of AI are not those who use the most tools, but those who design agents that are deeply specific to how they work. xeref.ai is built for those people: it gives you a structured way to design agents, a dashboard to run them, and an MCP backend so your agents and your workspace share the same brain.
            </p>
            <p className="leading-7 mt-4">
              Built by <strong>Bugra Karsli</strong> — developer, content creator, and AI automation enthusiast based in Turkey.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">The Platform</h2>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="flex flex-col gap-3 p-5 border rounded-xl bg-card">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">XerefClaw — Build</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Browse 48+ agent capabilities organized by the CLAWS methodology. Select the features you need, generate a structured system prompt, and save it as a named agent project. No code required.
                </p>
                <Link href="/builder" className="text-sm text-primary hover:underline underline-offset-4 mt-auto">
                  Open XerefClaw →
                </Link>
              </div>

              <div className="flex flex-col gap-3 p-5 border rounded-xl bg-card">
                <div className="w-10 h-10 bg-cyan-500/10 text-cyan-500 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">Dashboard — Manage</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A full productivity environment: AI Chat powered by your agents, Tasks with AI prioritization, Calendar, Workflows (cron automations), Stats, and a Memory layer that grows with your work.
                </p>
                <Link href="/" className="text-sm text-primary hover:underline underline-offset-4 mt-auto">
                  Go to Dashboard →
                </Link>
              </div>

              <div className="flex flex-col gap-3 p-5 border rounded-xl bg-card">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center">
                  <Send className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">Deploy — Ship</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect your agents to Telegram, Discord, WhatsApp, or a web chat widget. Set up cron workflows that run your agent on a schedule and deliver output wherever you need it.
                </p>
                <Link href="/docs#dashboard" className="text-sm text-primary hover:underline underline-offset-4 mt-auto">
                  Learn more →
                </Link>
              </div>
            </div>
          </section>

          <section className="bg-muted/40 p-6 rounded-xl border">
            <h2 className="text-2xl font-bold mb-5">The MCP Backbone</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Every feature in the Dashboard — projects, tasks, notes, memory, daily targets — is also available as an MCP (Model Context Protocol) tool. This means your Claude or Antigravity agent can connect directly to your xeref workspace and work with your real data in real time.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              What you manage in the UI is what your agent knows. There is no manual sync — the Dashboard and your agent share the same backend.
            </p>
            <Link href="/docs#mcp" className="inline-block mt-4 text-sm text-primary hover:underline underline-offset-4">
              Read the MCP docs →
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Memory Architecture</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Long-term memory is powered by <strong>Gemini Embedding 2</strong> (3072-dimensional, 100+ languages) and <strong>Pinecone</strong> for vector storage. Every task, note, and document you create is automatically embedded and semantically searchable — by you and by your agents.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Personal memories are stored in isolated per-user namespaces. Your data is never mixed with other users&apos; data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Connect with the Community</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="https://github.com/BugraKarsli" target="_blank" className="flex items-center justify-center p-6 border rounded-lg hover:bg-accent hover:border-primary transition-all group">
                <Github className="w-8 h-8 mb-2 group-hover:text-primary transition-colors" />
                <span className="font-semibold ml-3">GitHub</span>
              </Link>
              <Link href="https://youtube.com/@BugraKarsli1" target="_blank" className="flex items-center justify-center p-6 border rounded-lg hover:bg-accent hover:border-red-500 transition-all group">
                <Youtube className="w-8 h-8 mb-2 group-hover:text-red-500 transition-colors" />
                <span className="font-semibold ml-3">YouTube</span>
              </Link>
              <Link href="https://www.skool.com/bugrakarsli-ai-automations/about" target="_blank" className="flex items-center justify-center p-6 border rounded-lg hover:bg-accent hover:border-blue-500 transition-all group">
                <Globe className="w-8 h-8 mb-2 group-hover:text-blue-500 transition-colors" />
                <span className="font-semibold ml-3">Skool Community</span>
              </Link>
            </div>
          </section>

        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
