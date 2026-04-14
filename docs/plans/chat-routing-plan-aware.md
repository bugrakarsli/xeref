# Plan: Cost-Efficient Plan-Aware Chat Routing

## Context

xeref-claw's chat API currently trusts client-supplied model IDs with no server-side plan validation. All requests use a single `OPENROUTER_API_KEY`. There's no attribution headers, no base URL config, and Basic (free) users can technically hit expensive models by crafting requests. This change introduces plan-aware routing with per-tier API keys, server-side enforcement, and a new free "Xeref" model mapped to `openrouter/free`.

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `lib/ai/openrouter-config.ts` | **Create** | Centralized server-only OpenRouter config: env validation, plan-to-key mapping, plan-to-model allowlists, model resolution, provider factory, attribution headers |
| `lib/ai/openrouter-config.test.ts` | **Create** | TDD tests for model resolution, plan validation, key mapping |
| `app/api/chat/route.ts` | **Modify** | Use new config module, add plan lookup + server-side model validation, structured errors, observability logs |
| `components/dashboard/chat/chat-input.tsx` | **Modify** | Update `ModelId` type, `MODELS` array: add Xeref (basic), move Haiku to pro |
| `components/dashboard/chat/chat-interface.tsx` | **Modify** | Change default model from `claude-haiku-4-5-20251001` to `xeref-free` |
| `components/dashboard/AIAssistantModal.tsx` | **Delete** | Dead code that exposes `NEXT_PUBLIC_OPENROUTER_API_KEY` client-side |
| `lib/apiService.ts` | **Delete** | Dead legacy code that exposes API keys client-side |
| `vitest.config.ts` | **Create** | Minimal vitest config for TDD |
| `package.json` | **Modify** | Add vitest dev dependency + test script |
| `CLAUDE.md` | **Modify** | Update model routing table, env vars section |
| `.env.example` | **Modify** | Add new env vars, remove old `OPENROUTER_API_KEY` |

## Implementation Steps

### Step 0: Test Setup (TDD foundation)

Install vitest and create minimal config:

```bash
npm install -D vitest
```

**`vitest.config.ts`:**
```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: { environment: 'node' },
  resolve: { alias: { '@': path.resolve(__dirname) } },
})
```

Add `"test": "vitest run"` to package.json scripts.

### Step 1: RED — Write failing tests (`lib/ai/openrouter-config.test.ts`)

Tests to write before implementation:

1. **Plan-to-key mapping**: `getApiKeyForPlan('free')` returns value from `OPENROUTER_API_KEY_BASIC`, etc.
2. **Model allowlists**: `isModelAllowedForPlan('xeref-free', 'free')` returns true; `isModelAllowedForPlan('claude-sonnet-4-6', 'free')` returns false
3. **Model resolution**: `resolveModelId('xeref-free')` returns `openrouter/free`; `resolveModelId('claude-haiku-4-5-20251001')` returns `anthropic/claude-haiku-4-5`
4. **opus-plan dynamic resolution**: resolves to opus for planning keywords, sonnet otherwise
5. **best resolution**: resolves to `openrouter/auto` (not opus)
6. **Plan hierarchy**: pro users can use free models; ultra users can use all models

### Step 2: GREEN — Create `lib/ai/openrouter-config.ts`

Server-only module. Key decisions:
- Env vars read lazily (not at import time) to avoid build-time failures
- `createOpenRouter` called per-request since key varies by plan (cheap — just a config object)
- Pro users inherit access to free-tier models (hierarchy baked into the Sets)
- Attribution headers use env vars with sensible defaults

```ts
export type UserPlan = 'free' | 'pro' | 'ultra'
export type ModelId = 'xeref-free' | 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6' | 'claude-opus-4-6' | 'opus-plan' | 'best'

function getRequiredEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

const PLAN_KEY_MAP: Record<UserPlan, string> = {
  free: 'OPENROUTER_API_KEY_BASIC',
  pro: 'OPENROUTER_API_KEY_PRO',
  ultra: 'OPENROUTER_API_KEY_ULTRA',
}

export function getApiKeyForPlan(plan: UserPlan): string {
  return getRequiredEnv(PLAN_KEY_MAP[plan])
}

const MODEL_MAP: Record<string, string> = {
  'xeref-free': 'openrouter/free',
  'claude-haiku-4-5-20251001': 'anthropic/claude-haiku-4-5',
  'claude-sonnet-4-6': 'anthropic/claude-sonnet-4-6',
  'claude-opus-4-6': 'anthropic/claude-opus-4-6',
}

const PLAN_MODELS: Record<UserPlan, Set<string>> = {
  free:  new Set(['xeref-free']),
  pro:   new Set(['xeref-free', 'claude-haiku-4-5-20251001', 'claude-sonnet-4-6']),
  ultra: new Set(['xeref-free', 'claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-6', 'opus-plan', 'best']),
}

export function isModelAllowedForPlan(modelId: string, plan: UserPlan): boolean {
  return PLAN_MODELS[plan]?.has(modelId) ?? false
}

export function resolveModelId(modelId: string, lastUserMessage?: string): string {
  if (modelId === 'opus-plan') {
    const isPlan = /plan|roadmap|decompose|break down|architecture|goals|agent/i.test(lastUserMessage ?? '')
    return isPlan ? MODEL_MAP['claude-opus-4-6'] : MODEL_MAP['claude-sonnet-4-6']
  }
  if (modelId === 'best') return 'openrouter/auto'
  return MODEL_MAP[modelId] ?? modelId
}

export function createOpenRouterForPlan(plan: UserPlan) {
  const { createOpenRouter } = require('@openrouter/ai-sdk-provider')
  return createOpenRouter({
    apiKey: getApiKeyForPlan(plan),
    baseURL: process.env.OPENROUTER_BASE_URL || undefined,
    headers: {
      'HTTP-Referer': process.env.XEREF_DEFAULT_OPENROUTER_SITE_URL || 'https://xeref.ai',
      'X-Title': process.env.XEREF_DEFAULT_OPENROUTER_APP_NAME || 'Xeref',
    },
  })
}

export const DEFAULT_MODEL: ModelId = 'xeref-free'
```

