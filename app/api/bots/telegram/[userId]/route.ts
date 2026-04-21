import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TelegramMessage {
  message_id: number
  chat: { id: number }
  text?: string
  from?: { first_name?: string; username?: string }
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
}

async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  // Fetch user's bot token and profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('telegram_bot_token, preferred_model')
    .eq('id', userId)
    .single()

  if (!profile?.telegram_bot_token) {
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  const botToken = profile.telegram_bot_token
  const update = await req.json().catch(() => null) as TelegramUpdate | null
  const message = update?.message
  if (!message?.text) return NextResponse.json({ ok: true })

  const chatId = message.chat.id
  const userText = message.text

  // Route through the chat API (reuse existing inference endpoint)
  try {
    const chatRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass user identity via a service header the chat route can trust
        'x-xeref-user-id': userId,
        'x-xeref-source': 'telegram',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: userText }],
        model: 'xeref-free',
      }),
    })

    if (!chatRes.ok) throw new Error(`Chat API ${chatRes.status}`)

    // Chat API returns a streaming response — collect it
    const reader = chatRes.body?.getReader()
    const decoder = new TextDecoder()
    let reply = ''
    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        // Vercel AI SDK data stream: lines starting with "0:" contain text deltas
        for (const line of chunk.split('\n')) {
          if (line.startsWith('0:')) {
            try {
              reply += JSON.parse(line.slice(2))
            } catch { /* skip malformed */ }
          }
        }
      }
    }

    await sendTelegramMessage(botToken, chatId, reply || 'Done.')
  } catch {
    await sendTelegramMessage(botToken, chatId, 'Something went wrong. Please try again.')
  }

  return NextResponse.json({ ok: true })
}
