# Xeref — Daily Code Review
# Date: 2026-05-13
# Commits reviewed: 1

> **Note on scope:** `git log --since="24 hours ago"` returned no results (commit timestamp is ~27 hrs old in UTC). The most recent commit `e20b731` (2026-05-12 03:26 +0300) is included as the subject of this nightly review since it represents today's shipped work.

---

## TypeScript Status: 🟡 WARNING — environment blocked

`npx tsc --noEmit` exited with errors, but **all errors are environment-level**: `node_modules` is not installed in this CI environment (`npm install` was never run). Every error is a `TS2307: Cannot find module 'next'` or `TS7026: JSX element implicitly has type 'any'` — symptoms of missing `@types/react`, `next`, and `lucide-react` type packages, not of code defects introduced by this commit.

**Action required:** Ensure `npm ci` runs before the nightly type-check step. The codebase itself is not the source of these errors.

---

## ESLint Status: 🟡 WARNING — environment blocked

`npx eslint` also cannot run without `node_modules`. No lint results available.

---

## Code Quality Flags

### 1. Authorization regression — POST role check removed
**Files:** `app/api/design-systems/route.ts:27` · `app/api/templates/route.ts:27`

The original `POST` handlers verified `["owner", "admin"].includes(m.role)` before allowing creation. Both were dropped when switching to the admin client bypass. As a result, **any authenticated org member** can now create design systems and project templates — not just owners/admins. The admin client was the right fix for the RLS recursion, but role enforcement should be an independent, explicit check on top of it.

