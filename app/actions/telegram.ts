'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const CODE_TTL_MINUTES = 10

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface TelegramLinkStatus {
  linked: boolean
  telegramUsername: string | null
}

export async function getTelegramLinkStatus(): Promise<TelegramLinkStatus> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { linked: false, telegramUsername: null }

  const { data } = await adminClient()
    .from('telegram_links')
    .select('telegram_username')
    .eq('user_id', user.id)
    .single()

  return {
    linked: !!data,
    telegramUsername: data?.telegram_username ?? null,
  }
}

export async function generateTelegramPairingCode(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('telegram_pairing_codes')
    .insert({ user_id: user.id, expires_at: expiresAt })
    .select('code')
    .single()

  if (error) throw error
  return (data as { code: string }).code
}

export async function unlinkTelegram(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await adminClient().from('telegram_links').delete().eq('user_id', user.id)
}
