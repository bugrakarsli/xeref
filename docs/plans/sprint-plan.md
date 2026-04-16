# Xeref.ai Sprint Plan
> Generated: 2026-04-16 | Version: 1.0
> Execute via Claude Code + Antigravity IDE
> **Rule:** Execute ONE task at a time. Mark `[x]` when done. Never skip ahead.

---

## How to Use This File with Claude Code

Paste this prompt at the start of each session:
```
Read sprint-plan.md. Find the first unchecked [ ] task. Before writing any code:
1. Show which files you will inspect
2. Describe the exact change you will make
3. Ask for confirmation
Then execute only that one task. When done, mark it [x] in sprint-plan.md.
```

---

## Sprint 1 — Branding & Bug Fixes
> Estimated time: 2–3 hrs | Risk: Low | No dependencies

### TASK-01 · Chrome Tab Title Fix
- **Goal:** Tab shows `Xeref - xeref.ai` instead of `xeref.ai - xeref.ai`
- **Files:** `app/layout.tsx`, `public/manifest.json`
- **Change:** Set `metadata.title.default = "Xeref"` and `template = "%s | Xeref"`. Update manifest `name`/`short_name`.
- **Done when:** Chrome tab reads `Xeref - xeref.ai` after build.
- [x] Complete

---

### TASK-02 · Logo & Favicon White Background Fix
- **Goal:** Logo and favicon render with transparent background on all surfaces.
- **Files:** Logo component (find by searching `xeref.svg`), `app/layout.tsx` head, `public/favicon.ico`
- **3 checks to make:**
  1. Remove any `bg-white` / `bg-background` / `background: #fff` from the logo wrapper `div`
  2. Replace `<link rel="icon" href="/favicon.ico">` with `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`
  3. Confirm `public/xeref.svg` has `background="none"` or no fill on the root `<svg>` element
- **Done when:** Logo shows no white box in both light and dark mode. Favicon has transparent bg in Chrome tab.
- [x] Complete

---

### TASK-03 · AgentPanel Close Button Fix
- **Goal:** Clicking the X button in AgentPanel actually closes it.
- **Files:** Search for `AgentPanel` component and the UI store (`uiStore`, `useUIStore`, or similar)
- **Steps:**
  1. Find the close button's `onClick` handler
  2. Trace it to the store action — confirm `isAgentPanelOpen` (or equivalent) is being set to `false`
  3. If the action is missing or unbound, wire it: `const close = useUIStore(s => s.closeAgentPanel)` and attach to `onClick`
- **Done when:** Open AgentPanel → click X → panel closes. Re-open → close works again.
- [x] Complete

---

### TASK-04 · Prevent Empty New Chat Duplication
- **Goal:** If the active chat is already empty (0 messages), clicking "New Chat" should NOT create another entry — just focus the chat input.
- **Files:** Search for `createNewChat` or `handleNewChat` in sidebar/hooks
- **Change:**
  ```ts
  if (currentChat?.messages.length === 0) {
    chatInputRef.current?.focus();
    return;
  }
  createNewChat();
  ```
- **Done when:** Empty chat → click New Chat → no duplicate in sidebar. Chat with messages → click New Chat → new entry IS created.
- [x] Complete

---

## Sprint 2 — New UX Components
> Estimated time: 3–4 hrs | Risk: Low-Medium | Sprint 1 must be done first

### TASK-05 · Scroll-to-Top Button (Login/Landing Page)
- **Goal:** Circular up-arrow button appears centered above footer when user scrolls past 70% of the login page. Clicking scrolls to top of page.
- **New file:** `components/ui/ScrollToTopButton.tsx`
- **Behaviour:**
  - Appears when `scrollY / (scrollHeight - innerHeight) > 0.70`
  - Fixed position: `bottom: 96px`, `left: 50%`, `transform: translateX(-50%)`
  - `window.scrollTo({ top: 0, behavior: 'smooth' })` on click
  - Smooth fade in/out with CSS transition
