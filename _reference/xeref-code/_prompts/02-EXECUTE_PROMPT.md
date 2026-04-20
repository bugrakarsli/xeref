# Claude Code — Execute prompt (use Sonnet 4.6 after approving the plan)

Implement the approved `/code` New session + Routines plan now.

## Rules
- Apply only the agreed file creations/edits.
- Preserve all existing infrastructure and styles.
- Reuse existing sidebar and chat input where possible.
- Add the GitHub repository button to the existing chat input with the smallest safe change.
- Use Supabase for `routines`, `routine_runs`, `code_sessions`.
- Add the migration and RLS policies exactly as in `_reference/xeref-code/supabase/migrations/20260420_routines.sql`.
- Add the `rewrites()` block from `_reference/xeref-code/NEXT_CONFIG_PATCH.md` into `next.config.ts`.
- Keep user-facing URLs exactly:
  - `/code`
  - `/code/session_<ULID>`
  - `/code/routines`
  - `/code/routines/trig_01<ULID>`
- If an existing file conflicts with the reference file, adapt the reference to
  the repo instead of overwriting.

## Reference implementation blueprint
`_reference/xeref-code/` contains:
- `IMPLEMENTATION_PLAN.md`
- `NEXT_CONFIG_PATCH.md`
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

## Before writing code
1. Inspect the real repo structure.
2. Confirm exact target paths.
3. Reconcile naming/imports with the existing project.
4. Then implement.

## After implementation
- List every created file.
- List every edited file.
- Note any env additions needed.
- Note the exact Supabase CLI / SQL command to run for the migration.
- Run lint + typecheck and report results.
