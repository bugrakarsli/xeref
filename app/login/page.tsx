import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Cpu, LayoutDashboard, Send,
  Target, Zap, Sun, GitBranch,
  Database, Search, Layers,
  Home, CheckSquare, FolderKanban, BookOpen, Brain,
  Calendar, MessageSquare, BarChart2, Inbox,
  Server, Smartphone,
} from 'lucide-react';
import { XerefLogo } from '@/components/xeref-logo';
import { StartBuildingButton } from '@/components/start-building-button';
import { MobileNav } from '@/components/mobile-nav';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Navigation ── */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b backdrop-blur-sm sticky top-0 z-50 relative">
        <Link className="flex items-center justify-center font-bold text-lg" href="/login">
          <XerefLogo className="h-8 w-8 mr-2" />
          xeref.ai
        </Link>
        <nav className="absolute left-1/2 -translate-x-1/2 hidden sm:flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-cyan-400 transition-colors" href="/builder">
            XerefClaw
          </Link>
          <Link className="text-sm font-medium hover:text-cyan-400 transition-colors" href="/pricing">
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

        {/* ── Hero ── */}
        <section className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/10 to-background pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              NOW LIVE IN BETA
            </div>
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-cyan-400/60 pb-2 max-w-4xl">
              Build agents that <br className="hidden sm:inline" />remember everything
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl dark:text-gray-400 mt-4 mb-8">
              Xeref is an agent-first productivity platform. Design AI agents, manage projects with AI-generated plans, and deploy to Telegram, Discord, and WhatsApp — all powered by long-term memory.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <StartBuildingButton size="lg" showArrow />
              <Button variant="outline" size="lg" className="h-12 px-8" asChild>
                <Link href="/builder">Try as guest</Link>
              </Button>
            </div>
            <div className="w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border shadow-2xl">
              <Image
                src="/xeref-ai-og-image.jpg"
                alt="Xeref dashboard showing projects, tasks, and AI agent management"
                width={1200}
                height={630}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </section>

        {/* ── Pillars ── */}
        <section className="w-full py-12 md:py-20 lg:py-28 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <Badge variant="secondary" className="mb-3">Core Platform</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Three pillars. One platform.</h2>
              <p className="mt-3 max-w-[600px] text-muted-foreground">
                Everything you need to go from idea to deployed agent, with memory that grows with you.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {[
                {
                  icon: <Cpu className="h-8 w-8" />,
                  color: 'bg-blue-500/10 text-blue-500',
                  title: 'Build',
                  desc: 'Use XerefClaw to design agents with modular features. AI goal decomposition turns your high-level idea into a structured project plan with phases and tasks in seconds.',
                },
                {
                  icon: <LayoutDashboard className="h-8 w-8" />,
                  color: 'bg-cyan-500/10 text-cyan-500',
                  title: 'Manage',
                  desc: 'Projects, Tasks, Notes, Daily Targets — all connected to the same MCP backend your agent uses. What you manage is what your agent knows.',
                },
                {
                  icon: <Send className="h-8 w-8" />,
                  color: 'bg-amber-500/10 text-amber-500',
                  title: 'Deploy',
                  desc: 'Ship your agent to Telegram, Discord, WhatsApp, or a web chat widget with a step-by-step deployment wizard. No infra expertise required.',
                },
              ].map(({ icon, color, title, desc }) => (
                <div key={title} className="flex flex-col items-center space-y-2 border p-6 rounded-xl bg-background shadow-sm hover:shadow-md transition-shadow">
                  <div className={`p-3 ${color} rounded-full mb-2`}>{icon}</div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="text-sm text-center text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="w-full py-12 md:py-20 lg:py-28">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-12">
              <Badge variant="secondary" className="mb-3">Features</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Built for how you actually work</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
              {[
                {
                  icon: <Target className="h-6 w-6" />,
                  color: 'bg-blue-500/10 text-blue-500',
                  title: 'AI Goal Decomposition',
                  desc: 'Type a goal. Xeref\'s AI generates a complete project plan — phases, tasks, priorities — and writes it to your workspace instantly.',
                  tag: 'create_project_with_plan()',
                  span: 'lg:col-span-3',
                },
                {
                  icon: <Zap className="h-6 w-6" />,
                  color: 'bg-cyan-500/10 text-cyan-500',
                  title: 'AI Task Prioritization',
                  desc: 'Ask "what should I work on next?" and get a reasoned top-3 list based on your context, daily targets, priorities, and deadlines.',
                  tag: 'suggest_next_task()',
                  span: 'lg:col-span-3',
                },
                {
                  icon: <Sun className="h-6 w-6" />,
                  color: 'bg-amber-500/10 text-amber-500',
                  title: 'Daily Targets',
                  desc: 'Set 3 daily goals each morning. They surface on your Home view, inform AI prioritization, and give your agent real context about today\'s focus.',
                  tag: 'set_daily_targets()',
                  span: 'lg:col-span-2',
                },
              ].map(({ icon, color, title, desc, tag, span }) => (
                <div key={title} className={`flex flex-col border p-6 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow ${span}`}>
                  <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-4`}>{icon}</div>
                  <h3 className="text-base font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 flex-1">{desc}</p>
                  <span className="inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground w-fit">
                    {tag}
                  </span>
                </div>
              ))}

              {/* MCP Backend — wide card */}
              <div className="flex flex-col border p-6 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow lg:col-span-4">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center mb-4">
                      <GitBranch className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-semibold mb-2">MCP-Native Backend</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Every feature — projects, tasks, notes, memory, daily targets — is exposed as an MCP tool. Your Xeref dashboard and your Claude/Antigravity agent use the exact same backend. What you build in the UI, your agent can read, write, and reason over.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['list_projects', 'create_task', 'search_memory', 'suggest_next_task'].map((t) => (
                        <span key={t} className="inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Memory Architecture ── */}
        <section className="w-full py-12 md:py-20 lg:py-28 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-12">
              <Badge variant="secondary" className="mb-3">Memory Architecture</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Long-term memory that grows with you</h2>
              <p className="mt-3 max-w-[600px] text-muted-foreground">
                Powered by Gemini Embedding 2 and Pinecone. Every task, note, and document is embedded and searchable — by you and your agents.
              </p>
            </div>
            <div className="grid gap-10 md:grid-cols-2 items-center">
              {/* Left: tech items */}
              <div className="flex flex-col gap-6">
                {[
                  {
                    icon: <Database className="h-5 w-5" />,
                    color: 'bg-blue-500/10 text-blue-500',
                    title: 'Supabase — Structured Data',
                    desc: 'All your projects, tasks, notes, and context live here with row-level security. Your data is always isolated and always yours.',
                  },
                  {
                    icon: <Search className="h-5 w-5" />,
                    color: 'bg-emerald-500/10 text-emerald-500',
                    title: 'Pinecone — Semantic Search',
                    desc: 'Embeddings stored in per-user namespaces alongside global content indexes. Millisecond hybrid search across your personal memory and Xeref\'s knowledge base.',
                  },
                  {
                    icon: <Layers className="h-5 w-5" />,
                    color: 'bg-cyan-500/10 text-cyan-500',
                    title: 'Gemini Embedding 2',
                    desc: 'Google\'s natively multimodal embedding model. 3072-dimensional vectors, 8192-token context, 100+ languages. Auto-embeds every write via Edge Functions.',
                  },
                ].map(({ icon, color, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>{icon}</div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">{title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: namespace visualization */}
              <div className="bg-muted/30 border rounded-xl p-6 font-mono">
                <div className="text-xs text-muted-foreground mb-4 tracking-widest uppercase">Pinecone Namespaces</div>
                {[
                  { name: 'xeref_lessons', desc: 'Classroom content', accent: false },
                  { name: 'xeref_posts', desc: 'Community posts', accent: false },
                  { name: 'xeref_resources', desc: 'Guides, PDFs, news', accent: false },
                  { name: 'xeref_youtube', desc: 'Video transcripts', accent: false },
                  { name: 'user_{id}', desc: 'Personal tasks & notes', accent: true },
                ].map(({ name, desc, accent }, i, arr) => (
                  <div key={name} className={`flex items-center gap-3 py-3 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                    <span className={`inline-flex h-2 w-2 rounded-full shrink-0 ${accent ? 'bg-blue-500' : 'bg-primary'}`} />
                    <span className={`text-xs font-medium min-w-[140px] ${accent ? 'text-blue-400' : 'text-primary'}`}>{name}</span>
                    <span className="text-xs text-muted-foreground">{desc}</span>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  search_memory(query, namespaces=[...])<br />
                  <span className="text-primary">→ top-K results with citations</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Dashboard Overview ── */}
        <section className="w-full py-12 md:py-20 lg:py-28">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <Badge variant="secondary" className="mb-3">Dashboard</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Everything in one place</h2>
              <p className="mt-3 max-w-[600px] text-muted-foreground">
                7 of 12 sections are live — and shipping fast.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <Home className="h-5 w-5" />, title: 'Home', desc: 'Agent overview, Daily Targets, saved agents', live: true },
                { icon: <Cpu className="h-5 w-5" />, title: 'XerefClaw', desc: 'Agent builder, CLAWS methodology', live: true },
                { icon: <CheckSquare className="h-5 w-5" />, title: 'All Tasks', desc: 'Unified tasks + AI prioritization', live: true },
                { icon: <FolderKanban className="h-5 w-5" />, title: 'Projects', desc: 'Goal decomposition + kanban board', live: false },
                { icon: <BookOpen className="h-5 w-5" />, title: 'Classroom', desc: 'Lessons + semantic search', live: false },
                { icon: <Brain className="h-5 w-5" />, title: 'Memory', desc: 'Document brain, OCR ingestion', live: false },
                { icon: <Send className="h-5 w-5" />, title: 'Deploy', desc: 'Telegram, Discord, WhatsApp, web widget', live: false },
                { icon: <Calendar className="h-5 w-5" />, title: 'Calendar', desc: 'Deadlines + focus blocks + Google Sync', live: true },
                { icon: <Zap className="h-5 w-5" />, title: 'Workflows', desc: 'Cron triggers + multi-channel automation', live: true },
                { icon: <MessageSquare className="h-5 w-5" />, title: 'Chats', desc: 'In-app agent chat with streaming + sources', live: true },
                { icon: <BarChart2 className="h-5 w-5" />, title: 'Stats', desc: 'Productivity trends + agent usage', live: true },
                { icon: <Inbox className="h-5 w-5" />, title: 'Inbox', desc: 'Bot replies + activity feed', live: false },
              ].map(({ icon, title, desc, live }) => (
                <div key={title} className={`flex flex-col border rounded-xl p-4 transition-colors hover:border-primary/50 ${live ? 'bg-card' : 'bg-card'}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${live ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {icon}
                  </div>
                  <h4 className="text-sm font-semibold mb-1">{title}</h4>
                  <p className="text-xs text-muted-foreground leading-snug flex-1">{desc}</p>
                  <div className="mt-3">
                    {live ? (
                      <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">LIVE</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">COMING SOON</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section className="w-full py-12 md:py-20 lg:py-28 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-12">
              <Badge variant="secondary" className="mb-3">Tech Stack</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Built on the right foundations</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {[
                { icon: <Database className="h-6 w-6" />, color: 'bg-blue-500/10 text-blue-500', title: 'Supabase', desc: 'Auth, RLS, Edge Functions, structured data' },
                { icon: <Brain className="h-6 w-6" />, color: 'bg-emerald-500/10 text-emerald-500', title: 'Pinecone', desc: 'Vector memory, hybrid semantic search' },
                { icon: <Layers className="h-6 w-6" />, color: 'bg-cyan-500/10 text-cyan-500', title: 'Gemini Embedding 2', desc: '3072-dim multimodal embeddings, 100+ languages' },
                { icon: <Server className="h-6 w-6" />, color: 'bg-amber-500/10 text-amber-500', title: 'Xeref MCP Server', desc: 'Projects, Tasks, Notes, Memory, Daily Targets' },
                { icon: <Cpu className="h-6 w-6" />, color: 'bg-rose-500/10 text-rose-500', title: 'XerefClaw', desc: 'Agent prompt builder, CLAWS methodology' },
                { icon: <Smartphone className="h-6 w-6" />, color: 'bg-cyan-500/10 text-cyan-500', title: 'Mobile App', desc: 'React Native companion (roadmap Phase 4)' },
              ].map(({ icon, color, title, desc }) => (
                <div key={title} className="flex items-center gap-4 border rounded-xl p-5 bg-background shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center shrink-0`}>{icon}</div>
                  <div>
                    <h4 className="text-sm font-semibold mb-0.5">{title}</h4>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Roadmap ── */}
        <section className="w-full py-12 md:py-20 lg:py-28 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-12">
              <Badge variant="secondary" className="mb-3">Roadmap</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">What&apos;s being built</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  phase: '1',
                  color: 'bg-blue-500/10 text-blue-500',
                  title: 'Core Platform',
                  timeline: '4–8 weeks',
                  items: [
                    { text: 'Classroom section + semantic search', status: 'todo' as const },
                    { text: 'UserContext onboarding form', status: 'done' as const },
                    { text: 'Projects CRUD + AI goal decomposition', status: 'partial' as const },
                    { text: 'Tasks & Notes CRUD + Daily Targets', status: 'partial' as const },
                    { text: 'Xeref MCP Server v1 (all CRUD tools)', status: 'todo' as const },
                    { text: 'Guest mode (Supabase anon + rate limit)', status: 'partial' as const },
                    { text: 'Streaming responses in Chat', status: 'done' as const },
                  ],
                },
                {
                  phase: '2',
                  color: 'bg-cyan-500/10 text-cyan-500',
                  title: 'Memory & Community',
                  timeline: '8–16 weeks',
                  items: [
                    { text: 'Gemini Embedding 2 auto-embedding (Edge Functions)', status: 'todo' as const },
                    { text: 'Pinecone user namespaces + Memory dashboard', status: 'todo' as const },
                    { text: 'YouTube Chat with timestamped sources', status: 'todo' as const },
                    { text: 'Saved posts, bookmarks, community search', status: 'todo' as const },
                    { text: 'Calendar + Google Calendar sync', status: 'done' as const },
                    { text: 'Image uploads in Chat (Gemini Vision)', status: 'done' as const },
                  ],
                },
                {
                  phase: '3',
                  color: 'bg-amber-500/10 text-amber-500',
                  title: 'Deploy & Automate',
                  timeline: '16–24 weeks',
                  items: [
                    { text: 'Telegram bot wizard (priority channel)', status: 'todo' as const },
                    { text: 'Discord, WhatsApp, web widget', status: 'todo' as const },
                    { text: 'Workflows: cron + webhook triggers', status: 'partial' as const },
                    { text: 'AI News Feed + daily digest', status: 'todo' as const },
                    { text: 'OCR Document Brain (18 file types)', status: 'todo' as const },
                    { text: 'Stats: heatmap, velocity charts', status: 'partial' as const },
                  ],
                },
              ].map(({ phase, color, title, timeline, items }) => (
                <div key={phase} className="border rounded-xl p-6 bg-background shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-xs font-bold`}>
                      {phase}
                    </div>
                    <div>
                      <div className="text-base font-semibold">{title}</div>
                      <div className="text-xs text-muted-foreground">{timeline}</div>
                    </div>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {items.map(({ text, status }) => (
                      <li key={text} className="flex items-center gap-2 text-xs">
                        <span className={`inline-flex h-1.5 w-1.5 rounded-full shrink-0 ${
                          status === 'done' ? 'bg-green-500' : status === 'partial' ? 'bg-amber-500' : 'bg-border'
                        }`} />
                        <span className={`flex-1 ${
                          status === 'done' ? 'line-through text-muted-foreground/60' : 'text-muted-foreground'
                        }`}>{text}</span>
                        {status === 'done' && (
                          <span className="text-[10px] font-medium text-green-500 shrink-0">DONE</span>
                        )}
                        {status === 'partial' && (
                          <span className="text-[10px] font-medium text-amber-500 shrink-0">IN PROGRESS</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t font-mono text-xs text-muted-foreground">
        <p>© 2026 Xeref LLC. All rights reserved.</p>
        <nav className="sm:ml-auto flex flex-wrap gap-4 sm:gap-6 justify-center">
          <Link className="hover:underline underline-offset-4" href="/faq">FAQ</Link>
          <Link className="hover:underline underline-offset-4" href="/about">About</Link>
          <Link className="hover:underline underline-offset-4" href="/terms">Terms of Service</Link>
          <Link className="hover:underline underline-offset-4" href="/privacy">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
