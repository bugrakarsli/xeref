# Plan: Update Login Page Dashboard & Roadmap Sections

**Date:** 2026-04-13

## Context

The login page (`app/login/page.tsx`) shows only 2 of 12 dashboard cards as LIVE (Home, XerefClaw), but since then 5 more features have been fully implemented (All Tasks, Calendar, Workflows, Chats, Stats). The Roadmap section still shows all Phase 1 items as incomplete, even though several are done. We need to update both sections to reflect actual build progress, and create an execution plan for remaining Phase 1 + Phase 2 work.

## Skills to Use

1. **brainstorming** — Design the visual treatment for done/partial/not-done roadmap items
2. **page-cro** — Optimize the updated subtitle copy and section layout for conversion

---

## Part A: Login Page Updates (app/login/page.tsx)

### A1. Dashboard Cards — Update LIVE Status (lines 273-285)

Set `live: true` for 5 additional cards:

| Card | Line | Change |
|------|------|--------|
| All Tasks | 276 | `live: false` → `live: true` |
| Calendar | 281 | `live: false` → `live: true` |
| Workflows | 282 | `live: false` → `live: true` |
| Chats | 283 | `live: false` → `live: true` |
| Stats | 284 | `live: false` → `live: true` |

Remain COMING SOON (5): Projects, Classroom, Memory, Deploy, Inbox

### A2. Dashboard Subtitle (line 269)

Replace:
```
Home and XerefClaw are live. The full platform rolls out in phases.
```
With updated copy reflecting 7/12 sections live (use page-cro skill to refine exact wording).

### A3. Roadmap Data Model — Replace `priority: boolean` with `status` (lines 342-385)

Change each roadmap item from `{ text, priority }` to `{ text, status }` where status is `'done' | 'partial' | 'todo'`.

**Phase 1 — Core Platform:**
| Item | Status | Rationale |
|------|--------|-----------|
| Classroom section + semantic search | `todo` | Not implemented |
| UserContext onboarding form | `done` | onboarding-modal.tsx fully functional |
| Projects CRUD + AI goal decomposition | `partial` | CRUD exists, no AI goal decomposition |
| Tasks & Notes CRUD + Daily Targets | `partial` | Tasks CRUD done, Notes + Daily Targets missing |
| Xeref MCP Server v1 (all CRUD tools) | `todo` | Not implemented |
| Guest mode (Supabase anon + rate limit) | `partial` | /builder guest works, no rate limiting |
| Streaming responses in Chat | `done` | chat-interface.tsx with AI SDK streaming |

**Phase 2 — Memory & Community:**
| Item | Status | Rationale |
|------|--------|-----------|
| Gemini Embedding 2 auto-embedding | `todo` | Not implemented |
| Pinecone user namespaces + Memory dashboard | `todo` | Basic CRUD exists, no Pinecone/dashboard |
| YouTube Chat with timestamped sources | `todo` | Not implemented |
| Saved posts, bookmarks, community search | `todo` | Not implemented |
| Calendar + Google Calendar sync | `done` | calendar-view.tsx has full OAuth integration |
| Image uploads in Chat (Gemini Vision) | `done` | chat-interface.tsx supports file/image attachments |

**Phase 3 — Deploy & Automate:** All remain `todo`.

### A4. Roadmap Rendering — Status-based styling (lines 397-403)

Replace the current `priority`-based dot coloring with status-based visual treatment:
- **done**: Green dot + strikethrough text + "DONE" label
- **partial**: Yellow/amber dot + "IN PROGRESS" label
- **todo**: Muted dot (unchanged from current)

Use `brainstorming` skill to finalize the exact visual approach.

---

## Part B: Execution Plan for Incomplete Tasks

### Remaining Phase 1 (incomplete items to build):

1. **Classroom section + semantic search** — New view, new Supabase table, embedding integration
2. **AI goal decomposition** (in Projects) — Extend `app/actions/projects.ts` to auto-generate tasks from a goal
3. **Notes CRUD** — New server action file + integrate into tasks or home view
4. **Daily Targets** — New server action + UI in home-view
5. **Xeref MCP Server v1** — Build MCP server exposing projects/tasks/notes/memory tools
6. **Rate limiting for guest mode** — Add rate limiting middleware for anonymous API access

### Phase 2 tasks to build:

1. **Gemini Embedding 2 auto-embedding** — Supabase Edge Function that auto-embeds on write
2. **Pinecone user namespaces + Memory dashboard** — Memory view in dashboard, Pinecone integration
3. **YouTube Chat with timestamped sources** — YouTube transcript ingestion + citation in chat
4. **Saved posts, bookmarks, community search** — Community features + search

### Phase 2 already done (skip):
- Calendar + Google Calendar sync
- Image uploads in Chat

---

## Files to Modify

- `app/login/page.tsx` — Only file that needs code changes for Part A

## Verification

1. Run `npm run dev` and visit `/login`
2. Verify 7 cards show LIVE badge (Home, XerefClaw, All Tasks, Calendar, Workflows, Chats, Stats)
3. Verify 5 cards show COMING SOON (Projects, Classroom, Memory, Deploy, Inbox)
4. Verify Roadmap Phase 1 shows 2 done (green), 3 partial (yellow), 2 todo (muted)
5. Verify Roadmap Phase 2 shows 2 done (green), 4 todo (muted)
6. Run `npm run build` to confirm no TypeScript errors
