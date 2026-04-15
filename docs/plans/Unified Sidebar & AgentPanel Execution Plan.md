# Unified Sidebar & AgentPanel Execution Plan

## Overview

This plan covers four coordinated changes to the Antigravity IDE:

1. **Unified Sidebar** — Rebuild the sidebar using Image 3's top icon-tab navigation (Chat / Tasks / Code) while preserving all existing sections not shown in Image 3.
2. **Deduplication** — Remove buttons that are redundant between the Dashboard sidebar and the AgentManager sidebar.
3. **AgentPanel Backend Swap** — Keep the AgentPanel UI (Image 4) identical but wire the chat input to the same LLM backend as the main Dashboard chat.
4. **Ctrl+E / Ctrl+L Keyboard Shortcuts** — Already confirmed working. No changes needed.

The recommendation is to **use the Dashboard sidebar (Image 1) as the canonical sidebar shell** and migrate the AgentManager-specific items into it as a tab, because the Dashboard sidebar already contains the richer section structure (Projects, AI Agents, Chats/Recents).

---

## Phase 1 — Sidebar Restructure (Image 3 Navigation)

### 1.1 Add the Three-Tab Icon Strip

At the very top of the sidebar, replace the current top area with three icon tabs:

| Icon                | Label | Renders                                                     |
| ------------------- | ----- | ----------------------------------------------------------- |
| Chat bubble         | Chat  | Existing Recents + AI Agents + Pinned sections              |
| Checkbox            | Tasks | Existing Tasks list + Advanced (Stats, Calendar, Workflows) |
| Code brackets `</>` | Code  | Workspaces (portfolio, xeref-claw, XerefWhisper-desktop)    |

**Implementation steps:**

1. Create a `SidebarTabBar` component with three `IconTab` buttons.
2. Manage active tab in a `useState` hook (default: `"chat"`).
3. Conditionally render section groups below the tab bar based on the active tab value.
4. Apply an active indicator (underline or filled background) matching Image 3's style.

```tsx
// SidebarTabBar.tsx
type Tab = "chat" | "tasks" | "code";

const tabs: { id: Tab; icon: ReactNode; label: string }[] = [
  { id: "chat", icon: <ChatIcon />, label: "Chat" },
  { id: "tasks", icon: <TasksIcon />, label: "Tasks" },
  { id: "code", icon: <CodeIcon />, label: "Code" },
];
```

### 1.2 Section Mapping Per Tab

**Chat Tab** (default view):

- `+ New Chat` button
- `Projects` section (collapsible) — preserved from Image 1
- `AI AGENTS` section — XerefClaw, Xeref Agents — preserved from Image 1
- **`Pinned`** section (new, see §1.3)
- **`Recents >`** section — renamed from CHATS; same data, scrollable (see §1.4)

> ⚠️ **Remove the standalone "Chat" nav button** that currently exists under the CHATS section in Image 1. It is replaced entirely by the Chat tab in the icon strip — the tab renders the same existing view directly.

**Tasks Tab**:

- `ADVANCED` section (Stats, Calendar, Workflows) — preserved from Image 1
- `Tasks` item — preserved from Image 1

> ⚠️ **Remove the standalone "All Tasks" button** from the sidebar. It is replaced by the Tasks tab in the icon strip — the tab renders the same existing tasks view directly.

**Code Tab** (maps to Workspaces in Image 2):

- `WORKSPACES` section with folder icon — portfolio, xeref-claw, XerefWhisper-desktop
- `Open Editor` button / shortcut hint

### 1.3 Pinned Section — Drag & Drop

The `Pinned` section in Image 3 shows "Drag to pin" as a placeholder. Implement as follows:

1. Wrap the Pinned section and each chat item in `@dnd-kit/core` drag/drop context (or `react-dnd` if already used in the project).
2. A chat item dragged over the Pinned section triggers a visual highlight on the drop zone.
3. On drop, add the chat ID to a `pinnedChats: string[]` array stored in user preferences (local state or user preferences store).
4. Pinned items render at the top of the Pinned section with a 🔔 pin icon — matching Image 3.
5. Right-click on a pinned item → "Unpin" to remove.

