'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type UserPlan = 'free' | 'pro' | 'ultra'

export interface UserProfile {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  plan: UserPlan
  role: string | null
  primary_goal: string | null
  preferred_model: string | null
  onboarding_completed: boolean
  created_at: string
}

export async function getUserPlan(): Promise<UserPlan> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'

  const { data } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  return (data?.plan ?? 'free') as UserPlan
}

export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!data) return null
  return {
    ...data,
    plan: (data.plan ?? 'free') as UserPlan,
    onboarding_completed: data.onboarding_completed ?? true,
  } as UserProfile
}

export async function updateProfile(
  updates: Partial<Pick<UserProfile, 'display_name' | 'role' | 'primary_goal' | 'preferred_model' | 'onboarding_completed'>>
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) throw error
  revalidatePath('/')
}
