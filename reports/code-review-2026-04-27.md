# 🛡️ Xeref — Daily Code Review
# Date: 2026-04-27
# Commits reviewed: 4 (+ 2 merge commits)

## Commits
| Hash | Message |
|------|---------|
| `42c0656` | fix: GitHub OAuth 500s, GitHub 404, and Code route URL |
| `36436ca` | fix: resolve 14 ESLint set-state-in-effect errors across dashboard components |
| `c61951b` | fix: routines auth guards, telegram webhook verification, getSession→getUser (Issues #1 #3 #4) |
| `32867df` | feat: user connections system with DB-backed OAuth tokens and memory documents API |

---

## TypeScript Status: 🟢 CLEAN

No type errors. (Note: `node_modules` was absent at review time — all 5,650 pre-install errors were environment-only and disappeared after `npm install`.)

---

## ESLint Status: 🔴 BLOCKING (46 warnings, threshold: 0)

### Unused variables / imports (24 warnings)
| File | Line | Symbol |
|------|------|--------|
| `app/api/chat/route.ts` | 18 | `data` |
| `app/code/_components/ChatInputWithGitHub.tsx` | 39 | `onInputChange` |
| `components/dashboard/AgentPanel.tsx` | 3,5 | `useCallback`, `MoreHorizontal`, `Maximize2`, `onClose` |
| `components/dashboard/StatusBar.tsx` | 4,27 | `GitBranch`, `XCircle`, `AlertTriangle`, `Radio`, `Bell`, `ChevronRight`, `Settings`, `ExternalLink`, `gitStatus` |
| `components/dashboard/agent-team-view.tsx` | 64 | `statusBadgeVariant` |
| `components/dashboard/chat/chat-interface.tsx` | 12, 291 | `SYSTEM_AGENTS`, `selectedLabel` |
| `components/dashboard/classroom-view.tsx` | 6,11,21 | `Pencil`, `cn`, `updateCourse` |
| `components/dashboard/home-view.tsx` | 298 | `setActiveTab` |
| `components/dashboard/tasks-view.tsx` | 4,9-12,284 | `ChevronDown`, `DropdownMenu*`, `isPending` |
| `components/dashboard/whats-new-toast.tsx` | 3 | `useEffect` |
| `lib/apiService.ts` | 15 | `_enableSynthID` |
| `mcp/server.test.ts` | 8 | `beforeEach` |
| `components/dashboard/dashboard-shell.tsx` | 22 | `ComingSoonView` |

### Missing useEffect dependencies (3 warnings)
| File | Line | Issue |
|------|------|-------|
| `components/dashboard/artifacts/artifact-detail.tsx` | 52 | Missing `artifact?.published` dep — potential stale closure bug |
| `components/dashboard/code-routines-view.tsx` | 20 | Missing `supabase` dep |
| `components/dashboard/dashboard-shell.tsx` | 210 | Missing `activeView` and `handleNewSession` deps |

### Image / accessibility warnings (3 warnings)
| File | Line | Issue |
|------|------|-------|
| `components/dashboard/AgentManagerView.tsx` | 140 | `<img>` instead of Next.js `<Image />` |
| `components/dashboard/AgentPanel.tsx` | 738 | `<img>` instead of Next.js `<Image />` |
| `components/dashboard/ChatInput.tsx` | 194 | `<img>` missing `alt` prop |

### Stale eslint-disable directives (5 warnings)
| File | Line | Stale rule |
|------|------|-----------|
| `components/dashboard/AgentManagerView.tsx` | 115 | `react-hooks/set-state-in-effect` |
| `components/dashboard/tasks-view.tsx` | 136 | `react-hooks/set-state-in-effect` |
| `components/dashboard/artifacts/artifact-detail.tsx` | 47 | `react-hooks/exhaustive-deps` |
| `components/dashboard/calendar-view.tsx` | 154 | `react-hooks/exhaustive-deps` |
| `components/dashboard/chat/chat-message.tsx` | 186 | `react-hooks/exhaustive-deps` |
| `components/dashboard/chats-view.tsx` | 50 | `react-hooks/exhaustive-deps` |

### Unused expressions (2 warnings)
| File | Line | Issue |
|------|------|-------|
| `components/dashboard/classroom-view.tsx` | 256 | Expression with no effect |
| `components/dashboard/sidebar.tsx` | 893 | Expression with no effect |

---

## Code Quality Flags

### 🟡 console.log in production server code
`app/api/auth/callback/github/route.ts` — lines 13, 44, 59, 73, 92, 103: Multiple `console.log` calls trace the full OAuth flow including `userId` and redirect URIs. Server-only so not a client exposure risk, but noisy in production logs and leaks internal routing details.

`app/api/github/login/route.ts` — line 54: Logs `redirect_uri` for every OAuth initiation.

### 🟡 Unvalidated PATCH body in routines endpoint
`app/api/routines/[id]/route.ts` — PATCH handler passes the raw request body directly to `supabase.update(patch)` with no field allowlist. A user could update any column on their own row (e.g., `user_id`, `created_at`). The `.eq('user_id', user.id)` WHERE clause prevents cross-user mutation, but own-row field injection is unconstrained.

### 🟡 Unhandled storage error on document deletion
`app/api/memory/documents/[id]/route.ts` — The storage `remove()` call has no error check. If storage deletion fails silently, the DB record is deleted but the file remains orphaned in the `documents` bucket, wasting storage.

### 🟢 Stale eslint-disable comments (cleanup opportunity)
After `36436ca` fixed the `set-state-in-effect` violations, 5+ `// eslint-disable` directives became stale (listed above). These mask real future violations.

---

## 🔐 Security Alerts

**None.** No hardcoded secrets, API keys, or credentials were found in any changed file. All sensitive values reference `process.env.*`.

---

## ✅ What Looks Good

1. **Excellent cryptography in `lib/connections/`** — The new OAuth token storage uses AES-256-GCM with a 12-byte random IV and 16-byte auth tag, key length is validated at startup, and HMAC-SHA256 with `timingSafeEqual` is used for both OAuth state signing and Telegram webhook verification. This is production-grade crypto.

2. **Consistent `getUser()` adoption** — All 14+ components and every new API route (`routines`, `memory/documents`, `connections`) now use `getUser()` instead of the insecure `getSession()`. The security fix in commit `c61951b` was comprehensive and correctly applied.

3. **Clean token isolation in `store.ts`** — `listConnectionsForUser` explicitly excludes token columns from the SELECT, making it structurally impossible to accidentally leak decrypted tokens to the client through the list endpoint.

---

## 🔧 Recommended Fixes (Priority Order)

1. **Fix missing `useEffect` dependency in `artifact-detail.tsx:52`** — `artifact?.published` is a stale closure; the effect won't re-run when published state changes externally, leading to UI desync. Either add it to deps or use a `useReducer`.

2. **Add field allowlist to routines PATCH** — Change `supabase.update(patch)` to `supabase.update({ name: patch.name, prompt: patch.prompt, model: patch.model, active: patch.active, schedule_cron: patch.schedule_cron, timezone: patch.timezone })` so only safe fields can be written.

3. **Remove stale `eslint-disable` directives** — Clean up the 5 directives for `set-state-in-effect` and `exhaustive-deps` in `AgentManagerView.tsx`, `tasks-view.tsx`, `artifact-detail.tsx`, `calendar-view.tsx`, `chat-message.tsx`, and `chats-view.tsx` so future real violations are caught.

4. **Handle storage error in document DELETE** — Capture the `error` from `supabase.storage.from('documents').remove(...)` and log or return a 500 if it fails, rather than orphaning files silently.

5. **Replace `console.log` with structured logging in GitHub OAuth callback** — Either remove the log lines or replace with a lightweight server logger that can be silenced in production. The current logs expose `userId` and full redirect URIs to stdout on every OAuth flow.

---

## Summary

Today's four commits represent a strong security and quality push: the `getSession→getUser` migration closes a JWT validation gap across the full dashboard, the connections system ships with genuinely good cryptography, and the ESLint `set-state-in-effect` sweep cleaned up a large class of warnings. The codebase is in better shape today than yesterday on the security axis. The main actionable gap is the ESLint warning count (46 warnings, 0 tolerated) — the bulk of these are stale disables and unused imports that accumulated before the recent fixes and can be cleared in a single focused cleanup commit. Tomorrow morning: run the ESLint cleanup pass and add the PATCH field allowlist to the routines endpoint.
