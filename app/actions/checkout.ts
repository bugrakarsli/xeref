'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const CREEM_API_BASE = 'https://api.creem.io/v1'

export async function createCheckout(plan: 'pro' | 'ultra', interval: 'monthly' | 'annual') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const apiKey = process.env.CREEM_API_KEY
  if (!apiKey) throw new Error('Payment is not configured yet. Please contact support.')

  const PRODUCT_IDS = {
    pro_monthly: process.env.NEXT_PUBLIC_CREEM_PRO_MONTHLY_ID,
    pro_annual: process.env.NEXT_PUBLIC_CREEM_PRO_ANNUAL_ID,
    ultra_monthly: process.env.NEXT_PUBLIC_CREEM_ULTRA_MONTHLY_ID,
    ultra_annual: process.env.NEXT_PUBLIC_CREEM_ULTRA_ANNUAL_ID,
  }

  const productKey = `${plan}_${interval}` as keyof typeof PRODUCT_IDS
  const productId = PRODUCT_IDS[productKey]
  if (!productId) throw new Error(`Product ID for ${plan} ${interval} is not configured.`)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const res = await fetch(`${CREEM_API_BASE}/checkouts`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: productId,
      success_url: `${siteUrl}/checkout/success`,
      metadata: {
        userId: user.id,
      },
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('[Creem] Checkout error:', data)
    throw new Error(data.message || data.error || 'Failed to create checkout session')
  }

  redirect(data.checkout_url)
}
