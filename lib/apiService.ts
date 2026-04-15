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

type InlineSource = { type: string; url: string }
type ContentItem = { type: string; text?: string; source?: InlineSource }
type Part = { type: string; [key: string]: unknown }

export async function sendMessageToGemini(
  session: OpenRouterChatSession,
  contents: string | ContentItem[],
  onChunk: (text: string) => void,
  model?: string
): Promise<void> {
  // Extract text for session history (images stored as placeholder)
  const userText =
    typeof contents === 'string'
      ? contents
      : contents.filter((c) => c.type === 'text').map((c) => c.text ?? '').join('') || '[image]'

  session.messages.push({ role: 'user', content: userText })

  // Build parts for the current message — include inline images
  const currentParts: Part[] =
    typeof contents === 'string'
      ? [{ type: 'text', text: contents }]
      : contents.flatMap<Part>((c) => {
          if (c.type === 'text' && c.text) return [{ type: 'text', text: c.text }]
          if (c.type === 'image_url' && c.source?.url) return [{ type: 'image', image: c.source.url }]
          return []
        })

  // History (all but current) as plain text UIMessages
  const historyMessages = session.messages.slice(0, -1).map((m, i) => ({
    id: String(i),
    role: m.role,
    parts: [{ type: 'text', text: m.content }],
  }))

  // Current message with full parts (text + any images)
  const messages = [
    ...historyMessages,
    {
      id: String(session.messages.length - 1),
      role: 'user' as const,
      parts: currentParts,
    },
  ]

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      model: model || 'xeref-free',
      // Request plain text stream — avoids parsing the AI SDK v6 protocol manually
      legacyMode: true,
    }),
  })

  if (!res.ok || !res.body) {
    const errorText = await res.text().catch(() => '')
    throw new Error(`Chat request failed: ${res.status}${errorText ? ` — ${errorText}` : ''}`)
  }

  // Plain text stream: each read() chunk is raw response text
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    if (chunk) {
      fullText += chunk
      onChunk(chunk)
    }
  }

  session.messages.push({ role: 'assistant', content: fullText })
}
