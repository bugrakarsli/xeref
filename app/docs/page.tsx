import Link from 'next/link';
import { XerefLogo } from '@/components/xeref-logo';
import { StartBuildingButton } from '@/components/start-building-button';
import { Badge } from '@/components/ui/badge';
import { MobileNav } from '@/components/mobile-nav';
import { SiteFooter } from '@/components/site-footer';

const sections = [
  {
    id: 'overview',
    title: 'Platform Overview',
    content: [
      {
        heading: 'What is xeref.ai?',
        body: 'xeref.ai is an AI agent builder and productivity platform. It has two layers: XerefClaw — a visual builder for designing and generating custom AI agents — and the Dashboard, a productivity environment where you manage tasks, chat with AI, run workflows, and connect your agents to real channels like Telegram.',
      },
      {
        heading: 'How the layers connect',
        body: 'XerefClaw generates the system prompt that defines your agent\'s personality and capabilities. That prompt is saved as a project and used by the Dashboard\'s AI Chat as the agent\'s system context. Everything you build in XerefClaw powers the agents you run in the Dashboard.',
      },
    ],
  },
  {
    id: 'xerefclaw',
    title: 'XerefClaw — Agent Builder',
    content: [
      {
        heading: '1. Open XerefClaw',
        body: 'Click "XerefClaw" on the landing page or navigate to /builder. No account is required to browse and configure features.',
      },
      {
        heading: '2. Select Your Features',
        body: 'Browse 48+ capabilities organized across the CLAWS categories. Click any card to add it to your basket. Use the search bar or category filter to narrow down options.',
      },
      {
        heading: '3. Generate Your Prompt',
        body: 'Once you\'ve selected your features, open the basket and click "Generate Prompt". The output is a structured system prompt ready to paste into Antigravity IDE or save to your xeref.ai project.',
      },
      {
        heading: '4. Save Your Configuration',
        body: 'Sign in with Google or a magic link to save named agent projects. Saved projects appear in your Dashboard under Agents and can be used as the context for AI Chat sessions.',
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
    id: 'dashboard',
    title: 'The Dashboard',
    content: [
      {
        heading: 'Home',
        body: 'Your command center: saved agents, daily targets, and a snapshot of active tasks. Set up to 3 daily goals each morning — they surface here and inform AI task prioritization throughout the day.',
      },
      {
        heading: 'Tasks',
        body: 'A unified task list with AI-powered prioritization. Type a goal and xeref generates a full project plan with phases and tasks. Ask "what should I work on next?" to get a reasoned top-3 based on priorities, deadlines, and daily targets.',
      },
      {
        heading: 'AI Chat',
        body: 'Chat with any of your saved agents. The conversation uses the agent\'s generated system prompt as context, so each chat session is specialized to a specific agent you built in XerefClaw. Model access depends on your plan (see Plans & Model Access).',
      },
      {
        heading: 'Memory',
        body: 'Upload documents (PDF, text, images) and xeref chunks and embeds them into your personal Pinecone vector store. During AI Chat, relevant memory chunks are retrieved and injected as context automatically. You can also add manual memory entries and search across everything you\'ve stored.',
      },
      {
        heading: 'Artifacts',
        body: 'A versioned store for outputs your agents produce: code snippets, documents, prompts, data files, images, and workflows. Each artifact tracks its full version history and can be published with a share URL.',
      },
      {
        heading: 'Plans',
        body: 'Generate structured execution plans from a single goal. xeref breaks it into phases, tasks, roles, and KPIs — giving you a ready-to-execute project blueprint you can track in the Tasks view.',
      },
      {
        heading: 'Calendar',
        body: 'View deadlines, focus blocks, and scheduled events. Syncs with Google Calendar. Tasks with due dates appear on the calendar automatically.',
      },
      {
        heading: 'Workflows',
        body: 'Cron-triggered automations. Define a schedule and a prompt — xeref runs the agent on your schedule and delivers output to your configured channel (Telegram, email, etc.).',
      },
      {
        heading: 'Stats',
        body: 'Productivity trends, task completion rates, and AI usage metrics over time.',
      },
      {
        heading: 'Agents',
        body: 'All saved agent projects from XerefClaw. Start a chat from any agent, deploy it to a channel, or edit its configuration.',
      },
    ],
  },
  {
    id: 'customize',
    title: 'Customize — /customize',
    content: [
      {
        heading: 'Connectors',
        body: 'Manage OAuth connections and local integrations at /customize/connectors. The connector panel is organized into three groups: Web (GitHub, Gmail, Google Calendar, Notion, Slack, Supabase, Custom Webhook, Vercel), Channels (Telegram Bot), and Desktop (Filesystem). Connected services show a blue dot. Click any connector to view its detail panel, manage scopes, or disconnect.',
      },
      {
        heading: 'Web connectors',
        body: 'GitHub, Gmail, Google Calendar, Notion, Slack, and Vercel use OAuth — click Connect and authorize in the provider\'s window. The connection token is stored encrypted (AES-256-GCM) server-side. Supabase and Custom Webhook are configured manually via token/URL entry.',
      },
      {
        heading: 'Telegram Bot',
        body: 'Connect a Telegram bot by pasting your bot token in Dashboard → Deploy. Once connected, messages sent to your bot are routed to your configured xeref agent and replies are sent back through Telegram. The connector shows your masked token and a Disconnect action.',
      },
      {
        heading: 'Filesystem (Desktop)',
        body: 'Give your agents local file access via the built-in MCP Filesystem server. Add allowed directories by path, then configure per-tool permissions (Always allow / Ask each time / Never allow) for read, write, and delete operations. Settings persist in your browser\'s local storage.',
      },
      {
        heading: 'Skills',
        body: 'Browse and manage agent skills at /customize/skills. Skills are reusable instruction sets that extend what your agents can do — search for a skill, view its source, and add it to a project. Skills are stored in your profile and can be attached to any agent project.',
      },
      {
        heading: 'Sidebar customization',
        body: 'Control which views appear in your dashboard sidebar via the "Customize Sidebar" button at the bottom of the nav. Toggle visibility, reorder items with ↑/↓, and hide items you don\'t use — they collect under a "More" group. Preferences are saved to your profile and persist across devices.',
      },
    ],
  },
  {
    id: 'mcp',
    title: 'MCP Server',
    content: [
      {
        heading: 'What is the MCP backend?',
        body: 'Every piece of data in xeref.ai — projects, tasks, memories, daily targets — is exposed as an MCP (Model Context Protocol) tool. Your Claude or Antigravity agent can connect to this server and read, write, and reason over your workspace directly.',
      },
      {
        heading: 'Connecting your agent',
        body: 'Find your personal MCP endpoint in Dashboard → Settings. Add it as an MCP server in Antigravity or Claude Code. Your agent then has live access to your task list, project context, and memory — the same data you manage in the Dashboard.',
      },
      {
        heading: 'Available tools',
        body: 'list_projects, create_task, update_task, list_memories, save_memory, recall_memories, delete_memory, set_daily_targets, suggest_next_task, create_project_with_plan, rename_project, list_routines, and more. Full tool reference is in the API tab of your Dashboard settings.',
      },
    ],
  },
  {
    id: 'plans',
    title: 'Plans & Model Access',
    content: [
      {
        heading: 'Basic (Free)',
        body: 'Access to XerefClaw, Dashboard home, tasks, and AI Chat with the xeref base model. No credit card required.',
      },
      {
        heading: 'Pro — $17/mo or $170/yr',
        body: 'Everything in Basic, plus Claude Haiku 4.5, Claude Sonnet 4.6, and DeepSeek V4 Flash model access in AI Chat, higher workflow run limits, and priority support.',
      },
      {
        heading: 'Ultra — $77/mo or $770/yr',
        body: 'Everything in Pro, plus all available models (including DeepSeek V4 Pro), unlimited workflow runs, and full memory/embedding storage.',
      },
      {
        heading: 'Upgrading',
        body: 'Go to Dashboard → Settings → Billing, or visit the Pricing page. Upgrades take effect immediately via Creem.',
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
      {
        heading: 'Contact support',
        body: 'Email support@xeref.ai — we typically respond within 24 hours.',
      },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b backdrop-blur-sm sticky top-0 z-50 relative">
        <Link className="flex items-center justify-center font-bold text-lg" href="/">
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
          <Link className="text-sm font-medium text-cyan-400" href="/docs">
            Docs
          </Link>
        </nav>
        <div className="ml-auto flex gap-2 items-center">
          <div className="hidden sm:flex gap-2 items-center">
            <StartBuildingButton size="sm" showLoginButton />
          </div>
          <MobileNav />
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-12 md:py-20 max-w-3xl mx-auto">
          <div className="mb-10 space-y-3">
            <Badge variant="secondary">Documentation</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight">How xeref.ai works</h1>
            <p className="text-muted-foreground text-lg">
              From building your first agent to running it in production — everything in one place.
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

      <SiteFooter />
    </div>
  );
}
