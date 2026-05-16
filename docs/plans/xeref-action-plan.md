# Xeref – Action Plan (2026-05-14)

## Status (2026-05-16)

| Task | Status | Notes |
|------|--------|-------|
| 1 – File uploads + Memory ingestion | ✅ Done | `app/api/memory/documents/` + Pinecone ingestion |
| 2 – Tavily web search | ✅ Done | Inline in `app/api/chat/route.ts`, gated on `TAVILY_API_KEY` |
| 3 – Routines on /code | ✅ Done | UI + API at `app/api/routines/`; REST-ish design kept (no /list+/run split needed) |
| 4 – Fix 413 errors | ✅ Done | Server actions bumped to 10 MB via `next.config.ts`; Memory uploads use signed-URL bypass |
| 5 – /customize sidebar | ✅ Done | `app/customize/layout.tsx` passes `forceCollapsed` |
| 6 – Customizable sidebar tabs | ✅ Done | `components/dashboard/sidebar-customize-modal.tsx` + `app/api/settings/sidebar/` |
| 7 – Settings → General + avatar | ✅ Done | `app/settings/general/` + `components/settings/avatar-selector.tsx` |
| 8 – Sidebar typography | ✅ Done | `text-muted-foreground hover:text-white` wired in sidebar |
| 9 – Settings → Capabilities | ✅ Done | `app/settings/capabilities/` + `CapabilitiesSettings` in `lib/types.ts` |
| 10 – Settings → Xeref Code | ✅ Done | `app/settings/xeref-code/` + all sub-types in `lib/types.ts` |
| 11 – Pinecone env vars | ⚠️ Ops pending | Code correct (`lib/pinecone.ts`); set `PINECONE_API_KEY` + `PINECONE_INDEX=xeref` in Vercel env vars, then redeploy |

---

## Context

You are building **xeref.ai**, a Next.js/TypeScript SaaS app with Supabase, OpenRouter models, Tavily-powered web search, Routines integration, a customizable sidebar, and user-level settings.

The goal of this plan is to:
- Stabilize core features (file uploads, Memory, web search, 413 errors)
- Improve customization (sidebar, settings)
- Add a first version of **Capabilities** and **Xeref Code** settings
- Fix Pinecone Memory configuration for both local and production environments

---

## High-level goals

1. Fix file uploads (Supabase Storage `documents` bucket)
2. Add a Tavily-backed web search tool callable by the model (`default_api.search_web`)
3. Lay the groundwork for Routines integration on `/code`
4. Fix 413 "Payload Too Large" errors
5. Improve `/customize` route – sidebar always visible but collapsible
6. Implement customizable sidebar tabs with a "More" section + Customize Sidebar popup
7. Improve Settings → General tab with avatar selector
8. Adjust sidebar typography (default gray, white on hover/active)
9. Add Settings → Capabilities tab (feature toggles + network egress allowlist)
10. Add Settings → Xeref Code tab (code appearance, session behavior, web controls, authorization tokens)
11. Fix Pinecone Memory configuration (API keys & environments)

---

## Task 1 – File uploads

**Objective:** Ensure users can reliably upload and store files (PDF, DOCX, TXT, MD, etc.) in Supabase Storage and that these files can be ingested into Xeref Memory.

Key items:
- Verify Supabase Storage bucket (e.g., `documents`) exists and has correct RLS / public settings.
- Implement or fix upload endpoint / route (API route or server action) used by the web app.
- Handle progress, success, and error states in the UI.
- On success, trigger Memory ingestion pipeline (where relevant).

---

## Task 2 – Tavily web search tool

**Objective:** Add a Tavily-backed web search tool that the model can call via OpenRouter, exposed in Xeref as `search_web` or similar.

Key items:
- Configure Tavily API key on the backend.
- Implement a server-side route (e.g. `/api/tools/search-web`) that:
  - Accepts a natural-language query
  - Calls Tavily
  - Returns a clean, model-friendly JSON structure (title, URL, snippet, etc.).
- Wire this tool into the model configuration used by Xeref (e.g., OpenRouter "tools" / function calling).
- Add logging and basic rate limiting.

---

## Task 3 – Routines integration on `/code`

**Objective:** Prepare the `/code` page for future Routines integration.

