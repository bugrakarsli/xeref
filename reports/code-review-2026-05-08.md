# 🛡️ Xeref — Daily Code Review
# Date: 2026-05-08
# Commits reviewed: 0

> **No commits today.** Last activity was 2026-04-27 (11 days ago).
> The checks below reflect current codebase health — useful as a baseline.

---

## TypeScript Status: 🔴 BLOCKING

**Root Cause: `node_modules/` directory is absent.** The project has no installed packages.
This causes a cascade of 5,650 TypeScript errors across 178 files — virtually all are
downstream of missing `@types/react`, `next`, `lucide-react`, etc.

**Error breakdown:**

| Error Code | Count | Description |
|------------|-------|-------------|
| TS7026 | 4,544 | JSX element implicitly `any` (no `react/jsx-runtime` types) |
| TS7006 | 418 | Parameter implicitly has `any` type |
| TS2307 | 336 | Cannot find module (all npm packages missing) |
| TS2875 | 125 | `react/jsx-runtime` path not found |
| TS2591 | 103 | Cannot find name `JSX` |
| TS7031 | 63 | Binding element implicitly has `any` type |
| TS2503 | 36 | Cannot find namespace |
| TS2322 | 14 | **Real type mismatches — see below** |
| TS7053 | 5 | Element access with implicit `any` index |
| TS18046 | 4 | **`unknown` type used as value — see below** |
| TS2882 | 2 | Other |

**Confirmed real code errors (not dependency-related):**