- **Add to:** Login page layout or `app/(auth)/login/page.tsx`
- **Done when:** Scroll 70%+ down login page → button appears centered → click → page scrolls to top → button disappears.
- [x] Complete

---

### TASK-06 · Scroll-to-Bottom Button (Chat + AgentPanel)
- **Goal:** Circular down-arrow button appears in main chat and AgentPanel when user is scrolled more than 100px from the bottom. Clicking jumps to latest message.
- **New file:** `components/ui/ScrollToBottomButton.tsx`
- **Behaviour:**
  - Receives `scrollContainerRef: RefObject<HTMLElement>` as prop
  - Appears when `scrollHeight - scrollTop - clientHeight > 100`
  - Positioned `absolute bottom-4 left-1/2 -translate-x-1/2` inside the scroll container's parent
  - `scrollContainerRef.current.scrollTo({ top: scrollHeight, behavior: 'smooth' })` on click
- **Add to:**
  - `components/Chat/ChatContainer.tsx` (pass ref to the messages scroll div)
  - `components/AgentPanel/AgentPanelChat.tsx` (same pattern)
- **Done when:** Long chat → scroll up → button appears centered → click → jumps to bottom → button disappears.
- [x] Complete

---

### TASK-07 · Customize Page — New Layout + Xeref Branding
- **Goal:** Customize page gets its own layout (no main app sidebar), with a narrow left nav (back arrow + Skills + Connectors links), and a landing page with two cards. All "Claude" text replaced with "Xeref".
- **New/modified files:**
  - `app/(app)/customize/layout.tsx` — new layout, no main sidebar
  - `app/(app)/customize/page.tsx` — landing with two cards
  - `components/customize/CustomizeNav.tsx` — narrow left nav
  - `components/UserNav.tsx` — Customize link collapses sidebar on click
- **Landing page cards:**
  - "Connect your apps" → `/customize/connectors`
  - "Create new skills" → `/customize/skills`
- **Sidebar collapse:** `setSidebarCollapsed(true)` when navigating to `/customize`. Back arrow in CustomizeNav re-expands sidebar and navigates to `/`.
- **Branding:** Global find-replace `"Claude"` → `"Xeref"` scoped to `/app/(app)/customize/` and `/components/customize/` directories only.
- **Reference:** See attached image-4 for the target layout.
- **Done when:** Click Customize in UserNav → sidebar collapses → two-card landing page appears → Skills/Connectors nav works → back arrow returns to normal app with sidebar restored.
- [x] Complete

---

## Sprint 3 — Roadmap In-Progress Items
> Estimated time: 4–6 hrs | Risk: Medium-High | Sprints 1+2 must be done first

### TASK-08 · Projects CRUD + AI Goal Decomposition
- **Goal:** Complete the AI decomposition step — when a project is created, call Gemini to break the description into sub-goals and save them to Firestore.
- **Files:** Find `ProjectsService`, `createProject` mutation, Gemini API integration
- **Steps:**
  1. After project document is written to Firestore, call Gemini with the project description
  2. Parse the response into an array of sub-goals
  3. Write each sub-goal as a subcollection document under the project
  4. Show decomposed goals in the Projects UI
- **Done when:** Create project → sub-goals auto-appear → persisted in Firestore.
- [x] Complete

---

### TASK-09 · Tasks & Notes CRUD + Daily Targets
- **Goal:** Ensure daily targets reset correctly via Cloud Scheduler and Notes editor saves on blur.
- **Files:** Cloud Scheduler config, Notes editor component, Tasks CRUD service
- **Steps:**
  1. Verify Cloud Scheduler job fires daily at midnight (Istanbul timezone, `America/[Istanbul]`)
  2. Confirm the reset function sets `dailyTarget.completed = 0` and `dailyTarget.resetAt = today`
  3. Confirm Notes editor calls `updateNote()` on the `onBlur` event
