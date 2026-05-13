import type { ElementType } from 'react'

// ─── Skill (Supabase-backed) ──────────────────────────────────────────────────

export type SkillSource = 'built-in' | 'user'

export interface Skill {
  id: string
  created_at: string
  updated_at: string
  name: string
  description: string | null
  endpoint_url: string | null
  tools: string[]
  source: SkillSource
  user_id: string | null
}

export interface SkillInsert {
  name: string
  description?: string | null
  endpoint_url?: string | null
  tools?: string[]
}

export interface SkillUpdate {
  name?: string
  description?: string | null
  endpoint_url?: string | null
  tools?: string[]
}

export type SkillDialogMode = 'create' | 'edit' | 'view'

// ─── Connector (existing) ─────────────────────────────────────────────────────

export interface Connector {
  id: string
  name: string
  service: string
  icon: ElementType
  color: string
  connected: boolean
  description: string
  scopes?: string[]
}
