import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

function verifySignature(rawBody: string, signature: string): boolean {
  const computed = crypto
    .createHmac('sha256', process.env.CREEM_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(computed, 'hex'),
    Buffer.from(signature, 'hex')
  )
}

function determinePlan(product: { name: string }): 'pro' | 'ultra' | null {
  const name = product.name.toLowerCase()
  if (name.includes('ultra')) return 'ultra'
  if (name.includes('pro')) return 'pro'
  return null
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('creem-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  const rawBody = await req.text()

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  // Service role client to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  switch (event.eventType) {
    case 'checkout.completed':
    case 'subscription.active':
    case 'subscription.paid': {
      const userId = event.object.metadata?.userId
      const plan = determinePlan(event.object.product)
      if (userId && plan) {
        await supabase.from('profiles').update({ plan }).eq('id', userId)
      }
      break
    }

    case 'subscription.canceled':
    case 'subscription.expired': {
      const userId = event.object.metadata?.userId
      if (userId) {
        await supabase.from('profiles').update({ plan: 'free' }).eq('id', userId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
