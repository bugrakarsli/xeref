import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOpenRouterForPlan } from '@/lib/ai/openrouter-config'
import { generateText } from 'ai'
import type { Plan, PlanContent } from '@/lib/types'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data as Plan[])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { goal } = await req.json()
  if (!goal || typeof goal !== 'string' || goal.trim().length < 5) {
    return NextResponse.json({ error: 'goal is required' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const userPlan = (profile?.plan ?? 'free') as 'free' | 'pro' | 'ultra'
  const modelKey = userPlan === 'free' ? 'openrouter/free' : 'anthropic/claude-sonnet-4-6'
  const openrouter = createOpenRouterForPlan(userPlan)

  const systemPrompt = `You are a strategic execution planner. Given a business goal, generate a detailed phased execution plan as valid JSON.

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "title": "string — short plan title",
  "phases": [
    {
      "id": "phase_1",
      "title": "Phase Name",
      "subtitle": "Weeks N-N",
      "tasks": [
        {
          "id": "t_1_1",
          "title": "Task title",
          "skill": "Skill name",
          "description": "What this task involves",
          "role": "Who does it",
          "timeline": "Week N",
          "deliverables": "What is produced"
        }
      ]
    }
  ],
  "kpis": [
    {
      "category": "Category name",
      "metrics": ["metric 1", "metric 2"]
    }
  ]
}

Generate 3-4 phases with 3-6 tasks each. Be specific to the goal provided.`

  let content: PlanContent
  let title: string

  try {
    const { text } = await generateText({
      model: openrouter(modelKey),
      system: systemPrompt,
      prompt: `Goal: ${goal.trim()}`,
    })

    // Strip markdown code fences if the model wraps its output
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')
    const raw = JSON.parse(cleaned) as { title: string } & PlanContent
    title = raw.title ?? 'Execution Plan'
    content = { phases: raw.phases ?? [], kpis: raw.kpis ?? [] }
  } catch (err) {
    console.error('[plans POST] generation failed:', err)
    return NextResponse.json({ error: 'Failed to generate plan. Try again.' }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('plans')
    .insert({ user_id: user.id, title, goal: goal.trim(), content })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data as Plan, { status: 201 })
}
