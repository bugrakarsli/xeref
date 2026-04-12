# Dashboard v2 — Agent Selector, CRUD, Onboarding, Memory & Chat Tools

**Date**: April 12, 2026
**Status**: Planning

## Context

The dashboard has grown organically but several core features are stubs or missing:
- Agent selector only shows user projects, not system agents (XerefClaw, Xeref Agents)
- Sidebar items (projects, chats, tasks) are read-only with no inline CRUD
- Tasks view is a 39-line placeholder — no data model, no server actions
- No user onboarding for new signups
- No memory system
- No natural language CRUD from chat
- Workflows view is a disabled placeholder

This plan addresses all of these in a phased approach.

---

## Phase 1: Data Layer (DB + Types + Server Actions)

### 1a. New Supabase tables

**File**: `supabase/schema.sql` (append)

```sql
-- Tasks
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  due_date timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
alter table public.tasks enable row level security;
create policy "Users can CRUD own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Memories
create table public.memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  source text not null default 'manual' check (source in ('chat','manual')),
  tags text[] default '{}',
  created_at timestamptz default now() not null
);
alter table public.memories enable row level security;
create policy "Users can CRUD own memories" on public.memories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Workflows
create table public.workflows (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  trigger text not null,
  action text not null,
  enabled boolean not null default true,
  created_at timestamptz default now() not null
);
alter table public.workflows enable row level security;
create policy "Users can CRUD own workflows" on public.workflows
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Profile onboarding columns
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists primary_goal text;
alter table public.profiles add column if not exists preferred_model text;
alter table public.profiles add column if not exists onboarding_completed boolean default false;
```

### 1b. TypeScript types

**File**: `lib/types.ts` — add:

```ts
export interface Task {
  id: string
  user_id: string
  project_id: string | null
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Memory {
  id: string
  user_id: string
  content: string
  source: 'chat' | 'manual'
  tags: string[]
  created_at: string
}

export interface Workflow {
  id: string
  user_id: string
  name: string
  trigger: string
  action: string
  enabled: boolean
  created_at: string
}
```

### 1c. Server actions

**New file**: `app/actions/tasks.ts`
- `createTask(title, opts?: { description, project_id, priority, due_date })` → Task
- `getUserTasks()` → Task[]
- `updateTask(id, updates)` → Task
- `deleteTask(id)` → void

**New file**: `app/actions/memories.ts`
- `saveMemory(content, source, tags?)` → Memory
- `getUserMemories()` → Memory[]
- `deleteMemory(id)` → void

**New file**: `app/actions/workflows.ts`
- `getUserWorkflows()` → Workflow[]
- `updateWorkflow(id, updates)` → Workflow
- `seedDefaultWorkflows()` — creates "Save Memories from Chat" if none exist

**File**: `app/actions/projects.ts` — add:
- `renameProject(id, name)` → void

**File**: `app/actions/profile.ts` — add:
- `updateProfile(updates: { display_name?, role?, primary_goal?, preferred_model?, onboarding_completed? })` → void
- `getProfile()` → full profile row (not just plan)

---

## Phase 2: User Onboarding

### New component: `components/dashboard/onboarding-modal.tsx`

Multi-step dialog overlay (3-4 steps):
1. **Display Name** — text input, prefilled from Google OAuth if available
2. **Role** — selectable chips: Developer, Marketer, Founder, Freelancer, Other
3. **Primary Goal** — selectable chips: Build AI agents, Automate tasks, Learn AI, Manage team
4. **Preferred Model** — Haiku (fast), Sonnet (balanced), Opus (powerful) — with plan badges

On complete: call `updateProfile({ ...fields, onboarding_completed: true })`.

### Wire into DashboardShell

**File**: `components/dashboard/dashboard-shell.tsx`

- Accept `onboardingCompleted: boolean` prop (from `getProfile()` in `app/page.tsx`)
- If `!onboardingCompleted`, render `<OnboardingModal />` as an overlay
- On complete, set local state to dismiss

**File**: `app/page.tsx`

- Add `getProfile()` to the `Promise.all` fetch
- Pass `onboardingCompleted` to DashboardShell

---

## Phase 3: Pre-built System Agents

### New file: `lib/system-agents.ts`

Define 2 hardcoded system agents:

