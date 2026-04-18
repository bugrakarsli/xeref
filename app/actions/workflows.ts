'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import type { Workflow } from '@/lib/types'

const DEFAULT_WORKFLOWS = [
  {
    name: 'Save Memories from Chat',
    trigger: 'chat_message_sent',
    trigger_description: 'Whenever the user message explicitly requests to remember something.',
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
  updates: Partial<Pick<Workflow, 'name' | 'enabled' | 'trigger' | 'trigger_description' | 'action' | 'cron_expression'>>
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
  opts?: { cron_expression?: string; trigger_description?: string }
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
      trigger_description: opts?.trigger_description ?? null,
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

export interface WorkflowExecution {
  id: string
  created_at: string
  metadata: {
    workflow_id: string
    trigger: string
    action: string
    result: string
    payload?: Record<string, unknown>
  }
}

export async function getWorkflowExecutions(limit = 50): Promise<WorkflowExecution[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('usage_events')
    .select('id, created_at, metadata')
    .eq('user_id', user.id)
    .eq('event_type', 'workflow_run')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as WorkflowExecution[]
}

export async function runWorkflow(id: string, payload?: { userMessage?: string }): Promise<{ result: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: workflow, error: fetchErr } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchErr || !workflow) throw new Error('Workflow not found')

  const result = 'Triggered manually'
  const now = new Date().toISOString()

  await supabase.from('usage_events').insert({
    user_id: user.id,
    event_type: 'workflow_run',
    metadata: {
      workflow_id: id,
      trigger: workflow.trigger,
      action: workflow.action,
      result,
      ...(payload?.userMessage ? { payload: { userMessage: payload.userMessage } } : {}),
    },
  })

  await supabase
    .from('workflows')
    .update({ last_run_at: now, last_run_result: result })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/')
  return { result }
}

export async function deleteExecution(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin not configured')

  const admin = createAdminClient(url, key)
  const { error } = await admin
    .from('usage_events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
}

export async function updateExecutionResult(id: string, result: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: existing, error: fetchErr } = await supabase
    .from('usage_events')
    .select('metadata')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchErr || !existing) throw new Error('Execution not found')

  const { error } = await supabase
    .from('usage_events')
    .update({ metadata: { ...existing.metadata, result } })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
}

const MEMORY_KEYWORDS = [
  'remember', 'save to memory', 'note this', "don't forget", 'keep in mind',
  'save this', 'add to memory', 'store this', 'keep this', 'make a note',
]

function messageRequestsMemory(message: string): boolean {
  const lower = message.toLowerCase()
  return MEMORY_KEYWORDS.some((kw) => lower.includes(kw))
}

/** Fire all enabled chat_message_sent workflows for the current user */
export async function runChatWorkflows(userMessage: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: workflows } = await supabase
    .from('workflows')
    .select('id, trigger, trigger_description, action')
    .eq('user_id', user.id)
    .eq('trigger', 'chat_message_sent')
    .eq('enabled', true)

  if (!workflows || workflows.length === 0) return

  const now = new Date().toISOString()

  for (const workflow of workflows) {
    // If a trigger_description is set and the action is save_memory, only fire
    // when the user message explicitly requests it.
    if (workflow.action === 'save_memory' && workflow.trigger_description && !messageRequestsMemory(userMessage)) {
      continue
    }

    await supabase.from('usage_events').insert({
      user_id: user.id,
      event_type: 'workflow_run',
      metadata: {
        workflow_id: workflow.id,
        trigger: workflow.trigger,
        action: workflow.action,
        result: 'Success',
        payload: { userMessage },
      },
    })

    await supabase
      .from('workflows')
      .update({ last_run_at: now, last_run_result: 'Success' })
      .eq('id', workflow.id)
      .eq('user_id', user.id)
  }
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
