# xeref-code reference package (v2 — session URLs)

Drop this entire folder into your repo as `_reference/xeref-code/`, then point
Claude Code at it with `_prompts/01-PLAN_PROMPT.md` first, and after you
approve the plan, run `_prompts/02-EXECUTE_PROMPT.md` on Sonnet 4.6.

## What's inside
- `src/` — blueprint source files for the new routes and API handlers
- `supabase/migrations/20260420_routines.sql` — additive migration
- `NEXT_CONFIG_PATCH.md` — one rewrite block to merge into `next.config.ts`
- `IMPLEMENTATION_PLAN.md` — precise plan with file inventory
- `_prompts/01-PLAN_PROMPT.md` — paste into Claude Code in Plan mode
- `_prompts/02-EXECUTE_PROMPT.md` — paste into Claude Code after approving the plan

## Public URLs
- `/code` → default New session (redirects to a fresh session)
- `/code/session_<ULID>` → code session chat
- `/code/routines` → routines overview
- `/code/routines/trig_01<ULID>` → routine detail
