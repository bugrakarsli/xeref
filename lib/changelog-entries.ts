export const changelogEntries = [
  {
    version: 'v2.2',
    date: 'April 25, 2026',
    badge: 'Latest',
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
