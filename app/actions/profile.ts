'use server'

import { createClient } from '@/lib/supabase/server'

export type UserPlan = 'free' | 'pro' | 'ultra'

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
