// Compatibility shim for AgentPanel.tsx (legacy component).
// Routes all requests through /api/chat so API keys stay server-side.
// The old implementation called OpenRouter directly from the browser with
// NEXT_PUBLIC_OPENROUTER_API_KEY — that approach is no longer supported.

export interface OpenRouterChatSession {
  modelName: string
  systemInstruction: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}

export function createChatSession(
  modelName: string,
  systemInstruction: string,
  _enableSynthID?: boolean
): OpenRouterChatSession {
  return { modelName, systemInstruction, messages: [] }
}

export async function sendMessageToGemini(
  session: OpenRouterChatSession,
  contents: string | Array<{ type: string; text?: string; source?: unknown }>,
  onChunk: (text: string) => void,
  model?: string
): Promise<void> {
  // Extract text from multipart contents
  const userText =
    typeof contents === 'string'
      ? contents
      : contents
          .filter((c) => c.type === 'text')
          .map((c) => c.text ?? '')
          .join('')

  session.messages.push({ role: 'user', content: userText })

  // Build messages in AI SDK format
  const messages = session.messages.map((m) => ({
    role: m.role,
    content: [{ type: 'text', text: m.content }],
  }))

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      // Use the provided model or fallback to xeref-free
      model: model || 'xeref-free',
    }),
  })

  if (!res.ok || !res.body) {
    throw new Error(`Chat request failed: ${res.status}`)
  }

  // Parse Vercel AI SDK data stream: text chunks are lines prefixed with `0:`
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (line.startsWith('0:')) {
        try {
          const chunk = JSON.parse(line.slice(2)) as string
          fullText += chunk
          onChunk(chunk)
        } catch {
          // skip malformed chunk
        }
      }
    }
  }

  session.messages.push({ role: 'assistant', content: fullText })
}