```ts
export interface SystemAgent {
  id: string            // 'system-xerefclaw' | 'system-xeref-agents'
  name: string
  icon: string          // Lucide icon name
  description: string
  systemPrompt: string
}

export const SYSTEM_AGENTS: SystemAgent[] = [
  {
    id: 'system-xerefclaw',
    name: 'XerefClaw',
    icon: 'Bot',
    description: 'General AI assistant with knowledge of CLAWS agent architecture',
    systemPrompt: 'You are XerefClaw, a helpful AI assistant...'
  },
  {
    id: 'system-xeref-agents',
    name: 'Xeref Agents',
    icon: 'BrainCircuit',
    description: 'Specialist in multi-agent architecture and team design',
    systemPrompt: 'You are Xeref Agents, an AI specialist...'
  },
]
```

### Update agent selector

**File**: `components/dashboard/chat/chat-input.tsx`

- Import `SYSTEM_AGENTS`
- Add `selectedSystemAgent` state (or extend selection to accept `Project | SystemAgent`)
- In the dropdown: show system agents first with a separator, then user projects
- `onProjectSelect` callback needs to differentiate: pass `{ type: 'system', agent }` or `{ type: 'project', project }`

**File**: `components/dashboard/chat/chat-interface.tsx`

- Update `sendMessage` body: if system agent selected, pass `systemAgentId` instead of `projectId`

### Update API route

**File**: `app/api/chat/route.ts`

- Accept `systemAgentId` in request body
- If present, look up `SYSTEM_AGENTS` by id and use its `systemPrompt` directly
- Keep existing `projectId` logic as fallback

---

## Phase 4: Sidebar CRUD

**File**: `components/dashboard/sidebar.tsx`

### Projects section (lines 275-291)
- On hover: show Pencil (rename) + Trash (delete) icons
- Pencil click: turn text into inline `<input>`, on blur/Enter call `renameProject(id, value)`
- Trash click: call `deleteProject(id)` with confirmation toast

### Chats section (lines 362-377)
- On hover: show Pencil (rename) + Trash (delete) icons
- Pencil: inline edit → `updateChatTitle(id, value)`
- Trash: `deleteChat(id)` with confirmation

### Props changes
- Add callback props: `onProjectRenamed`, `onProjectDeleted`, `onChatRenamed`, `onChatDeleted`
- Wire these from `DashboardShell` to update local state

**File**: `components/dashboard/dashboard-shell.tsx`
- Add handlers for rename/delete of projects and chats from sidebar
- Pass them down as props

---

## Phase 5: Tasks View Upgrade

**File**: `components/dashboard/tasks-view.tsx` — full rewrite

- Fetch tasks via `getUserTasks()` on mount (useEffect or passed as prop)
- Task list with columns: Title, Status (badge), Priority (color-coded), Due Date
- Create task: "Add Task" button opens inline form or small dialog (title, priority, optional project link)
- Status toggle: click status badge to cycle todo → in_progress → done
- Delete: trash icon on hover
- Filter: tabs for All / Todo / In Progress / Done

**File**: `components/dashboard/dashboard-shell.tsx`
- Fetch tasks in `app/page.tsx` and pass down, OR let TasksView fetch its own data on mount

---

## Phase 6: Natural Language CRUD via Chat (Tool Calling)

### Install zod (if not present)
```bash
npm install zod
```

### Define chat tools

**New file**: `lib/chat-tools.ts`

Define tool schemas using Vercel AI SDK `tool()`:

```ts
import { tool } from 'ai'
import { z } from 'zod'

export const chatTools = {
  create_task: tool({
    description: 'Create a new task when the user asks to add, create, or remember a task',
    parameters: z.object({
      title: z.string(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      description: z.string().optional(),
    }),
  }),

  list_tasks: tool({
    description: 'List the user\'s tasks when they ask to see, show, or check their tasks',
    parameters: z.object({
      status: z.enum(['todo', 'in_progress', 'done']).optional(),
    }),
  }),

  update_task: tool({
    description: 'Update a task status or details when the user says to mark, complete, or change a task',
    parameters: z.object({
      title: z.string().describe('The task title to search for'),
      status: z.enum(['todo', 'in_progress', 'done']).optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
    }),
  }),

  rename_project: tool({
    description: 'Rename a project when the user asks to rename or change the name of a project',
    parameters: z.object({
      current_name: z.string(),
      new_name: z.string(),
    }),
  }),

  save_memory: tool({
    description: 'Save something to memory when the user explicitly says "remember", "save this", "note this", or "don\'t forget"',
    parameters: z.object({
      content: z.string(),
      tags: z.array(z.string()).optional(),
    }),
  }),

  recall_memories: tool({
    description: 'Search memories when the user asks "what did I ask you to remember" or "do you remember"',
    parameters: z.object({
      query: z.string().optional(),
    }),
  }),
}
```

