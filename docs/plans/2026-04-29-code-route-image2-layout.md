# Plan — `/code` becomes the Claude-Code-style workspace (Image #2 layout)

> **Save final approved copy to**: `docs/plans/2026-04-29-code-route-image2-layout.md`
> (Plan-mode constraint forces this draft to live in `~/.claude/plans/`. After approval, copy to `docs/plans/` per project convention.)

## Context

Today the standalone `/code` route ships a barebones layout (Image #3): `app/code/layout.tsx` mounts a 64-wide `CodeSidebar` with only "+ New session" and "Routines"; `app/code/page.tsx` eagerly inserts a `code_sessions` row and redirects to `/code/<id>`; the session page renders an empty transcript placeholder + `ChatInputWithGitHub`.

The dashboard at `/` exposes a "Code" tab in its outer sidebar. That tab maps to `ViewKey 'code_session'` and renders `CodeSessionView` (slim header + transcript + composer) inside `DashboardShell`.

We want one Code experience, not two. The target is the Claude-Code-style workspace from Image #2: a richer left rail (New session · Routines · Dispatch Beta · Customize · More · Pinned · Recents) and a center landing pane (Welcome back, Bugra · Sessions cards · composer at the bottom). The dashboard's Code tab will redirect to `/code` so there's a single source of truth.

## Decisions (locked via AskUserQuestion)

- **Layout target**: Build the Image #2 layout from scratch as the `/code` shell.
- **Shell relationship**: `/code` stays standalone (own layout). Dashboard `/` Code tab redirects to `/code` — no nested DashboardShell wrap.
- **/code root**: No auto-create. Show landing center pane; sessions are created lazily on first message send.
- **Data wiring**:
  - Sessions cards (center) + Recents (sidebar): real data from `code_sessions` Supabase table.
  - "Needs input" / "Unread" badges: heuristic for now (e.g. `last_message_role` from `code_messages`); if unclear in v1, mock with simple flag.
  - Pinned + Drag to pin: stub UI only, no DnD.
  - Dispatch: nav stub → new `/dispatch` "coming soon" page.
  - Customize: links to existing `/customize` route.
  - More: expandable placeholder items (no real children yet).
  - Composer footer ("Default" button + "Accept edits" + Sonnet 4.6 · Medium label): visual only.

## Files to modify / create

### Modify

- `app/code/page.tsx` — drop the auto-insert + redirect. Become a real page: server-fetch user + sessions, render `<CodeLanding firstName={...} sessions={...} />`.
- `app/code/layout.tsx` — keep the layout shape but swap to the rebuilt sidebar; ensure it has full-bleed dark background and the "Claude Code · Research preview" header chip in the sidebar top.
- `app/code/_components/CodeSidebar.tsx` — full rebuild to match Image #2 (see Section: Sidebar spec).
- `app/code/session/[sessionId]/page.tsx` — keep current behaviour but restyle header strip to match the polish of Image #2 (session title + small id beneath, no other change). Transcript + composer continue to use existing components.
- `components/dashboard/dashboard-shell.tsx`:
  - Code tab handler: `router.push('/code')` instead of `setActiveView('code_session')` (around L70-74 tab map and L325-396 view switch).
  - Remove `'code_session'` and `'code_routines'` cases from the view switch (and stop importing `CodeSessionView`, `CodeRoutinesView` if no other call sites use them — verify with Grep).
  - History list inside outer Sidebar (L1229-1249 in `components/dashboard/sidebar.tsx`) — keep, it's still useful for Chat tab. Confirm it doesn't reference `code_session` ViewKey.
- `lib/types.ts` — leave `'code_session'` and `'code_routines'` ViewKeys in the union for now (cheap to keep; remove only after confirming zero usages elsewhere).

### Create

- `app/code/_components/CodeLanding.tsx` — center pane. Welcome banner with user first name + starburst icon, "Sessions" header + cards list, bottom composer.
- `app/code/_components/SessionCard.tsx` — reusable card row: status dot, badge ("Needs input" / "Unread"), title, repo full name, age, chevron. Click → `router.push('/code/<id>')`.
- `app/code/_components/SidebarRecents.tsx` — flat list of recent sessions with status dot + title; click → navigate to session.
- `app/code/_components/SidebarSection.tsx` — small layout helper for "Pinned" / "Recents" headings + items.
- `app/dispatch/page.tsx` — simple "Dispatch — coming soon" placeholder.

### Reuse (no changes)

- `app/code/_components/ChatInputWithGitHub.tsx` — composer + repo picker. Used by both `CodeLanding` (for the bottom composer; we pass `sessionId={undefined}` and let the existing lazy-create flow run on first send) and `app/code/session/[sessionId]/page.tsx`.
- `app/code/_components/GitHubRepoButton.tsx` — already provides "Select repo" popover.
- `app/actions/code-sessions.ts` → `getUserCodeSessions()` — server action for both Sessions cards and Recents.
- `lib/supabase/server.ts` — for fetching `code_messages` to derive "Needs input" / "Unread" heuristic if we go beyond mock.

## Sidebar spec (CodeSidebar rebuild)

Layout — `<aside className="w-64 shrink-0 border-r ... flex flex-col">`:

1. **Top brand row** — "Claude Code" wordmark + "Research preview" chip (right side: a sidebar-collapse icon button + a search icon button — both visual stubs for now).
2. **Primary actions** (gap-1):
   - `+ New session` — button. On click: navigate to `/code` (the landing). The session is created lazily on first message.
   - `⚡ Routines` — `<Link href="/code/routines">`, active styling when pathname starts with `/code/routines`.
   - `📋 Dispatch` + `Beta` chip — `<Link href="/dispatch">`.
   - `🛍️ Customize` — `<Link href="/customize">`.
   - `▾ More` — `<button>` toggling a local boolean; reveals 2-3 placeholder items (e.g. "Settings", "Help") that are simple `<a>` to existing routes or `#`.
3. **Pinned section** — heading "Pinned" + a single greyed row "📌 Drag to pin" (no DnD; static placeholder).
4. **Recents section** — heading "Recents" + flat list of sessions from `getUserCodeSessions()`, sorted by `created_at` desc, capped at ~10. Each row: status dot + truncated title.
5. **Bottom account chip** — user avatar + name. Reuse the existing pattern from `components/dashboard/sidebar.tsx` (whatever bottom chip currently uses) or build a slim version that matches Image #2's "👤 Bugra Karsli" + small badge on the right.

Styling: match `bg-[var(--color-bg)]` / muted hover states; spacing matches the existing dashboard sidebar tokens to keep the design cohesive.

## Center pane spec (CodeLanding)

```
              ✦ Welcome back, {firstName}

              Sessions
              ┌──────────────────────────────────────────────────────────┐
              │ • Needs input  Fix GitHub OAuth …      bugrakarsli/xeref │
              │                                              1d  ›       │
              ├──────────────────────────────────────────────────────────┤
              │ • Unread       Analyze README …    bugrakarsli/claw-…  › │
              └──────────────────────────────────────────────────────────┘

                                    ⋯

              [☁ Default] [+ Select repo…]                       🦀
              ┌──────────────────────────────────────────────────────────┐
              │ hi                                                    ↵  │
              └──────────────────────────────────────────────────────────┘
              Accept edits  ⊞ + 🎤 ▾                Sonnet 4.6 · Medium
```

- Welcome banner: `firstName` derived server-side from `user.user_metadata.full_name?.split(' ')[0]` or `user.email.split('@')[0]`.
- Sessions cards: only the most recent 3-5; "Show all" link beneath if there are more (defer; v1 just renders top 5).
- Badges:
  - "Needs input" = sessions where the most recent message is from assistant and a tool call is pending — for v1 mock to a simple boolean derived from the title/created_at, OR add a `status` enum on `code_sessions` later. **For this PR**: read `last_message_role` if cheap; otherwise mock all to "Unread" except the most recent.
  - "Unread" = read receipts not implemented yet → treat any session with messages but no `last_seen_at` as unread (v1: mock).
- Bottom composer: reuse `ChatInputWithGitHub` with `sessionId={undefined}`. The existing lazy-create flow in `CodeSessionView`-style code creates the session via `POST /api/sessions` on first send. **Verify**: `ChatInputWithGitHub` already supports `sessionId?: string` — if not, add the lazy path (preferred: extract a thin `useLazySessionCreate()` helper).
- "Default" button (left of "Select repo…"): visual-only `<button>` styled like a chip — no onClick logic.
- "Accept edits" footer: visual-only static text + decorative icons.

## Implementation steps

1. **Rebuild `CodeSidebar`** (Task #1).
   - Author all sub-components inline or in `_components/sidebar/*` if it grows past ~150 lines.
   - Wire Recents data via a thin server boundary: keep `CodeSidebar` as a Client Component, fetch sessions in `app/code/layout.tsx` (server) and pass down as a prop, OR convert the layout to keep Recents loaded once. Simpler: pass `sessions` from layout → CodeSidebar.
   - Verify: navigate to `/code`, sidebar shows all sections; clicking each link/route works (Routines, Dispatch placeholder, Customize, More toggle).

2. **Build `CodeLanding`** (Task #2).
   - Server component receives `firstName` and `sessions` props. Renders Welcome + cards + `<ChatInputWithGitHub />` (Client subtree).
   - SessionCard click → `router.push(\`/code/\${id}\`)`.

3. **Replace `/code/page.tsx` body** (Task #3).
   - Remove `redirect()` + `insert()`. Keep `force-dynamic`. Fetch user + `getUserCodeSessions()`. If no user, redirect to `/login`. Render `<CodeLanding firstName={...} sessions={...} />`.

4. **Redirect dashboard Code tab** (Task #4).
   - In `dashboard-shell.tsx`, find tab handler for `'code'` SidebarTab. Replace its body with `router.push('/code')`. Remove `case 'code_session'` and `case 'code_routines'` from the activeView switch (keep the ViewKey union for safety).
   - Grep for remaining usages of `code_session` / `code_routines` ViewKeys; confirm no orphans.
   - Confirm `CodeSessionView` and `CodeRoutinesView` imports are removed if unused.

5. **Add `/dispatch` stub** (Task #5).
   - `app/dispatch/page.tsx` exporting a centered "Dispatch · Beta — coming soon" message. No layout customization.

6. **Verify session page styling** (Task #6).
   - Open `/code/session/<id>` and confirm header + transcript area + composer render correctly inside the new sidebar shell. Adjust header padding/typography if it looks off vs. Image #2.

## Verification

- `npm run dev`, then:
  - **Landing**: `http://localhost:3000/code` → matches Image #2 (sidebar sections + Welcome + Sessions cards + composer). No DB row created on page load (check Supabase `code_sessions` count before/after navigating).
  - **Lazy create**: type a message and send → new session row created, redirected/transitioned to `/code/<id>`.
  - **Session page**: `http://localhost:3000/code/<existing-id>` → same sidebar; center shows session header + transcript + composer.
  - **Dashboard redirect**: `/`, click the Code sidebar tab → URL becomes `/code`.
  - **Sub-routes**: Routines, Dispatch (coming soon), Customize all reachable from sidebar; active state lights up correctly.
  - **Recents**: sub-sidebar shows actual recent sessions; clicking one navigates to that session.
  - **Stubs do not throw**: clicking "+ Drag to pin", "More" expand, "Default" button, "Accept edits" footer — all render without runtime errors and don't fire spurious requests.
- `npm run lint` clean.
- `npm run build` clean (App Router type-checks server/client boundaries).
- Manual responsive check: 1280px and 1920px widths look reasonable (Image #2 is desktop-only — no mobile spec for this round).

## Out of scope (explicit)

- Real "Needs input" / "Unread" status pipeline (would need `code_messages` schema additions — defer).
- Pinned drag-and-drop and persistence.
- "Default" agent profile picker behaviour.
- "Accept edits" auto-apply toggle.
- Mobile / sub-1024px layout for `/code`.
- Removing `'code_session'` / `'code_routines'` from `ViewKey` union (cleanup PR after we confirm no consumers remain).
