'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Memory } from '@/lib/types'

export async function saveMemory(
  content: string,
  source: 'chat' | 'manual' = 'manual',
  tags: string[] = [],
  projectId?: string | null,
): Promise<Memory> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('memories')
    .insert({ user_id: user.id, content, source, tags, project_id: projectId ?? null })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/')
  return data as Memory
}

export async function getUserMemories(projectId?: string | null): Promise<Memory[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let q = supabase
    .from('memories')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (projectId) {
    // Return project-scoped memories + global memories (project_id IS NULL)
    q = q.or(`project_id.eq.${projectId},project_id.is.null`)
  }

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Memory[]
}

export async function deleteMemory(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/')
}