### Step 3: Refactor `app/api/chat/route.ts`

Key changes:
1. Remove module-level `createOpenRouter` call and inline `MODEL_MAP`
2. Import from `@/lib/ai/openrouter-config`
3. Query user plan from already-created supabase client (avoids double auth)
4. Validate model server-side before any upstream call → 403 on violation
5. Wrap `streamText()` in try/catch for synchronous errors → 502 on failure
6. Add observability log: `{ userId, plan, requested, resolved }`
7. Return structured JSON errors instead of plain text

```ts
const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
const userPlan = (profile?.plan ?? 'free') as UserPlan

if (!isModelAllowedForPlan(requestedModel, userPlan)) {
  return Response.json({ error: 'Model not available on your plan', code: 'PLAN_LIMIT' }, { status: 403 })
}

const resolvedId = resolveModelId(requestedModel, lastUserMessage)
const openrouter = createOpenRouterForPlan(userPlan)
console.log('[Chat]', { plan: userPlan, requested: requestedModel, resolved: resolvedId })
```

### Step 4: Update `components/dashboard/chat/chat-input.tsx`

```ts
export type ModelId = 'xeref-free' | 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6' | 'claude-opus-4-6' | 'opus-plan' | 'best'

export const MODELS = [
  { id: 'xeref-free',                label: 'Xeref',          description: 'Fast and free for everyday use',           plan: 'free',  planLabel: 'BASIC' },
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5',     description: 'Fastest for quick answers',                plan: 'pro',   planLabel: 'PRO'   },
  { id: 'claude-sonnet-4-6',         label: 'Sonnet 4.6',    description: 'Best balance of speed and intelligence',   plan: 'pro',   planLabel: 'PRO'   },
  { id: 'best',                      label: 'Best (Auto)',    description: 'Dynamically routes to the best model',    plan: 'ultra', planLabel: 'ULTRA' },
  { id: 'claude-opus-4-6',           label: 'Opus 4.6',      description: 'Most capable for complex work',            plan: 'ultra', planLabel: 'ULTRA' },
  { id: 'opus-plan',                 label: 'Opus Plan Mode',description: 'Uses Opus for planning, Sonnet otherwise', plan: 'ultra', planLabel: 'ULTRA' },
]
```

### Step 5: Update `components/dashboard/chat/chat-interface.tsx`

- Change default state to `'xeref-free'`
- On localStorage restore: if saved model is `claude-haiku-4-5-20251001` and user is on free plan, reset to `xeref-free`

### Step 6: Delete dead code

- Delete `components/dashboard/AIAssistantModal.tsx` (only referenced in docs/plans)
- Delete `lib/apiService.ts` (unused, exposes API key client-side)

### Step 7: Update docs

- `CLAUDE.md`: update model routing table + env vars section
- `.env.example`: add new vars, annotate old `OPENROUTER_API_KEY` as replaced

## Verification

1. `npm run test` — all unit tests pass
2. `npm run build` — no TypeScript or lint errors
3. Manual: free user can only select Xeref; direct API request with disallowed model → 403
4. Manual: server logs show routing decisions on each request
5. Manual: streaming works end-to-end with `openrouter/free`

## Follow-up Before Deploy

1. Confirm Vercel has: `OPENROUTER_API_KEY_BASIC`, `OPENROUTER_API_KEY_PRO`, `OPENROUTER_API_KEY_ULTRA`, `OPENROUTER_BASE_URL`, `XEREF_DEFAULT_OPENROUTER_SITE_URL`, `XEREF_DEFAULT_OPENROUTER_APP_NAME`
2. Remove old `OPENROUTER_API_KEY` from Vercel after confirming deploy works
3. Set per-tier spending limits on OpenRouter keys for cost control
