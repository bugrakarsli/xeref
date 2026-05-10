import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.CREEM_WEBHOOK_SECRET
  if (!secret) {
    console.error('[Creem] CREEM_WEBHOOK_SECRET is not defined in environment variables')
    return false
  }

  const computed = crypto
    .createHmac('sha256', secret)
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

async function resolveUserId(
  supabase: SupabaseClient,
  event: Record<string, unknown>
): Promise<string | null> {
  const obj = event.object as Record<string, unknown> | undefined
  const data = event.data as Record<string, unknown> | undefined

  // Try standard location first
  const metadata =
    (obj?.metadata as Record<string, string> | undefined) ??
    (data?.object as Record<string, unknown> | undefined)?.metadata as Record<string, string> | undefined ??
    (event.metadata as Record<string, string> | undefined)

  if (metadata?.userId) return metadata.userId as string

  // Fallback: look up by customer email
  const customer = (obj?.customer ?? data?.customer ?? event.customer) as Record<string, string> | undefined
  const email = customer?.email
  if (email) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()
    const profile = profileData as { id: string } | null
    if (profile?.id) {
      console.log('[Creem] Resolved userId via email fallback:', email)
      return profile.id
    }
  }

  console.error('[Creem] Could not resolve userId. Event object:', JSON.stringify(event, null, 2))
  return null
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('creem-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  const rawBody = await req.text()

  if (!verifySignature(rawBody, signature)) {
    console.error('[Creem] Signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody) as Record<string, unknown>
  console.log('[Creem] Event received:', event.eventType)

  // Service role client to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  switch (event.eventType) {
    case 'checkout.completed':
    case 'subscription.active':
    case 'subscription.paid': {
      const obj = (event.object ?? (event.data as Record<string, unknown>)?.object) as Record<string, unknown> | undefined
      const product = obj?.product as { name: string } | undefined
      const plan = product ? determinePlan(product) : null

      if (!plan) {
        console.error('[Creem] Could not determine plan from product:', product)
        break
      }

      const userId = await resolveUserId(supabase, event)
      if (userId) {
        const { error } = await supabase.from('profiles').update({ plan }).eq('id', userId)
        if (error) {
          console.error('[Creem] Failed to update profile plan:', error)
        } else {
          console.log(`[Creem] Updated user ${userId} to plan: ${plan}`)
        }
      }
      break
    }

    case 'subscription.canceled':
    case 'subscription.expired': {
      const userId = await resolveUserId(supabase, event)
      if (userId) {
        const { error } = await supabase.from('profiles').update({ plan: 'free' }).eq('id', userId)
        if (error) {
          console.error('[Creem] Failed to reset profile plan:', error)
        } else {
          console.log(`[Creem] Reset user ${userId} to plan: free`)
        }
      }
      break
    }

    default:
      console.log('[Creem] Unhandled event type:', event.eventType)
  }

  return NextResponse.json({ received: true })
}
