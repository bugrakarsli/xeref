import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_CAPABILITIES } from '@/lib/types'
import type { CapabilitiesSettings } from '@/lib/types'
import { parseBody, UpdateCapabilitiesSchema } from '@/lib/validation'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', user.id)
    .single()

  const stored = (data?.preferences as { capabilities?: Partial<CapabilitiesSettings> } | null)?.capabilities ?? {}
  return NextResponse.json({ ...DEFAULT_CAPABILITIES, ...stored })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const rawBody = await request.json().catch(() => null)
  const { data: body, error: bodyError } = parseBody(UpdateCapabilitiesSchema, rawBody)
  if (bodyError) return bodyError

  const { data: current } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', user.id)
    .single()

  const prev = (current?.preferences as { capabilities?: Partial<CapabilitiesSettings> } | null)?.capabilities ?? {}
  const merged = { ...prev, ...body }

  const preferences = { ...(current?.preferences as object ?? {}), capabilities: merged }
  const { error } = await supabase
    .from('profiles')
    .update({ preferences })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...DEFAULT_CAPABILITIES, ...merged })
}
