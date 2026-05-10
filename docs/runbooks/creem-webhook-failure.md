# Runbook: Creem Webhook Failure

## When to run
- User paid but their plan wasn't upgraded
- Webhook endpoint returns non-2xx (visible in Creem dashboard)
- `profiles.plan` stuck on `basic` after purchase

## Webhook overview

Creem sends signed `POST` events to `/api/webhooks/creem`. The handler:
1. Verifies HMAC signature using `CREEM_WEBHOOK_SECRET`
2. Extracts `customerId` and `plan` from the event
3. Updates `profiles.plan` in Supabase

## Diagnosis

### Check Creem dashboard
1. Go to Creem dashboard → Webhooks → delivery logs
2. Find the failed event; note the event ID and payload
3. If Creem got a 4xx/5xx, it will retry up to N times

### Common failures

**Signature verification failed (400)**
- `CREEM_WEBHOOK_SECRET` mismatch between Creem config and Vercel env
- Fix: copy the secret from Creem dashboard → update `CREEM_WEBHOOK_SECRET` in Vercel → redeploy

**`customerId` not found in profiles (500)**
- The user signed up but `profiles` row doesn't have `creem_customer_id` set
- Fix: manually update the profile row, then replay the webhook

**`profiles` update failed (500)**
- RLS or schema issue — check Supabase logs

### Manual plan upgrade (emergency)
If webhook can't be replayed and the user needs access now:
```sql
UPDATE profiles
SET plan = 'pro'  -- or 'ultra'
WHERE id = '<user_uuid>';
```
Document this manual override — reconcile with Creem billing data afterwards.

### Replay a webhook
In Creem dashboard → Webhooks → find the event → "Resend". The endpoint must be live.

For local testing:
```bash
# Use Creem's test mode or replay via curl with the exact payload + signature header
```

## Key files
- `app/api/webhooks/creem/route.ts` — signature verification + profile update
- `app/actions/checkout.ts` — creates the checkout session (sets `customerId`)
- `lib/types.ts` — `Plan` type: `'basic' | 'pro' | 'ultra'`
