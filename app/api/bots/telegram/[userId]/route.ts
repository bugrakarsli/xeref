import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { createOpenRouterForPlan, resolveModelId } from '@/lib/ai/openrouter-config'
import { generateText } from 'ai'
import { parseBody, TelegramUpdateSchema } from '@/lib/validation'

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
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('[Telegram] sendMessage failed:', err)
  }
}

async function sendTypingAction(botToken: string, chatId: number) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch user's bot token and plan
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('telegram_bot_token, plan')
    .eq('id', userId)
    .single()

  if (!profile?.telegram_bot_token) {
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  const botToken = profile.telegram_bot_token

  // Verify webhook secret
  const incomingSecret = req.headers.get('x-telegram-bot-api-secret-token')
  if (!incomingSecret) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const expectedSecret = crypto
    .createHmac('sha256', process.env.TELEGRAM_WEBHOOK_SECRET!)
    .update(botToken)
    .digest('hex')
    .slice(0, 64)
  try {
    const valid = crypto.timingSafeEqual(
      Buffer.from(incomingSecret),
      Buffer.from(expectedSecret)
    )
    if (!valid) return NextResponse.json({ ok: false }, { status: 401 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const rawUpdate = await req.json().catch(() => null)
  const { data: update } = parseBody(TelegramUpdateSchema, rawUpdate)
  const message = update?.message
  if (!message?.text) return NextResponse.json({ ok: true })

  const chatId = message.chat.id
  const userText = message.text

  // Acknowledge to Telegram immediately (prevents retries) then process async
  void (async () => {
    try {
      await sendTypingAction(botToken, chatId)

      const userPlan = (profile.plan ?? 'free') as 'free' | 'pro' | 'ultra'
      const openrouter = createOpenRouterForPlan(userPlan)
      const modelId = resolveModelId('xeref-free', userText)

      const { text } = await generateText({
        model: openrouter(modelId),
        messages: [{ role: 'user', content: userText }],
      })

      await sendTelegramMessage(botToken, chatId, text || 'Done.')
    } catch (err) {
      console.error('[Telegram] webhook handler error:', err)
      await sendTelegramMessage(botToken, chatId, 'Something went wrong. Please try again.')
    }
  })()

  return NextResponse.json({ ok: true })
}
