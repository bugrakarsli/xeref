# Xeref Design — Next.js 15 / Tailwind 4 / Supabase

Research preview workspace at `/design` for branded prototypes, slide decks, and templates.

---

## Quick start

```bash
# 1. Install
pnpm install

# 2. Environment
cp .env.local.example .env.local
# → fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Run migration (paste SQL in Supabase SQL editor or push via CLI)
# supabase db push

# 4. Dev server
pnpm dev
```

Navigate to: http://localhost:3000/design

---

## File structure

```
src/
├── app/
│   ├── layout.tsx                        # Root layout
│   ├── globals.css                       # CSS variables + Tailwind
│   ├── design/page.tsx                   # RSC page — fetches org data server-side
│   └── api/
│       ├── projects/route.ts             # GET + POST /api/projects
│       ├── design-systems/route.ts       # GET + POST /api/design-systems
│       └── templates/route.ts            # GET + POST /api/templates
│
├── components/design/
│   ├── sidebar/
│   │   ├── sidebar-shell.tsx             # Full sidebar assembly
│   │   ├── sidebar-tabs.tsx              # Tab switcher (reads Zustand)
│   │   ├── launcher-panel.tsx            # Renders active panel
│   │   ├── design-system-cta.tsx         # "Set up design system" card
│   │   ├── account-menu.tsx              # Radix DropdownMenu account popover
│   │   └── panels/
│   │       ├── prototype-panel.tsx
│   │       ├── slide-deck-panel.tsx      # Radix Switch for speaker notes
│   │       ├── template-panel.tsx
│   │       └── other-panel.tsx
│   ├── layout/
│   │   └── main-content.tsx              # Org settings view with tabs
│   ├── modals/
│   │   ├── modal-root.tsx                # Renders the open modal from store
│   │   ├── tutorial-modal.tsx            # Radix Dialog role picker
│   │   └── create-design-system-modal.tsx
│   └── ui/
│       ├── button.tsx                    # Variant + size primitives
│       ├── badge.tsx
│       └── input.tsx
│
├── hooks/
│   ├── use-design-systems.ts             # Real-time Supabase subscription
│   ├── use-projects.ts
│   └── use-templates.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser client
│   │   ├── server.ts                     # Server / RSC client (cookies)
│   │   └── middleware.ts                 # Session refresh helper
│   └── utils.ts                          # cn()
│
├── middleware.ts                          # Next.js middleware
├── store/design-store.ts                  # Zustand: sidebar + modals + account
└── types/index.ts                         # All domain types

supabase/migrations/
└── 20260418_xeref_design.sql             # 5 tables + RLS + triggers
```

---

## Supabase data model

| Table | Description |
|---|---|
| `organizations` | Top-level tenant. Every user belongs to one. |
| `org_members` | User ↔ org with role, job_roles, tutorial_completed. |
| `design_systems` | Brand colors, typography, component patterns per org. |
| `project_templates` | Reusable project configs scoped to an org. |
| `projects` | Individual design projects linked to system, template, org. |

All tables use Row Level Security — users read/write only within their own org.

---

## Key dependencies

| Package | Purpose |
|---|---|
| `next` 15 | App Router, RSC, API route handlers |
| `@supabase/ssr` | Cookie-based auth for Next.js |
| `zustand` 5 | Client state (sidebar, modals, account menu) |
| `@radix-ui/react-dialog` | Accessible modal primitive |
| `@radix-ui/react-dropdown-menu` | Account popover |
| `@radix-ui/react-switch` | Speaker notes toggle |
| `lucide-react` | Icons |
| `tailwind-merge` + `clsx` | `cn()` utility |

---

## Adding a new project type tab

1. Add type to `src/types/index.ts` → `ProjectType` union.
2. Add to `TABS` array in `sidebar-tabs.tsx`.
3. Create `src/components/design/sidebar/panels/my-panel.tsx`.
4. Add render branch in `launcher-panel.tsx`.
5. Add Zustand state + actions in `design-store.ts`.

---

## Wiring Create buttons to backend

```ts
// In any panel component:
const res = await fetch("/api/projects", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: prototypeName,
    project_type: "prototype",
    prototype_mode: prototypeMode,
    visibility: "org",
  }),
});
const { data } = await res.json();
router.push(`/design/projects/${data.id}`);
```

---

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