Key items:
- Design basic layout for `/code` (editor area, console/logs, sidebar for routines).
- Add placeholder UI sections for:
  - Listing available routines
  - Running a routine with parameters
  - Viewing routine run results
- Define API surface (even if not fully implemented yet), e.g. `/api/routines/list`, `/api/routines/run`.

---

## Task 4 – Fix 413 body size errors

**Objective:** Prevent 413 "Payload Too Large" errors when sending long messages, big tool responses, or file contents.

Key items:
- Increase body size limits in Next.js API routes / middleware (`sizeLimit`) where needed.
- For streaming routes, consider chunking large payloads.
- Add graceful error handling and user-facing message when input is truly too large.

---

## Task 5 – `/customize` route

**Objective:** Ensure the `/customize` page keeps the main sidebar visible but collapsed, so users always maintain spatial context while customizing.

Key items:
- Sidebar should remain mounted and visible in collapsed mode.
- `/customize` content should appear in the main content area.
- Reflect current sidebar configuration and allow navigation back without layout jump.

---

## Task 6 – Customizable sidebar tabs

**Objective:** Let users customize which tabs appear in the main sidebar, with extra items grouped into a "More" section and edited via a popup.

Key items:
- Data model in Supabase for per-user sidebar preferences (e.g., visible tabs, order, pinned state).
- UI pattern:
  - Main visible tabs
  - "More" group for overflow / rarely used tabs
  - "Customize Sidebar" button or entry that opens a configuration modal.
- Modal should allow drag-and-drop or simple toggles to show/hide tabs.
- Persist changes to Supabase and reflect them immediately in the sidebar.

---

## Task 7 – Settings → General tab

**Objective:** Improve the General settings page for basic user profile and account preferences.

Key items:
- Fields: display name, email (read-only or editable depending on auth), time zone, etc.
- Avatar selector:
  - Upload avatar, or
  - Generate from initials / predefined set.
- Save behavior:
  - Optimistic updates
  - Debounced save
  - "Saved" toast on success

---

## Task 8 – Sidebar typography

**Objective:** Improve sidebar readability and visual hierarchy.

Key items:
- Default sidebar tab text color: muted gray.
- On hover and active: white text and slightly stronger background.
- Ensure good contrast in both light and dark modes.
- Keep font size and weight consistent with the global design system.

---

## Task 9 – Settings “Capabilities” tab

**Objective:** Add a **Capabilities** tab under Settings where users can enable/disable Xeref features (similar to Claude’s Capabilities screen) and configure code network egress and allowed domains.

### 9.1. Settings tab structure

Settings routes:
- `/settings/general` → Profile, name, avatar, etc.
- `/settings/capabilities` → Feature toggles and network egress.
- `/settings/xeref-code` → Xeref Code settings (Task 10).

Label in UI: **Capabilities**.

Branding:
- Replace any "Claude" with **"Xeref"**.
- Replace "Anthropic" with **"BugraKarsli"** or remove vendor names.

### 9.2. Data model

Extend user preferences (e.g., JSONB column in Supabase) with:

```ts
interface CapabilitiesSettings {
  memory_search_enabled: boolean;
  memory_generate_from_history: boolean;
  import_from_other_ai: boolean;

  tool_access_mode: 'load_tools_when_needed' | 'ask_before_using_tools' | 'never_use_tools';
  connector_discovery_enabled: boolean;

  visuals_artifacts_enabled: boolean;
  visuals_inline_charts_enabled: boolean;

  code_execution_enabled: boolean;
  network_egress_enabled: boolean;
  domain_allowlist_mode: 'none' | 'package_managers_only' | 'all_domains';
  additional_allowed_domains: string[]; // e.g. ['xeref.ai']
}
```

### 9.3. UI layout

Sections:

1. **Memory**
   - Toggle: "Search and reference chats"
   - Toggle: "Generate memory from chat history"
   - (Optional) Button: "View and manage memory" (can route to `/settings/memory` later).

2. **General**
   - Dropdown: "Tool access mode" with options:
     - Load tools when needed
     - Ask before using tools
     - Never use tools
   - Toggle: "Connector discovery" – whether Xeref suggests relevant integrations.