```ts
// userPreferences.ts
interface UserPreferences {
  pinnedChats: string[]; // chat IDs
  // ...existing fields
}
```

### 1.4 Recents Section — Scrollable Chat History

The `Recents >` section is a **rename of the existing CHATS section** in Image 1 — same data source, same conversations. The scroll area must be **isolated** — only the Recents list scrolls, not the entire sidebar.

1. Rename the section header from `CHATS` to `Recents >`.
2. The `>` acts as an expander toggle (chevron).
3. When expanded, wrap the list in a `<div>` with `overflow-y: auto` and `max-height: calc(100vh - {topOffset}px)` so only this region scrolls.
4. Each item shows: chat title, timestamp (relative), agent icon.
5. Clicking a Recents item opens the conversation in the main chat panel.

```tsx
// RecentsList.tsx
<div
  className="recents-scroll"
  style={{ overflowY: "auto", maxHeight: "40vh" }}
>
  {recentChats.map((chat) => (
    <RecentChatItem key={chat.id} chat={chat} />
  ))}
</div>
```

---

## Phase 2 — AgentManager Sidebar Deduplication

Based on research into how Antigravity's Agent Manager is designed to work, the Agent Manager is a **mission control surface** for spawning, orchestrating, and observing multiple concurrent agents across workspaces. Its sidebar must retain all items necessary for this workflow. Items that are **global app navigation** (not agent-management-specific) should be removed.[^1][^2]

### MVP Items to Keep in AgentManager Sidebar

These items are **core to the Agent Manager's unique purpose** and must not be removed:

| Item                                                              | Why Keep                                                                                                    |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Workspaces list** (portfolio, xeref-claw, XerefWhisper-desktop) | Agents are assigned per workspace; this is the primary unit of orchestration [^3]                           |
| **New Conversation** (within workspace context)                   | Starting a new agent conversation inside a workspace is workspace-scoped, not global                        |
| **Conversation History** (per workspace)                          | Each workspace has its own agent conversation thread; essential for multi-agent monitoring [^1]             |
| **Open Editor** button                                            | Core toggle to switch from Agent Manager to Editor view [^1]                                                |
| **Artifacts** (if shown in sidebar)                               | Agents produce Artifacts (plans, screenshots, walkthroughs); reviewing them is central to the workflow [^2] |
| **Inbox / Tasks** (if workspace-scoped)                           | Tracks pending agent tasks and approval requests within the agent manager [^4]                              |

### Items to Remove from AgentManager Sidebar (Global Nav Duplicates)

| Item                                                                                                | Reason to Remove                                       |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Global "New Conversation" / "New Chat" button** (if it opens the global chat, not workspace chat) | Already present in Dashboard sidebar Chat tab          |
| **Global Tasks / All Tasks**                                                                        | Replaced by Dashboard Tasks tab                        |
| **Global Workflows**                                                                                | Accessible from Dashboard Tasks tab (Advanced section) |
| **Global Settings**                                                                                 | Accessible from Dashboard bottom nav                   |
| **Global Stats / Calendar**                                                                         | Dashboard Tasks tab (Advanced section)                 |

> ⚠️ **Decision rule:** If an item in the AgentManager sidebar operates at the **workspace or agent level**, keep it. If it navigates to a **global app section** that the Dashboard sidebar already covers, remove it.

The `Ctrl+E` / `Close Manager` button in the AgentManager header calls the same `toggleAgentManager()` handler as the keyboard shortcut — confirm both paths are wired to the same function before removing any nav items.

---

## Phase 3 — AgentPanel LLM Backend (Image 4)

### 3.1 Current State

Image 4 shows the AgentPanel (opened via `Ctrl+L`) with a chat input that says "Ask anything (⌘L), @ to mention, / for workflows". The error `[Error: Failed to get full response. Please try again.]` confirms the backend is not yet wired to a real LLM provider.

