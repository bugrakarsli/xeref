import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { token } = body as { token?: string }

  if (!token || typeof token !== 'string' || !token.includes(':')) {
    return NextResponse.json({ error: 'Invalid bot token format' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Server misconfiguration: TELEGRAM_WEBHOOK_SECRET not set' }, { status: 500 })
  }

  // Verify token with Telegram and set webhook
  const webhookUrl = `${siteUrl}/api/bots/telegram/${user.id}`
  const hashedSecret = crypto
    .createHmac('sha256', webhookSecret)
    .update(token)
    .digest('hex')
    .slice(0, 64)

  const tgRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl, secret_token: hashedSecret }),
  })

  const tgJson = await tgRes.json()
  if (!tgJson.ok) {
    return NextResponse.json({ error: tgJson.description ?? 'Telegram rejected the token' }, { status: 400 })
  }

  // Store token in profile
  const { error } = await supabase
    .from('profiles')
    .update({ telegram_bot_token: token })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: 'Failed to save token' }, { status: 500 })

  return NextResponse.json({ ok: true, webhook: webhookUrl })
}
