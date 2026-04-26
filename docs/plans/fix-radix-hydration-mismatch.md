# Plan: Fix Radix UI Hydration Mismatch in Sidebar

## Context

The dashboard shows a React hydration error where Radix UI `DropdownMenuTrigger` buttons have different `id` attributes between server-rendered HTML and the client's first render. The error traces to `app/page.tsx → DashboardShell → Sidebar`.

**Root cause**: `Sidebar` is a `'use client'` component that Next.js server-renders. It contains `DropdownMenu` (from Radix UI) in three places:
1. Each `RecentChatItem` (chat list dropdown)
2. Each `PinnedChatItem` (pinned chats dropdown)
3. The user navbar dropdown at the bottom

Radix uses React's `useId()` to generate `id` attributes. `useId()` encodes the component's **position in the fiber tree**. If the tree structure differs even subtly between server and client, all subsequent `useId()` values shift — producing the observed ID mismatch.

The `Sidebar` is heavily client-side in practice: it loads `pinnedChats` from `localStorage` via `useEffect`, uses `useRouter`, `usePathname`, and manages multiple interactive states. SSR provides little value while introducing this hydration fragility.

## Approach: `dynamic` import with `ssr: false`

Prevent SSR of `Sidebar` entirely in `dashboard-shell.tsx`. This is the correct architectural fix because:
- No server HTML to hydrate → no hydration mismatch
- The `Sidebar`'s content (chats, pinned, user state) is always client-driven anyway
- The dashboard is behind auth — there's no SEO or first-paint value from SSR-ing the sidebar

## Changes

### 1. `components/dashboard/dashboard-shell.tsx`

Remove the static import:
```tsx
import { Sidebar } from './sidebar'
```

Add a dynamic import:
```tsx
import dynamic from 'next/dynamic'

const Sidebar = dynamic(
  () => import('./sidebar').then((m) => ({ default: m.Sidebar })),
  {
    ssr: false,
    loading: () => (
      <div
        className={cn(
          'flex h-full bg-card border-r transition-all duration-200 shrink-0',
          'w-56' // default non-collapsed width; avoids layout shift
        )}
      />
    ),
  }
)
```

The `loading` placeholder matches the sidebar's default width so the main content area doesn't reflow when the sidebar mounts.

### 2. `components/dashboard/sidebar.tsx` — guard pinned section with `isHydrated`

Change line ~714 from:
```tsx
{!collapsed && (
  <div className="flex flex-col flex-1 mt-2 min-h-0">
    {/* Pinned section */}
```
to:
```tsx
{!collapsed && isHydrated && (
  <div className="flex flex-col flex-1 mt-2 min-h-0">
    {/* Pinned section */}
```

This ensures the pinned + recents section (all `RecentChatItem` / `PinnedChatItem` dropdowns) doesn't render until after localStorage loads. Defense-in-depth on top of `ssr: false`.

## Critical Files

- `components/dashboard/dashboard-shell.tsx` — add `dynamic` import, remove static import
- `components/dashboard/sidebar.tsx` — line ~714: add `isHydrated &&` to the `!collapsed` guard

## Verification

1. `npm run dev` — confirm no hydration error in browser console on dashboard load
2. Hard-refresh several times — error is intermittent, verify it no longer appears
3. Confirm sidebar renders correctly after JS loads (chat list, pinned section, user menu all present)
4. Confirm collapsed/expanded toggle still works
5. `npm run build` — no TypeScript errors from the dynamic import
