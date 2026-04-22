# 🛡️ Xeref — Daily Code Review
# Date: 2026-04-22
# Commits reviewed: 5

---

## Commits

| SHA | Message |
|-----|---------|
| `30d8f00` | chore: remove reference scaffold, dead files, and add v2.1 changelog |
| `a7742a6` | feat: implement Creem checkout action, add login page, and configure local environment permissions |
| `8e5cb8b` | feat: add MCP server v1 and Telegram bot deploy wizard |
| `734afd7` | feat: implement dashboard shell with navigation, state management, and keyboard shortcuts |
| `b61fbd2` | feat: add site documentation, changelog, faq, login, and pricing pages with a shared start building component |

---

## TypeScript Status: 🔴 BLOCKING

**Root cause: `node_modules` is completely empty (0 packages installed). `npm install` has never been run.**

This single missing step cascades into **4,813 TypeScript errors** across the entire codebase — every import fails because no type declarations exist. The errors themselves are not code bugs; they disappear once dependencies are installed. Representative error categories:

- `TS2307: Cannot find module 'react' / 'next' / 'lucide-react' / '@supabase/ssr'` — all external imports
- `TS7026: JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists` — cascades from missing `@types/react`
- `TS2591: Cannot find name 'process'` — cascades from missing `@types/node`
- `TS2304: Cannot find name '__dirname'` — same as above

**Action required:** Run `npm install` in the project root before any further CI, build, or type-checking steps.

---

## ESLint Status: 🔴 BLOCKING

ESLint cannot run — same root cause as TypeScript: the `eslint` package is not installed.

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'eslint' imported from /home/user/xeref/eslint.config.mjs
```

**Action required:** Run `npm install` first, then re-run `npx eslint . --ext .ts,.tsx`.

---

## Code Quality Flags

### 1. Debug `console.log` left in production component
- **File:** `components/dashboard/AgentManagerView.tsx:313`
- `console.log("Sending message:", inputText)` — debug statement left inside a UI interaction handler. Will emit on every user message send in production.

### 2. Fake "test message" in DeployView
- **File:** `components/dashboard/deploy-view.tsx` — `handleTestMessage()` uses a hardcoded `setTimeout` to simulate sending a test Telegram message without actually sending one. Users will see "Test message sent!" even though nothing happened. Either wire it to a real endpoint or remove the button.

### 3. Unvalidated internal auth headers in Telegram → Chat forwarding
- **File:** `app/api/bots/telegram/[userId]/route.ts:55-60`
- The webhook handler forwards messages to `/api/chat` with custom headers `x-xeref-user-id` and `x-xeref-source`. However, `app/api/chat/route.ts` authenticates **only** via Supabase session cookies and completely ignores these headers. Result: the Telegram bot always receives a `401 Unauthorized` and falls into the catch block, sending users "Something went wrong." The integration is **non-functional**.
- Secondary concern: the headers establish a pattern of "trusted internal caller" identity — if a future developer adds header-based auth to the chat route without securing it to internal-only traffic, it becomes an impersonation vector.

### 4. Missing error handling on `sendTelegramMessage`
- **File:** `app/api/bots/telegram/[userId]/route.ts:21-26`
- `sendTelegramMessage()` calls `fetch(...)` with no error handling and no `await` on the return value. If the Telegram API is unreachable, the error is silently swallowed.

### 5. Supabase admin client instantiated at module level
- **File:** `app/api/mcp/route.ts:4-7` and `app/api/bots/telegram/[userId]/route.ts:4-7`
- Both files instantiate `supabaseAdmin` at module scope. This is acceptable for server-only route files, but it means `SUPABASE_SERVICE_ROLE_KEY` is read at cold-start time. If the env var is absent the process won't crash immediately — it will only surface as a runtime error later. Consider a startup guard or lazy instantiation.

### 6. Changelog entries file
- **File:** `lib/changelog-entries.ts` — newly added. No issues found; data-only file.

---

## 🔐 Security Alerts

### ⚠️ MEDIUM — Broken internal auth pattern creates future injection risk
- **File:** `app/api/bots/telegram/[userId]/route.ts:55-60`
- **Detail:** The Telegram webhook trusts the `[userId]` URL path parameter as user identity without any HMAC verification of the incoming Telegram request. Telegram webhooks should validate the `X-Telegram-Bot-Api-Secret-Token` header (set during `setWebhook`). Any actor who discovers the webhook URL `https://your-domain/api/bots/telegram/{userId}` can send arbitrary messages and have them forwarded to your chat inference endpoint on behalf of that user.
- **Fix:** Add a webhook secret during `setWebhook` registration and validate it on every incoming request in the `[userId]/route.ts` handler.

### ✅ No hardcoded secrets found
All API keys and secrets correctly use `process.env.*`. `SUPABASE_SERVICE_ROLE_KEY` is only used in server-side route files (never `NEXT_PUBLIC_*`). Creem product IDs use `NEXT_PUBLIC_CREEM_*` which is acceptable since they are non-secret product identifiers.

---

## ✅ What Looks Good

1. **MCP server implementation (`app/api/mcp/route.ts`)** is clean and well-structured. Bearer token auth against a database column, proper protocol negotiation (`initialize` / `tools/list` / `tools/call`), and row-level user scoping on every Supabase query. Good first version.

2. **Checkout action (`app/actions/checkout.ts`)** follows the correct `'use server'` pattern, uses `getUser()` (not `getSession()`), never exposes `CREEM_API_KEY` to the client, and throws descriptive errors. Auth and payment gating are correct.

3. **Telegram registration flow (`app/api/bots/telegram/register/route.ts`)** verifies the token against the live Telegram API before persisting it — good defensive check that prevents saving invalid tokens.

---

## 🔧 Recommended Fixes (Priority Order)

1. **Run `npm install`** — unblocks TypeScript, ESLint, and the dev/build pipeline entirely. Everything else is secondary to this.

2. **Fix the Telegram bot auth** — the bot is broken today. The chat route cannot accept unauthenticated server-to-server calls. Options: (a) call the Supabase admin client directly in the Telegram handler instead of proxying to `/api/chat`, bypassing cookie auth; or (b) add a shared internal secret (`INTERNAL_API_SECRET`) that the chat route checks alongside the cookie auth path.

3. **Add Telegram webhook signature verification** — in `app/api/bots/telegram/[userId]/route.ts`, register a `secret_token` with `setWebhook` and verify `req.headers.get('x-telegram-bot-api-secret-token')` on every inbound update. Without this, the webhook URL is publicly exploitable.

4. **Remove debug `console.log`** in `components/dashboard/AgentManagerView.tsx:313`.

5. **Fix or remove the fake test message** in `components/dashboard/deploy-view.tsx:handleTestMessage()` — either call a real API or remove the button until the feature is implemented.

6. **Add error handling to `sendTelegramMessage`** — wrap the `fetch` call in a try/catch and log/return the failure instead of silently swallowing it.

---

## Summary

Today's session was highly productive — 5 commits shipped MCP server v1, Telegram bot integration, Creem checkout, the dashboard shell, and several marketing/content pages. Code quality in the new server actions and MCP route is solid, with correct auth patterns and no hardcoded secrets. However, the project is in a **blocked state** because `npm install` has never been run, making TypeScript and ESLint completely non-functional (4,813 cascading errors from zero installed packages). The Telegram bot feature is also **non-functional at runtime** due to a broken auth handoff between the webhook handler and the chat API. Tomorrow's top priority: run `npm install`, then fix the Telegram↔Chat auth bridge so the new Deploy view actually works end-to-end.