**Suggested fix:**
```ts
// After ensureOrgForUser, explicitly re-check role via admin client
const { data: membership } = await admin
  .from("org_members")
  .select("role")
  .eq("user_id", user.id)
  .eq("org_id", orgId)
  .single();
if (!["owner", "admin"].includes(membership?.role ?? "")) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### 2. Unhandled error in Server Component page
**File:** `app/design/page.tsx:16`

```ts
await ensureOrgForUser(user);  // no try/catch
```

If `ensureOrgForUser` throws (DB timeout, Supabase outage, slug uniqueness race — see #3), the entire `/design` page crashes with an unhandled 500. A Server Component with side effects should guard this:

```ts
try {
  await ensureOrgForUser(user);
} catch (e) {
  console.error("ensureOrgForUser failed:", e);
  // continue — org will be null, page renders in degraded mode
}
```

### 3. Race condition in `ensureOrgForUser` — org creation
**File:** `lib/design/ensure-org.ts:30-40`

The slug-existence check and subsequent `INSERT` into `organizations` are not atomic. Two concurrent first-visits by the same user (e.g., double-click or parallel tab open) can both observe `existingOrg === null` and both attempt `INSERT`. The second insert will fail with a unique constraint violation on `slug`. The error message will be something like `"duplicate key value violates unique constraint"` — this is **not** caught by the existing membership-duplicate guard (which only runs for `org_members`). The org insert error propagates as `"Failed to create org: duplicate key value..."`.

**Suggested fix:** catch unique-constraint errors on org insert and re-fetch the org by slug:
```ts
if (orgErr) {
  if (orgErr.message.includes("duplicate")) {
    const { data: retried } = await admin.from("organizations").select("id").eq("slug", slug).maybeSingle();
    if (!retried) throw new Error("Org creation conflict unresolvable");
    orgId = retried.id;
  } else {
    throw new Error(`Failed to create org: ${orgErr.message}`);
  }
}
```

### 4. Two admin clients created per API request
**Files:** `app/api/design-systems/route.ts` · `app/api/projects/route.ts` · `app/api/templates/route.ts`

`ensureOrgForUser()` already calls `createAdminClient()` internally. Each route then calls `createAdminClient()` again for the data query. This doubles the Supabase client instantiations per request. Minor overhead, but easy to fix: `ensureOrgForUser` could return the admin client alongside the orgId, or the routes could pass in an already-created client.

### 5. `handleCreate` logic duplicated across 4 panel files
**Files:** `components/design/panels/prototype-panel.tsx` · `slide-deck-panel.tsx` · `other-panel.tsx` · `template-panel.tsx`

Each panel implements an almost-identical `handleCreate` async function (~30 lines each). The only differences are `project_type`, field names, and toast strings. Not blocking, but a shared `useCreateProject(type, payload)` hook would eliminate ~90 lines of duplication and make future changes (e.g., adding optimistic updates) a single-site edit.

### 6. `app/design/page.tsx` still queries `org_members` via user-scoped RLS client
**File:** `app/design/page.tsx:18-27`

After calling `ensureOrgForUser`, the page uses the standard (RLS-governed) `supabase` client to query `org_members`. While the SQL migration fixes the recursion, this read still goes through user-level RLS. If there are any edge cases with the new `SECURITY DEFINER` function (e.g., it's not yet applied in staging), the page silently falls through with `orgId = null` and renders empty. This is acceptable behavior, but worth noting in testing.

---

## Security Alerts

No hardcoded API keys, secrets, or tokens found in this commit.

The `lib/supabase/admin.ts` admin client correctly reads `SUPABASE_SERVICE_ROLE_KEY` from `process.env` and is located in `lib/` (server-only path). No risk of this being bundled into the browser client.

The SQL migration's `SECURITY DEFINER` function (`is_org_admin`) is correctly scoped — it reads from `org_members` using the function owner's privileges and `auth.uid()` for identity, which is the standard Supabase pattern for breaking RLS recursion safely.

---

## What Looks Good

1. **RLS recursion fix is architecturally correct.** Using a `SECURITY DEFINER` SQL function to break the self-referencing `org_members` policy is the right approach, and the migration correctly recreates the policies for `design_systems` and `project_templates` too — not just `org_members`.

2. **`ensureOrgForUser` is well-structured for idempotency.** The three-step flow (check membership → check slug → insert org → insert membership) handles all re-entrant cases: returning users, previously failed org creation, and concurrent membership inserts. The only gap is concurrent *org* creation (flag #3 above).

3. **Error handling on client-side `fetch` calls is solid.** Every `handleCreate` function in the four panel components handles both non-OK HTTP responses (`res.ok` check) and network-level exceptions (`catch` block), displaying user-friendly toast messages in both cases.

---

## Recommended Fixes (Priority Order)

1. **[High] Restore role-based authorization on design system and template POST endpoints** (`app/api/design-systems/route.ts`, `app/api/templates/route.ts`). An authorization regression that lets any user promote themselves to creator is higher priority than a cosmetic or performance issue.

2. **[Medium] Add try/catch around `ensureOrgForUser` in `app/design/page.tsx`**. A DB failure in a side-effect call should degrade gracefully, not hard-crash the page.

3. **[Medium] Fix race condition in `ensureOrgForUser` org insertion** (`lib/design/ensure-org.ts`). Catch unique-constraint errors on org insert and re-fetch by slug before re-throwing.

4. **[Low] Run `npm ci` before nightly type-check and lint.** The environment must have `node_modules` for any static analysis to be meaningful.

5. **[Low] Extract shared `useCreateProject` hook** to eliminate the 4× duplication of `handleCreate` logic across panel components.

---

## Summary

Today's commit ships a meaningful feature (fully wired `/design` page with project creation, org bootstrap, and an RLS recursion fix) and is generally well-constructed. The SQL migration and admin-client bypass are correct solutions for the RLS problem. However, one authorization regression slipped through: the role check that previously blocked non-owner/admin members from creating design systems and templates was removed alongside the RLS bypass — these are independent concerns and the role gate needs to be restored. Two secondary issues (unhandled throw in the Server Component and a race condition in org creation) are likely dormant under normal load but worth addressing before they cause incidents. The nightly CI environment needs `npm install` to enable TypeScript and ESLint checks going forward.
