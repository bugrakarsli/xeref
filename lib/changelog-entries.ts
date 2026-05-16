export const changelogEntries = [
  {
    version: 'v3.0',
    date: 'May 17, 2026',
    badge: 'Latest',
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Keyboard Shortcuts panel — a ⌨ icon button now lives above the v3.0 badge in the right rail. Click it to open a reference dialog listing every real wired shortcut (Ctrl+1/2/3, Ctrl+E/L, Ctrl+Shift+O, F9, F, Ctrl+B) grouped by category. Mod key auto-renders as ⌘ on macOS.',
          'Profile avatar in sidebar — the bottom-left user avatar now mirrors the photo uploaded in Settings → General instead of always showing initials. Falls back to initials when no photo is set.',
        ],
      },
    ],
  },
  {
    version: 'v2.9',
    date: 'May 16, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Voice to Text — press F9 anywhere in the dashboard to start or stop voice dictation; transcribed text is appended to the chat composer. A microphone button also lives next to the send button for click-to-dictate.',
          'Whisper-grade transcripts — recordings are transcribed by Groq whisper-large-v3-turbo and lightly polished for grammar and punctuation without paraphrasing.',
        ],
      },
      {
        type: 'Improved',
        color: 'text-purple-400',
        items: [
          'Chat composer — the existing MicButton infra used in the legacy AgentPanel is now available in the main chat view too, with a shared global toggle event so future hotkey surfaces can hook into the same recording.',
        ],
      },
    ],
  },
  {
    version: 'v2.8',
    date: 'May 16, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Branch Protection — xeref repo is now public and protected: main requires a PR with 1 approval, passing CI (Lint, Type Check, Tests), and blocks force pushes and branch deletion via a GitHub Ruleset.',
        ],
      },
      {
        type: 'Improved',
        color: 'text-purple-400',
        items: [
          'CI Reliability — excluded agent/ from the root tsconfig so the root tsc --noEmit no longer picks up agent/src files whose dependencies live in a separate node_modules. Bumped actions/checkout and actions/setup-node to v5 ahead of the June 2026 Node.js 24 runner default.',
          'Repo hygiene — removed 2,832 tracked files from agent/node_modules/ (root .gitignore only excluded /node_modules at repo root). Updated to **/node_modules/ to cover all nested workspaces.',
        ],
      },
    ],
  },
  {
    version: 'v2.7',
    date: 'May 14, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Customizable Sidebar — Nav items (Projects, Customize, Artifacts, Design, Inbox, and 7 more) are now user-configurable: toggle visibility, reorder with ↑/↓ controls, and persist preferences to your profile. Hidden items collect under a "More" group; a "Customize Sidebar" button at the bottom opens the configuration modal.',
          'Settings Foundation — profiles.preferences JSONB column provides the data layer for per-user sidebar config, capabilities settings, and Xeref Code settings across all future settings tabs.',
          '/customize keeps sidebar — navigating to /customize now renders the dashboard sidebar in collapsed mode alongside the customize sub-nav, maintaining spatial context instead of replacing the shell.',
        ],
      },
      {
        type: 'Improved',
        color: 'text-purple-400',
        items: [
          'Sidebar typography — default nav text is now muted gray; hover and active states use white text with a subtle background highlight for clearer visual hierarchy.',
        ],
      },
      {
        type: 'Fixed',
        color: 'text-amber-400',
        items: [
          'Memory upload 413 errors — file bytes now go directly to Supabase Storage via signed upload URL, bypassing Vercel\'s 4.5 MB serverless payload limit. Files up to 50 MB upload without error.',
          'Memory ingestion on production — aligned env var naming (PINECONE_INDEX) and switched to name-based Pinecone index lookup; the "apiKey" initialization error on xeref.ai is resolved.',
          'Documents INSERT policy — added missing RLS policy so authenticated users can create document rows via the browser client.',
        ],
      },
    ],
  },
  {
    version: 'v2.6',
    date: 'May 13, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Skills System — Full implementation including database migration, server actions for CRUD operations, and new UI components (SkillsSection, SkillFileTree, SkillContentPane) under /customize/skills',
        ],
      },
      {
        type: 'Improved',
        color: 'text-purple-400',
        items: [
          'MCP Server Memory Tools — Renamed and enhanced note tools to memory tools (list_memories, save_memory, recall_memories, delete_memory) to align with the CLAWS Archive methodology',
          'MCP Server Project Tools — Updated update_project to rename_project for clarity and better intent matching',
        ],
      },
      {
        type: 'Fixed',
        color: 'text-amber-400',
        items: [
          'OAuth Redirects — Resolved the redirect_uri_mismatch error during Google, Notion, Slack, and Vercel OAuth authentication by standardizing the redirect URI generation logic across connector routes',
        ],
      },
    ],
  },
  {
    version: 'v2.5',
    date: 'May 10, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Telegram Channels section on /customize/connectors — live status card reads telegram_bot_token from the user\'s profile; shows masked token when connected with a Disconnect action, or a Configure button that opens the Deploy wizard',
          'Vercel OAuth connection — new Vercel provider added to the connections registry; OAuth flow at /api/connections/vercel/login with full callback and token storage',
          'Google, Notion, and Slack OAuth callback routes — complete /api/connections/{provider}/callback implementations with CSRF validation, token encryption, and profile upsert',
          'Settings page — dedicated /settings route with account and integration management',
          'DeepSeek V4 Flash (Pro) and DeepSeek V4 Pro (Ultra) — two new model options; Flash is now available on Pro plan alongside Haiku 4.5 and Sonnet 4.6',
          'Referral view redesign — full visual overhaul with gradient hero, animated star, social sharing buttons (Twitter, LinkedIn, Email), copy-with-feedback, and step description cards',
        ],
      },
      {
        type: 'Improved',
        color: 'text-purple-400',
        items: [
          'Claude Opus 4.6 upgraded to Opus 4.7 — Ultra plan and Opus Plan Mode now route to the latest flagship model',
          '/code layout unified with DashboardShell — the Code workspace now shares the main dashboard shell (sidebar, plan gating, nav) instead of the standalone CodeSidebar; CodeSidebar.tsx removed',
          'ConnectorsSection rebuilt as a live OAuth-driven status board — cards fetch real connected/not-connected state from the database and "Connect" buttons initiate the correct OAuth flow per provider',
          '/code footer mode and effort pickers — dead decorative markup replaced with functional dropdowns: left pill cycles "Default / Accept edits / Plan" edit mode; right pill shows real selected model label and reasoning effort (Low / Medium / High), both persisted to localStorage',
        ],
      },
      {
        type: 'Fixed',
        color: 'text-amber-400',
        items: [
          '/code session chat no response — CodeSessionView (DefaultChatTransport + useChat + transcript renderer) wired into the session page; responses now stream and persist correctly',
          '/code first message never saved — CodeLanding.handleSubmit no longer fires a broken direct POST to the chat API; initial message is stashed in sessionStorage and auto-sent via useChat on the session page',
          'GitHub OAuth routing — 500 errors and 404s on the GitHub OAuth callback and Code route URLs resolved',
          'ESLint set-state-in-effect — 14 violations across dashboard components resolved without altering runtime behavior',
          'Telegram webhook handler bypasses cookie auth — /api/bots/telegram/[userId] now calls OpenRouter directly via generateText instead of proxying through /api/chat (which requires Supabase session cookies); bot responses now reach users reliably',
          'clearTelegramBotToken server action added to profile.ts — Disconnect button on the Telegram card nulls the stored token and revalidates the path',
          'Routines auth guards and Telegram webhook verification — getSession replaced with getUser server-side; Telegram webhook now validates the secret header before processing updates',
        ],
      },
      {
        type: 'Architecture',
        color: 'text-blue-400',
        items: [
          '/api/connections/[provider]/ pattern — login and callback routes for google, notion, slack, and vercel with AES-256-GCM token encryption and HMAC-SHA256 CSRF state',
          'lib/connections/registry.ts — Vercel added as an OAuth provider with VERCEL_CLIENT_ID / VERCEL_CLIENT_SECRET env requirements',
          'AGENTS.md and GEMINI.md — agent runtime documentation committed to the repo',
          'code-session-view.tsx — sessionStorage handoff pattern for auto-sending the first message on new sessions without a double-render or StrictMode double-send',
        ],
      },
    ],
  },
  {
    version: 'v2.4',
    date: 'April 29, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Claude Code workspace — Ultra-plan workspace at /code with a Claude-Code-style sidebar (New session, Routines, Dispatch, Customize, More, Pinned, Recents) and a rich landing pane (Welcome banner, Sessions cards with Needs input/Unread badges, composer)',
          'Inline due date editing on tasks list — click the Due cell of any task row to set or clear a due date without opening the full dialog; saves immediately to Supabase',
          '/dispatch coming-soon stub — the new Dispatch nav item in the Code sidebar now links to a placeholder page instead of 404ing',
          'Pricing page updated — Claude Code workspace listed as an Ultra-plan feature',
        ],
      },
      {
        type: 'Improved',
        color: 'text-sky-400',
        items: [
          'Dashboard Code tab now redirects to /code instead of rendering the inline CodeSessionView, consolidating to a single Code experience',
          '/code landing page no longer auto-creates a Supabase session row on load — sessions are created lazily on first message send, reducing orphaned DB rows',
          'CodeSidebar rebuilt with brand row, full primary nav, Pinned stub, and Recents from real code_sessions data',
        ],
      },
      {
        type: 'Fixed',
        color: 'text-amber-400',
        items: [
          'Hydration mismatch on WorkflowsView — DashboardShell now initialises activeView, showAgentPanel, agentPanelMinimized, and selectedSessionId with SSR-safe defaults and hydrates from localStorage in a single useEffect after mount',
          'useLocalStorage hydration bug — write effect now skips on first mount using a hydrated flag, preventing initialValue from transiently overwriting stored data before the read effect fires',
          'Connectors page hydration error — localStorage read deferred to after hydration, eliminating server/client count mismatch',
        ],
      },
    ],
  },
  {
    version: 'v2.3',
    date: 'April 26, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Code session history — sessions are now persisted to Supabase and appear in a collapsible "History" section in the Code tab sidebar, mirroring the Chat "Recents" pattern',
          'Session resume on refresh — the active code session ID is stored in localStorage and restored on page reload, automatically reloading messages from the database',
          'Inline session management — hover any history item to reveal a "⋮" menu with Rename (inline edit) and Delete actions',
          'Repo required validation — submitting a message without selecting a GitHub repository now shows an animated red warning "Select a repo first" above the input instead of silently failing',
          'GitHub repo button state feedback — the repo selector now highlights with a primary-colored border when a repository is selected',
        ],
      },
      {
        type: 'Fixed',
        color: 'text-amber-400',
        items: [
          'Radix UI hydration mismatch — sidebar is now loaded client-only via next/dynamic with ssr:false, eliminating useId() ID mismatches between server HTML and client render',
          'Pinned/Recents section guarded by isHydrated — the Radix-heavy dropdown section no longer renders until localStorage has loaded, providing defense-in-depth against hydration errors',
          'New session button now resets selectedSessionId to null (blank session) while preserving previous sessions in History',
          'Code session messages now reload when switching between sessions without a full page refresh',
        ],
      },
      {
        type: 'Architecture',
        color: 'text-blue-400',
        items: [
          'app/actions/code-sessions.ts — new server actions: getUserCodeSessions, renameCodeSession, deleteCodeSession',
          'Supabase migration: updated_at column + auto-update trigger added to code_sessions table',
          'CodeSession interface added to lib/types.ts',
          'GitHubRepoButton refactored to a controlled component — accepts selectedRepo and onRepoSelect props for parent-driven state',
          'DashboardShell: selectedSessionId and codeSessions state wired through to Sidebar and CodeSessionView',
          'CodeSessionView: accepts onSessionCreated callback, reloads messages reactively on sessionId prop changes',
        ],
      },
    ],
  },
  {
    version: 'v2.2',
    date: 'April 25, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Classroom view — structured course browser with Courses → Modules → Lessons hierarchy, markdown lesson reader, per-lesson progress tracking, and admin content authoring controls (create/edit/delete courses, modules, and lessons inline)',
          'Semantic search powered by Gemini Embedding 2 (text-embedding-004) and Pinecone — lesson content is indexed on save and searchable with real-time debounced queries against the xeref_lessons namespace',
          'Memory view — document brain scaffold with drag-and-drop upload area and coming-soon chips for OCR ingestion and semantic search',
          'Projects, Deploy, and Inbox dashboard sections promoted from COMING SOON to LIVE',
        ],
      },
      {
        type: 'Architecture',
        color: 'text-blue-400',
        items: [
          'Added \'classroom\' and \'memory\' to ViewKey in lib/types.ts; new Course, CourseModule, Lesson, LessonProgress interfaces',
          'Supabase migration: courses, modules, lessons, lesson_progress tables with RLS — admin write restricted to bugra@bugrakarsli.com and bugra@xeref.ai',
          'lib/pinecone.ts — Pinecone integrated inference helpers (upsertRecords / searchRecords) using multilingual-e5-large — no separate embedding API needed',
          'POST /api/classroom/embed — admin-gated lesson embedding trigger',
          'GET /api/classroom/search — authenticated semantic search endpoint',
          'app/actions/classroom.ts — full CRUD + progress server actions',
          'New package: @pinecone-database/pinecone (integrated inference — multilingual-e5-large, dense vectors, cosine metric)',
        ],
      },
    ],
  },
  {
    version: 'v2.1',
    date: 'April 22, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'MCP server v1 — POST /api/mcp bearer-token-authenticated endpoint exposing list/create/update/delete for projects, tasks, and notes, plus suggest_next_task',
          'getMcpToken / regenerateMcpToken / saveTelegramBotToken server actions',
          'Settings view: MCP token card with show/hide, copy, and regenerate controls',
          'Deploy view — new DeployView with Telegram bot setup wizard; accessible via Deploy nav item under the tasks tab',
          'POST /api/bots/telegram/register — validates bot token and calls Telegram setWebhook',
          'POST /api/bots/telegram/[userId] — receives Telegram updates and routes them through the chat API',
        ],
      },
      {
        type: 'Architecture',
        color: 'text-blue-400',
        items: [
          'Added \'deploy\' to ViewKey in lib/types.ts',
          'Supabase migration: mcp_token (unique) and telegram_bot_token columns added to profiles table',
        ],
      },
      {
        type: 'Fixed',
        color: 'text-amber-400',
        items: [
          'Creem checkout action: removed hardcoded redirect URI that caused OAuth mismatch in local dev',
          'Login page simplified — stripped redundant layout wrappers',
          'Local environment permissions configured',
        ],
      },
    ],
  },
  {
    version: 'v2.0',
    date: 'April 18, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          '/design route — full design system management with sidebar, panels, and modals for creating, editing, and previewing design systems',
          'Artifact management system — browse, preview, and inspect saved artifacts with split-pane detail view, version history, and capability badges',
          '/artifacts/my page — dedicated artifact library with list and detail views',
          'Global search popup — Cmd/Ctrl+K command palette for fast navigation across projects, chats, and views',
          'Chat-based workflow triggers — automation workflows can now be launched directly from the chat interface',
        ],
      },
      {
        type: 'Architecture',
        color: 'text-blue-400',
        items: [
          'Zustand design store (store/design-store.ts) for client-side design system state management',
          'New API routes: /api/design-systems, /api/projects, /api/templates for design feature backend',
          'New hooks: use-design-systems, use-projects, use-templates (SWR-based data fetching)',
          'types/design.ts — DesignProject type (renamed from Project to avoid collision with existing type)',
          'components/design/ directory — scoped UI primitives (badge, button, input) to avoid conflicts with shadcn/ui',
          'Supabase migration 20260418_xeref_design.sql — adds design_projects, organizations, org_members tables with RLS',
        ],
      },
      {
        type: 'Fixed',
        color: 'text-amber-400',
        items: [
          'Database migration ordering — split into 3 passes (tables → policies → triggers) to fix RLS policy referencing org_members before the table existed',
        ],
      },
    ],
  },
  {
    version: 'v1.9',
    date: 'April 18, 2026',
    badge: null,
    sections: [
      {
        type: 'Improved',
        color: 'text-purple-400',
        items: [
          'Sidebar keyboard accessibility — chat rows and pinned chat rows are now fully keyboard-navigable (role="button", tabIndex, onKeyDown, focusRing)',
          'Sidebar action buttons — Rename/Delete now appear on focus-within, not just hover; keyboard users can reach them without a mouse',
          'Sidebar tab strip — switched to grid layout to prevent active-tab label from causing layout shifts',
          'Mobile hamburger — removed inline style conflict with md:hidden; visibility now handled entirely by Tailwind',
          'Sidebar custom event coupling replaced with typed callback props (onShowChatList, onOpenTaskDialog) with window event fallback',
          'Hardcoded workspace names removed from Code tab until wired to real data',
          'Collapsed sidebar MessageSquare icon now reflects active chat state',
          'Customize nav item no longer collapses the sidebar on click',
          'Upgrade to Pro chip shown in expanded sidebar for free-plan users',
          'maxHeight inline style on Recents scroll area replaced with Tailwind class',
          'Recents chevron rotation standardized to match Projects (rotate-90 when open)',
          'Empty Pinned section copy updated to "Right-click a chat to pin it"',
          'suppressHydrationWarning removed from user menu trigger',
        ],
      },
      {
        type: 'Fixed',
        color: 'text-amber-400',
        items: [
          'Confirm/Cancel rename buttons — added aria-label and p-1 touch target padding (WCAG 2.5.5)',
          'Rename inputs — added aria-label on all inline edit inputs',
          'Workflows: Run/Edit/log-edit buttons now keyboard-accessible (focus:opacity-100, focus-visible ring)',
          'Workflows: All form labels associated with inputs via htmlFor/id pairs',
          'Workflows: Run Now modal shows inline role="alert" error when message is empty; textarea marked required/aria-required',
          'Workflows: Delete is now two-stage — first click prompts confirmation, second click fires',
          'Workflows: Cron field validates 5-field format on submit and shows role="alert" error',
          'Workflows: MoreHorizontal log-edit icon replaced with Pencil',
          'Workflows: Toggle button — added type="button" and focus-visible ring',
          'Workflows: Create button shows "Creating…" while pending',
          'Workflows: Logs toggle has aria-expanded and aria-controls',
          'Workflows: Redundant !disabled guard removed from DropdownMenuItem onClick handlers',
          'Workflows: Timestamps use consistent en-GB locale instead of browser-default',
          'Workflows: Execution logs panel has CSS mask-image fade to indicate overflow',
          'Workflows: Loading states wrapped in role="status" aria-live="polite"',
          'Workflows: Empty state has an inline Create Workflow button',
          'Workflows: Run Now modal DialogContent has aria-label',
          'Workflows: parseCronToHuman called once per cron section instead of twice',
          'Workflows: Header row wraps on narrow viewports (flex-wrap gap-y-3)',
        ],
      },
    ],
  },
  {
    version: 'v1.8',
    date: 'April 17, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Notes view — persistent note-taking integrated with the dashboard sidebar',
          'Stats view — real-time usage analytics and performance metrics',
          'Workflows view — cron job scheduling and webhook-based automation',
          'Customize Views — personalize dashboard layout with draggable view cards',
          'Comprehensive dashboard chat UI — improved message rendering, typing indicators, and input handling',
        ],
      },
      {
        type: 'Improved',
        color: 'text-purple-400',
        items: [
          'Task management UI — enhanced with better status indicators and inline actions',
          'Dashboard shell performance — optimized component rendering and state management',
        ],
      },
      {
        type: 'Architecture',
        color: 'text-blue-400',
        items: [
          'Dashboard UI components refactored for maintainability and reusability',
          'Chat interface standardized with proper error handling and edge cases',
        ],
      },
    ],
  },
  {
    version: 'v1.7',
    date: 'April 16, 2026',
    badge: null,
    sections: [
      {
        type: 'Improved',
        color: 'text-purple-400',
        items: [
          'New Conversation view layout — empty chat state now uses `items-center justify-center` on the outer container to vertically and horizontally center the entire block (icon + heading + input) as a single unit with `max-w-2xl` constraint, instead of expanding the content area with `flex-1` and pushing the input to the bottom',
        ],
      },
    ],
  },
  {
    version: 'v1.6',
    date: 'April 15, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Plan-aware chat routing — Basic users get the free Xeref model, Pro unlocks Haiku 4.5 and Sonnet 4.6, Ultra keeps Best (Auto), Opus 4.6, and Opus Plan Mode',
          'Xeref model — new default model for Basic plan, powered by OpenRouter\'s free tier (openrouter/free)',
          'Per-plan API key isolation — each plan tier uses a dedicated OpenRouter key for cost control and spend visibility',
          'OpenRouter attribution headers — every request now sends HTTP-Referer and X-Title for accurate usage tracking on openrouter.ai',
        ],
      },
      {
        type: 'Improved',
        color: 'text-purple-400',
        items: [
          'Haiku 4.5 moved to Pro plan — Claude models now start at Pro tier',
          'Model selector labels updated to reflect new plan tiers (BASIC / PRO / ULTRA)',
          'Chat errors now return structured JSON responses instead of plain text strings',
        ],
      },
      {
        type: 'Architecture',
        color: 'text-blue-400',
        items: [
          'Centralized OpenRouter config in lib/ai/openrouter-config.ts — plan-to-key mapping, model allowlists, and provider factory in one server-only module',
          'Server-side plan enforcement on every chat request — client-supplied model IDs are validated against the authenticated user\'s plan before any upstream call',
          'Unit tests added (vitest) — 24 tests covering plan gating, model resolution, and routing logic',
          'AgentPanel.tsx legacy API call replaced — no longer calls OpenRouter directly from the browser; all requests route through /api/chat',
        ],
      },
      {
        type: 'Fixed',
        color: 'text-amber-400',
        items: [
          'Removed NEXT_PUBLIC_OPENROUTER_API_KEY exposure in client-side components',
          'Silent stream failures now return visible 502 errors instead of empty assistant responses',
        ],
      },
    ],
  },
  {
    version: 'v1.5',
    date: 'April 12, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'System agents in chat — XerefClaw and Xeref Agents are now selectable pre-built agents in the chat input dropdown, above your custom project agents',
          'Natural language CRUD via chat — tell the AI to "create a task", "mark X as done", "rename project", "remember X", or "what do you remember" and it executes the action directly',
          'Memory system — new memories table; chat messages saying "remember" or "save this" are saved to long-term memory (with enable/disable toggle)',
          'Workflows view upgraded — "Save Memories from Chat" workflow shows with a live toggle switch to enable or disable memory saving',
          'Tasks view fully implemented — real CRUD with status cycling, priority badges, status filter tabs, and inline delete',
          'User onboarding modal — new users see a 4-step setup flow on first login (name, role, goal, preferred model)',
          'Sidebar CRUD — hover over any project or chat to reveal inline rename (pencil) and delete (trash) actions',
        ],
      },
      {
        type: 'Improved',
        color: 'text-purple-400',
        items: [
          'Chat now defaults to XerefClaw system agent — no more empty agent selector on first open',
          'Agent selector shows "System Agents" and "My Agents" sections with descriptions',
          'Chat auto-creates a session on first message without requiring "New Chat" button first',
          'Tool results rendered as styled cards in chat (task created, memory saved, task list, etc.)',
        ],
      },
      {
        type: 'Architecture',
        color: 'text-blue-400',
        items: [
          'AI SDK v6 tool calling with inputSchema — 6 tools wired to server actions (create_task, list_tasks, update_task, rename_project, save_memory, recall_memories)',
          'New Supabase tables: tasks, memories, workflows + onboarding columns on profiles',
          'System agents defined in lib/system-agents.ts with hardcoded system prompts',
          'AgentSelection union type replaces Project | null throughout chat components',
        ],
      },
    ],
  },
  {
    version: 'v1.4',
    date: 'April 1, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Home page chat/tasks toggle — Chat and Tasks are now accessible directly from Home via a pill toggle, replacing the "Build a new agent" card',
          'Xeref Agents — new AI Agents team view listing all available agents grouped by team, with tool stack details and create/edit support',
          'Stats page now shows live data — Agents Created, Prompts Generated, and Chat Sessions reflect real account activity',
        ],
      },
      {
        type: 'Improved',
        color: 'text-purple-400',
        items: [
          'Tasks empty state is contextual — shows your configured agent count and explains when tasks will appear',
          'Workflows description references your actual agent count and button now shows a "Coming Soon" badge',
        ],
      },
    ],
  },
  {
    version: 'v1.3',
    date: 'March 31, 2026',
    badge: null,
    sections: [
      {
        type: 'Fixed',
        color: 'text-amber-400',
        items: [
          'Chat responses now render correctly — migrated to AI SDK v6 parts-based message format (UIMessage.parts)',
          'Dynamic model routing (opus-plan, best) now correctly reads user message content from AI SDK v6 format',
          'Assistant messages properly persisted to database after streaming completes',
          'Chat history loaded from database now renders correctly with v6 UIMessage parts format',
        ],
      },
      {
        type: 'Architecture',
        color: 'text-blue-400',
        items: [
          'Upgraded to AI SDK v6 (ai@6, @ai-sdk/react@3) — replaced legacy useChat api/body options with DefaultChatTransport',
          'Server route now uses toUIMessageStreamResponse() replacing deprecated toDataStreamResponse()',
          'Per-request body (model + projectId) passed via sendMessage options for accurate project context per message',
        ],
      },
    ],
  },
  {
    version: 'v1.2',
    date: 'March 31, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Dynamic Model Routing — auto-switches active LLM natively in the web chat input',
          'Opus Plan Mode (Ultra exclusive) — dynamically uses Opus 4.6 for planning and Sonnet 4.6 otherwise',
          '/model opusplan text command to instantly lock into architectural deep-reasoning setups',
        ],
      },
      {
        type: 'Architecture',
        color: 'text-blue-400',
        items: [
          'Configured default model globally to Haiku 4.5 for optimized low-latency chats',
          'Intelligent AI Goal Decomposition backend router evaluates semantics to pick the best model tier automatically',
          'Deployed subagent definitions securely encapsulating Opus 4.6 architecture constraints',
        ],
      },
      {
        type: 'Fixed',
        color: 'text-amber-400',
        items: [
          'Resolved DropdownMenu radix ID hydration mismatch on sidebar user avatar menu',
        ],
      },
    ],
  },
  {
    version: 'v1.1',
    date: 'March 30, 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          'Creem payment integration — subscribe to Pro or Ultra directly from the pricing page',
          'Checkout success page with subscription confirmation',
          'Webhook handler for real-time subscription status updates',
          'Learn More button linking to Skool community',
        ],
      },
      {
        type: 'Fixed',
        color: 'text-amber-400',
        items: [
          'Pricing page no longer redirects authenticated users back to the dashboard',
          'StartBuildingButton auth redirect only triggers when signing in through the dialog',
        ],
      },
    ],
  },
  {
    version: 'v1.0 Beta',
    date: 'March 2026',
    badge: null,
    sections: [
      {
        type: 'New',
        color: 'text-emerald-400',
        items: [
          '48+ agent features organized by the CLAWS methodology (Connect, Listen, Archive, Wire, Sense, Agent Architecture)',
          'Visual feature builder — browse, search, and filter capabilities',
          'One-click prompt generation for Antigravity IDE',
          'Magic link + Google OAuth sign-in',
          'Named project save and restore (signed-in users)',
          'Dark-only design system with OKLch color variables',
          'Responsive layout with Framer Motion feature card animations',
        ],
      },
      {
        type: 'Architecture',
        color: 'text-blue-400',
        items: [
          'Next.js 16 App Router with React 19 and Babel React Compiler',
          'Supabase backend — Postgres + RLS for projects and usage events',
          'Tailwind v4 with `@import "tailwindcss"` syntax',
          'shadcn/ui components (new-york style, neutral base)',
          'Vercel deployment with Edge-compatible proxy session refresh',
        ],
      },
    ],
  },
];

export const latestVersion = changelogEntries[0].version;