3. **Visuals**
   - Toggle: "Artifacts" – enable rich artifacts/documents in the UI.
   - Toggle: "Inline visualizations" – allow charts and diagrams in the conversation.

4. **Code execution and file creation**
   - Toggle: "Code execution and file creation" – master switch for code tools.
   - Nested toggle: "Allow network egress" – whether the sandbox can access the network (HTTP, package registries).
   - Dropdown: "Domain allowlist" with values:
     - None
     - Package managers only
     - All domains
   - **Additional allowed domains**:
     - Text input with placeholder `example.com or *.example.com`.
     - "Add" button appends a domain to `additional_allowed_domains`.
     - Listed domains appear as rows or pills with a small **×** icon to remove.

Behavior:
- If `code_execution_enabled` is false → disable all network egress controls.
- If `network_egress_enabled` is false → hide or disable `Domain allowlist` and `Additional allowed domains` controls.
- Every change is optimistically applied and saved via a debounced `PATCH /api/settings/capabilities`, with a small "Saved" toast on success.

---

## Task 10 – Settings “Xeref Code” tab (extended)

**Objective:** Add a dedicated **Xeref Code** tab under Settings to control code environment behavior, appearance, PR automation, web controls, and authorization tokens, modeled after Claude Code but branded for Xeref.

### 10.1. Settings tab structure

Settings routes (recap):
- `/settings/general`
- `/settings/capabilities`
- `/settings/xeref-code`

Label in UI: **Xeref Code**.

Branding:
- Replace "Claude" → **"Xeref"**.
- Replace "Claude Code" / "Anthropic" → **"Xeref"** / **"BugraKarsli"**.

### 10.2. Code appearance

Section: **Code appearance**

- Subsection: **Code font**
  - Description: "Set a custom monospace font for code and terminal."
  - Text input for font name (e.g., `JetBrains Mono`).
  - Side-by-side preview panel:
    - Left: "Xeref Light" theme
    - Right: "Xeref Dark" theme
    - Small TypeScript snippet with diff-style highlighting.
  - Changes update a CSS variable such as `--font-code` used by editor/terminal components.

Data model:

```ts
interface XerefCodeAppearanceSettings {
  code_font: string | null; // e.g. 'JetBrains Mono', null = default
}
```

### 10.3. General behavior

Section: **General**

Toggles:

1. **Classify session states** (default **ON**)
   - Description: "Allow Xeref to automatically classify sessions as blocked, ready for review, or done. Classifying sessions counts towards your plan usage. Applies to new sessions."

2. **Create pull requests automatically** (default OFF)
   - Description: "When Xeref pushes changes to a branch, it automatically opens a pull request without asking first. Applies to remote sessions only."

3. **Autofix pull requests** (default OFF)
   - Description: "When you create a pull request, Xeref automatically monitors it for CI failures and review comments, then responds proactively. Xeref may post comments on your behalf."

Data model:

```ts
interface XerefCodeGeneralSettings {
  classify_session_states: boolean;
  auto_create_pull_requests: boolean;
  auto_fix_pull_requests: boolean;
}
```

### 10.4. Xeref Code on the Web

Section: **Xeref Code on the Web**

Rows:

1. **Delete sessions stored by BugraKarsli**
   - Description: "Permanently delete BugraKarsli's server-side copies of your Xeref Code sessions. Sessions on your computer aren’t affected. This can’t be undone."
   - Right-aligned button: **Delete…**

2. **Sharing settings**
   - Description: "Control how your xeref.ai/code sessions are shared."
   - Right-aligned button: **Manage**

#### 10.4.1. Delete confirmation dialog

Clicking **Delete…** opens a confirmation modal:
- Title: "Delete sessions stored by BugraKarsli?"
- Body: same description text as above.
- Buttons:
  - **Cancel** (secondary)
  - **Delete stored sessions** (primary, red)

Behavior:
- On confirm, call `DELETE /api/xeref-code/sessions` to permanently delete server-side copies of Xeref Code sessions for that user.
- Close modal and show a danger-styled toast such as "Stored Xeref Code sessions deleted".

#### 10.4.2. Sharing settings dialog

Clicking **Manage** opens a "Sharing settings" modal:

Toggles:
1. **Require repository access** (default OFF)
   - Description: "Only users with repository access can view your shared sessions."

