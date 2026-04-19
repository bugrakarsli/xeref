# xeref

**xeref** is the web app for [xeref.ai](https://xeref.ai) — an AI agent builder and productivity dashboard. Users configure custom agents via the CLAWS methodology, chat with them directly in-app, manage projects and tasks, and deploy to channels.

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
NEXT_PUBLIC_SUPABASE_URL=        # Supabase dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase dashboard → Settings → API
SUPABASE_SERVICE_ROLE_KEY=       # Server-only — never expose to client
NEXT_PUBLIC_SITE_URL=            # http://localhost:3000 in dev, https://xeref.ai in prod
OPENROUTER_API_KEY=              # openrouter.ai → Keys
CREEM_WEBHOOK_SECRET=            # Creem dashboard → Webhooks
```

## Database Setup

Run `supabase/schema.sql` in the Supabase SQL Editor. This creates:
- `profiles` — user plan and metadata (auto-populated by trigger on `auth.users`)
- `projects` — saved agent configurations with generated prompts
- `chats` / `messages` — chat history per project
- `usage_events` — analytics log

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

| Route | Description |
|---|---|
| `/` | Dashboard (redirects to `/login` if unauthenticated) |
| `/builder` | XerefClaw agent builder — browse CLAWS features, generate prompts |
| `/login` | Magic link + Google OAuth |
| `/pricing` | Plans: Basic (free) · Pro ($17/mo) · Ultra ($77/mo) |
| `/docs` | Documentation page |
| `/changelog` | Release history |
| `/faq` | Frequently asked questions |
| `/checkout/success` | Post-payment confirmation |

## Architecture Overview

```
app/
  page.tsx                  → Auth check → DashboardShell
  builder/page.tsx          → CLAWS feature selector (Client Component)
  login/page.tsx            → Magic link + Google OAuth
  pricing/page.tsx          → Creem checkout integration
  api/chat/route.ts         → Streaming chat via OpenRouter (multi-model)
  api/webhooks/creem/       → Payment webhook handler
  actions/
    projects.ts             → Project CRUD
    chats.ts                → Chat + message CRUD
    profile.ts              → getUserPlan()
    checkout.ts             → createCheckout() → Creem redirect
    prompt.ts               → Prompt regeneration

components/dashboard/
  dashboard-shell.tsx       → Top-level shell; routes between views
  sidebar.tsx               → Collapsible left nav
  home-view.tsx             → Welcome + quick actions
  chat/                     → Full chat interface with model selector
  tasks-view.tsx            → Task management
  stats-view.tsx            → Usage analytics
  workflows-view.tsx        → Cron/webhook workflows
  calendar-view.tsx         → Calendar
  inbox-view.tsx            → Notifications
  settings-view.tsx         → Account, plan, preferences
  agent-team-view.tsx       → Agent team configuration
  referral-view.tsx         → Referral program

lib/
  features.ts               → 48+ CLAWS feature catalog
  prompt-generator.ts       → Converts selected feature IDs → Antigravity prompt
  types.ts                  → TypeScript interfaces
```

## Chat & Model Routing

`POST /api/chat` streams responses via OpenRouter. Model selection:

| Model ID | Resolves to |
|---|---|
| `claude-haiku-4-5-20251001` | `anthropic/claude-haiku-4-5` (default) |
| `claude-sonnet-4-6` | `anthropic/claude-sonnet-4-6` |
| `claude-opus-4-6` | `anthropic/claude-opus-4-6` |
| `opus-plan` | Opus 4.6 if message contains planning keywords, else Sonnet 4.6 |
| `best` | `openrouter/auto` |

If a `projectId` is provided, the project's generated CLAWS prompt is used as the system prompt.

## Plans

| Plan | Price | Key limits |
|---|---|---|
| Basic | Free | Rate-limited API, no cloud save |
| Pro | $17/mo or $170/yr | Projects, tasks, memory, 2 deploy channels, 3 workflows |
| Ultra | $77/mo or $770/yr | Unlimited channels, workflows, memory, OCR document brain |

Payments are handled by **Creem** (`app/actions/checkout.ts` + `app/api/webhooks/creem/route.ts`). The webhook updates `profiles.plan` in Supabase.

## Test Use Cases

### 1. Agent Builder (unauthenticated)

1. Navigate to `/builder`.
2. Use the category filter to browse CLAWS sections.
3. Select 3–5 features (e.g., *Slack Connector*, *Long-term Memory*, *Task Planner*).
4. Click **Generate Prompt** — the prompt should appear in the Basket panel, copy-ready.
5. Verify the prompt groups features in CLAWS order and includes full descriptions.

### 2. Auth Flow

1. Go to `/login`, enter an email, click **Send magic link**.
2. Open the link from the email — you should land on the dashboard (`/`).
3. Sign out from Settings → confirm redirect to `/login`.
4. Repeat with **Continue with Google**.

### 3. Save & Load a Project (authenticated)

1. In `/builder`, select features and click **Save Project**.
2. Enter a project name → confirm toast notification.
3. Refresh the page — the project should appear in the sidebar Projects list.
4. Click the project to load it; verify the correct features are pre-selected.

### 4. Chat with a Project Agent

1. From the dashboard sidebar, open **Chat**.
2. Select a saved project from the project dropdown.
3. Send a message — the response should stream in using the project's generated system prompt.
4. Switch models (Haiku → Sonnet) mid-conversation and verify the header reflects the change.

### 5. Checkout Flow (staging)

1. Go to `/pricing` as an authenticated user.
2. Click **Get Pro** — should redirect to Creem checkout.
3. Use Creem test card details to complete payment.
4. After redirect to `/checkout/success`, verify `profiles.plan` is updated to `pro` in Supabase.
5. In the dashboard Settings view, confirm the plan badge shows **Pro**.

### 6. Webhook Verification

```bash
# Trigger a test webhook event from Creem dashboard and confirm:
# - HTTP 200 response
# - profiles.plan updated in Supabase
# - No 500 errors in Vercel logs
```

## Tech Stack

- **Next.js 16** — App Router, React Server Components
- **React 19** with Babel React Compiler
- **Tailwind v4** — `@import "tailwindcss"` syntax
- **shadcn/ui** — `new-york` style, `neutral` base color
- **Supabase** — auth + Postgres (RLS on all tables)
- **Vercel AI SDK** — streaming chat (`streamText`, `convertToModelMessages`)
- **OpenRouter** — multi-model AI backend
- **Creem** — payments and subscription management
- **Framer Motion** — animations
- **Sonner** — toast notifications
