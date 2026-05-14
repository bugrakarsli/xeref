# 🛡️ Xeref — Daily Code Review
# Date: 2026-05-14
# Commits reviewed: 2

---

## TypeScript Status: 🟡 WARNING (environment caveat)

`node_modules` is **not installed** in the review environment, so `npx tsc --noEmit` reported 6,109 "Cannot find module" errors across the entire codebase — all pre-existing and entirely caused by the missing install, not by today's code. The same error count appeared against HEAD~2, confirming zero regression from today's commits.

Within the files actually changed today, one genuine non-critical type issue was spotted manually:

- `app/api/skills/[id]/files/route.ts:8` — `MOCK_FILES` typed as `Record<string, any[]>`. Should be `Record<string, FileNode[]>` once the mock is replaced with real data.

**No blocking type errors introduced today.**

---

## ESLint Status: 🟡 WARNING (environment caveat)

ESLint failed with `ERR_MODULE_NOT_FOUND` because `node_modules` is not installed. Cannot produce a definitive lint report. Manual inspection of changed files found one lint-equivalent issue:

- `components/customize/SkillFileTree.tsx:34` — `catch (err: any)` uses an explicit `any` cast. Should be `catch (err: unknown)` with a type guard.

No other lint issues found in the changed files.

---

## Code Quality Flags

### `app/api/skills/[id]/files/route.ts`
- **Lines 5–17** — `MOCK_FILES` with a hardcoded UUID is production-committed placeholder code. The route returns mock file tree data unconditionally. Comment on line 5 says "In a real implementation…" — this entire block needs replacing before the Skills file browser is considered functional. Not a runtime crash, but misleading to users who browse non-matching skill IDs.
- **Line 8** — `any[]` typing for mock file entries (minor).

### `components/customize/SkillFileTree.tsx`
- **Line 34** — `catch (err: any)` — prefer `unknown` + type guard.

### `components/customize/SkillContentPane.tsx`
- **Line 27** — `console.error('Failed to copy', err)` left in production code. This fires in the browser console on clipboard failures. Should be removed or replaced with a user-facing toast.

### `supabase/migrations/20260513_skills.sql`
- **Line 12** — `user_id UUID` has no `REFERENCES auth.users(id) ON DELETE CASCADE` constraint. If a Supabase user is deleted, their skill rows become orphaned and RLS policies will fail silently. Low urgency but worth adding.
- **Lines 15–18** — The `ALTER TABLE ADD COLUMN IF NOT EXISTS` idempotency block re-adds `source` with a `NOT NULL DEFAULT` constraint, but the `CREATE TABLE` already defined `source` the same way. On a fresh DB this causes a benign no-op; on an existing DB it might error on the `NOT NULL` default change. Not blocking but sloppy.

### `mcp/server.ts`
- Rename from `update_project` → `rename_project` and `description` param removal is a **breaking change** for any MCP client that currently calls `update_project` with `description`. There is no deprecation shim. Acceptable if the MCP server is single-user and the client config is updated simultaneously, but worth noting.
- `recall_memories` uses `ilike` for full-text search — correct for a prototype but note that this bypasses the Pinecone semantic search stack described in CLAUDE.md (`xeref_user_memory` namespace). Flagged as a tech-debt divergence for awareness.

### OAuth Login Routes (`google`, `notion`, `slack`, `vercel`)
- All four routes are structurally consistent and correct: auth check → HMAC-signed state cookie → provider redirect. `cookies()` is properly `await`ed per CLAUDE.md rules. `getUser()` is used (not `getSession()`). No issues found.

---

## 🔐 Security Alerts

**None.** No hardcoded API keys, secrets, or tokens detected in any changed file. All provider credentials are read from `process.env`. RLS is enabled on the new `skills` table with correct per-owner policies. The built-in skill's `endpoint_url` (`https://xeref.ai/code`) is a non-secret reference URL in seed data — not a concern.

---

## ✅ What Looks Good

1. **Skills CRUD is auth-hardened end-to-end.** Every server action calls `getUser()` before writing, `updateSkill` / `deleteSkill` double-check ownership via `.eq('user_id', user.id)` on the Supabase query (RLS + query-level guard), and `built-in` skills are explicitly blocked from mutation at the action layer before hitting the DB.

2. **OAuth redirect fix is clean and consistent.** All four provider login routes now use the same `NEXT_PUBLIC_SITE_URL || url.origin` pattern to build the `redirectUri`, eliminating the mismatch bug. Cookie options are uniform (`httpOnly`, `secure` on prod, `sameSite: lax`, 10-min TTL).

3. **Migration is idempotent and ships RLS from day one.** `CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS` before re-creating, and `ON CONFLICT DO UPDATE` for the seed row means this migration can be re-run safely. RLS is enabled immediately on table creation — no window where the table exists without access control.

---

## 🔧 Recommended Fixes (Priority Order)

1. **Replace mock file tree in `app/api/skills/[id]/files/route.ts`.** The `MOCK_FILES` constant makes the Skills file browser non-functional for any skill other than the hardcoded UUID. Either wire it to a real storage backend or remove the route and hide the UI behind a feature flag until it's ready.

2. **Remove `console.error` in `SkillContentPane.tsx:27`.** Replace with a silent no-op or a `toast.error('Failed to copy')` call to match the app's error-handling pattern.

3. **Add FK constraint on `skills.user_id`.** Alter the migration (or add a follow-up migration) to add `REFERENCES auth.users(id) ON DELETE CASCADE` so skill rows are cleaned up automatically when users are deleted.

4. **Fix `catch (err: any)` in `SkillFileTree.tsx:34`.** Use `catch (err: unknown)` and narrow the type before reading `err.message`.

5. **Document or version `rename_project` MCP tool break.** Add a comment in `mcp/server.ts` noting the renamed tool so operators know to update their MCP client configs. If multi-user support is planned, consider a deprecation alias.

---

## Summary

Today's two commits shipped the Skills system (DB migration, server actions, three new UI components) plus OAuth redirect fixes and MCP memory/project tool renames — a solid feature slice with good security hygiene. The biggest quality gap is the committed mock file-tree endpoint, which ships non-functional placeholder code to production. TypeScript and ESLint could not be fully evaluated due to missing `node_modules` in the review environment; install the dependencies and run `npx tsc --noEmit` locally before the next merge. Top action for tomorrow: replace the mock Skills file API or hide the file-browser UI behind a guard.
