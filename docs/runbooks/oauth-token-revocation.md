# Runbook: OAuth Token Revocation

## When to run
- User reports a compromised account or lost device
- Provider sends an abuse/revocation webhook
- User explicitly disconnects a provider from the dashboard

## Steps

### 1. Revoke at the provider

**Google**
```bash
# Revoke the access token (also invalidates refresh token)
curl -X POST "https://oauth2.googleapis.com/revoke?token=<access_token>"
```

**Notion**
Notion doesn't support programmatic token revocation. Direct the user to:
`https://www.notion.so/my-integrations` → remove the Xeref integration.

**Slack**
```bash
curl -X POST https://slack.com/api/auth.revoke \
  -H "Authorization: Bearer <access_token>"
```

### 2. Delete from Xeref database

```sql
-- In Supabase SQL editor or via service role client
DELETE FROM user_connections
WHERE user_id = '<user_uuid>'
  AND provider = '<google|notion|slack>';
```

Or via the app's delete endpoint:
```bash
curl -X DELETE /api/connections/<provider> \
  -H "Authorization: Bearer <supabase_jwt>"
```

### 3. Verify

```sql
SELECT id, provider, status FROM user_connections WHERE user_id = '<user_uuid>';
```

Row should be gone. If deletion is soft-preferred, update `status = 'revoked'` instead.

## Key files
- `lib/connections/store.ts` — `deleteConnection(userId, provider)`
- `app/api/connections/route.ts` — DELETE handler
- `lib/connections/crypto.ts` — tokens are AES-256-GCM encrypted at rest; revocation removes the ciphertext
