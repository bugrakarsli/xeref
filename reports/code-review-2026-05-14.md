# 🛡️ Xeref — Daily Code Review
# Date: 2026-05-14
# Commits reviewed: 2

## Commits
- `e517ac3` fix: add missing rehype-highlight dependency to resolve vercel build error
- `c6877a9` feat: implement skills system, fix oauth redirects, and update mcp server tools

---

## TypeScript Status: 🟢 CLEAN

`npx tsc --noEmit` — no errors. All new types are well-formed; `Skill`, `SkillInsert`, `SkillUpdate` interfaces in `components/customize/types.ts` align with the Supabase schema.

---

## ESLint Status: 🔴 5 errors, 8 warnings

### Errors

| File | Line | Rule | Description |
|------|------|------|-------------|
| `app/api/skills/[id]/files/route.ts` | 8 | `@typescript-eslint/no-explicit-any` | `Record<string, any[]>` — **introduced today** |
| `components/customize/SkillFileTree.tsx` | 34 | `@typescript-eslint/no-explicit-any` | `catch (err: any)` — **introduced today** |
| `components/dashboard/chat/chat-interface.tsx` | 65 | `react-hooks/set-state-in-effect` | setState called synchronously in effect — pre-existing |
| `components/dashboard/chat/chat-message.tsx` | 200 | `react-hooks/set-state-in-effect` | setState called synchronously in effect — pre-existing |
| `hooks/use-local-storage.ts` | 13 | `react-hooks/set-state-in-effect` | setState called synchronously in effect — pre-existing |

### Warnings

| File | Line | Rule | Description |
|------|------|------|-------------|
| `app/api/connections/vercel/login/route.ts` | 5 | `no-unused-vars` | `PROVIDERS` imported but never used |
| `components/customize/ConnectorsSection.tsx` | 8 | `no-unused-vars` | `PROVIDERS` imported but never used — pre-existing |
| `components/dashboard/AgentManagerView.tsx` | 139 | `@next/next/no-img-element` | `<img>` instead of `<Image />` — pre-existing |
| `components/dashboard/chat/chat-message.tsx` | 190 | `no-unused-vars` | `onEditPrompt` prop declared but never used — pre-existing |
| `components/dashboard/dashboard-shell.tsx` | 80,111,129 | `react-hooks/exhaustive-deps` | Functions should be wrapped in `useCallback` — pre-existing |
| `components/dashboard/dashboard-shell.tsx` | 140 | `no-unused-disable` | Stale `eslint-disable` directive for a rule with no violations — pre-existing |

---

## Code Quality Flags

### Introduced Today

1. **`app/api/skills/[id]/files/route.ts` line 8** — `MOCK_FILES` typed as `Record<string, any[]>`. The `FileNode` interface already exists in `SkillFileTree.tsx`. Should be `Record<string, FileNode[]>` (or imported from a shared location).

2. **`components/customize/SkillFileTree.tsx` line 34** — `catch (err: any)` bypasses TypeScript safety. Use `catch (err: unknown)` with `const msg = err instanceof Error ? err.message : 'Failed to load files'`.

3. **`app/api/skills/[id]/files/route.ts`** — The entire route is a stub with hardcoded mock data keyed on a specific UUID. The comment acknowledges this. Fine as a scaffold, but the mock GUID (`a1b2c3d4-e5f6-7890-abcd-ef1234567890`) also appears in the SQL seed — this coupling is fragile if the seed data changes.

4. **`app/api/connections/vercel/login/route.ts` line 5** — `PROVIDERS` is imported but only `isProviderConfigured` and `createState` / `OAUTH_STATE_COOKIE` are actually used in the route body. The `PROVIDERS.vercel.scopes.join(' ')` call is absent (unlike the Google route). This may be an incomplete OAuth scope wiring for Vercel.

