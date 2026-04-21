'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'

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

export async function getMcpToken(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data } = await supabase
    .from('profiles')
    .select('mcp_token')
    .eq('id', user.id)
    .single()

  return data?.mcp_token ?? null
}

export async function regenerateMcpToken(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const token = `xmcp_${randomBytes(24).toString('hex')}`

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await admin
    .from('profiles')
    .update({ mcp_token: token })
    .eq('id', user.id)

  if (error) throw error
  revalidatePath('/')
  return token
}

export async function getTelegramBotToken(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data } = await supabase
    .from('profiles')
    .select('telegram_bot_token')
    .eq('id', user.id)
    .single()

  return data?.telegram_bot_token ?? null
}

export async function saveTelegramBotToken(botToken: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ telegram_bot_token: botToken })
    .eq('id', user.id)

  if (error) throw error
  revalidatePath('/')
}
