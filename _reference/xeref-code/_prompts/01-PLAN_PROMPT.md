# Claude Code — Plan mode prompt

You are working inside my existing xeref repository.

## Goal

Implement a new `/code` section with two primary views:

1. **New session** (default at `/code`, creates and opens `/code/session_<ULID>`)
2. **Routines** (at `/code/routines` with detail at `/code/routines/trig_01<ULID>`)

## Constraints

- Preserve all existing files and infrastructure.
- Do not break current app behavior.
- Keep existing `.env.local` (append only).
- Prefer additive changes over refactors.
- Reuse existing code tab sidebar and existing chat input if present.
- Data layer: **Supabase** (additive migration only).
- Plan first, wait for approval, then execute with Sonnet 4.6.

## Reference implementation

A reference blueprint is attached in the repo under `_reference/xeref-code/`:

- `IMPLEMENTATION_PLAN.md`
- `NEXT_CONFIG_PATCH.md`
- `src/**` (full route tree and API handlers)
- `supabase/migrations/20260420_routines.sql`

Use it as the blueprint. Adapt naming/imports to match my repo when needed.

## Target UX

### `/code`

- Show existing code-tab sidebar (or use the provided `CodeSidebar.tsx`).
- Default content = New session.
- Clicking **New session** → create or open a session → navigate to
  `/code/session_<ULID>`.
- New session view reuses existing chat input area + adds a GitHub repository
  connector button near the input.

### `/code/routines`

- Title, usage text, All routines / Calendar tabs, routine cards, New routine button.

### `/code/routines/trig_01<ULID>`

- Title, active state, next run, repositories, instructions panel, connectors,
  runs list with filters, Run now button.

### New routine modal

- Name, prompt, repository selector, triggers (Schedule / GitHub event / API),
  connectors list, Create/Cancel.

## Data model

Use Supabase. Required tables: `routines`, `routine_runs`, `code_sessions`.
Add RLS policies tied to `auth.uid()`. Additive schema only.

## IDs

- Routine id: `trig_01` + sortable unique suffix (Crockford base32 ULID, 24 chars)
- Session id: `session_` + sortable unique suffix (ULID, 26 chars)

## Routing

- Public URLs must be:
  - `/code/session_<ULID>`
  - `/code/routines/trig_01<ULID>`
- For session URLs, add the rewrite from `NEXT_CONFIG_PATCH.md` to
  `next.config.ts` (smallest safe change).
- Routine URLs need no rewrite.

## Existing component integration

- Find current code tab sidebar and existing chat input files.
- Reuse them rather than replacing them.
- If the chat input does not support injecting a GitHub button, add the smallest
  possible extension point (for example a `leadingToolbar` slot prop).

## Deliverable for this step (PLAN ONLY)

1. Inspect the repo.
2. Identify the current code tab route, sidebar, and chat input files.
3. Map my current structure to the target implementation.
4. Produce a precise plan containing:
   - files to create (with exact paths)
   - files to edit (with exact diffs or patch summaries)
   - migration impact
   - dependency installs needed
   - env vars to add
   - rewrites to merge
   - any risks
5. Do NOT modify files yet. Wait for my approval.
