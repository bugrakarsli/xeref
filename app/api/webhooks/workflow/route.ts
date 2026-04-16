import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Webhook receiver for workflow triggers.
 * POST /api/webhooks/workflow?secret=<webhook_secret>
 */
export async function POST(request: Request) {
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret')

  if (!secret) {
    return NextResponse.json({ error: 'Missing secret query param' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  // Use any-typed client to bypass generated schema types in server-only routes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient(supabaseUrl, serviceKey) as any

  const { data: workflow, error: wfError } = await sb
    .from('workflows')
    .select('*')
    .eq('webhook_secret', secret)
    .single()

  if (wfError || !workflow) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  }

  if (!workflow.enabled) {
    return NextResponse.json({ error: 'Workflow is disabled' }, { status: 403 })
  }

  let payload: Record<string, unknown> = {}
  try { payload = await request.json() } catch { /* empty body ok */ }

  const runAt = new Date().toISOString()
  let result = `Action "${workflow.action}" acknowledged`

  if (workflow.action === 'create_task') {
    const title = typeof payload.title === 'string' ? payload.title : `Task from webhook: ${workflow.name}`
    const { error } = await sb.from('tasks').insert({ user_id: workflow.user_id, title, priority: 'medium', status: 'todo' })
    result = error ? `Failed to create task: ${error.message}` : `Task created: "${title}"`
  } else if (workflow.action === 'save_memory') {
    const content = typeof payload.content === 'string' ? payload.content : JSON.stringify(payload)
    const { error } = await sb.from('memories').insert({ user_id: workflow.user_id, content, source: 'manual', tags: ['workflow'] })
    result = error ? `Failed to save memory: ${error.message}` : 'Memory saved'
  }

  await Promise.all([
    sb.from('workflows').update({ last_run_at: runAt, last_run_result: result }).eq('id', workflow.id),
    sb.from('usage_events').insert({
      user_id: workflow.user_id,
      event_type: 'workflow_run',
      metadata: { workflow_id: workflow.id, trigger: 'webhook', action: workflow.action, result, payload },
    }),
  ])

  return NextResponse.json({ ok: true, workflow_id: workflow.id, action: workflow.action, result })
}
