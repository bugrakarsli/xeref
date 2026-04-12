# Xeref Agent Manager Migration Execution Plan

## Phase 1: Core Porting & Adaptation
- [x] Migrate `types.ts` -> `types/agent-types.ts`
- [x] Refactor `geminiService.ts` -> `lib/apiService.ts` utilizing `OpenRouter` architecture instead of GenAI SDK.
- [x] Integrate `ChatInput.tsx` (adapted for Next.js with `"use client"`).
- [x] Adapt `AgentPanel.tsx`: Migrate UI, add Next.js compatibility, integrate `apiService.ts`, and retain Rules/Workflows.
- [x] Adapt `StatusBar.tsx`: Update to "Xeref.ai - Settings" UI.
- [x] Adapt `AIAssistantModal.tsx`: Modify prompt execution to use OpenRouter.
- [x] Simplify `AgentManagerView.tsx`: Strip Habits, Stats, Sandbox, etc., focusing entirely on "Tasks" and "Workflows" interfaces.
- [x] Next.js Global Shortcut integration `AgentGlobalShortcuts.tsx`:
  - Provide global listeners.
  - Bind `Ctrl+L` -> Toggle Agent Panel.
  - Bind `Ctrl+E` -> Toggle Agent Manager View.
- [x] Apply Global Shortcuts into `layout.tsx` wrapper.

## Phase 2: Next Steps & Polishing
- [ ] Connect "Tasks" interface directly to backend Database/CRM.
- [ ] Implement local state syncing or server storage for Rules/Workflows inside `AgentPanel`.
- [ ] Validate Next.js App Router specific styling, hydration match, and Tailwind dark mode.
- [ ] Integrate OpenRouter model switching natively within UI.

## Note on Architecture
- API execution defaults to user's `.env` configuration (`OPENROUTER_API_KEY`).
- UI styling expects Next.js default `lucide-react` integration and TailwindCSS.