### Wire tools into API route

**File**: `app/api/chat/route.ts`

- Import `chatTools` and server actions
- Add `tools` parameter to `streamText()` call
- Each tool gets an `execute` async function that calls the appropriate server action
- For `save_memory`: check if the "Save Memories from Chat" workflow is enabled before saving
- Tool results are automatically streamed back to the client by AI SDK

### Render tool results in chat

**File**: `components/dashboard/chat/chat-message.tsx`

- Handle `tool-invocation` parts in messages
- Render tool results as styled cards (e.g., "Task created: Fix login bug" with a checkmark)

---

## Phase 7: Memory Workflow Toggle

**File**: `components/dashboard/workflows-view.tsx` — upgrade from placeholder

- Fetch workflows via `getUserWorkflows()` on mount
- Seed default "Save Memories from Chat" workflow if none exist (call `seedDefaultWorkflows()`)
- Show each workflow as a card with:
  - Name, trigger description, action description
  - Toggle switch (enabled/disabled) — calls `updateWorkflow(id, { enabled })`
- Keep "Create Workflow" button disabled with "Coming Soon" for custom workflows
- The memory-save tool in Phase 6 checks `getUserWorkflows()` for the memory workflow's `enabled` state

---

## Files Summary

| File | Action | Phase |
|------|--------|-------|
| `supabase/schema.sql` | Append tasks, memories, workflows tables + profile columns | 1 |
| `lib/types.ts` | Add Task, Memory, Workflow interfaces | 1 |
| `app/actions/tasks.ts` | New — full CRUD | 1 |
| `app/actions/memories.ts` | New — save, list, delete | 1 |
| `app/actions/workflows.ts` | New — list, update, seed defaults | 1 |
| `app/actions/projects.ts` | Add `renameProject()` | 1 |
| `app/actions/profile.ts` | Add `updateProfile()`, `getProfile()` | 1 |
| `components/dashboard/onboarding-modal.tsx` | New — multi-step onboarding | 2 |
| `components/dashboard/dashboard-shell.tsx` | Wire onboarding, sidebar CRUD callbacks, tasks | 2, 4, 5 |
| `app/page.tsx` | Fetch profile for onboarding check | 2 |
| `lib/system-agents.ts` | New — system agent definitions | 3 |
| `components/dashboard/chat/chat-input.tsx` | Add system agents to dropdown | 3 |
| `components/dashboard/chat/chat-interface.tsx` | Pass systemAgentId to API | 3 |
| `app/api/chat/route.ts` | Handle systemAgentId + add tool calling | 3, 6 |
| `components/dashboard/sidebar.tsx` | Add hover CRUD actions on projects/chats | 4 |
| `components/dashboard/tasks-view.tsx` | Full rewrite with real data + CRUD | 5 |
| `lib/chat-tools.ts` | New — tool definitions for AI SDK | 6 |
| `components/dashboard/chat/chat-message.tsx` | Render tool invocation results | 6 |
| `components/dashboard/workflows-view.tsx` | Upgrade to show memory workflow with toggle | 7 |
| `app/changelog/page.tsx` | Add v1.5.0 entry after completion | Post |

---

## Verification

### Phase 1
- Run new SQL in Supabase SQL Editor — verify tables created
- `npm run build` passes with new types and actions

### Phase 2
- New user signup → onboarding modal appears → fill steps → dashboard loads → refresh → modal doesn't reappear
- Existing user → no modal (already onboarded)

### Phase 3
- Open Chat → agent selector shows "XerefClaw" and "Xeref Agents" above user projects
- Select XerefClaw → type "hey" → get a normal conversational response (not a builder walkthrough)

### Phase 4
- Sidebar: hover over a project → see pencil + trash icons
- Click pencil → inline edit → save → name updates
- Click trash → project deleted, removed from sidebar
- Same for chats

### Phase 5
- Tasks view shows real tasks from DB
- Create a task via "Add Task" button → appears in list
- Toggle status → updates in DB
- Delete → removed

### Phase 6
- In chat: "remember that the API key expires in May" → AI calls save_memory tool → toast "Memory saved"
- In chat: "create a task to fix the login bug with high priority" → AI calls create_task → toast "Task created"
- In chat: "what tasks do I have?" → AI calls list_tasks → shows task list in response
- In chat: "rename this project to Agent v2" → AI calls rename_project → project renamed

### Phase 7
- Workflows view shows "Save Memories from Chat" with enabled toggle
- Toggle OFF → in chat "remember X" → AI responds that memory saving is disabled
- Toggle ON → works again
