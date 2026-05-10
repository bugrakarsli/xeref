import OpenAI from 'openai'
import { env } from './env.js'
import { getSupabase } from './supabase.js'

// TODO: For plan-gated model routing, call the xeref web app's /api/chat
// endpoint instead of OpenAI directly (reuses lib/ai/openrouter-config.ts logic).
const MODEL = 'gpt-4o-mini'

const SYSTEM_PROMPT = `You are the xeref AI assistant, helping users manage their tasks, projects, and productivity.
Be concise and helpful. When referencing tasks or projects, be specific about their titles.`

let _openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
  return _openai
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function getChatHistory(chatId: string): Promise<Message[]> {
  const sb = getSupabase()
  const { data } = await sb
    .from('messages')
    .select('role, content')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
    .limit(20)

  return (data ?? []) as Message[]
}

export async function ensureChat(userId: string, telegramChatId: number): Promise<string> {
  const sb = getSupabase()
  const title = `Telegram #${telegramChatId}`

  const { data: existing } = await sb
    .from('chats')
    .select('id')
    .eq('user_id', userId)
    .eq('title', title)
    .single()

  if (existing) return existing.id as string

  const { data } = await sb
    .from('chats')
    .insert({ user_id: userId, title, project_id: null })
    .select('id')
    .single()

  return (data as { id: string }).id
}

export async function saveMessage(chatId: string, role: 'user' | 'assistant', content: string): Promise<void> {
  const sb = getSupabase()
  await sb.from('messages').insert({ chat_id: chatId, role, content, citations: [] })
  await sb.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId)
}

export async function resetChat(chatId: string): Promise<void> {
  const sb = getSupabase()
  await sb.from('messages').delete().eq('chat_id', chatId)
}

export async function reply(userId: string, telegramChatId: number, userMessage: string): Promise<string> {
  const chatId = await ensureChat(userId, telegramChatId)
  const history = await getChatHistory(chatId)

  await saveMessage(chatId, 'user', userMessage)

  const completion = await getOpenAI().chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: userMessage },
    ],
  })

  const response = completion.choices[0]?.message.content ?? 'Sorry, I could not generate a response.'
  await saveMessage(chatId, 'assistant', response)
  return response
}
