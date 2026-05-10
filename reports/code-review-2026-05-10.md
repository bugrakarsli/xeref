# 🛡️ Xeref — Daily Code Review
# Date: 2026-05-10
# Commits reviewed: 8

---

## Commits Reviewed

| Hash | Message |
|------|---------|
| `6b2a6ba` | fix: telegram bot registration - fix NEXT_PUBLIC_APP_URL -> NEXT_PUBLIC_SITE_URL and guard missing TELEGRAM_WEBHOOK_SECRET |
| `eb54992` | docs: update Chat & Model Routing table with Opus 4.7 and DeepSeek V4 models |
| `909e0cf` | fix: github repos route always returns JSON + improve error handling |
| `4274c21` | fix: OAuth callbacks redirect on failure + error/success toasts + vercel constraint |
| `29393c5` | fix: session history highlight, auto-title, and GitHub reconnect UX |
| `0360b31` | fix: add missing onEditPrompt prop to ChatMessageProps |
| `e9d978b` | fix: drop spurious third arg to createChatSession in AgentPanel |
| `c89aa5a` | feat: v2.5 — OAuth connections, DeepSeek models, /code chat fixes, and referral redesign |

---

## TypeScript Status: 🔴 BLOCKING (Infrastructure)

`node_modules` is **empty** — dependencies have not been installed in this environment. All TypeScript errors reported by `tsc --noEmit` are caused by missing packages (`next`, `react`, `lucide-react`, `@types/node`, etc.), not by actual code defects. The `tsconfig.json` itself is correct.

**Action required**: Run `npm ci` before the next nightly review to restore the package tree. TypeScript cannot be meaningfully assessed until then.

---

## ESLint Status: 🔴 BLOCKING (Infrastructure)

Same root cause — ESLint fails with `ERR_MODULE_NOT_FOUND` because `eslint` itself is not installed. Cannot assess lint compliance until `npm ci` is run.

---

## Code Quality Flags

### 🟡 `console.log` in production server routes

`app/api/auth/callback/github/route.ts` — lines 13, 42, 59, 95, 105

Five `console.log` calls emit PII-adjacent data (userId, OAuth scopes, redirect targets) to stdout in every GitHub OAuth round-trip. These are debugging aids that belong behind a logger abstraction or should be removed from production.

`app/api/chat/route.ts` — line 116

One `console.log('[Chat]', { ... })` fires on every single chat request, logging plan, model, and projectId. At scale this is significant log noise.

**Recommendation**: Replace with `console.error`-only logging, or introduce a `logger.debug()` call that is no-op in production.

---

### 🟡 Inconsistent error response type in OAuth callbacks

`app/api/connections/google/callback/route.ts` — lines 21, 32, 37, 62  
`app/api/connections/slack/callback/route.ts` — lines 20, 31, 35, 57  
`app/api/connections/notion/callback/route.ts` — similar

The callback routes correctly redirect on OAuth provider error (`?error=access_denied`) and on `upsertConnection` failure. However, several intermediate failure paths still return raw `NextResponse.json(...)` responses instead of redirects:

- Missing code or client credentials → JSON 400
- `verifyState` throws → JSON 500  
- State mismatch → JSON 400
- Token exchange failure → JSON 400

A user who hits these paths sees a blank browser tab with a JSON body. The fix in `4274c21` only wired up redirects for the outer OAuth error param and the final `upsertConnection` step. The middle paths need the same treatment.

---

### 🟡 CLAUDE.md model table out of sync with code

`CLAUDE.md` documents the pro plan as: `xeref`, `claude-haiku-4-5-20251001`, `claude-sonnet-4-6` — but `lib/ai/openrouter-config.ts:64` now also includes `deepseek-v4-flash` for pro. This is intentional (from commit `eb54992`) but the CLAUDE.md plan table was not updated, which will mislead future reviewers.

---

## 🔐 Security Alerts

### 🚨 OPEN REDIRECT — OAuth `returnTo` parameter not validated

**Severity**: Medium  
**Files**: `app/api/connections/google/login/route.ts:19`, `app/api/connections/slack/login/route.ts:17`, `app/api/connections/notion/login/route.ts` (and all other OAuth login routes)

**Root cause**: The `returnTo` query parameter is accepted from user-supplied input and embedded verbatim into the HMAC-signed OAuth state:

```ts
const returnTo = url.searchParams.get('returnTo') || '/customize/connectors'
const { state, cookieValue } = createState(user.id, returnTo)
```

On callback, `verified.returnTo` is used directly in a `new URL(...)` constructor:

