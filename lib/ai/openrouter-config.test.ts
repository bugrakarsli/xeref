import { describe, it, expect, beforeEach, vi } from 'vitest'

// We import after setting up env stubs so lazy getRequiredEnv picks them up
const setEnv = (overrides: Record<string, string>) => {
  vi.stubEnv('OPENROUTER_API_KEY_BASIC', overrides.OPENROUTER_API_KEY_BASIC ?? 'key-basic')
  vi.stubEnv('OPENROUTER_API_KEY_PRO', overrides.OPENROUTER_API_KEY_PRO ?? 'key-pro')
  vi.stubEnv('OPENROUTER_API_KEY_ULTRA', overrides.OPENROUTER_API_KEY_ULTRA ?? 'key-ultra')
  vi.stubEnv('OPENROUTER_BASE_URL', overrides.OPENROUTER_BASE_URL ?? '')
  vi.stubEnv('XEREF_DEFAULT_OPENROUTER_SITE_URL', overrides.XEREF_DEFAULT_OPENROUTER_SITE_URL ?? '')
  vi.stubEnv('XEREF_DEFAULT_OPENROUTER_APP_NAME', overrides.XEREF_DEFAULT_OPENROUTER_APP_NAME ?? '')
}

describe('openrouter-config', () => {
  beforeEach(() => {
    setEnv({})
    vi.resetModules()
  })

  // ── Plan-to-key mapping ──────────────────────────────────────────────────

  describe('getApiKeyForPlan', () => {
    it('returns OPENROUTER_API_KEY_BASIC for free plan', async () => {
      vi.stubEnv('OPENROUTER_API_KEY_BASIC', 'test-basic-key')
      const { getApiKeyForPlan } = await import('./openrouter-config')
      expect(getApiKeyForPlan('free')).toBe('test-basic-key')
    })

    it('returns OPENROUTER_API_KEY_PRO for pro plan', async () => {
      vi.stubEnv('OPENROUTER_API_KEY_PRO', 'test-pro-key')
      const { getApiKeyForPlan } = await import('./openrouter-config')
      expect(getApiKeyForPlan('pro')).toBe('test-pro-key')
    })

    it('returns OPENROUTER_API_KEY_ULTRA for ultra plan', async () => {
      vi.stubEnv('OPENROUTER_API_KEY_ULTRA', 'test-ultra-key')
      const { getApiKeyForPlan } = await import('./openrouter-config')
      expect(getApiKeyForPlan('ultra')).toBe('test-ultra-key')
    })

    it('throws when OPENROUTER_API_KEY_BASIC is missing', async () => {
      vi.stubEnv('OPENROUTER_API_KEY_BASIC', '')
      const { getApiKeyForPlan } = await import('./openrouter-config')
      expect(() => getApiKeyForPlan('free')).toThrow('Missing required env var: OPENROUTER_API_KEY_BASIC')
    })
  })

  // ── Model allowlists ─────────────────────────────────────────────────────

  describe('isModelAllowedForPlan', () => {
    it('allows xeref-free for free plan', async () => {
      const { isModelAllowedForPlan } = await import('./openrouter-config')
      expect(isModelAllowedForPlan('xeref-free', 'free')).toBe(true)
    })

    it('blocks claude-haiku-4-5-20251001 for free plan', async () => {
      const { isModelAllowedForPlan } = await import('./openrouter-config')
      expect(isModelAllowedForPlan('claude-haiku-4-5-20251001', 'free')).toBe(false)
    })

    it('blocks claude-sonnet-4-6 for free plan', async () => {
      const { isModelAllowedForPlan } = await import('./openrouter-config')
      expect(isModelAllowedForPlan('claude-sonnet-4-6', 'free')).toBe(false)
    })

    it('blocks claude-opus-4-7 for free plan', async () => {
      const { isModelAllowedForPlan } = await import('./openrouter-config')
      expect(isModelAllowedForPlan('claude-opus-4-7', 'free')).toBe(false)
    })

    it('blocks best for free plan', async () => {
      const { isModelAllowedForPlan } = await import('./openrouter-config')
      expect(isModelAllowedForPlan('best', 'free')).toBe(false)
    })

    it('allows xeref-free for pro plan (plan hierarchy)', async () => {
      const { isModelAllowedForPlan } = await import('./openrouter-config')
      expect(isModelAllowedForPlan('xeref-free', 'pro')).toBe(true)
    })

    it('allows claude-haiku-4-5-20251001 for pro plan', async () => {
      const { isModelAllowedForPlan } = await import('./openrouter-config')
      expect(isModelAllowedForPlan('claude-haiku-4-5-20251001', 'pro')).toBe(true)
    })

    it('allows claude-sonnet-4-6 for pro plan', async () => {
      const { isModelAllowedForPlan } = await import('./openrouter-config')
      expect(isModelAllowedForPlan('claude-sonnet-4-6', 'pro')).toBe(true)
    })

    it('blocks claude-opus-4-7 for pro plan', async () => {
      const { isModelAllowedForPlan } = await import('./openrouter-config')
      expect(isModelAllowedForPlan('claude-opus-4-7', 'pro')).toBe(false)
    })

    it('blocks best for pro plan', async () => {
      const { isModelAllowedForPlan } = await import('./openrouter-config')
      expect(isModelAllowedForPlan('best', 'pro')).toBe(false)
    })

    it('allows all models for ultra plan', async () => {
      const { isModelAllowedForPlan } = await import('./openrouter-config')
      for (const m of ['xeref-free', 'claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-7', 'opus-plan', 'best']) {
        expect(isModelAllowedForPlan(m, 'ultra')).toBe(true)
      }
    })

    it('returns false for unknown model id', async () => {
      const { isModelAllowedForPlan } = await import('./openrouter-config')
      expect(isModelAllowedForPlan('gpt-4o', 'ultra')).toBe(false)
    })
  })

  // ── Model resolution ─────────────────────────────────────────────────────

  describe('resolveModelId', () => {
    it('resolves xeref-free to openrouter/free', async () => {
      const { resolveModelId } = await import('./openrouter-config')
      expect(resolveModelId('xeref-free')).toBe('openrouter/free')
    })

    it('resolves claude-haiku-4-5-20251001 to anthropic/claude-haiku-4-5', async () => {
      const { resolveModelId } = await import('./openrouter-config')
      expect(resolveModelId('claude-haiku-4-5-20251001')).toBe('anthropic/claude-haiku-4-5')
    })

    it('resolves claude-sonnet-4-6 to anthropic/claude-sonnet-4-6', async () => {
      const { resolveModelId } = await import('./openrouter-config')
      expect(resolveModelId('claude-sonnet-4-6')).toBe('anthropic/claude-sonnet-4-6')
    })

    it('resolves claude-opus-4-7 to anthropic/claude-opus-4-7', async () => {
      const { resolveModelId } = await import('./openrouter-config')
      expect(resolveModelId('claude-opus-4-7')).toBe('anthropic/claude-opus-4-7')
    })

    it('resolves best to openrouter/auto (not opus)', async () => {
      const { resolveModelId } = await import('./openrouter-config')
      const resolved = resolveModelId('best')
      expect(resolved).toBe('openrouter/auto')
      expect(resolved).not.toContain('opus')
    })

    // opus-plan dynamic routing
    it('resolves opus-plan to opus when message contains planning keyword', async () => {
      const { resolveModelId } = await import('./openrouter-config')
      expect(resolveModelId('opus-plan', 'help me plan this project')).toBe('anthropic/claude-opus-4-7')
      expect(resolveModelId('opus-plan', 'create a roadmap for Q3')).toBe('anthropic/claude-opus-4-7')
      expect(resolveModelId('opus-plan', 'decompose this into tasks')).toBe('anthropic/claude-opus-4-7')
      expect(resolveModelId('opus-plan', 'break down the architecture')).toBe('anthropic/claude-opus-4-7')
      expect(resolveModelId('opus-plan', 'set agent goals')).toBe('anthropic/claude-opus-4-7')
    })

    it('resolves opus-plan to sonnet when message has no planning keywords', async () => {
      const { resolveModelId } = await import('./openrouter-config')
      expect(resolveModelId('opus-plan', 'what is 2 + 2?')).toBe('anthropic/claude-sonnet-4-6')
      expect(resolveModelId('opus-plan', 'write me a poem')).toBe('anthropic/claude-sonnet-4-6')
      expect(resolveModelId('opus-plan', undefined)).toBe('anthropic/claude-sonnet-4-6')
    })
  })

  // ── Default model ────────────────────────────────────────────────────────

  describe('DEFAULT_MODEL', () => {
    it('defaults to xeref-free', async () => {
      const { DEFAULT_MODEL } = await import('./openrouter-config')
      expect(DEFAULT_MODEL).toBe('xeref-free')
    })
  })
})
