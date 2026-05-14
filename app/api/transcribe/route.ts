import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOpenRouterForPlan } from '@/lib/ai/openrouter-config'
import { getUserPlan } from '@/app/actions/profile'
import { generateText } from 'ai'

export const runtime = 'nodejs'

const POLISH_SYSTEM =
  'You are a transcription cleaner. Fix grammar, punctuation, and capitalization in the user\'s text. ' +
  'Do NOT add, remove, or paraphrase content. Return only the cleaned text, no preface.'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as Blob | null
  const language = (form.get('language') as string | null) ?? 'auto'
  const doPolish = form.get('polish') !== 'false'

  if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 })

  // ── Groq Whisper transcription ────────────────────────────────────────────
  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 })

  const groqForm = new FormData()
  groqForm.append('file', file, 'audio.webm')
  groqForm.append('model', 'whisper-large-v3-turbo')
  groqForm.append('response_format', 'json')
  if (language !== 'auto') groqForm.append('language', language)

  const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${groqKey}` },
    body: groqForm,
  })

  if (!groqRes.ok) {
    const err = await groqRes.json().catch(() => ({ error: { message: groqRes.statusText } }))
    return NextResponse.json(
      { error: err?.error?.message ?? 'Transcription failed', code: err?.error?.code },
      { status: groqRes.status }
    )
  }

  const { text: raw } = await groqRes.json() as { text: string }

  if (!doPolish) {
    return NextResponse.json({ text: raw, raw, polished: false })
  }

  // ── Polish via OpenRouter (Claude Haiku — fast + cheap) ───────────────────
  try {
    const plan = await getUserPlan()
    const openrouter = createOpenRouterForPlan(plan)
    const model = plan === 'free' ? 'openrouter/free' : 'anthropic/claude-haiku-4-5'

    const { text: polished } = await generateText({
      model: openrouter(model),
      system: POLISH_SYSTEM,
      prompt: raw,
    })

    return NextResponse.json({ text: polished.trim(), raw, polished: true })
  } catch {
    // Polish failed — return raw rather than erroring
    return NextResponse.json({ text: raw, raw, polished: false })
  }
}
