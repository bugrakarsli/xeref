import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Vercel cron fires this at 09:00 UTC daily.
 * Runs all enabled scheduled_daily workflows; also runs scheduled_weekly on Mondays.
 */
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient(supabaseUrl, serviceKey) as any
  const now = new Date()
  const isMonday = now.getUTCDay() === 1
  const triggers = isMonday ? ['scheduled_daily', 'scheduled_weekly'] : ['scheduled_daily']

  const { data: workflows, error } = await sb
    .from('workflows')
    .select('*')
    .eq('enabled', true)
    .in('trigger', triggers)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const results: { id: string; name: string; result: string }[] = []

  for (const wf of workflows ?? []) {
    let result = `Action "${wf.action}" acknowledged`

    if (wf.action === 'create_task') {
      const title = `Scheduled task from: ${wf.name}`
      const { error: taskErr } = await sb.from('tasks').insert({ user_id: wf.user_id, title, priority: 'medium', status: 'todo' })
      result = taskErr ? `Failed: ${taskErr.message}` : `Task created: "${title}"`
    }

    const runAt = now.toISOString()
    await Promise.all([
      sb.from('workflows').update({ last_run_at: runAt, last_run_result: result }).eq('id', wf.id),
      sb.from('usage_events').insert({
        user_id: wf.user_id,
        event_type: 'workflow_run',
        metadata: { workflow_id: wf.id, trigger: wf.trigger, action: wf.action, result },
      }),
    ])

    results.push({ id: wf.id, name: wf.name, result })
  }

  return NextResponse.json({ ok: true, ran: results.length, results })
}