```ts
return NextResponse.redirect(
  new URL(`${verified.returnTo || '/customize/connectors'}?connected=google`, origin)
)
```

Because `new URL(absoluteUrl, base)` ignores the `base` when the first argument is an absolute URL, any attacker who navigates a user to:

```
/api/connections/google/login?returnTo=https://evil.com
```

will cause the server to sign `https://evil.com` into the state and redirect there after a successful OAuth flow. The HMAC only ensures the state hasn't been tampered with — it does not validate whether the `returnTo` value is a safe relative path.

**Exploit scenario**: Attacker sends phishing link → user clicks, authenticates with Google → is silently redirected to attacker's site with `?connected=google` appended (lending false legitimacy).

**Fix** — validate `returnTo` in the login route before signing it:

```ts
function safeReturnTo(raw: string | null, fallback = '/customize/connectors'): string {
  if (!raw) return fallback
  try {
    // Allow only relative paths (no protocol/host)
    const u = new URL(raw, 'https://placeholder')
    if (u.origin !== 'https://placeholder') return fallback
    return raw
  } catch {
    return fallback
  }
}
const returnTo = safeReturnTo(url.searchParams.get('returnTo'))
```

Apply this fix to all OAuth login routes: google, slack, notion, vercel, github.

---

## ✅ What Looks Good

1. **Telegram fix is clean and defensive** — `app/api/bots/telegram/register/route.ts` now correctly guards the missing `TELEGRAM_WEBHOOK_SECRET` with an explicit 500 and meaningful error message before attempting any crypto or external call. Token format validation (`!token.includes(':')`) is a nice lightweight pre-check.

2. **GitHub repos route error handling** — `app/api/github/repos/route.ts` now consistently returns JSON for all paths (fixing the previous mixed redirect/JSON responses), correctly maps 401/403 GitHub responses to reconnect scenarios, and has a clean outer `try/catch` that covers the entire handler.

3. **OAuth crypto implementation is solid** — `lib/connections/oauth-state.ts` uses `timingSafeEqual` for both the cookie comparison and signature comparison, has a 10-minute TTL enforced server-side, and uses `base64url` encoding throughout. The HMAC-SHA256 design is correct; the open redirect issue is in the consumers of `returnTo`, not in the crypto layer itself.

---

## 🔧 Recommended Fixes (Priority Order)

1. **[Security — High]** Validate `returnTo` is a relative path before calling `createState(...)` in all OAuth login routes. Add a shared `safeReturnTo()` helper in `lib/connections/oauth-state.ts` or a new `lib/connections/utils.ts` to avoid repeating the check.

2. **[UX — Medium]** Complete the redirect-on-failure pattern in all OAuth callback routes. Token exchange failures (`lines 59–63` in google/callback) and state verification failures should redirect to `?error=...` rather than returning JSON 400/500, so users see the connectors UI error state instead of a blank browser page.

3. **[Ops — Medium]** Remove the five `console.log` calls from `app/api/auth/callback/github/route.ts` and the per-request `console.log` in `app/api/chat/route.ts:116`. Replace error-worthy events with `console.error` and suppress debug traces in production.

4. **[Docs — Low]** Update the CLAUDE.md plan table to include `deepseek-v4-flash` in the pro tier and `deepseek-v4-pro` / `claude-opus-4-7` in ultra, matching the current `lib/ai/openrouter-config.ts` state.

5. **[Infra — Blocker for future reviews]** Run `npm ci` in the CI/review environment. Until `node_modules` is populated, neither `tsc --noEmit` nor `npx eslint` can produce meaningful output.

---

## Summary

Today's 8-commit push (`v2.5`) landed a significant feature batch: OAuth connections for Google, Slack, Notion, and Vercel; DeepSeek V4 model variants; a GitHub code-chat flow; and a referral view redesign. The individual bug-fix commits on top (`6b2a6ba` through `e9d978b`) are tight and well-scoped — the `createChatSession` arg drop, `onEditPrompt` prop fix, and Telegram env-var correction are all surgical one-liners with no collateral change. The primary concern is a **medium-severity open redirect** in all five OAuth login routes: `returnTo` accepts any absolute URL from the query string, signs it into HMAC state, and redirects to it after a successful OAuth flow — a phishing vector that should be patched before the connections feature is broadly promoted. A secondary concern is incomplete redirect-on-failure in the OAuth callbacks, which leaves users on a blank JSON page when state or token exchange fails. Tomorrow's top action: patch `safeReturnTo()` across all login routes and wire the remaining callback failure paths to proper UI redirects.
