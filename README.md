# xeref

**xeref** is the web app for [xeref.ai](https://xeref.ai) — an AI agent builder and productivity dashboard. Users configure custom agents via the CLAWS methodology, chat with them in-app, manage projects, tasks, artifacts, and memories, deploy to channels (Telegram, Slack, Notion), and automate workflows.

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
# Supabase
NEXT_PUBLIC_SUPABASE_URL=                 # Supabase dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=            # Supabase dashboard → Settings → API
SUPABASE_SERVICE_ROLE_KEY=                # Server-only — never expose to client

# Site
NEXT_PUBLIC_SITE_URL=                     # http://localhost:3000 in dev, https://xeref.ai in prod

# OpenRouter (per-plan keys)
OPENROUTER_API_KEY_BASIC=                 # Free/basic plan users
OPENROUTER_API_KEY_PRO=                   # Pro plan users
OPENROUTER_API_KEY_ULTRA=                 # Ultra plan users

# Payments (Creem)
CREEM_API_KEY=                            # Creem dashboard → API keys
CREEM_WEBHOOK_SECRET=                     # Creem dashboard → Webhooks
NEXT_PUBLIC_CREEM_PRO_MONTHLY_ID=         # Creem product ID — Pro Monthly
NEXT_PUBLIC_CREEM_PRO_ANNUAL_ID=          # Creem product ID — Pro Annual
NEXT_PUBLIC_CREEM_ULTRA_MONTHLY_ID=       # Creem product ID — Ultra Monthly
NEXT_PUBLIC_CREEM_ULTRA_ANNUAL_ID=        # Creem product ID — Ultra Annual

# Connections (OAuth token encryption)
CONNECTIONS_ENCRYPTION_KEY=               # 32-byte hex string — generate: openssl rand -hex 32

# OAuth providers (Connections feature)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
VERCEL_CLIENT_ID=
VERCEL_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Semantic memory (Pinecone)
PINECONE_API_KEY=
PINECONE_INDEX_NAME=

# OCR ingestion (Gemini primary, Mistral fallback)
GEMINI_API_KEY=
MISTRAL_API_KEY=

# Web search (Tavily — used by chat route)
TAVILY_API_KEY=

# MCP server (single-user)
XEREF_MCP_USER_ID=                        # Supabase user UUID for MCP tool calls

# Telegram bot
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
```

## Database Setup

Run `supabase/schema.sql` in the Supabase SQL Editor, then apply migrations in order from `supabase/migrations/`. Tables:

| Table | Purpose |
|---|---|
| `profiles` | User plan (`basic`/`pro`/`ultra`) and metadata — auto-populated via trigger on `auth.users` |
| `projects` | Saved CLAWS agent configurations with generated prompts |
| `chats` / `messages` | Chat history per project |
| `tasks` | Task management with status, priority, and due dates |
| `memories` | Long-term memory entries per user |
| `notes` | User notes |
| `workflows` | Cron/webhook automation configs |
| `code_sessions` | Claude Code workspace sessions with transcript |
| `routines` | Scheduled routines for the Code workspace |
| `user_connections` | Encrypted OAuth tokens per user per provider |
| `documents` | User-uploaded files for OCR memory ingestion |
| `design_projects` | Design system projects |
| `artifacts` / `artifact_versions` | Saved artifacts with version history |
| `rate_limits` | Anonymous user rate-limiting buckets |

All tables use Row Level Security.

## Commands

```bash
npm run dev       # Development server (http://localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
npx shadcn@latest add <component-name>
```

## Key Routes

| Route | Description |
|---|---|
| `/` | Dashboard shell (redirects to `/login` if unauthenticated) |
| `/builder` | XerefClaw agent builder — browse CLAWS features, generate prompts |
| `/code` | Claude Code workspace — sessions, routines, dispatch |
| `/code/session/[sessionId]` | Individual code session with streaming chat |
| `/code/routines` | Scheduled routines management |
| `/customize` | Agent customization |
| `/customize/connectors` | OAuth connection management (Google, Notion, Slack, Vercel, Telegram) |
| `/settings` | Account, plan, and integration settings |
| `/design` | Design system management |
| `/artifacts/my` | User artifact library |
| `/login` | Magic link + Google OAuth |
| `/pricing` | Plans: Basic (free) · Pro ($17/mo) · Ultra ($77/mo) |
| `/changelog` | Release history |
| `/docs` | Documentation |
| `/faq` | Frequently asked questions |
| `/checkout/success` | Post-payment confirmation |

## Architecture Overview

```
app/
  page.tsx                        → Auth check → DashboardShell
  error.tsx                       → Root error boundary (surfaces real error message)
  builder/page.tsx                → CLAWS feature selector
  code/
    page.tsx                      → Claude Code workspace landing
    layout.tsx                    → Code layout (wraps DashboardShell)
    session/[sessionId]/page.tsx  → Individual session view
    routines/page.tsx             → Routines list
    _components/                  → CodeLanding, ChatInputWithGitHub, GitHubRepoButton
  customize/
    connectors/page.tsx           → OAuth connection status board
  settings/page.tsx               → Settings view
  design/                         → Design system feature
  artifacts/my/page.tsx           → User artifact library
  login/page.tsx                  → Magic link + Google OAuth
  pricing/page.tsx                → Creem checkout integration
  changelog/page.tsx              → Release history (data from lib/changelog-entries.ts)
  api/
    chat/route.ts                 → Streaming chat via OpenRouter (multi-model, plan-gated)
    sessions/[id]/chat/route.ts   → Code session streaming chat
    memory/documents/route.ts     → File upload + OCR ingestion trigger
    memory/documents/[id]/route.ts → Document delete (cascades Pinecone chunks)
    connections/[provider]/       → OAuth login + callback per provider
    bots/telegram/[userId]/route.ts → Telegram webhook handler
    mcp/route.ts                  → HTTP wrapper for self-hosted MCP server
    webhooks/creem/route.ts       → Payment webhook → updates profiles.plan
    webhooks/workflow/route.ts    → Workflow webhook trigger
  actions/
    checkout.ts                   → createCheckout() → Creem redirect
    tasks.ts                      → Task CRUD
    memories.ts                   → Memory CRUD
    chats.ts                      → Chat + message CRUD
    projects.ts                   → Project CRUD
    profile.ts                    → getUserPlan(), clearTelegramBotToken()
    workflows.ts                  → Workflow CRUD + trigger
    code-sessions.ts              → Code session CRUD

components/dashboard/
  dashboard-shell.tsx             → Top-level shell; routes between views via ViewKey
  sidebar.tsx                     → Collapsible left nav
  rhs-sidebar.tsx                 → Right sidebar (chat view only) with latestVersion badge
  whats-new-toast.tsx             → "What's new" toast — auto-derives from changelog-entries
  home-view.tsx                   → Welcome + quick actions
  chat/                           → Full chat interface with model selector, ChatMessage
  tasks-view.tsx                  → Task management
  memory-view.tsx                 → File upload, OCR toggle, document list
  code-session-view.tsx           → Claude Code session with streaming chat
  artifacts-view.tsx              → Artifact management
  referral-view.tsx               → Referral program
  settings-view.tsx               → Account and plan settings
  workflows-view.tsx              → Automation workflows

components/customize/
  ConnectorsSection.tsx           → Live OAuth status board (real connected state per provider)

lib/
  changelog-entries.ts            → All release history; exports changelogEntries + latestVersion
  features.ts                     → 48+ CLAWS feature catalog
  prompt-generator.ts             → Selected feature IDs → Antigravity prompt
  types.ts                        → Core interfaces (Feature, ViewKey, Artifact, CodeSession…)
  system-agents.ts                → Built-in agent definitions
  ai/openrouter-config.ts         → Server-only plan/model routing
  pinecone.ts                     → Semantic memory — xeref_lessons + xeref_user_memory namespaces
  ocr.ts                          → Text extraction — Gemini primary, Mistral fallback
  connections/
    crypto.ts                     → AES-256-GCM token encryption/decryption
    oauth-state.ts                → HMAC-SHA256 signed CSRF state with 10-min TTL
    registry.ts                   → OAuth provider registry (google, notion, slack, vercel, github)
  supabase/
    client.ts                     → Browser Supabase client (use client components only)
    server.ts                     → Server Supabase client (Server Components, Actions, Routes)

mcp/server.ts                     → Self-hosted MCP server (stdio transport, single-user)
```

## Chat & Model Routing

`POST /api/chat` streams via OpenRouter. Routing is plan-aware and server-enforced — client model IDs are validated before any upstream call. Disallowed requests return `403 { error, code: 'PLAN_LIMIT' }`.

| Model ID | Resolves to | Plan |
|---|---|---|
| `xeref-free` (default) | `openrouter/free` | Basic |
| `claude-haiku-4-5-20251001` | `anthropic/claude-haiku-4-5` | Pro |
| `claude-sonnet-4-6` | `anthropic/claude-sonnet-4-6` | Pro |
| `deepseek-v4-flash` | `deepseek/deepseek-v4-flash` | Pro |
| `best` | `openrouter/auto` | Ultra |
| `claude-opus-4-7` | `anthropic/claude-opus-4-7` | Ultra |
| `deepseek-v4-pro` | `deepseek/deepseek-v4-pro` | Ultra |
| `opus-plan` | Opus 4.7 for planning queries, Sonnet 4.6 otherwise | Ultra |

If a `projectId` is in the request body, the project's CLAWS prompt is used as the system prompt. The chat route also exposes a `recall_documents` tool backed by Pinecone user-memory search.

## Semantic Memory (Pinecone)

Two active namespaces in `lib/pinecone.ts`:

| Namespace | Purpose |
|---|---|
| `xeref_lessons` | Classroom lesson content (embedding search) |
| `xeref_user_memory` | User-uploaded document chunks from OCR pipeline |

User-memory fields: `userId`, `documentId`, `documentName`, `chunkIndex`, `text`. All searches are filtered by `userId`. Use `indexDocumentChunks` / `searchUserDocuments` / `deleteDocumentChunks`.

## OCR Ingestion Pipeline

`lib/ocr.ts` — invoked as a background task (`after()`) when a file is uploaded with `ocr=true`:

1. **Plain text / Markdown** — extracted directly, no API call
2. **PDF / Image** — Gemini 2.5 Flash primary; Mistral OCR fallback if `GEMINI_API_KEY` is absent or Gemini fails
3. Extracted text is chunked (1500 chars, 200 overlap) and indexed into Pinecone `xeref_user_memory`

## Connections (OAuth)

Tokens stored encrypted (AES-256-GCM) in `user_connections`. CSRF state is HMAC-SHA256 signed with a nonce + 10-min TTL. `listConnectionsForUser()` never returns raw tokens — only `getConnectionWithSecrets()` decrypts (server-only).

Active providers: `google` · `notion` · `slack` · `vercel` · `github` — login and callback routes at `app/api/connections/[provider]/`.

## MCP Server

`mcp/server.ts` — self-hosted, single-user, stdio transport. Auth via `SUPABASE_SERVICE_ROLE_KEY` + `XEREF_MCP_USER_ID`. Exposes CRUD tools for tasks, projects, notes, and chats. HTTP wrapper at `app/api/mcp/route.ts`.

## Dashboard Views

`DashboardShell` routes between views via `activeView: ViewKey`:

`'home' | 'tasks' | 'stats' | 'calendar' | 'workflows' | 'inbox' | 'chat' | 'settings' | 'referral' | 'agents' | 'artifacts' | 'code'`

`RhsSidebar` only renders when `activeView === 'chat'`.

## Plans

| Plan | Price | Key features |
|---|---|---|
| Basic | Free | Rate-limited API, no cloud save, XerefClaw builder |
| Pro | $17/mo or $170/yr | Projects, tasks, memory, 2 deploy channels, 3 workflows, Haiku + Sonnet + DeepSeek Flash |
| Ultra | $77/mo or $770/yr | Unlimited channels + workflows, OCR document brain, Claude Code workspace, all models |

Payments via **Creem** (`app/actions/checkout.ts` + `app/api/webhooks/creem/route.ts`). Webhook updates `profiles.plan`.

## Tech Stack

- **Next.js 16** — App Router, React Server Components, Turbopack
- **React 19**
- **Tailwind v4** — `@import "tailwindcss"` syntax (not `@tailwind` directives)
- **shadcn/ui** — `new-york` style, `neutral` base color
- **Supabase** — auth (magic link + Google OAuth) + Postgres with RLS on all tables
- **`@supabase/ssr`** — correct package for Next.js App Router
- **Vercel AI SDK** — `streamText`, `convertToModelMessages`, `DefaultChatTransport`
- **OpenRouter** — multi-model AI backend (`@openrouter/ai-sdk-provider`)
- **Pinecone** — vector database for semantic memory (`@pinecone-database/pinecone`)
- **Creem** — payments and subscription management
- **Zustand** — client-side state (design store)
- **Sonner** — toast notifications
- **Framer Motion** — animations
