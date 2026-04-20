# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> For full setup, routes, architecture map, and tech stack — see **README.md**.

## What This App Is

**xeref** is the web app for xeref.ai — an AI agent builder and productivity dashboard. Users configure agents via the CLAWS methodology, chat with them in-app, manage tasks/workflows/artifacts, and upgrade via Creem payments.

## Commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint
npx shadcn@latest add <component-name>
```

## Environment Variables

Required in `.env.local` — see README.md for full list. Key vars:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY_BASIC` / `_PRO` / `_ULTRA` (per-plan keys, server-only)
- `CREEM_WEBHOOK_SECRET`

## Critical Rules

### Supabase Clients
- **Browser** (`lib/supabase/client.ts`): only in `'use client'` components; call `createClient()` inside handlers, not at component body level
- **Server** (`lib/supabase/server.ts`): Server Components, Server Actions, Route Handlers
- Always use `getUser()` (not `getSession()`) for server-side auth — `getSession()` doesn't validate the JWT
- `cookies()` from `next/headers` must be `await`ed

### Auth Flow
Magic link + Google OAuth → `/auth/callback` → `/` (dashboard). `app/page.tsx` calls `getUser()` and redirects to `/login` if unauthenticated. `/builder` works without auth — users can generate prompts but cannot save projects.

### Chat & Model Routing
All routing in `lib/ai/openrouter-config.ts` (server-only). Plan gating is server-enforced — client model IDs are validated before any upstream call.

| Plan   | Allowed models                                              |
| ------ | ----------------------------------------------------------- |
| `free` | `xeref-free` only                                           |
| `pro`  | `xeref-free`, `claude-haiku-4-5-20251001`, `claude-sonnet-4-6` |
| `ultra`| All models                                                  |

Disallowed requests → `403 { error, code: 'PLAN_LIMIT' }`. If `projectId` is in the request body, the project's `prompt` field is used as the system prompt.

### Dashboard View Routing
`DashboardShell` owns `activeView: ViewKey`. Defined in `lib/types.ts`:
`'home' | 'tasks' | 'stats' | 'calendar' | 'workflows' | 'inbox' | 'chat' | 'settings' | 'referral' | 'agents' | 'artifacts' | 'code'`

`RhsSidebar` only renders when `activeView === 'chat'`.

### Dynamic Icon Loading
Lucide icons are loaded by string name from feature data:
```ts
const IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.HelpCircle;
```
Use valid Lucide icon names when adding features to `features.ts`.

### Payments (Creem)
`app/actions/checkout.ts` → `createCheckout(plan, interval)` → Creem redirect URL.
`app/api/webhooks/creem/route.ts` → verifies signature, updates `profiles.plan`.
Plans: `basic` (free) · `pro` ($17/mo, $170/yr) · `ultra` ($77/mo, $770/yr)

### CLAWS Feature Categories
Category IDs: `connect` | `listen` | `archive` | `wire` | `sense` | `agent-architecture`. This order matters — prompt generation groups features in CLAWS order.

## Theme
Dark mode forced globally in `layout.tsx` via `className="dark"`. Colors use OKLch variables in `globals.css`. No light/dark toggle — intentionally dark-only.

## Branding
- `public/xeref.svg` — logo component + favicon
- `public/xeref-ai-og-image.jpg` — OG/Twitter metadata (wired in `layout.tsx`)