- **Done when:** Notes save without a save button. Daily targets reset at midnight.
- [x] Complete

---

### TASK-10 · Xeref MCP Server v1 — Audit + Complete
- **Goal:** All CRUD tools defined in the MCP spec are implemented and tested.
- **Files:** MCP server implementation, tool definitions
- **Steps:**
  1. List all tools currently defined vs tools in the spec
  2. Implement any missing tools
  3. Add a basic integration test for each tool (create → read → update → delete)
- **Done when:** All spec tools pass CRUD integration tests.
- [x] Complete

---

### TASK-11 · Guest Mode (Supabase Anon + Rate Limit)
- **Goal:** Guest users can sign in anonymously and are rate-limited at the defined threshold.
- **Files:** Auth config, middleware, rate-limit middleware
- **Steps:**
  1. Verify Supabase anon sign-in triggers correctly on first load
  2. Verify rate-limit middleware increments a counter per `anon_uid` per minute
  3. Test that exceeding the limit returns a 429 with a clear message
- **Done when:** Guest flow works end-to-end. Rate limit triggers and shows user-facing message.
- [x] Complete

---

### TASK-12 · Workflows — Cron + Webhook Triggers
- **Goal:** Users can create workflows triggered by a cron schedule or an incoming webhook.
- **Files:** Workflows feature directory, webhook receiver endpoint, cron expression UI
- **Steps:**
  1. Complete the webhook receiver endpoint (verify it parses payload and triggers the right workflow)
  2. Add a cron expression input with human-readable preview (`"Every day at 9am"`)
  3. Test end-to-end: schedule fires → workflow runs → result logged
- **Done when:** Both trigger types work end-to-end in dev environment.
- [x] Complete

---

### TASK-13 · Stats — Heatmap + Velocity Charts
- **Goal:** Activity heatmap and velocity chart are wired to real Firestore data.
- **Files:** Stats page, heatmap component, velocity chart component, Firestore query for task completion events
- **Steps:**
  1. Write Firestore query that returns task completions grouped by day for the last 52 weeks
  2. Feed data into heatmap component (GitHub-style grid)
  3. Write query for tasks completed per week over the last 12 weeks
  4. Feed into velocity chart (Recharts `AreaChart` or `BarChart`)
- **Done when:** Heatmap shows real completion data. Velocity chart reflects actual weekly output.
- [x] Complete

---

## Progress Tracker

| Task | Sprint | Status |
|------|--------|--------|
| TASK-01 Tab Title | S1 | ✅ Done |
| TASK-02 Logo/Favicon | S1 | ✅ Done |
| TASK-03 AgentPanel Close | S1 | ✅ Done |
| TASK-04 Empty New Chat | S1 | ✅ Done |
| TASK-05 Scroll-to-Top | S2 | ✅ Done |
| TASK-06 Scroll-to-Bottom | S2 | ✅ Done |
| TASK-07 Customize Layout | S2 | ✅ Done |
| TASK-08 Projects AI Decomp | S3 | ✅ Done |
| TASK-09 Tasks + Daily Targets | S3 | ✅ Done |
| TASK-10 MCP Server Audit | S3 | ✅ Done |
| TASK-11 Guest Mode | S3 | ✅ Done |
| TASK-12 Workflows | S3 | ✅ Done |
| TASK-13 Stats Charts | S3 | ✅ Done |

---

## Claude Code Session Starter Prompts

**Begin a task:**
```
Read sprint-plan.md. Find the first [ ] incomplete task.
Before coding: list files to inspect, describe the exact change, confirm with me.
Then execute only that one task. When done, mark [x] and update the tracker table.
```

**Resume after a break:**
```
Read sprint-plan.md. Show me the current progress tracker.
Find the next incomplete task and describe it to me before touching any code.
```

**End of session checkpoint:**
```
Update sprint-plan.md: mark all completed tasks [x] and update the tracker table statuses.
Show me a summary of what was done and what's next.
```
