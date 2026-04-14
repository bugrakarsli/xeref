// Server-only OpenRouter configuration.
// Never import this from client components — it reads server-only env vars.
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export type UserPlan = 'free' | 'pro' | 'ultra'

export type ModelId =
  | 'xeref-free'
  | 'claude-haiku-4-5-20251001'
  | 'claude-sonnet-4-6'
  | 'claude-opus-4-6'
  | 'opus-plan'
  | 'best'

// Lazy env validation — read at call time, not at module load, so build never fails.
function getRequiredEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

// ── Plan → API key ───────────────────────────────────────────────────────────

const PLAN_KEY_MAP: Record<UserPlan, string> = {
  free: 'OPENROUTER_API_KEY_BASIC',
  pro: 'OPENROUTER_API_KEY_PRO',
  ultra: 'OPENROUTER_API_KEY_ULTRA',
}

export function getApiKeyForPlan(plan: UserPlan): string {
  return getRequiredEnv(PLAN_KEY_MAP[plan])
}

// ── Model resolution (client ID → OpenRouter provider ID) ────────────────────

const MODEL_MAP: Record<string, string> = {
  'xeref-free': 'openrouter/free',
  'claude-haiku-4-5-20251001': 'anthropic/claude-haiku-4-5',
  'claude-sonnet-4-6': 'anthropic/claude-sonnet-4-6',
  'claude-opus-4-6': 'anthropic/claude-opus-4-6',
}

const OPUS_PLAN_REGEX = /plan|roadmap|decompose|break down|architecture|goals|agent/i

export function resolveModelId(modelId: string, lastUserMessage?: string): string {
  // opus-plan: dynamic routing — Opus for planning queries, Sonnet otherwise
  if (modelId === 'opus-plan') {
    const isPlan = OPUS_PLAN_REGEX.test(lastUserMessage ?? '')
    return isPlan ? MODEL_MAP['claude-opus-4-6'] : MODEL_MAP['claude-sonnet-4-6']
  }
  // best: OpenRouter auto-routing (Ultra only, distinct from explicit Opus selection)
  if (modelId === 'best') return 'openrouter/auto'
  return MODEL_MAP[modelId] ?? modelId
}

// ── Plan → allowed models ────────────────────────────────────────────────────

const PLAN_MODELS: Record<UserPlan, Set<string>> = {
  free: new Set(['xeref-free']),
  pro: new Set(['xeref-free', 'claude-haiku-4-5-20251001', 'claude-sonnet-4-6']),
  ultra: new Set([
    'xeref-free',
    'claude-haiku-4-5-20251001',
    'claude-sonnet-4-6',
    'claude-opus-4-6',
    'opus-plan',
    'best',
  ]),
}

export function isModelAllowedForPlan(modelId: string, plan: UserPlan): boolean {
  return PLAN_MODELS[plan]?.has(modelId) ?? false
}

// ── Provider factory ─────────────────────────────────────────────────────────
// Creates a per-request OpenRouter provider instance with the correct API key
// and attribution headers for the given plan tier.

export function createOpenRouterForPlan(plan: UserPlan) {
  return createOpenRouter({
    apiKey: getApiKeyForPlan(plan),
    baseURL: process.env.OPENROUTER_BASE_URL || undefined,
    headers: {
      'HTTP-Referer': process.env.XEREF_DEFAULT_OPENROUTER_SITE_URL || 'https://xeref.ai',
      'X-Title': process.env.XEREF_DEFAULT_OPENROUTER_APP_NAME || 'Xeref',
    },
  })
}

// Default model — cheapest path, available to all plans
export const DEFAULT_MODEL: ModelId = 'xeref-free'
