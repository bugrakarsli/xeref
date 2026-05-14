import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_VISIBLE_IDS, ALL_ITEM_IDS } from '@/lib/sidebar/items'
import type { SidebarPreferences } from '@/lib/types'

function defaults(): SidebarPreferences {
  return { visible_tabs: DEFAULT_VISIBLE_IDS, order: DEFAULT_VISIBLE_IDS }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', user.id)
    .single()

  const prefs = (data?.preferences as { sidebar?: SidebarPreferences } | null)?.sidebar ?? defaults()
  return NextResponse.json(prefs)
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json() as Partial<SidebarPreferences>

  // Sanitise: only allow known item ids
  const visibleTabs = (body.visible_tabs ?? DEFAULT_VISIBLE_IDS).filter(id => ALL_ITEM_IDS.includes(id))
  const order = (body.order ?? visibleTabs).filter(id => ALL_ITEM_IDS.includes(id))

  const { data: current } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', user.id)
    .single()

  const merged = { ...(current?.preferences as object ?? {}), sidebar: { visible_tabs: visibleTabs, order } }
  const { error } = await supabase
    .from('profiles')
    .update({ preferences: merged })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ visible_tabs: visibleTabs, order })
}
