'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Task, DailyTarget } from '@/lib/types'
import { runWorkflowsForEvent } from './workflows'

export async function createTask(
  title: string,
  opts?: {
    description?: string
    project_id?: string | null
    priority?: 'low' | 'medium' | 'high'
    due_date?: string | null
  }
): Promise<Task> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title,
      description: opts?.description ?? null,
      project_id: opts?.project_id ?? null,
      priority: opts?.priority ?? 'medium',
      due_date: opts?.due_date ?? null,
    })
    .select()
    .single()

  if (error) throw error
  await runWorkflowsForEvent('task_created', user.id).catch(() => null)
  revalidatePath('/')
  return data as Task
}

export async function getUserTasks(): Promise<Task[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Task[]
}

export async function updateTask(
  id: string,
  updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'project_id'>>
): Promise<Task> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  if (updates.status === 'done') {
    await runWorkflowsForEvent('task_completed', user.id).catch(() => null)
  }
  revalidatePath('/')
  return data as Task
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/')
}

export async function getDailyTarget(): Promise<DailyTarget> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .select('daily_task_goal, daily_completed, daily_reset_at')
    .eq('id', user.id)
    .single()

  if (error) throw error

  const today = new Date().toISOString().slice(0, 10)
  const resetAt = data?.daily_reset_at ?? today

  // Client-side reset: if stored date is before today, reset the counter
  if (resetAt < today) {
    await resetDailyTarget()
    return { goal: data?.daily_task_goal ?? 3, completed: 0, resetAt: today }
  }

  return {
    goal: data?.daily_task_goal ?? 3,
    completed: data?.daily_completed ?? 0,
    resetAt,
  }
}

export async function setDailyGoal(goal: number): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ daily_task_goal: goal })
    .eq('id', user.id)

  if (error) throw error
}

export async function incrementDailyCompleted(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data } = await supabase
    .from('profiles')
    .select('daily_completed')
    .eq('id', user.id)
    .single()

  await supabase
    .from('profiles')
    .update({ daily_completed: (data?.daily_completed ?? 0) + 1 })
    .eq('id', user.id)
}

export async function resetDailyTarget(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const today = new Date().toISOString().slice(0, 10)
  const { error } = await supabase
    .from('profiles')
    .update({ daily_completed: 0, daily_reset_at: today })
    .eq('id', user.id)

  if (error) throw error
}
