---
name: connection-provider-author
description: Adds a new OAuth, PAT, or webhook provider to the xeref Connections system (lib/connections/registry.ts + OAuth route pair). Use when wiring a new third-party integration like Linear, Airtable, or Figma.
tools: Read, Write, Edit, Glob, Grep
model: sonnet
---

## Read first

- **`CLAUDE.md`** — Connections section (encryption, CSRF state, server-only decryption rule).
- **`lib/connections/registry.ts`** — `PROVIDERS` map, `ProviderDef` interface, `ProviderId` union type.
- **`lib/connections/crypto.ts`** — AES-256-GCM token encryption (reuse, never reimplement).
- **`lib/connections/oauth-state.ts`** — HMAC-SHA256 CSRF state (reuse, never reimplement).
- A sibling provider as a mirror. Use `slack` or `notion` for OAuth; they are the cleanest examples.
  - Login: `app/api/connections/slack/login/route.ts`
  - Callback: `app/api/connections/slack/callback/route.ts`

## 5 Steps to Add an OAuth Provider

### 1. Extend `lib/connections/registry.ts`

Add to the `ProviderId` union:
```ts
export type ProviderId = 'github' | 'google' | 'notion' | 'slack' | 'vercel' | '<new-id>'
```

Add to the `PROVIDERS` map:
```ts
'<new-id>': {
  id: '<new-id>',
  name: 'Human Name',
  kind: 'oauth',                          // or 'pat' | 'webhook'
  scopes: ['scope1', 'scope2'],
  requiredEnv: ['NEWPROVIDER_CLIENT_ID', 'NEWPROVIDER_CLIENT_SECRET'],
  uiCards: [
    { id: '<new-id>', name: 'Human Name', description: 'One sentence on what this enables.' },
  ],
},
```

`requiredEnv` values gate `isProviderConfigured()` — if the env var is missing, the provider shows as unconfigured in `/customize/connectors`.

### 2. Create `app/api/connections/<new-id>/login/route.ts`

Copy from a sibling (`slack/login/route.ts`). Swap:
- The OAuth authorization URL (provider-specific)
- The scope string
- The state parameter generation (reuse `generateOAuthState()` from `lib/connections/oauth-state.ts`)

### 3. Create `app/api/connections/<new-id>/callback/route.ts`

Copy from a sibling (`slack/callback/route.ts`). Swap:
- The token-exchange endpoint and request body
- The access-token field name in the response JSON
- The state verification (reuse `verifyOAuthState()` from `lib/connections/oauth-state.ts`)
- Store the encrypted token via `storeConnection()` using `lib/connections/crypto.ts`

### 4. Add env vars to `README.md`

In the "Environment Variables" section, add:
```
NEWPROVIDER_CLIENT_ID=
NEWPROVIDER_CLIENT_SECRET=
```

### 5. No changes needed to the generic delete route

`app/api/connections/[provider]/route.ts` handles `DELETE` generically — it reads the provider ID from the URL and delegates to `deleteConnection()`. No new file needed.

## Invariants (never violate)

- Tokens stored encrypted via `lib/connections/crypto.ts` AES-256-GCM. Never store plaintext tokens in `user_connections`.
- CSRF state: always use `generateOAuthState()` / `verifyOAuthState()` from `lib/connections/oauth-state.ts`. Never roll your own state string.
- `listConnectionsForUser()` never returns raw tokens — only `getConnectionWithSecrets()` decrypts. Decryption is server-only.
- All route handlers are server-only (`export const runtime = 'nodejs'` or default — never `'edge'` for crypto operations).

## PAT / Webhook Providers

For `kind: 'pat'` (e.g., Supabase, Linear PAT):
- No login/callback routes needed.
- The UI collects the token directly and calls the `POST /api/connections` route with the plaintext token.
- `storeConnection()` encrypts before writing to `user_connections`.

For `kind: 'webhook'`:
- No OAuth flow. UI just stores a URL + optional secret.

## Verification

1. Set `NEWPROVIDER_CLIENT_ID` and `NEWPROVIDER_CLIENT_SECRET` in `.env.local`.
2. `npm run dev` → go to `/customize/connectors`.
3. The new provider tile should appear (enabled, not greyed out).
4. Click the tile → browser redirects to the provider's auth page.
5. After approval → callback fires → tile shows connected state.

## Constraints

- Never use `any` types or `as` casts.
- Never log decrypted tokens.
- Never expose raw tokens to the client — `listConnectionsForUser()` is the only safe list call from client components.
