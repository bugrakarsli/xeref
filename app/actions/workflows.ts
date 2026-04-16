'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Workflow } from '@/lib/types'

const DEFAULT_WORKFLOWS = [
  {
    name: 'Save Memories from Chat',
    trigger: 'chat_message_sent',
    action: 'save_memory',
    enabled: true,
  },
]

export async function getUserWorkflows(): Promise<Workflow[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as Workflow[]
}

export async function updateWorkflow(
  id: string,
  updates: Partial<Pick<Workflow, 'name' | 'enabled'>>
): Promise<Workflow> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('workflows')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/')
  return data as Workflow
}

export async function seedDefaultWorkflows(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Only seed if the user has no workflows yet
  const { data: existing } = await supabase
    .from('workflows')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  if (existing && existing.length > 0) return

  await supabase.from('workflows').insert(
    DEFAULT_WORKFLOWS.map((w) => ({ ...w, user_id: user.id }))
  )
  revalidatePath('/')
}

export async function createWorkflow(
  name: string,
  trigger: string,
  action: string,
  opts?: { cron_expression?: string }
): Promise<Workflow> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const webhookSecret = trigger === 'webhook'
    ? `wh_${crypto.randomUUID().replace(/-/g, '')}`
    : null

  const { data, error } = await supabase
    .from('workflows')
    .insert({
      user_id: user.id,
      name,
      trigger,
      action,
      enabled: true,
      cron_expression: opts?.cron_expression ?? null,
      webhook_secret: webhookSecret,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/')
  return data as Workflow
}

export async function deleteWorkflow(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/')
}

/** Check if the memory-save workflow is enabled for the current user */
export async function isMemoryWorkflowEnabled(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('workflows')
    .select('enabled')
    .eq('user_id', user.id)
    .eq('action', 'save_memory')
    .single()

  return data?.enabled ?? true
}
