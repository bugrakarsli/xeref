# xeref /code — Implementation Plan (v2, session URLs)

Target: Next.js 16 App Router + TypeScript + Supabase. Additive only — keep
existing `.env.local` and existing chat input / sidebar components.

## Routes

- `/code`                                  → default = New session, creates + redirects to `/code/session_<ULID>`
- `/code/session_<ULID>`                   → code session chat (existing ChatInput + GitHub repo button)
- `/code/routines`                         → routines overview (list + New routine modal)
- `/code/routines/trig_01<ULID>`           → routine detail (image-3 reference)

## Public URL ↔ file mapping

| Public URL                        | File route                                         |
|-----------------------------------|----------------------------------------------------|
| `/code`                           | `src/app/code/page.tsx`                            |
| `/code/session_<ULID>`            | `src/app/code/session/[sessionId]/page.tsx` (via rewrite) |
| `/code/routines`                  | `src/app/code/routines/page.tsx`                   |
| `/code/routines/trig_01<ULID>`    | `src/app/code/routines/[triggerId]/page.tsx`       |

## ID format

- Routines:  `trig_01` + 24-char Crockford base32 ULID
- Sessions:  `session_` + 26-char ULID
- IDs generated client-side in `src/lib/ids.ts`, DB enforces PK uniqueness.

## Data layer — Supabase (additive migration)

Migration: `supabase/migrations/20260420_routines.sql`

Tables:
- `routines`       — PK is `trig_01...`
- `routine_runs`   — run history for detail page
- `code_sessions`  — lightweight record (id, repo_full_name, title)

RLS policies scoped to `auth.uid()`. No ALTER on existing tables. No Firestore
changes. Chat messages still flow through your existing chat infra.

## Existing integration

- `ChatInputWithGitHub.tsx` is a thin wrapper. Swap its commented import for
  your existing `<ChatInput/>` path. Prefer adding a `leadingToolbar` prop
  to your ChatInput so we can inject `<GitHubRepoButton/>` cleanly.
- `CodeSidebar.tsx` provides the two-action sidebar for `/code/*`. If you
  already have a code-tab sidebar, merge the two buttons into it instead.

## Env additions (add, do not overwrite)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://xeref.ai
# optional, for GitHub repo picker:
GITHUB_APP_CLIENT_ID=...
```

## File inventory

Create these new files:
- `src/lib/ids.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/app/code/layout.tsx`
- `src/app/code/page.tsx`
- `src/app/code/_components/CodeSidebar.tsx`
- `src/app/code/_components/GitHubRepoButton.tsx`
- `src/app/code/_components/ChatInputWithGitHub.tsx`
- `src/app/code/session/[sessionId]/page.tsx`
- `src/app/code/routines/page.tsx`
- `src/app/code/routines/_components/NewRoutineButton.tsx`
- `src/app/code/routines/_components/NewRoutineModal.tsx`
- `src/app/code/routines/[triggerId]/page.tsx`
- `src/app/api/routines/route.ts`
- `src/app/api/routines/[id]/route.ts`
- `src/app/api/routines/[id]/run-now/route.ts`
- `src/app/api/sessions/route.ts`
- `src/app/api/sessions/[id]/route.ts`
- `supabase/migrations/20260420_routines.sql`

Edit this existing file only:
- `next.config.ts` → merge the `rewrites()` block (see NEXT_CONFIG_PATCH.md).