2. **Show your name** (default ON)
   - Description: "Your name appears on sessions you share."

Data model:

```ts
interface XerefCodeWebSettings {
  require_repo_access_for_shared_sessions: boolean;
  show_name_on_shared_sessions: boolean;
}
```

### 10.5. Authorization tokens

Section: **Authorization tokens**

Table columns:
- **Application** – e.g., "Xeref Code"
- **Connected** – relative time string ("3 hours ago")
- **Scopes** – list of scopes like `user:file_upload`, `user:inference`, `user:profile`, `user:sessions:xeref_code`
- **Actions** – delete icon per row

Data model:

```ts
interface XerefAuthorizationToken {
  id: string;
  application: string;
  connected_at: string; // ISO timestamp
  scopes: string[];
}
```

API endpoints:
- `GET /api/settings/xeref-code/tokens` – list tokens for current user
- `DELETE /api/settings/xeref-code/tokens/:id` – revoke selected token

Behavior:
- On delete click, optimistically remove the row, call API; on failure, restore row and show error toast.

### 10.6. Persistence & UX

- Load `xeref_code` preferences (appearance, general, web, tokens) when `/settings/xeref-code` mounts.
- Use a shared store (Zustand/Context) so the rest of the app can read these settings.
- All edits (toggles, inputs) are debounced and saved via `PATCH /api/settings/xeref-code`.
- Reuse the same "Saved" toast pattern as other settings.

---

## Task 11 – Pinecone Memory configuration (API keys & environments)

**Objective:** Fix the Memory document upload error and ensure both local and production environments are correctly configured to use the `xeref` Pinecone index.

### 11.1. Problem

While uploading `xeref-action-plan.md` to Memory on `xeref.ai`, the app showed:

> "The client configuration must have required property: apiKey. You can find the configuration values for your project in the Pinecone developer console…"

This means the Pinecone client in production is being initialized without a valid `apiKey` (missing or misnamed environment variable).

### 11.2. Pinecone project & index

- Pinecone account: `bugra@xeref.ai` (commercial plan)
- Index: **`xeref`** (AWS, region `us-east-1`, dense, on-demand, multilingual-e5-large)

### 11.3. API keys

In the Pinecone console:
- Existing keys include entries like `default`, `xeref-ai-pinecone`, etc.
- Create a new key for production, e.g. **`xeref-production`**:
  - Permissions: **All**
  - Copy the full key value immediately (it will be masked after creation).

### 11.4. Environment variables

**Production (Vercel – Xeref project env vars)**

Add or update:
- `PINECONE_API_KEY = <xeref-production key>`
- `PINECONE_ENVIRONMENT = us-east-1`
- `PINECONE_INDEX = xeref`

Deploy the app after saving env vars.

**Local (`.env.local`) – to be done at home**

When you have access to `.env.local`, align local config as well. Two options:

1. **Minimum change (ok short-term)**
   - Keep local using existing key (e.g., `xeref-ai-pinecone`).
   - Prod uses `xeref-production`.

2. **Clean configuration (recommended)**
   - Update `.env.local` to:
     - `PINECONE_API_KEY = <xeref-production key>`
     - `PINECONE_ENVIRONMENT = us-east-1`
     - `PINECONE_INDEX = xeref`
   - Optionally revoke old, unused keys (`default`, `xeref-ai-pinecone`) from Pinecone for security.

This task is explicitly scheduled for when you are home and can edit `.env.local` once, cleanly.

### 11.5. Code-level check

Ensure the Pinecone client uses the env vars above, for example:

```ts
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const xerefIndex = await pinecone.index(process.env.PINECONE_INDEX!);
```

Checklist:
- `process.env.PINECONE_API_KEY` is defined in both prod and local.
- `process.env.PINECONE_ENVIRONMENT` (if required by client version) matches the index region.
- `process.env.PINECONE_INDEX` is `xeref`.
- The Memory ingestion pipeline (document upload → embeddings → upsert) uses this client.

### 11.6. Verification

After updating:
- Deploy to Vercel.
- On `xeref.ai`, upload `xeref-action-plan.md` to Memory.
- The document status should move to **ready** (no API key error).
- Local development should also successfully upsert/query the `xeref` index using the same (or intentionally different) key.