The UI is already correct — **do not touch the view layer**.

### 3.2 Backend Integration Steps

The AgentPanel already uses the same chat input component as the main Dashboard chat (Planning mode + model selector visible at bottom). Wire it to the **same API route and service** already used by the Dashboard chat — do not create a parallel implementation.

**Step 1 — Identify the existing chat handler**

Find the function handling message submission in the main Dashboard chat (Image 1). It calls an API route (e.g., `/api/chat`). Note the exact request/response shape.

**Step 2 — Reuse the same handler in AgentPanel**

```ts
// agentPanelService.ts — reuses existing chatService, no new backend needed
import { sendChatMessage } from "@/services/chatService"; // existing Dashboard service

export async function sendAgentPanelMessage(
  message: string,
  model: string,
  mode: string,
  conversationHistory: Message[],
): Promise<string> {
  // Calls the exact same function/route as the Dashboard chat
  return sendChatMessage({
    message,
    model,
    mode,
    history: conversationHistory,
  });
}
```

**Step 3 — Sync the Model Selector with Dashboard Models**

The model selector in the AgentPanel (Image 4: "Gemini 2.5 Flash") must display **exactly the same model list** as the main Dashboard chat model selector. Do not hardcode a separate list:

1. Extract the model list into a shared constant or hook (e.g., `useAvailableModels()`).
2. Import and use this shared list in both the Dashboard chat model selector and the AgentPanel model selector.
3. This ensures any future model additions or removals propagate to both components automatically.

```ts
// models.config.ts — single source of truth
export const AVAILABLE_MODELS = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-3-pro", label: "Gemini 3 Pro" },
  { id: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
  // add / remove here only
];
```

```tsx
// Both Dashboard chat AND AgentPanel import from the same config:
import { AVAILABLE_MODELS } from "@/config/models.config";
```

**Step 4 — Connect to AgentPanel component**

In `AgentPanel.tsx`, find the `onSubmit` handler of the chat input. Replace the broken call with `sendAgentPanelMessage(...)`. Update conversation state with the returned reply. Do not change any UI components.

**Step 5 — Streaming (optional, recommended)**

For UX consistency with the Dashboard chat, use the same streaming renderer. The AgentPanel's chat view already mirrors the Dashboard chat bubble style (Image 4), so the streaming tokens will render identically.

---

## Phase 4 — Keyboard Shortcuts

All shortcuts are **already confirmed working**. No implementation changes required — only verify during regression testing.

| Shortcut           | Behavior                             |
| ------------------ | ------------------------------------ |
| `Ctrl+E` / `Cmd+E` | Toggle Dashboard ↔ AgentManager view |
| `Ctrl+L` / `Cmd+L` | Open / close AgentPanel              |

Ensure `Ctrl+E` in AgentManager triggers the same handler as the `Close Manager` button in the AgentManager header.

---

## Recommended Implementation Order

| Step | Task                                                               | Complexity  |
| ---- | ------------------------------------------------------------------ | ----------- |
| 1    | Build `SidebarTabBar` component + tab state                        | Low         |
| 2    | Assign sections to Chat / Tasks / Code tabs                        | Low         |
| 3    | Remove standalone Chat button and All Tasks button                 | Low         |
| 4    | Rename CHATS → Recents + add isolated scroll area                  | Low         |
| 5    | Implement Pinned section with drag-and-drop                        | Medium-High |
| 6    | Extract model list to shared `models.config.ts`                    | Low         |
| 7    | Wire AgentPanel `onSubmit` to existing chat service                | Medium      |
| 8    | AgentManager sidebar deduplication (global nav items only)         | Low         |
| 9    | Cross-view regression test (Dashboard ↔ AgentManager ↔ AgentPanel) | Medium      |

---

## Claude Code Prompt Sequence

### Prompt 1 — Sidebar Tab Navigation

