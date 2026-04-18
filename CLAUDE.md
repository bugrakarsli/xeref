# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Is

**xeref** is the web app for xeref.ai — an AI agent builder and productivity dashboard. Users browse 48+ features organized by the CLAWS methodology, select what they want, save named project configurations, chat with agents directly in-app, manage tasks/workflows, and upgrade via Creem payments.

## Commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint
```

Adding shadcn components:

```bash
npx shadcn@latest add <component-name>
```

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=                 # From Supabase dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=            # From Supabase dashboard → Settings → API
SUPABASE_SERVICE_ROLE_KEY=                # Keep server-only — never expose to client
NEXT_PUBLIC_SITE_URL=                     # http://localhost:3000 in dev, https://xeref.ai in prod
OPENROUTER_API_KEY_BASIC=                 # OpenRouter key for free/basic plan users
OPENROUTER_API_KEY_PRO=                   # OpenRouter key for pro plan users
OPENROUTER_API_KEY_ULTRA=                 # OpenRouter key for ultra plan users
OPENROUTER_BASE_URL=                      # Optional override (omit to use OpenRouter default)
XEREF_DEFAULT_OPENROUTER_SITE_URL=        # Site URL sent as HTTP-Referer for OpenRouter attribution
XEREF_DEFAULT_OPENROUTER_APP_NAME=        # App name sent as X-Title for OpenRouter attribution
CREEM_WEBHOOK_SECRET=                     # Creem dashboard → Webhooks
```

## Architecture

### Key Directories

- `app/` — App Router pages:
  - `layout.tsx` — Root layout (dark mode, OG metadata, favicon)
  - `page.tsx` — Auth check → loads `DashboardShell` with projects, chats, userPlan
  - `builder/page.tsx` — CLAWS feature selector (Client Component, works unauthenticated)
  - `login/page.tsx` — Auth page (magic link + Google OAuth)
  - `auth/callback/route.ts` — OAuth/magic link callback handler
  - `pricing/page.tsx` — Plans page with Creem checkout
  - `checkout/success/page.tsx` — Post-payment confirmation
  - `changelog/page.tsx`, `docs/page.tsx`, `faq/page.tsx`, `about/page.tsx` — Content pages
  - `terms/page.tsx`, `privacy/page.tsx` — Legal pages
  - `api/chat/route.ts` — Streaming chat endpoint (OpenRouter, multi-model)
  - `api/webhooks/creem/route.ts` — Creem payment webhook (updates `profiles.plan`)
  - `actions/projects.ts` — Project CRUD (save, load, delete, update)
  - `actions/chats.ts` — Chat + message CRUD
  - `actions/profile.ts` — `getUserPlan()` → `'free' | 'pro' | 'ultra'`
  - `actions/checkout.ts` — `createCheckout(plan, interval)` → Creem redirect URL
  - `actions/prompt.ts` — Prompt regeneration for saved projects

- `components/ui/` — shadcn/ui primitives
- `components/` — App-specific components:
  - `FeatureGrid`, `FeatureCard`, `CategoryFilter`, `Basket`, `XerefLogo`
  - `StartBuildingButton`, `MobileNav`, `PricingSection`
- `components/dashboard/` — Full dashboard shell and all views:
  - `dashboard-shell.tsx` — Top-level client shell; owns view routing, project state, auth sign-out
  - `sidebar.tsx` — Collapsible left nav with user info, plan badge, projects list, chats list
  - `home-view.tsx` — Welcome + chat/tasks toggle + quick-action cards
  - `stats-view.tsx` — Usage analytics (project count, chat count, etc.)
  - `tasks-view.tsx` — Task management
  - `calendar-view.tsx` — Calendar view
  - `workflows-view.tsx` — Cron/webhook workflows
  - `inbox-view.tsx` — Notification inbox
  - `settings-view.tsx` — Account info, plan display, preferences
  - `agent-team-view.tsx` — Agent team configuration
  - `referral-view.tsx` — Referral program
  - `rhs-sidebar.tsx` — Right-hand context panel (shown in Chat view only)
  - `whats-new-toast.tsx` — Bottom-right "What's New" notification
  - `chat/` — Chat UI: `chat-interface.tsx`, `chat-message.tsx`, `chat-header.tsx`, `chat-list.tsx`, `chat-input.tsx`
  - `chats-view.tsx` — Outer chat page; wraps `ChatInterface`

- `lib/` — Core logic:
  - `types.ts` — All TypeScript interfaces (`Feature`, `Category`, `Project`, `Chat`, `UsageEvent`, `ViewKey`)
  - `features.ts` — Catalog of 48+ features with full metadata
  - `prompt-generator.ts` — Converts selected feature IDs → copy-paste Antigravity prompt
  - `utils.ts` — `cn()` Tailwind merge utility
  - `supabase/client.ts` — Browser Supabase client (for `'use client'` components)
  - `supabase/server.ts` — Server Supabase client (for Server Components and Server Actions)
  - `ai/openrouter-config.ts` — **Server-only** OpenRouter config: plan-to-key mapping, model allowlists, model resolution, per-request provider factory with attribution headers

- `proxy.ts` — Refreshes Supabase session tokens on every request (Next.js 16 uses `proxy.ts` + `export function proxy()` instead of the deprecated `middleware.ts`)

### Supabase Client Rules

