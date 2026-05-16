'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Memory } from '@/lib/types'

export async function saveMemory(
  content: string,
  source: 'chat' | 'manual' = 'manual',
  tags: string[] = []
): Promise<Memory> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('memories')
    .insert({ user_id: user.id, content, source, tags })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/')
  return data as Memory
}

export async function getUserMemories(): Promise<Memory[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
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
