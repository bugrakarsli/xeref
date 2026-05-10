# xeref

**xeref** is the web app for [xeref.ai](https://xeref.ai) — an AI agent builder and productivity dashboard. Users configure custom agents via the CLAWS methodology, chat with them directly in-app, manage projects, tasks, artifacts, and design systems, and deploy to channels.

## Quick Start

```bash
npm install
cp .env.local.example .env.local  # fill in values (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=                 # Supabase dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=            # Supabase dashboard → Settings → API
SUPABASE_SERVICE_ROLE_KEY=                # Server-only — never expose to client
NEXT_PUBLIC_SITE_URL=                     # http://localhost:3000 in dev, https://xeref.ai in prod
OPENROUTER_API_KEY_BASIC=                 # OpenRouter key for free/basic plan users
OPENROUTER_API_KEY_PRO=                   # OpenRouter key for pro plan users
OPENROUTER_API_KEY_ULTRA=                 # OpenRouter key for ultra plan users
OPENROUTER_BASE_URL=                      # Optional override (omit to use OpenRouter default)
XEREF_DEFAULT_OPENROUTER_SITE_URL=        # Site URL sent as HTTP-Referer for OpenRouter attribution
XEREF_DEFAULT_OPENROUTER_APP_NAME=        # App name sent as X-Title for OpenRouter attribution
CREEM_WEBHOOK_SECRET=                     # Creem dashboard → Webhooks
```

## Database Setup

Run `supabase/schema.sql` in the Supabase SQL Editor, then apply migrations in `supabase/migrations/`. Tables:

- `profiles` — user plan and metadata (auto-populated via trigger on `auth.users`)
- `projects` — saved agent configurations with generated prompts
- `chats` / `messages` — chat history per project
- `usage_events` — analytics log
- `tasks` — task management with status/priority
- `memories` — long-term memory per user
- `workflows` — cron/webhook automation configs
- `design_projects` — design system projects (from `/design` feature)
- `organizations` / `org_members` — multi-org support

All tables use Row Level Security.

## Commands

```bash
npm run dev       # Development server (http://localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
```

Adding shadcn components:

```bash
npx shadcn@latest add <component-name>
```

## Key Routes

| Route               | Description                                                         |
| ------------------- | ------------------------------------------------------------------- |
| `/`                 | Dashboard (redirects to `/login` if unauthenticated)                |
| `/builder`          | XerefClaw agent builder — browse CLAWS features, generate prompts   |
| `/design`           | Design system management — create, edit, and preview design systems |
| `/artifacts/my`     | Artifact library — view, preview, and manage saved artifacts        |
| `/login`            | Magic link + Google OAuth                                           |
| `/pricing`          | Plans: Basic (free) · Pro ($17/mo) · Ultra ($77/mo)                 |
| `/docs`             | Documentation page                                                  |
| `/changelog`        | Release history                                                     |
| `/faq`              | Frequently asked questions                                          |
| `/checkout/success` | Post-payment confirmation                                           |

## Architecture Overview

```
app/
  page.tsx                  → Auth check → DashboardShell
  builder/page.tsx          → CLAWS feature selector (Client Component)
  design/
    page.tsx                → Design system management
    layout.tsx              → Design route layout
    design.css              → Design-specific styles
  artifacts/my/page.tsx     → User artifact library
  login/page.tsx            → Magic link + Google OAuth
  pricing/page.tsx          → Creem checkout integration
  api/
    chat/route.ts           → Streaming chat via OpenRouter (multi-model)
    design-systems/route.ts → Design system CRUD API
    projects/route.ts       → Projects API
    templates/route.ts      → Design templates API
    webhooks/creem/         → Payment webhook handler
  actions/
    projects.ts             → Project CRUD
    chats.ts                → Chat + message CRUD
    profile.ts              → getUserPlan()
    checkout.ts             → createCheckout() → Creem redirect
    prompt.ts               → Prompt regeneration
    workflows.ts            → Workflow CRUD + trigger

components/dashboard/
  dashboard-shell.tsx       → Top-level shell; routes between views
  sidebar.tsx               → Collapsible left nav with search trigger
  search-popup.tsx          → Global search popup (Cmd/Ctrl+K)
  home-view.tsx             → Welcome + quick actions
  chat/                     → Full chat interface with model selector
  tasks-view.tsx            → Task management with CRUD
  stats-view.tsx            → Usage analytics
  workflows-view.tsx        → Cron/webhook workflows with chat triggers
  calendar-view.tsx         → Calendar
  inbox-view.tsx            → Notifications
  settings-view.tsx         → Account, plan, preferences
  agent-team-view.tsx       → Agent team configuration
  referral-view.tsx         → Referral program
  artifacts-view.tsx        → Artifact management (list + detail + preview)
  artifacts/
    artifact-list.tsx       → Artifact list with filtering
    artifact-detail.tsx     → Full artifact detail panel
    artifact-preview.tsx    → Rendered artifact preview
    artifact-list-item.tsx  → Single artifact row
    artifact-version-panel.tsx → Version history
    mock-artifacts.ts       → Dev mock data

components/design/          → Design feature UI (sidebar, panels, modals)
  sidebar-shell.tsx         → Design sidebar navigation
  sidebar-tabs.tsx          → Tab strip for design panels
  main-content.tsx          → Main design canvas/content area
  launcher-panel.tsx        → Quick-launch panel
  panels/                   → prototype, slide-deck, other panels
  modals/                   → create-design-system, modal-root, tutorial
  ui/                       → Design-scoped badge, button, input primitives

store/
  design-store.ts           → Zustand store for design system state

hooks/
  use-design-systems.ts     → SWR hook for design systems
  use-projects.ts           → SWR hook for design projects
  use-templates.ts          → SWR hook for design templates

types/
  design.ts                 → DesignProject and related interfaces

lib/
  features.ts               → 48+ CLAWS feature catalog
  prompt-generator.ts       → Converts selected feature IDs → Antigravity prompt
  types.ts                  → Core TypeScript interfaces (Feature, ViewKey, Artifact, etc.)
  system-agents.ts          → Built-in agent definitions (XerefClaw, Xeref Agents)
  changelog-entries.ts      → Changelog data (drives /changelog page)
  ai/openrouter-config.ts   → Server-only plan/model routing
```

## Chat & Model Routing

`POST /api/chat` streams responses via OpenRouter. Routing is plan-aware and server-enforced.

| Model ID                    | Resolves to                                                     | Plan  |
| --------------------------- | --------------------------------------------------------------- | ----- |
| `xeref-free` (default)      | `openrouter/free`                                               | Basic |
| `claude-haiku-4-5-20251001` | `anthropic/claude-haiku-4-5`                                    | Pro   |
| `claude-sonnet-4-6`         | `anthropic/claude-sonnet-4-6`                                   | Pro   |
| `deepseek-v4-flash`         | `deepseek/deepseek-v4-flash`                                    | Pro   |
| `best`                      | `openrouter/auto`                                               | Ultra |
| `claude-opus-4-7`           | `anthropic/claude-opus-4-7`                                     | Ultra |
| `deepseek-v4-pro`           | `deepseek/deepseek-v4-pro`                                      | Ultra |
| `opus-plan`                 | Opus 4.7 if message contains planning keywords, else Sonnet 4.6 | Ultra |

If a `projectId` is provided, the project's generated CLAWS prompt is used as the system prompt. Disallowed models return `403 { error, code: 'PLAN_LIMIT' }`.

## Dashboard Views

`DashboardShell` routes between views via `activeView: ViewKey`:

`'home' | 'tasks' | 'stats' | 'calendar' | 'workflows' | 'inbox' | 'chat' | 'settings' | 'referral' | 'agents' | 'artifacts' | 'code'`

The right-hand sidebar (`RhsSidebar`) only renders when `activeView === 'chat'`.

## Plans

| Plan  | Price             | Key limits                                                |
| ----- | ----------------- | --------------------------------------------------------- |
| Basic | Free              | Rate-limited API, no cloud save                           |
| Pro   | $17/mo or $170/yr | Projects, tasks, memory, 2 deploy channels, 3 workflows   |
| Ultra | $77/mo or $770/yr | Unlimited channels, workflows, memory, OCR document brain |

Payments handled by **Creem** (`app/actions/checkout.ts` + `app/api/webhooks/creem/route.ts`). Webhook updates `profiles.plan` in Supabase.

## Tech Stack

- **Next.js 16** — App Router, React Server Components
- **React 19** with Babel React Compiler (`next.config.ts`: `reactCompiler: true`)
- **Tailwind v4** — `@import "tailwindcss"` syntax (not `@tailwind` directives)
- **shadcn/ui** — `new-york` style, `neutral` base color
- **Supabase** — auth (magic link + Google OAuth) + Postgres (RLS on all tables)
- **`@supabase/ssr`** — correct package for Next.js App Router (not deprecated `auth-helpers-nextjs`)
- **Vercel AI SDK** — streaming chat (`streamText`, `convertToModelMessages`)
- **OpenRouter** — multi-model AI backend (`@openrouter/ai-sdk-provider`)
- **Zustand** — client-side state management (design store)
- **Creem** — payments and subscription management
- **Framer Motion** — animations
- **Sonner** — toast notifications
