'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Project } from '@/lib/types'

export async function saveProject(
  name: string,
  featureIds: string[],
  description?: string
): Promise<Project> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name,
      description: description ?? null,
      selected_feature_ids: featureIds,
    })
    .select()
    .single()

  if (error) throw error

  await supabase.from('usage_events').insert({
    user_id: user.id,
    event_type: 'project_saved',
    metadata: { project_id: data.id, feature_count: featureIds.length },
  })

  revalidatePath('/builder')
  return data as Project
}

export async function getUserProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Project[]
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error

  await supabase.from('usage_events').insert({
    user_id: user.id,
    event_type: 'project_deleted',
    metadata: { project_id: id },
  })

  revalidatePath('/builder')
}

export async function logPromptGenerated(featureCount: number): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return // anonymous usage — skip logging

  await supabase.from('usage_events').insert({
    user_id: user.id,
    event_type: 'prompt_generated',
    metadata: { feature_count: featureCount },
  })
}