- **Browser client** (`lib/supabase/client.ts`): use in `'use client'` components only — call `createClient()` inside event handlers, not at component body level (Next.js SSR-renders client components during build, so calling it at top level will fail if env vars aren't set)
- **Server client** (`lib/supabase/server.ts`): use in Server Components, Server Actions, and Route Handlers
- Always call `getUser()` (not `getSession()`) when checking auth on the server — `getSession()` does not validate the JWT
- `cookies()` from `next/headers` must be `await`ed in Next.js 16

### Database Schema (Supabase)

Run `supabase/schema.sql` in the Supabase SQL Editor:

- `profiles` — `plan ('free'|'pro'|'ultra')`, user metadata; auto-created via trigger on `auth.users`
- `projects` — `selected_feature_ids text[]`, `prompt text`, per-user agent configurations
- `chats` — chat sessions linked to a project (optional)
- `messages` — individual messages per chat, stored as `role`/`content`
- `usage_events` — analytics log (`event_type`, `metadata jsonb`)

All tables have RLS; users can only access their own rows.

### Auth Flow

Magic link + Google OAuth → `/auth/callback` → `/` (dashboard)

`app/page.tsx` is a Server Component that calls `getUser()` and redirects to `/login` if unauthenticated. It fetches projects, chats, and userPlan in parallel before rendering `DashboardShell`.

The builder (`/builder`) is fully usable without auth — unauthenticated users can browse and generate prompts but cannot save projects.

### Chat & Model Routing

`POST /api/chat` streams text via OpenRouter using Vercel AI SDK (`streamText`). Routing is **plan-aware and server-enforced** — the client-supplied model is validated against the user's plan before any upstream request.

All routing logic lives in `lib/ai/openrouter-config.ts` (server-only).

**Plan entitlements:**

| Plan           | Allowed models                                                 |
| -------------- | -------------------------------------------------------------- |
| `free` (Basic) | `xeref-free` only                                              |
| `pro`          | `xeref-free`, `claude-haiku-4-5-20251001`, `claude-sonnet-4-6` |
| `ultra`        | All models                                                     |

**Model resolution:**

| `model` field               | Resolves to                                            | Plan  |
| --------------------------- | ------------------------------------------------------ | ----- |
| `xeref-free` (default)      | `openrouter/free`                                      | Basic |
| `claude-haiku-4-5-20251001` | `anthropic/claude-haiku-4-5`                           | Pro   |
| `claude-sonnet-4-6`         | `anthropic/claude-sonnet-4-6`                          | Pro   |
| `best`                      | `openrouter/auto`                                      | Ultra |
| `claude-opus-4-6`           | `anthropic/claude-opus-4-6`                            | Ultra |
| `opus-plan`                 | Opus if message matches planning keywords, else Sonnet | Ultra |

**Per-plan API keys:** `OPENROUTER_API_KEY_BASIC` / `_PRO` / `_ULTRA` — the correct key is selected server-side based on the authenticated user's plan. Keys are never exposed to the client.

If `projectId` is passed in the request body, the project's stored `prompt` field is injected as the system prompt.

Disallowed model requests return `403 { error, code: 'PLAN_LIMIT' }`. Upstream failures return `502`. Errors are also surfaced to the client via `onError` in `toUIMessageStreamResponse`.

### Payments (Creem)

- `app/actions/checkout.ts` — `createCheckout(plan, interval)` creates a Creem session and returns a redirect URL
- `app/api/webhooks/creem/route.ts` — verifies Creem webhook signature, updates `profiles.plan` in Supabase on successful payment events
- Plans: `basic` (free) · `pro` ($17/mo, $170/yr) · `ultra` ($77/mo, $770/yr)

### Dashboard View Routing

`DashboardShell` owns `activeView: ViewKey` state. `ViewKey` is defined in `lib/types.ts`:
`'home' | 'tasks' | 'stats' | 'calendar' | 'workflows' | 'inbox' | 'chat' | 'settings' | 'referral' | 'agents'`

The right-hand sidebar (`RhsSidebar`) only renders when `activeView === 'chat'`.

### CLAWS Feature Categories

Features are organized by category ID: `connect` | `listen` | `archive` | `wire` | `sense` | `agent-architecture`. This ordering matters — prompt generation groups features in CLAWS order.

### Dynamic Icon Loading

Lucide icons are referenced by string names in feature data and loaded at runtime:

```ts
const IconComponent =
  (LucideIcons as any)[feature.icon] || LucideIcons.HelpCircle;
```

When adding features to `features.ts`, use valid Lucide icon names.

## Tech Stack

- **Next.js 16** with App Router, React Server Components
- **React 19** with Babel React Compiler enabled (`next.config.ts`: `reactCompiler: true`)
- **Tailwind v4** — uses `@import "tailwindcss"` syntax (not `@tailwind` directives)
- **shadcn/ui** with `new-york` style and `neutral` base color
- **Supabase** — auth (magic link + Google OAuth) and Postgres database
- **`@supabase/ssr`** — correct package for Next.js App Router (not the deprecated `auth-helpers-nextjs`)
- **Vercel AI SDK** — `streamText`, `convertToModelMessages` for streaming chat
- **OpenRouter** — multi-model AI provider (`@openrouter/ai-sdk-provider`)
- **Creem** — payments and subscription management
- **Framer Motion** — animations on feature cards and grid
- **Sonner** — toast notifications

## Theme

Dark mode is forced globally in `layout.tsx` via `className="dark"` on `<html>`. Colors use OKLch in CSS variables defined in `globals.css`. Do not add light/dark toggle logic — the app is intentionally dark-only.

## Branding Assets

Assets in `public/`:

- `xeref.svg` — used in `XerefLogo` component and as favicon (`icons` in `layout.tsx`)
- `xeref-ai-og-image.jpg` — wired in `layout.tsx` OG + Twitter metadata

OG image URLs resolve correctly on Vercel because `metadataBase` is set in `layout.tsx`.
