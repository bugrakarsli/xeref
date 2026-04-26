import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

// Short-lived signed state for OAuth round-trips.
// We sign { userId, nonce, returnTo } with HMAC-SHA256 using the same
// CONNECTIONS_ENCRYPTION_KEY material so we don't need a second secret.

const COOKIE = 'xeref_oauth_state'
const TTL_SECONDS = 10 * 60

interface StatePayload {
  userId: string
  nonce: string
  returnTo: string
  ts: number
}

function getSecret(): Buffer {
  const hex = process.env.CONNECTIONS_ENCRYPTION_KEY
  if (!hex) throw new Error('CONNECTIONS_ENCRYPTION_KEY required for OAuth state signing')
  return Buffer.from(hex, 'hex')
}

export function createState(userId: string, returnTo: string): { state: string; cookieValue: string } {
  const payload: StatePayload = {
    userId,
    nonce: randomBytes(16).toString('hex'),
    returnTo,
    ts: Math.floor(Date.now() / 1000),
  }
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const sig = createHmac('sha256', getSecret()).update(body).digest('base64url')
  const token = `${body}.${sig}`
  // Cookie carries the same token; we also pass it as ?state= to the provider.
  // On callback we compare the two — they must match.
  return { state: token, cookieValue: token }
}

export function verifyState(token: string, cookieValue: string | undefined): StatePayload | null {
  if (!token || !cookieValue) return null
  if (token.length !== cookieValue.length) return null
  if (!timingSafeEqual(Buffer.from(token), Buffer.from(cookieValue))) return null

  const [body, sig] = token.split('.')
  if (!body || !sig) return null

  const expected = createHmac('sha256', getSecret()).update(body).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  let payload: StatePayload
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    return null
  }

  if (Math.floor(Date.now() / 1000) - payload.ts > TTL_SECONDS) return null
  return payload
}

export const OAUTH_STATE_COOKIE = COOKIE
