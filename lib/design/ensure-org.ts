import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'

export async function ensureOrgForUser(user: User): Promise<string> {
  const admin = createAdminClient()

  // 1. User already has a membership — fast path
  const { data: existing } = await admin
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (existing?.org_id) return existing.org_id

  const slug = `${user.id.slice(0, 8)}-org`

  // 2. Org may already exist from a previous failed attempt — check by slug
  const { data: existingOrg } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  let orgId = existingOrg?.id ?? null

  if (!orgId) {
    // 3. Create a fresh org
    const userName =
      user.user_metadata?.full_name ??
      user.email?.split('@')[0] ??
      'My'
    const { data: org, error: orgErr } = await admin
      .from('organizations')
      .insert({ name: `${userName}'s Organization`, slug })
      .select('id')
      .single()
    if (orgErr || !org) throw new Error(`Failed to create org: ${orgErr?.message}`)
    orgId = org.id
  }

  // 4. Create membership (org exists, user just isn't a member yet)
  const { error: memberErr } = await admin
    .from('org_members')
    .insert({ org_id: orgId, user_id: user.id, role: 'owner' })

  // Ignore duplicate-key errors (concurrent requests / already exists)
  if (memberErr && !memberErr.message.toLowerCase().includes('duplicate')) {
    throw new Error(`Failed to create membership: ${memberErr.message}`)
  }

  return orgId
}
