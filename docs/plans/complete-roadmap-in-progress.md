# Execution Plan: Complete IN PROGRESS Roadmap Items

## Context
The login page (`app/login/page.tsx`) has a Roadmap section showing IN PROGRESS items. This plan completes each one so they can be marked `done`. Research revealed that **Stats is already fully complete** — its label just needs updating. **Guest mode is being removed** from the roadmap entirely.

---

## Item 1: Stats — Mark as DONE (no code needed)

**Finding:** Both charts are fully implemented with custom SVG:
- Heatmap: `components/dashboard/stats-view.tsx` lines 155–193
- Velocity: `components/dashboard/stats-view.tsx` lines 197–256
- Data: `app/actions/stats.ts` — `getTaskCompletionHeatmap()` + `getTaskVelocity()`

**Action:** Change `status: 'partial'` → `status: 'done'` for the Stats entry in `app/login/page.tsx` (Phase 3 roadmap array).

---

## Item 2: Remove Guest Mode from Roadmap

**Action:** Remove the `{ text: 'Guest mode (Supabase anon + rate limit)', status: 'partial' }` entry from the Phase 1 items array in `app/login/page.tsx`.

---

## Item 3: Projects CRUD + AI Goal Decomposition — Mark as DONE

**Finding:** All CRUD + AI decomposition is fully implemented:
- `app/actions/projects.ts` — `saveProject`, `getUserProjects`, `renameProject`, `updateProjectPrompt`, `deleteProject`, `decomposeProjectGoals`, `getProjectGoals`, `toggleProjectGoal`
- UI: `CreateProjectDialog`, `ProjectGoalsList`, `ProjectCard`, sidebar inline rename

**Remaining gap:** No dedicated Projects view accessible from the dashboard sidebar — projects only appear in the Home view.

**Action:**
1. Add `'projects'` to the `ViewKey` union in `lib/types.ts`
2. Create `components/dashboard/projects-view.tsx` — lists all projects as cards with create/rename/delete and goal decomposition, reusing existing `ProjectCard` and `CreateProjectDialog` components from `home-view.tsx`
3. Wire the new view into `DashboardShell` (`components/dashboard/dashboard-shell.tsx`) and add a "Projects" nav item to the sidebar (`components/dashboard/sidebar.tsx`)
4. Change roadmap status → `done` in `app/login/page.tsx`

---

## Item 4: Tasks & Notes CRUD + Daily Targets — Mark as DONE

**Finding:** Full CRUD + kanban + daily targets all implemented in `components/dashboard/tasks-view.tsx` and `app/actions/tasks.ts`. Only polish is missing.

**Remaining gap:** Task list has no search or project filter (the `project_id` FK exists but isn't exposed in the UI).

**Action:**
1. Add a search input + project filter dropdown to `components/dashboard/tasks-view.tsx` (above the task list, client-side filter against loaded tasks using existing `project_id` field)
2. Change roadmap status → `done` in `app/login/page.tsx`

---

## Item 5: Workflows: Cron + Webhook Triggers — Mark as DONE

**Finding:**
- Webhook trigger: **fully working** (`app/api/webhooks/workflow/route.ts`)
- `scheduled_daily` / `scheduled_weekly`: **working** via Vercel Cron at 09:00 UTC (`app/api/cron/run-workflows/route.ts`)
- `task_created` / `task_completed` triggers: UI exists but never called from task actions

**Action:**
1. Add helper `runWorkflowsForEvent(trigger: string, userId: string)` in `app/actions/workflows.ts` — queries enabled workflows with matching trigger and executes their action (reuse existing `runWorkflow()` logic)
2. Call it at end of `createTask()` in `app/actions/tasks.ts` for `task_created`
3. Call it when `updateTask()` sets `status='done'` in `app/actions/tasks.ts` for `task_completed`
4. Change roadmap status → `done` in `app/login/page.tsx`

---

## Execution Order

| # | Item | Effort | Files Changed |
|---|------|--------|---------------|
| 1 | Stats → DONE + remove Guest Mode | 5 min | `app/login/page.tsx` |
| 2 | Tasks search + project filter | 30 min | `components/dashboard/tasks-view.tsx`, `app/login/page.tsx` |
| 3 | Workflow task triggers | 45 min | `app/actions/tasks.ts`, `app/actions/workflows.ts`, `app/login/page.tsx` |
| 4 | Projects view | 60 min | `lib/types.ts`, new `components/dashboard/projects-view.tsx`, `components/dashboard/dashboard-shell.tsx`, `components/dashboard/sidebar.tsx`, `app/login/page.tsx` |

---

## Verification
- Stats view: navigate to `/` → Stats → confirm heatmap + velocity render with real data
- Tasks: create tasks across projects, verify search and project filter work
- Workflows: create a `task_created` workflow, create a task, check execution logs appear
- Projects view: navigate to Projects tab, create/rename/delete a project, trigger AI decomposition
- Roadmap: visit `/login`, scroll to Roadmap — all remaining items show green "DONE"
