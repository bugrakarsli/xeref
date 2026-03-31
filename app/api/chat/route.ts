import { streamText, convertToModelMessages } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const MODEL_MAP: Record<string, string> = {
  'claude-haiku-4-5-20251001': 'anthropic/claude-haiku-4-5',
  'claude-sonnet-4-6': 'anthropic/claude-sonnet-4-6',
  'claude-opus-4-6': 'anthropic/claude-opus-4-6',
}
import { createClient } from '@/lib/supabase/server'

function getTextFromParts(parts?: Array<{ type: string; text?: string }>): string {
  if (!parts) return ''
  return parts.filter(p => p.type === 'text').map(p => p.text ?? '').join('')
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await req.json()
  const { messages, projectId, model } = body
  let modelId = typeof model === 'string' && model ? model : 'claude-haiku-4-5-20251001'

  const lastUserMsg = messages?.slice().reverse().find((m: { role: string }) => m.role === 'user')
  const lastUserMessage = getTextFromParts(lastUserMsg?.parts)?.toLowerCase() || ''

  if (modelId === 'opus-plan') {
    const isPlanMode = /plan|roadmap|decompose|break down|architecture|goals|agent/i.test(lastUserMessage)
    modelId = isPlanMode ? 'claude-opus-4-6' : 'claude-sonnet-4-6'
  } else if (modelId === 'best') {
    modelId = 'openrouter/auto'
  }

  const resolvedModelId = MODEL_MAP[modelId] || modelId
  // Fetch project's system prompt if a project is selected
  let systemPrompt: string | undefined
  if (projectId) {
    const { data: project } = await supabase
      .from('projects')
      .select('prompt')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (project?.prompt) {
      systemPrompt = project.prompt
    }
  }

  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: openrouter(resolvedModelId),
    system: systemPrompt,
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse({
    onError: (err) => {
      console.error('[Chat] stream error, model:', resolvedModelId, err)
      return err instanceof Error ? err.message : 'Model request failed'
    },
  })
}
