import { getSupabase } from './supabase.js'

export interface LinkedUser {
  userId: string
  email: string | null
  plan: string
}

export async function resolveUser(telegramUserId: number): Promise<LinkedUser | null> {
  const sb = getSupabase()
  const { data: link } = await sb
    .from('telegram_links')
    .select('user_id')
    .eq('telegram_user_id', telegramUserId)
    .single()

  if (!link) return null

  const { data: profile } = await sb
    .from('profiles')
    .select('plan')
    .eq('id', link.user_id)
    .single()

  const { data: authUser } = await sb.auth.admin.getUserById(link.user_id)

  return {
    userId: link.user_id,
    email: authUser?.user?.email ?? null,
    plan: (profile as { plan?: string } | null)?.plan ?? 'basic',
  }
}

export async function pairUser(
  telegramUserId: number,
  telegramUsername: string | undefined,
  code: string
): Promise<LinkedUser | null> {
  const sb = getSupabase()
  const now = new Date().toISOString()

  const { data: pairing } = await sb
    .from('telegram_pairing_codes')
    .select('user_id, expires_at, used')
    .eq('code', code)
    .single()

  if (!pairing || pairing.used || pairing.expires_at < now) return null

  await sb.from('telegram_pairing_codes').update({ used: true }).eq('code', code)

  await sb
    .from('telegram_links')
    .upsert({ telegram_user_id: telegramUserId, user_id: pairing.user_id, telegram_username: telegramUsername ?? null })

  return resolveUser(telegramUserId)
}
