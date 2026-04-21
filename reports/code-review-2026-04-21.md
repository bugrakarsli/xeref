# 🛡️ Xeref — Daily Code Review
# Date: 2026-04-21
# Commits reviewed: 7

---

## Commits in Scope

| SHA | Message |
|-----|---------|
| `323f0e6` | feat: add code session chat with streaming and AI SDK v6 message types |
| `7a16e78` | fix: remove explicit redirect_uri to avoid mismatch |
| `92fd2dc` | Merge branch 'feature/design-integration-plan' |
| `ef01cf8` | feat: implement GitHub OAuth authentication flow and repository selection component |
| `2042ffd` | feat: implement routine and code session management with Supabase schema, API routes, and UI components |
| `d8da722` | Merge feature/design-integration-plan into main |
| `71f98ee` | fix: use per-user Google OAuth credentials for calendar token refresh |

---

## TypeScript Status: 🔴 BLOCKING

`npx tsc --noEmit` reported **4,657 errors**.

The overwhelming majority are pre-existing infrastructure errors caused by missing type packages:
- `Cannot find module 'react'` / `Cannot find module 'next/server'` etc. — `@types/react` / `@types/node` not installed in this environment
- `Cannot find name 'process'` — `@types/node` missing from `tsconfig`

**New errors introduced today** (in today's added files):

| File | Line | Error | Category |
|------|------|-------|----------|
| `app/api/sessions/[id]/chat/route.ts` | 38 | Parameter `m` implicitly has type `any` | 🟡 WARNING |
| `app/api/sessions/[id]/chat/route.ts` | 50 | Binding element `text` implicitly has type `any` | 🟡 WARNING |
| `app/code/_components/ChatInputWithGitHub.tsx` | 57 | Parameter `val` implicitly has type `any` | 🟡 WARNING |
| `app/code/_components/ChatInputWithGitHub.tsx` | 71 | Parameter `m` implicitly has type `any` | 🟡 WARNING |
| `app/code/_components/GitHubRepoButton.tsx` | 57, 79 | Parameters `v`, `r` implicitly have type `any` | 🟡 WARNING |

**Root cause for infrastructure errors:** `@types/node` is not listed in `devDependencies`. Running `npm i --save-dev @types/node` and adding `"node"` to the `types` array in `tsconfig.json` would clear the `process` / `__dirname` errors across the entire codebase.

---

## ESLint Status: 🔴 BLOCKING

ESLint **failed to execute** with:

```
ERR_MODULE_NOT_FOUND: Cannot find package 'eslint' imported from /home/user/xeref/eslint.config.mjs
```

The `eslint` package appears to not be installed in the current environment. This is a tooling gap — no lint check ran today. Run `npm install` to restore the ESLint package before the next review cycle.

---

## Code Quality Flags

### 🔴 Missing Auth on Routines GET Endpoints
- **`app/api/routines/route.ts` — GET handler (line 4):** No `getUser()` check. Any unauthenticated caller can list all rows from the `routines` table. Also returns data for all users, not scoped to the requesting user.
- **`app/api/routines/[id]/route.ts` — GET / PATCH / DELETE handlers:** Same issue — no auth gate. Any caller with a known routine ID can read, overwrite, or delete it.

### 🔴 CSRF Risk in GitHub OAuth Flow (Missing `state` Parameter)
- **`app/api/github/login/route.ts` line 14:** The OAuth redirect URL does not include a `state` parameter. Without a state token (generated server-side, stored in session/cookie, validated on callback), this flow is vulnerable to CSRF attacks where an attacker can trick a logged-in user into linking an attacker-controlled GitHub account.
- **`app/api/auth/callback/github/route.ts` line 4–12:** The callback does not validate a `state` parameter either.

### 🟡 `console.error` in Client Component
- **`app/code/_components/ChatInputWithGitHub.tsx` line 47:** `console.error('Failed to send message:', error)` will be emitted in users' browser consoles in production. Swap for a silent failure or surface the error via UI state.

### 🟡 `as any` Type Casts Suppressing Type Safety
- **`app/api/sessions/[id]/chat/route.ts` line 43:** `userPlan as any` passed to `createOpenRouterForPlan` — the plan type should be narrowed to the union defined in `lib/types.ts`.
- **`app/api/sessions/[id]/chat/route.ts` line 49:** `messages as any` passed to `streamText` — `convertToModelMessages` is imported but never called; this is the documented AI SDK v6 adapter for this conversion.

### 🟡 Unused Import
- **`app/api/sessions/[id]/chat/route.ts` line 1:** `convertToModelMessages` is imported from `ai` but never used. The manual `map` on line 38 is doing this conversion by hand, poorly (no type safety).

### 🟡 `(r: any)` Untyped Callback in Repos Route
- **`app/api/github/repos/route.ts` line 33:** `repos.map((r: any) => ...)` — define an inline type or interface for the GitHub repo shape.

---

## 🔐 Security Alerts

### 🚨 CRITICAL — Unauthenticated Access to Routines Endpoints

**Files:** `app/api/routines/route.ts` (GET), `app/api/routines/[id]/route.ts` (GET / PATCH / DELETE)

Any unauthenticated HTTP client can:
1. `GET /api/routines` → enumerate all routines for all users
2. `GET /api/routines/<id>` → read any routine including its `prompt` and `repo_full_name`
3. `PATCH /api/routines/<id>` → overwrite any routine's configuration
4. `DELETE /api/routines/<id>` → delete any user's routine

**Fix:** Add `getUser()` guard (matching the pattern used in `app/api/sessions/route.ts`) and add `.eq('user_id', user.id)` to all queries so data is scoped to the authenticated user.

### 🚨 HIGH — Missing CSRF State in GitHub OAuth

**Files:** `app/api/github/login/route.ts`, `app/api/auth/callback/github/route.ts`

The OAuth `state` parameter is absent. A CSRF attacker can forge the callback URL and associate an attacker-controlled GitHub account with a victim's session, gaining access to whatever permissions the OAuth scope includes (`repo`).

**Fix:** Before redirecting, generate a cryptographically random `state` token, store it in a short-lived HttpOnly cookie, include it in the authorization URL, and validate it in the callback before exchanging the code.

---

## ✅ What Looks Good

1. **Auth pattern is consistent on new session routes** — `app/api/sessions/route.ts` and `app/api/sessions/[id]/chat/route.ts` both correctly use `supabase.auth.getUser()` (not the deprecated `getSession()`), matching the CLAUDE.md spec.
2. **GitHub token is stored securely** — `app/api/auth/callback/github/route.ts` sets `httpOnly: true` and `secure` only in production, which is the correct approach for protecting OAuth tokens in cookies.
3. **Error handling coverage is complete** — every new API route wraps async logic in `try/catch` and returns structured JSON errors, preventing unhandled promise rejections from crashing the server.

---

## 🔧 Recommended Fixes (Priority Order)

1. **[CRITICAL] Add auth + user-scoping to all Routines endpoints** — `app/api/routines/route.ts` and `app/api/routines/[id]/route.ts`. Three-line fix per handler: `getUser()`, 401 if null, add `.eq('user_id', user.id)` to every query.

2. **[HIGH] Add CSRF `state` parameter to the GitHub OAuth flow** — generate a random token in `GET /api/github/login`, set it in a short-lived cookie, validate it in `GET /api/auth/callback/github` before accepting the code.

3. **[MEDIUM] Fix `convertToModelMessages` usage in chat route** — `app/api/sessions/[id]/chat/route.ts` imports but ignores `convertToModelMessages`. Use it to convert history before passing to `streamText`, remove the `as any` casts, and delete the dead import.

4. **[MEDIUM] Install missing type packages** — `npm i --save-dev @types/node`, add `"node"` to `tsconfig.json` `compilerOptions.types`. This will clear hundreds of pre-existing TS errors in one step.

5. **[LOW] Remove `console.error` from `ChatInputWithGitHub.tsx`** — replace with a React state-based error message visible to the user.

---

## Summary

Today's 7 commits introduced the GitHub OAuth integration, code session chat streaming, and routine/session management APIs — a significant feature surface. The implementation quality on the happy path is solid: auth patterns follow the project spec, error handling is present, and tokens are stored correctly. However, two security gaps were introduced that require immediate attention before this code reaches production: the Routines API endpoints are entirely unprotected (unauthenticated enumeration and mutation of any user's data), and the GitHub OAuth flow is missing CSRF `state` protection. Yesterday's single commit was a focused hydration bugfix, suggesting the codebase has entered a faster-paced feature development phase — tightening the pre-merge security checklist for API routes would catch these access-control omissions before they land. Top action for tomorrow morning: add `getUser()` guards and user-scoped `.eq('user_id', user.id)` filters to the Routines routes.