- `components/customize/ConnectorsSection.tsx:64,77` — `key` prop in JSX not assignable to component prop type `{ connector: Connector; onToggle }` (component's prop interface needs update or `React.Key` mixin)
- `components/dashboard/chat/chat-interface.tsx:366` — `ChatMessageProps` type mismatch; likely a recently-added prop (`isStreaming`, `messageId`) not reflected in the interface
- `components/dashboard/ChatInput.tsx:68-69` — `item` is of type `unknown` (clipboard DataTransfer item not narrowed before use)
- `components/dashboard/chat/chat-input.tsx:159-160` — same pattern as above
- `components/dashboard/sidebar.tsx:853,914,1018,1256` — multiple component prop type mismatches in `PinnedChatItemProps`, `RecentChatItemProps`, `InlineEditRowProps`, `CodeSessionItemProps`
- `components/dashboard/home-view.tsx:406` and `projects-view.tsx:382` — project card component prop mismatch (likely `chats` typed as `any` instead of `Chat[]`)
- `components/feature-grid.tsx:31` — `FeatureCardProps` missing `key` or type mismatch

**Immediate action required:** Run `npm install` — without it, the app cannot be built or type-checked.

---

## ESLint Status: 🔴 CANNOT RUN

ESLint package not found (`node_modules/eslint` missing). Error:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'eslint'
imported from /home/user/xeref/eslint.config.mjs
```

ESLint checks are blocked until `npm install` completes.

---

## Code Quality Flags

### console.log Statements in Production Code

| File | Lines | Notes |
|------|-------|-------|
| `components/dashboard/AgentManagerView.tsx` | 315, 448 | Debug logs on message send — should be removed |
| `app/api/auth/callback/github/route.ts` | 13, 42, 59, 93, 106 | Structured logs (tagged `[github/callback]`) — acceptable for server routes if intentional |
| `app/api/chat/route.ts` | 116 | Logs chat payload including model/messages — potential data exposure in logs |
| `app/api/github/login/route.ts` | 54 | Logs `redirect_uri` |
| `app/api/webhooks/creem/route.ts` | 50, 73, 100, 114, 121 | Logs userId, plan, email — PII in log output |

**Highest priority:** `AgentManagerView.tsx:315,448` — client-side `console.log("Sending message:", inputText)` leaks user message content to browser devtools.

### Async Calls Without Error Handling

Several server actions make unawaited or unguarded Supabase calls:

- `app/actions/calendar.ts:42,68,125` — Supabase writes without try/catch
- `app/actions/chats.ts:136` — Supabase query without try/catch
- `app/actions/classroom.ts:68,75,137` — DB writes + `fetch` without error guard
- `app/actions/workflows.ts:65,76` — Supabase inserts without try/catch
- `components/dashboard/memory-view.tsx:97` — `fetch` DELETE without catch
- `components/dashboard/dashboard-shell.tsx:214` — `signOut()` without catch

### Undocumented Environment Variables

Two env vars used in code but absent from `CLAUDE.md` / README:

- `CONNECTIONS_ENCRYPTION_KEY` — used in `lib/connections/crypto.ts:11` and `lib/connections/oauth-state.ts:18` — required for OAuth token encryption; missing at runtime will silently break connections
- `TAVILY_API_KEY` — used in `app/api/chat/route.ts:282,289` — gated by presence check, but not documented
- `XEREF_DEFAULT_OPENROUTER_SITE_URL` / `XEREF_DEFAULT_OPENROUTER_APP_NAME` — used in `app/actions/projects.ts:136-137` and `lib/ai/openrouter-config.ts:84-85` — undocumented but have safe defaults

---

## 🔐 Security Alerts

No hardcoded API keys, tokens, or secrets found in source files.

`CONNECTIONS_ENCRYPTION_KEY` usage in `lib/connections/crypto.ts` and `oauth-state.ts` is correct
(loaded from env, not hardcoded). However: if this key is missing from the deployment environment,
OAuth state signing and token encryption silently fail — add validation at startup.

`app/api/chat/route.ts:116` logs the full chat request object `[Chat] { ... }` — verify this does
not include message content or file attachments in production log aggregators (Vercel, Datadog, etc.)

---

## ✅ What Looks Good

1. **Auth security is solid.** The `getSession()` → `getUser()` migration (commit `c61951b`) is correctly applied across server components. No `getSession()` calls remain in server-side code, eliminating the JWT-bypass vulnerability.

2. **Plan gating is server-enforced.** `lib/ai/openrouter-config.ts` validates model IDs against the user's plan before any upstream OpenRouter call, returning `403 { code: 'PLAN_LIMIT' }` for violations — correctly not relying on client-side filtering.

3. **No hardcoded secrets.** All API keys and credentials are properly loaded from environment variables with no hardcoded values found in any `.ts` or `.tsx` file.

---

## 🔧 Recommended Fixes (Priority Order)

1. **Run `npm install`** — the entire codebase is un-buildable and un-type-checkable without dependencies. This is the single highest-impact action.

2. **Remove `console.log` in `AgentManagerView.tsx:315,448`** — client-side logging of user message content is a privacy issue; delete both lines.

3. **Guard `app/api/chat/route.ts:116`** — either remove the log or redact message content before logging (log only model name, token counts, not content).

4. **Add `CONNECTIONS_ENCRYPTION_KEY` startup validation** — if this key is absent, connections silently break; add a check in `lib/connections/crypto.ts` that throws at module load time if the key is missing.

5. **Fix `ChatInput.tsx:68-69` and `chat/chat-input.tsx:159-160`** — narrow `item` from `unknown` with a type guard before accessing clipboard DataTransfer properties.

6. **Resolve prop type mismatches** — `sidebar.tsx`, `chat-interface.tsx`, `home-view.tsx`, and `projects-view.tsx` all have component interfaces out of sync with their usage; update the prop interfaces to match actual usage (or fix the callsites).

7. **Wrap unguarded async actions** — add try/catch to `calendar.ts`, `chats.ts`, `workflows.ts`, and `classroom.ts` server actions; surface errors to callers rather than letting them throw uncaught.

8. **Document missing env vars** — add `CONNECTIONS_ENCRYPTION_KEY`, `TAVILY_API_KEY`, `XEREF_DEFAULT_OPENROUTER_SITE_URL`, and `XEREF_DEFAULT_OPENROUTER_APP_NAME` to the README env var table.

---

## Summary

The codebase has been inactive for 11 days and is currently in a **broken infrastructure state** — `node_modules/` is absent, making the project un-buildable and preventing ESLint from running entirely. Once `npm install` is executed, the real TypeScript error count should drop dramatically (the 5,650 current errors are largely a cascade from missing type packages). The genuine code issues identified are: ~20 real type mismatches across dashboard components, 14 `console.log` statements left in production paths (two of which are client-side and log user message content), and multiple unguarded async Supabase operations in server actions. The auth security hardening applied in late April (getSession → getUser, ESLint set-state-in-effect fixes) puts the codebase in good shape conceptually — the priority for tomorrow morning is `npm install` first, then addressing the console.log privacy issues and missing CONNECTIONS_ENCRYPTION_KEY documentation.
