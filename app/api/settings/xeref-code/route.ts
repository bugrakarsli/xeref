import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_XEREF_CODE } from '@/lib/types'
import type { XerefCodeAppearanceSettings, XerefCodeGeneralSettings, XerefCodeWebSettings } from '@/lib/types'

type XerefCodeSettings = XerefCodeAppearanceSettings & XerefCodeGeneralSettings & XerefCodeWebSettings

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', user.id)
    .single()

  const stored = (data?.preferences as { xeref_code?: Partial<XerefCodeSettings> } | null)?.xeref_code ?? {}
  return NextResponse.json({ ...DEFAULT_XEREF_CODE, ...stored })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json() as Partial<XerefCodeSettings>

  const { data: current } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', user.id)
    .single()

  const prev = (current?.preferences as { xeref_code?: Partial<XerefCodeSettings> } | null)?.xeref_code ?? {}
  const merged = { ...prev, ...body }

  const preferences = { ...(current?.preferences as object ?? {}), xeref_code: merged }
  const { error } = await supabase
    .from('profiles')
    .update({ preferences })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...DEFAULT_XEREF_CODE, ...merged })
}
