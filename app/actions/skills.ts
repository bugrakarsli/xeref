'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Skill, SkillInsert, SkillUpdate } from '@/components/customize/types'

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getSkills(): Promise<Skill[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .or(`source.eq.built-in${user ? `,user_id.eq.${user.id}` : ''}`)
    .order('source', { ascending: false })   // built-in first
    .order('name',   { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as Skill[]
}

export async function getSkillById(id: string): Promise<Skill | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('skills').select('*').eq('id', id).single()
  return (data as Skill) ?? null
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createSkill(
  input: SkillInsert
): Promise<{ skill?: Skill; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('skills')
    .insert({
      name:         input.name,
      description:  input.description  ?? null,
      endpoint_url: input.endpoint_url ?? null,
      tools:        input.tools        ?? [],
      source:       'user',
      user_id:      user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/customize/skills')
  return { skill: data as Skill }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateSkill(
  id: string,
  input: SkillUpdate
): Promise<{ skill?: Skill; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const existing = await getSkillById(id)
  if (!existing) return { error: 'Skill not found' }
  if (existing.source === 'built-in') return { error: 'Built-in skills are read-only' }

  const { data, error } = await supabase
    .from('skills')
    .update({
      name:         input.name,
      description:  input.description,
      endpoint_url: input.endpoint_url,
      tools:        input.tools,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/customize/skills')
  return { skill: data as Skill }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteSkill(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const existing = await getSkillById(id)
  if (!existing) return { error: 'Skill not found' }
  if (existing.source === 'built-in') return { error: 'Built-in skills cannot be deleted' }

  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/customize/skills')
  return {}
}
