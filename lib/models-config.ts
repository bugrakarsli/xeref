export interface ModelOption {
  id: string
  name: string
  description: string
  tier: 'BASIC' | 'PRO' | 'ULTRA'
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'xeref-free',
    name: 'Xeref',
    description: 'Fast and free for everyday use',
    tier: 'BASIC',
  },
  {
    id: 'claude-haiku-4-5-20251001',
    name: 'Haiku 4.5',
    description: 'Fastest for quick answers',
    tier: 'PRO',
  },
  {
    id: 'deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    description: 'Fast and affordable from DeepSeek',
    tier: 'PRO',
  },
  {
    id: 'claude-sonnet-4-6',
    name: 'Sonnet 4.6',
    description: 'Best balance of speed and intelligence',
    tier: 'PRO',
  },
  {
    id: 'best',
    name: 'Best (Auto)',
    description: 'Dynamically routes your query to the best model',
    tier: 'ULTRA',
  },
  {
    id: 'claude-opus-4-7',
    name: 'Opus 4.7',
    description: 'Most capable for complex work',
    tier: 'ULTRA',
  },
  {
    id: 'deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    description: 'Powerful reasoning from DeepSeek',
    tier: 'ULTRA',
  },
  {
    id: 'opus-plan',
    name: 'Opus Plan Mode',
    description: 'Uses Opus 4.7 for planning, Sonnet 4.6 otherwise',
    tier: 'ULTRA',
  },
]

export const DEFAULT_MODEL = AVAILABLE_MODELS[0].id
