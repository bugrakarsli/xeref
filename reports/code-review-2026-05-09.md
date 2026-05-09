# 🛡️ Xeref — Daily Code Review
# Date: 2026-05-09
# Commits reviewed: 0 (no commits in the last 24 hours)

---

## TypeScript Status: 🔴 BLOCKING (environment issue)

**Root cause: `node_modules` directory does not exist.**

The `tsc --noEmit` run returned **5,650 errors**, but the overwhelming majority are
`TS2307: Cannot find module` and `TS7026: JSX element implicitly has type 'any'`
caused entirely by missing package installations — not by actual code defects.

**Confirmed missing packages causing cascading failures:**
- `next`, `next/link`, `next/navigation`, `next/cache` (Next.js core + types)
- `react` / `react/jsx-runtime` (all JSX errors stem from this)
- `@supabase/supabase-js`
- `clsx`, `tailwind-merge`, `zustand`
- `@modelcontextprotocol/sdk`
- `zod`, `vitest`
- `@types/node` (causes all `process` not-found errors)

**Genuine code-level type errors (visible after deps are installed):**

| Severity | File | Issue |
|----------|------|-------|
| 🟡 WARNING | `lib/supabase/server.ts:17` | Binding elements `value`, `options` implicitly `any` |
| 🟡 WARNING | `mcp/server.ts:44,64,87,105…` | 20+ destructured parameters implicitly `any` in tool handlers |
| 🟡 WARNING | `store/design-store.ts:41–64` | `set` and action parameters implicitly `any` |

**Immediate action required: run `npm install` to restore the dependency tree.**

---

## ESLint Status: 🔴 BLOCKED

ESLint failed to start — `eslint` package not found (same missing `node_modules` issue).

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'eslint'
```

Previous CI run (PR #5, commit `36436ca`) resolved 14 `set-state-in-effect` errors,
so ESLint was clean at that point. Baseline assumed clean pending `npm install`.

---

## Code Quality Flags

### Console.log statements in production code

12 `console.log` calls found across API routes and a UI component. These emit
to server logs in production and can expose PII or internal state.

| File | Lines | What is logged |
|------|-------|---------------|
| `app/api/auth/callback/github/route.ts` | 13, 42, 59, 93, 106 | OAuth flow steps, userId, GitHub login |
| `app/api/chat/route.ts` | 116–121 | **userId, plan tier, resolved model ID** |
| `app/api/github/login/route.ts` | 54 | OAuth redirect_uri |
| `app/api/webhooks/creem/route.ts` | 50, 73, 100, 114, 121 | userId, plan transitions, event types |
| `components/dashboard/AgentManagerView.tsx` | 315, 448 | `inputText` message content |

The `app/api/chat/route.ts` log at line 116 is the most notable — it writes
`userId` and plan data on every chat request, creating a high-volume PII log stream.

### Missing error handling in API routes

Only **9 of 29** API route files contain `try/catch` blocks (~31% coverage).
20 routes execute Supabase calls and external fetches without a catch boundary,
meaning unhandled promise rejections will surface as 500s with no structured error response.

Files at highest risk (external calls, no catch):
- `app/api/connections/[provider]/route.ts`
- `app/api/calendar/auth/route.ts`
- `app/api/sessions/[id]/chat/route.ts`

### Implicit `any` in MCP server handlers (`mcp/server.ts`)

Tool handler destructuring at lines 44, 64, 87, 105, 138, 158, 179, 209, 225, 246, 276, 295
all have implicit `any` types. These are tool input parameters that should be typed
via Zod schemas (the file already imports `zod`).

---

## 🔐 Security Alerts

No hardcoded secrets or API keys found in source files. All credential references
correctly use `process.env.*`.

The `console.log` in `app/api/chat/route.ts:116` logs `userId` and `plan` on every
request — not a secret leak, but a **GDPR/privacy concern** in a production log pipeline.
Flag for removal before any external log aggregation (Datadog, Sentry, etc.) is wired up.

---

## ✅ What Looks Good

1. **Auth pattern is correct.** All server-side routes consistently use `getUser()` 
   rather than `getSession()` — the security fix from PR #5 (`36436ca`) is holding.

2. **No hardcoded credentials anywhere.** Full grep across `app/`, `lib/`, and 
   `components/` returned zero hits for inline keys, tokens, or passwords.

3. **Plan gating is server-enforced.** `lib/ai/openrouter-config.ts` validates model 
   IDs against user plan before any upstream call, matching the documented architecture.

---

## 🔧 Recommended Fixes (Priority Order)

1. **Run `npm install`** — the missing `node_modules` directory renders both TypeScript
   and ESLint non-functional. This must be the first action on any dev or CI machine
   before any further quality checks can be trusted.

2. **Remove or replace console.log statements** — convert the 12 production `console.log`
   calls to a structured logger (e.g. `pino`) or remove them. Priority: 
   `app/api/chat/route.ts:116` (high-volume PII), then `app/api/webhooks/creem/route.ts`
   (payment flow), then GitHub OAuth routes.

3. **Add try/catch to the 20 unguarded API routes** — wrap Supabase and external 
   fetch calls in `try/catch` blocks and return structured `{ error: string }` responses
   with appropriate HTTP status codes. Start with `app/api/sessions/[id]/chat/route.ts`
   and `app/api/connections/[provider]/route.ts` as they handle user-facing flows.

4. **Type the MCP tool handler parameters** (`mcp/server.ts`) — define Zod schemas 
   for each tool's input and extract types from them to eliminate the 20+ implicit `any`
   warnings. The `zod` import is already present; it just needs to be used for typing.

5. **Type `lib/supabase/server.ts:17`** — add explicit types for the `value` and 
   `options` binding elements in the cookie setter callback.

---

## Summary

No new commits landed in the last 24 hours, so today's review reflects the accumulated
state of the codebase post-PR #6. The single most urgent issue is not a code defect
but an environment one: `node_modules` is absent, making all automated quality gates 
(TypeScript, ESLint) non-functional — this must be remediated immediately on every 
environment. Underlying code quality is solid: no secrets are hardcoded, auth patterns 
are correct, and recent PRs have already addressed security regressions. The two 
actionable items for tomorrow morning are restoring the dependency tree and auditing 
the 12 `console.log` calls, particularly the one in the chat API that logs user PII 
on every request.
