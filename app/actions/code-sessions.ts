'use server'

import { createClient } from '@/lib/supabase/server'
import type { CodeSession } from '@/lib/types'

export async function getUserCodeSessions(): Promise<CodeSession[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('code_sessions')
    .select('id, user_id, title, repo_full_name, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(30)

  if (error) return []
  return (data ?? []) as CodeSession[]
}

export async function renameCodeSession(id: string, title: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('code_sessions')
    .update({ title })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
}

export async function deleteCodeSession(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('code_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
}
