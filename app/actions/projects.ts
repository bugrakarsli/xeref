'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { Project, ProjectGoal } from '@/lib/types'

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

  revalidatePath('/')
  revalidatePath('/builder')
  return data as Project
}

export async function getUserProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return []
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
    .eq('user_id', user.id)

  if (error) throw error

  await supabase.from('usage_events').insert({
    user_id: user.id,
    event_type: 'project_deleted',
    metadata: { project_id: id },
  })

  revalidatePath('/')
  revalidatePath('/builder')
}

export async function renameProject(id: string, name: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('projects')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/')
}

export async function updateProjectPrompt(id: string, prompt: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('projects')
    .update({ prompt, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/')
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

export async function decomposeProjectGoals(
  projectId: string,
  description: string
): Promise<ProjectGoal[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const apiKey = process.env.OPENROUTER_API_KEY_PRO ?? process.env.OPENROUTER_API_KEY_BASIC
  if (!apiKey) return []

  const openrouter = createOpenRouter({
    apiKey,
    headers: {
      'HTTP-Referer': process.env.XEREF_DEFAULT_OPENROUTER_SITE_URL ?? 'https://xeref.ai',
      'X-Title': process.env.XEREF_DEFAULT_OPENROUTER_APP_NAME ?? 'Xeref',
    },
  })

  let titles: string[] = []
  try {
    const { text } = await generateText({
      model: openrouter('anthropic/claude-haiku-4-5'),
      prompt: `Break this project into 3 to 5 clear, actionable sub-goals. Return ONLY a JSON array of strings with no other text.\n\nProject: ${description}`,
      maxOutputTokens: 400,
    })
    const parsed = JSON.parse(text.trim())
    if (Array.isArray(parsed)) {
      titles = parsed.slice(0, 5).map((t: unknown) => String(t).replace(/^["'\-•\d.]+\s*/, '').trim()).filter(Boolean)
    }
  } catch {
    return []
  }

  if (titles.length === 0) return []

  const { data, error } = await supabase
    .from('project_goals')
    .insert(titles.map((title) => ({ project_id: projectId, user_id: user.id, title })))
    .select()

  if (error) throw error
  return (data ?? []) as ProjectGoal[]
}

export async function getProjectGoals(projectId: string): Promise<ProjectGoal[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_goals')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at')

  if (error) throw error
  return (data ?? []) as ProjectGoal[]
}

export async function toggleProjectGoal(goalId: string, completed: boolean): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('project_goals')
    .update({ completed })
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) throw error
}
