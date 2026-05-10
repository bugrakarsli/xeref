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

| Plan    | Allowed models                                            |
| ------- | --------------------------------------------------------- |
| `basic` | `xeref` only                                              |
| `pro`   | `xeref`, `claude-haiku-4-5-20251001`, `claude-sonnet-4-6` |
| `ultra` | All models                                                |

Disallowed requests → `403 { error, code: 'PLAN_LIMIT' }`. If `projectId` is in the request body, the project's `prompt` field is used as the system prompt.

### Dashboard View Routing

`DashboardShell` owns `activeView: ViewKey`. Defined in `lib/types.ts`:
`'home' | 'tasks' | 'stats' | 'calendar' | 'workflows' | 'inbox' | 'chat' | 'settings' | 'referral' | 'agents' | 'artifacts' | 'code'`

`RhsSidebar` only renders when `activeView === 'chat'`.

### Dynamic Icon Loading

Lucide icons are loaded by string name from feature data:

```ts
const IconComponent =
  (LucideIcons as any)[feature.icon] || LucideIcons.HelpCircle;
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

## Key Infrastructure

### Connections (`lib/connections/`)

OAuth tokens stored encrypted (AES-256-GCM) via `lib/connections/crypto.ts`. CSRF state is HMAC-SHA256 signed with a nonce + 10-min TTL in `lib/connections/oauth-state.ts`. `listConnectionsForUser()` never returns raw tokens — only `getConnectionWithSecrets()` decrypts (server-only). All require `CONNECTIONS_ENCRYPTION_KEY` (32-byte hex in `.env.local`).

Active providers: `google` | `notion` | `slack` — login + callback routes at `app/api/connections/[provider]/`.

### MCP Server (`mcp/server.ts`)

Self-hosted, single-user. Transport: stdio. Auth: `SUPABASE_SERVICE_ROLE_KEY` + `XEREF_MCP_USER_ID` env vars. Exposes CRUD tools for tasks, projects, notes, chats. Not multi-tenant — `XEREF_MCP_USER_ID` is fixed per deployment. HTTP wrapper at `app/api/mcp/route.ts`.

### Semantic Memory (`lib/pinecone.ts`)

Pinecone index. Currently scoped to `xeref_lessons` namespace (classroom feature only). Planned: `xeref_user_memory` namespace for unified cross-entity search across tasks/projects/notes/chats.

### Three-Brain Skill (`docs/doc/three-brain-SKILL.md`)

Routes work to Codex (adversarial review/rescue) or Gemini (multimodal/long-context). Installed Gemini CLI v0.1.9 does **not** support `@file` — pipe files via stdin instead: `cat file.pdf | gemini -p "your prompt"`.

---

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