```
Add a three-tab icon strip at the top of the sidebar with tabs: Chat (chat bubble icon),
Tasks (checkbox icon), Code (</> icon). Manage active tab in useState.

When Chat is active show: New Chat button, Projects section, AI Agents section,
Pinned section (empty with "Drag to pin" placeholder), Recents section (renamed from CHATS).
When Tasks is active show: Stats, Calendar, Workflows (Advanced section), Tasks item.
When Code is active show: Workspaces section (portfolio, xeref-claw, XerefWhisper-desktop).

Also remove the standalone "Chat" button under the CHATS section and the standalone
"All Tasks" button — they are now replaced by the Chat tab and Tasks tab respectively.
Do not remove any other existing sections.
```

### Prompt 2 — Recents Scrollable Section

```
Rename the CHATS section header to "Recents >". Keep the same data source and
conversation items — only the label changes.
Make the ">" a chevron toggle. When expanded, wrap the list in a scroll area
(overflow-y: auto, max-height: 40vh). Only the Recents list scrolls —
the rest of the sidebar must remain fixed position.
```

### Prompt 3 — Pinned Section Drag & Drop

```
In the sidebar Chat tab, add a "Pinned" section with a "Drag to pin" placeholder when empty.
Use @dnd-kit/core to make each Recents chat item draggable.
When a chat item is dropped onto the Pinned section, add its ID to pinnedChats array
in the user preferences store. Render pinned chats with a pin icon.
Add right-click "Unpin" context menu item.
```

### Prompt 4 — AgentManager Deduplication

```
Review AgentManagerView sidebar. Remove only items that are global app navigation
already present in the main Dashboard sidebar: global All Tasks, global Workflows,
global Stats/Calendar, global Settings.

Keep all workspace-scoped and agent-management-specific items:
workspace list, per-workspace conversation history, New Conversation (workspace-scoped),
Open Editor button, Artifacts, Inbox/Tasks (if workspace-scoped).

Ensure the Close Manager button calls the same toggleAgentManager() handler
as the Ctrl+E keyboard shortcut.
```

### Prompt 5 — AgentPanel Model Sync + LLM Backend

```
1. Extract the model list from the Dashboard chat model selector into a shared
   constant file at src/config/models.config.ts. Import and use this same list
   in the AgentPanel model selector so both always show identical options.

2. In AgentPanel component, find the chat input submit handler.
   Replace the current broken call with the same chat service function used
   by the Dashboard chat (do not create a new API route).
   Pass the selected model and planning mode from the AgentPanel UI state
   into the service call. Handle errors using the existing error message UI.
   Do not change any UI components.
```

---

## Key Files to Locate Before Starting

| File                                     | Purpose                                  |
| ---------------------------------------- | ---------------------------------------- |
| `Sidebar.tsx` / `AppSidebar.tsx`         | Main sidebar shell                       |
| `AgentManagerView.tsx`                   | Ctrl+E view (Image 2)                    |
| `AgentPanel.tsx`                         | Ctrl+L floating panel (Image 4)          |
| `useKeyboardShortcuts.ts`                | Global shortcut handler                  |
| `chatService.ts` / `api/chat/route.ts`   | Existing LLM call to reuse in AgentPanel |
| User preferences store (Zustand / Redux) | For `pinnedChats` persistence            |

---

## References

1. [Getting Started with Google Antigravity](https://codelabs.developers.google.com/getting-started-google-antigravity) - This codelab guides you through the process of installing and experiencing the features of Google An...

2. [Build with Google Antigravity, our new agentic development platform](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/) - Google Antigravity: The agentic development platform that lets agents autonomously plan, execute, an...

3. [Google Antigravity: 5 Key Features of the Next-Gen Agentic ...](https://zeabur.com/blogs/google-antigravity-agentic-ide-features) - Before writing code, Antigravity generates an Implementation Plan. The killer feature here is the ab...

4. [What Is Google Antigravity? AI Coding Tutorial & Gemini 3 ...](https://www.youtube.com/watch?v=MAUpppfg9Go) - Hi Friends, my name is Callum aka wanderloots & welcome to Antigravity! Google Antigravity takes AI ...
