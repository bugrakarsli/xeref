import { streamText, convertToModelMessages } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await req.json()
  const { messages, projectId, model } = body
  const modelId = typeof model === 'string' && model ? model : 'claude-sonnet-4-6'

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
    model: anthropic(modelId),
    system: systemPrompt,
    messages: modelMessages,
  })

  return result.toTextStreamResponse()
}
