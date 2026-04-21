# Implementation Plan: Roadmap — MCP Server + Telegram Bot

## Context
Scope trimmed to xeref-native features only. Content/knowledge features (Classroom, Memory, YouTube, OCR, Bookmarks) moved to portfolio site. This plan covers Step 0 cleanup + the two remaining xeref roadmap items.

---

## Step 0 — Cleanup: Mark Already-Done Items on Login Page

All code is complete — only `login/page.tsx` roadmap array needs updating:

| Item | Action |
|------|--------|
| Projects CRUD + AI goal decomposition | `partial` → `done` |
| Tasks & Notes CRUD + Daily Targets | `partial` → `done` |
| Workflows: cron + webhook triggers | `partial` → `done` |
| Stats: heatmap, velocity charts | `partial` → `done` |
| Guest mode (Supabase anon + rate limit) | Remove entry |

**File:** `app/login/page.tsx`

---

## 1 — Xeref MCP Server v1

**What it is:** MCP-over-HTTP endpoint exposing xeref CRUD as callable tools for external agents.

**Implementation:**
1. Create `app/api/mcp/route.ts` — POST handler, bearer token auth
2. Tool registry:
   - `list_projects` / `create_project` / `delete_project`
   - `list_tasks` / `create_task` / `update_task` / `delete_task`
   - `list_notes` / `create_note` / `update_note` / `delete_note`
   - `suggest_next_task` (top 3 priority-sorted todos)
3. Auth: bearer token stored in `profiles.mcp_token` — add column via Supabase migration
4. Add MCP token display + regenerate button in Settings view

**Reuse:** `app/actions/tasks.ts`, `app/actions/projects.ts`, `app/actions/notes.ts`

**Files:** new `app/api/mcp/route.ts`, `components/dashboard/settings-view.tsx`, Supabase migration

**Effort:** ~4 hours

---

## 2 — Telegram Bot Wizard

**What it is:** Guided UI to connect a personal Telegram bot to the user's xeref agent.

**Implementation:**
1. Add `'deploy'` to `ViewKey` in `lib/types.ts`
2. Create `components/dashboard/deploy-view.tsx` — Telegram setup tab
3. Telegram tab: paste bot token → POST `/api/bots/telegram/register` → sets Telegram webhook
4. Create `app/api/bots/telegram/register/route.ts` — stores token, calls Telegram setWebhook
5. Create `app/api/bots/telegram/[userId]/route.ts` — receives messages, routes through chat API, replies
6. Store token in `profiles.telegram_bot_token` via Supabase migration
7. Show bot status (active/inactive) + test message button in deploy view

**Files:** `lib/types.ts`, `components/dashboard/sidebar.tsx`, `components/dashboard/dashboard-shell.tsx`, new `components/dashboard/deploy-view.tsx`, new `app/api/bots/telegram/register/route.ts`, new `app/api/bots/telegram/[userId]/route.ts`, Supabase migration

**Effort:** ~5 hours

---

## Execution Order

1. Step 0 — instant login page wins
2. MCP Server — unblocks external agent access
3. Telegram bot — first deploy channel

## Verification

- `npm run build` — no TypeScript errors
- MCP: test tool calls with curl using a valid bearer token
- Telegram: send a message to the bot, verify reply comes back through the chat API
- Login page: confirm all 4 items show as done, guest mode entry gone
