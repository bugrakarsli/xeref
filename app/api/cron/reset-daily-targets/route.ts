import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Vercel cron fires this at 21:00 UTC daily (= midnight Istanbul UTC+3).
// Secured by CRON_SECRET env var — Vercel passes it as Authorization: Bearer <secret>.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey)
  const today = new Date().toISOString().slice(0, 10)

  const { error } = await supabase
    .from('profiles')
    .update({ daily_completed: 0, daily_reset_at: today })
    .lt('daily_reset_at', today)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, resetAt: today })
}
