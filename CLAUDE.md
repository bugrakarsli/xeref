# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Is

**xeref-claw** is an AI agent builder UI backed by Supabase. Users browse a catalog of 48+ features organized by the CLAWS methodology, select what they want, save named project configurations, and get a generated prompt to paste into Antigravity IDE to build their custom agent.

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
NEXT_PUBLIC_SUPABASE_URL=        # From Supabase dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # From Supabase dashboard → Settings → API
SUPABASE_SERVICE_ROLE_KEY=       # Keep server-only — never expose to client
NEXT_PUBLIC_SITE_URL=            # http://localhost:3000 in dev, https://xeref.ai in prod
```

## Architecture

### Key Directories

- `app/` — App Router pages:
  - `layout.tsx` — Root layout (dark mode, OG metadata, favicon)
  - `page.tsx` — Landing page
  - `builder/page.tsx` — Main feature selector (Client Component)
  - `login/page.tsx` — Auth page (magic link + Google OAuth)
  - `auth/callback/route.ts` — OAuth/magic link callback handler
  - `actions/projects.ts` — Server Actions for project CRUD
- `components/ui/` — shadcn/ui primitives
- `components/` — App-specific: `FeatureGrid`, `FeatureCard`, `CategoryFilter`, `Basket`, `XerefLogo`
- `lib/` — Core logic:
  - `types.ts` — All TypeScript interfaces (`Feature`, `Category`, `Project`, `UsageEvent`)
  - `features.ts` — Catalog of all 48+ features with full metadata
  - `prompt-generator.ts` — Converts selected feature IDs → copy-paste Antigravity prompt
  - `utils.ts` — `cn()` Tailwind merge utility
  - `supabase/client.ts` — Browser Supabase client (for `'use client'` components)
  - `supabase/server.ts` — Server Supabase client (for Server Components and Server Actions)
- `proxy.ts` — Refreshes Supabase session tokens on every request (Next.js 16 uses `proxy.ts` + `export function proxy()` instead of the deprecated `middleware.ts`)

### Supabase Client Rules

- **Browser client** (`lib/supabase/client.ts`): use in `'use client'` components only — call `createClient()` inside event handlers, not at component body level (Next.js SSR-renders client components during build, so calling it at top level will fail if env vars aren't set)
- **Server client** (`lib/supabase/server.ts`): use in Server Components, Server Actions, and Route Handlers
- Always call `getUser()` (not `getSession()`) when checking auth on the server — `getSession()` does not validate the JWT
- `cookies()` from `next/headers` must be `await`ed in Next.js 16

### Database Schema (Supabase)

Run the SQL from `supabase/schema.sql` in the Supabase SQL Editor to set up:
- `profiles` — auto-created from `auth.users` via trigger
- `projects` — user's saved agent configurations (`selected_feature_ids text[]`)
- `usage_events` — analytics log (`event_type`, `metadata jsonb`)

All tables have RLS enabled; users can only access their own rows.

### Auth Flow

Magic link + Google OAuth → `/auth/callback` → `/builder`

The builder page (`app/builder/page.tsx`) is a Client Component that resolves auth state via `useEffect` + browser Supabase client. Auth state is passed as `isAuthenticated` prop to `Basket`. Unauthenticated users can still use the full builder and generate prompts — they just can't save projects.

### CLAWS Feature Categories

Features are organized by category ID: `connect` | `listen` | `archive` | `wire` | `sense` | `agent-architecture`. This ordering matters — prompt generation groups features in CLAWS order.

### Dynamic Icon Loading

Lucide icons are referenced by string names in feature data and loaded at runtime:
```ts
const IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.HelpCircle
```

When adding features to `features.ts`, use valid Lucide icon names.

## Tech Stack

- **Next.js 16** with App Router, React Server Components
- **React 19** with Babel React Compiler enabled (`next.config.ts`: `reactCompiler: true`)
- **Tailwind v4** — uses `@import "tailwindcss"` syntax (not `@tailwind` directives)
- **shadcn/ui** with `new-york` style and `neutral` base color
- **Supabase** — auth (magic link + Google OAuth) and Postgres database
- **`@supabase/ssr`** — correct package for Next.js App Router (not the deprecated `auth-helpers-nextjs`)
- **Framer Motion** — animations on feature cards and grid
- **Sonner** — toast notifications

## Theme

Dark mode is forced globally in `layout.tsx` via `className="dark"` on `<html>`. Colors use OKLch in CSS variables defined in `globals.css`. Do not add light/dark toggle logic — the app is intentionally dark-only.

## Branding Assets

All three assets exist in `public/`:
- `xeref-logo.png` — used in `XerefLogo` component
- `xeref-favicon.png` — wired in `layout.tsx` metadata `icons`
- `xeref-ogimage.png` — wired in `layout.tsx` OG + Twitter metadata

OG image URLs resolve correctly on Vercel because `metadataBase` is set in `layout.tsx`.
