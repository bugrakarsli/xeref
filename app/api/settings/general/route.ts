import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseBody, UpdateGeneralSettingsSchema } from '@/lib/validation'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const rawBody = await request.json().catch(() => null)
  const { data: body, error: bodyError } = parseBody(UpdateGeneralSettingsSchema, rawBody)
  if (bodyError) return bodyError

  const updates: Record<string, string> = {}
  if (body.display_name !== undefined) updates.display_name = body.display_name.trim().slice(0, 80)
  if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'no valid fields' }, { status: 400 })
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
