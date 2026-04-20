# Xeref Design — Setup Guide

Research preview workspace at `/design` for branded prototypes, slide decks, and templates.

---

## Quick start

```bash
# 1. Install dependencies (zustand already added)
npm install

# 2. Environment — all vars already in .env.local:
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 3. Run migration (paste SQL in Supabase SQL editor or push via CLI)
supabase db push
# or paste supabase/migrations/20260418_xeref_design.sql in the Supabase SQL editor

# 4. Dev server
npm run dev
```

Navigate to: http://localhost:3000/design

---

## File structure (within xeref app)

```
app/design/
├── page.tsx                              # RSC page — fetches org data server-side
├── layout.tsx                            # Nested layout: scopes design CSS tokens
└── design.css                            # Design feature CSS vars + Tailwind theme additions

app/api/
├── projects/route.ts                     # GET + POST /api/projects (design_projects table)
├── design-systems/route.ts               # GET + POST /api/design-systems
└── templates/route.ts                    # GET + POST /api/templates

components/design/
├── sidebar-shell.tsx                     # Full sidebar assembly
├── sidebar-tabs.tsx                      # Tab switcher (reads Zustand)
├── launcher-panel.tsx                    # Renders active panel
├── design-system-cta.tsx                 # "Set up design system" card
├── account-menu.tsx                      # Radix DropdownMenu account popover
├── main-content.tsx                      # Org settings view with tabs
├── panels/
│   ├── prototype-panel.tsx
│   ├── slide-deck-panel.tsx              # Radix Switch for speaker notes
│   ├── template-panel.tsx
│   └── other-panel.tsx
├── modals/
│   ├── modal-root.tsx                    # Renders the open modal from store
│   ├── tutorial-modal.tsx                # Radix Dialog role picker
│   └── create-design-system-modal.tsx
└── ui/
    ├── button.tsx                        # Design-specific variant primitives
    ├── badge.tsx
    └── input.tsx

hooks/
├── use-design-systems.ts                 # Real-time Supabase subscription
├── use-projects.ts                       # (useDesignProjects)
└── use-templates.ts

store/design-store.ts                     # Zustand: sidebar + modals + account
types/design.ts                           # All design domain types
supabase/migrations/20260418_xeref_design.sql
```

---

## Supabase data model

| Table | Description |
|---|---|
| `organizations` | Top-level tenant. Every user belongs to one. |
| `org_members` | User ↔ org with role, job_roles, tutorial_completed. |
| `design_systems` | Brand colors, typography, component patterns per org. |
| `project_templates` | Reusable project configs scoped to an org. |
| `design_projects` | Individual design projects (renamed from `projects` to avoid collision). |

All tables use Row Level Security — users read/write only within their own org.

---

## Organization onboarding

The `/design` page requires the user to belong to an `org_members` row. Until an org is created and the user is added, the page renders with empty design systems and templates.

To create an org and add yourself as owner, run in Supabase SQL editor:

```sql
INSERT INTO organizations (name, slug) VALUES ('My Org', 'my-org');
INSERT INTO org_members (org_id, user_id, role)
  VALUES (
    (SELECT id FROM organizations WHERE slug = 'my-org'),
    '<your-user-uuid>',
    'owner'
  );
```

---

## Adding a new project type tab

1. Add type to `types/design.ts` → `ProjectType` union.
2. Add to `TABS` array in `components/design/sidebar-tabs.tsx`.
3. Create `components/design/panels/my-panel.tsx`.
4. Add render branch in `components/design/launcher-panel.tsx`.
5. Add Zustand state + actions in `store/design-store.ts`.

---

## Wiring Create buttons to backend

```ts
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
```