5. **`scratch/update_prompts.mjs`** — Script uses `SUPABASE_SERVICE_ROLE_KEY` loaded from `.env.local` via dotenv (not hardcoded). Safe for developer use, but `scratch/` is tracked in git. Ensure `.env.local` remains in `.gitignore`.

6. **`SkillsSection.tsx` line 66** — Uses `window.confirm()` for delete confirmation. This is fine for MVP but blocks the event loop and cannot be styled. A modal dialog would be preferable as the UI matures.

---

## 🔐 Security Alerts

**None.** No hardcoded secrets, API keys, or tokens were found in today's changes. The `scratch/update_prompts.mjs` script reads credentials from `.env.local` via `dotenv`, which is correct. The SQL migration file contains no sensitive data.

The RLS policies in `20260513_skills.sql` are sound:
- Built-in skills: SELECT only, no auth required.
- User skills: full CRUD gated on `auth.uid() = user_id` at the database level.

---

## ✅ What Looks Good

1. **Defense-in-depth on skill mutations** — `app/actions/skills.ts` checks both `user_id` in the `.eq()` filter *and* the `source !== 'built-in'` guard, so even if RLS were misconfigured, the server action would refuse to mutate built-in skills.

2. **OAuth state handling is correct** — The Google, Notion, Slack, and Vercel login routes all use HMAC-signed state cookies (`createState`) with a 10-minute TTL, matching the pattern documented in CLAUDE.md. The redirect URI is derived from `NEXT_PUBLIC_SITE_URL || url.origin` rather than being hardcoded, which was the root cause of the mismatch bug now fixed.

3. **Migration is idempotent** — `20260513_skills.sql` uses `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, `DROP POLICY IF EXISTS`, and `ON CONFLICT (id) DO UPDATE` throughout. Safe to re-run without side effects.

---

## 🔧 Recommended Fixes (Priority Order)

1. **Fix `catch (err: any)` in `SkillFileTree.tsx:34`** — Replace with `catch (err: unknown)` and narrow the type. This is a lint error that will fail CI.
   ```ts
   } catch (err: unknown) {
     setError(err instanceof Error ? err.message : 'Failed to load files')
   }
   ```

2. **Fix `Record<string, any[]>` in `app/api/skills/[id]/files/route.ts:8`** — Import or inline the `FileNode` type:
   ```ts
   import type { FileNode } from '@/components/customize/SkillFileTree'
   const MOCK_FILES: Record<string, FileNode[]> = { ... }
   ```

3. **Remove or use the `PROVIDERS` import in `vercel/login/route.ts`** — Either drop the unused import, or wire in `PROVIDERS.vercel.scopes.join(' ')` if Vercel OAuth requires scopes. Currently the Vercel auth request is sent with no `scope` parameter, which may cause issues depending on Vercel's OAuth requirements.

4. **Address the three pre-existing `set-state-in-effect` errors** — `chat-interface.tsx`, `chat-message.tsx`, and `use-local-storage.ts` all call `setState` synchronously inside `useEffect`. While these are pre-existing, they are now lint *errors* (not warnings). Wrap the reads in `useMemo` or restructure with `useLayoutEffect` where appropriate. These should be prioritized before the next sprint.

5. **Clean up stale `eslint-disable` in `dashboard-shell.tsx:140`** — Remove the directive since the rule it suppresses no longer reports any violations there.

---

## Summary

Today's two commits were productive: a clean dependency fix (`rehype-highlight`) that resolves a known Vercel build error, and a substantial feature addition implementing the Skills system end-to-end (DB migration → server actions → three new UI components). TypeScript is fully clean. ESLint has **2 new errors** introduced today (`any` types in the skills file route and file tree component) and 3 pre-existing `set-state-in-effect` errors that have been accumulating. No security issues were found — the RLS design is solid and OAuth state management follows the established HMAC pattern. Top action for tomorrow: fix the two new `any` lint errors before they multiply, and audit whether the Vercel OAuth connector is missing scope wiring.
