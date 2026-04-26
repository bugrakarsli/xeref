import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { decryptToken, encryptToken } from './crypto'
import type { ProviderId, ProviderKind } from './registry'

let cached: SupabaseClient | null = null

function admin(): SupabaseClient {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for connection storage')
  }
  cached = createClient(url, key, { auth: { persistSession: false } })
  return cached
}

export interface ConnectionRow {
  id: string
  user_id: string
  provider: ProviderId
  kind: ProviderKind
  expires_at: string | null
  scopes: string[]
  metadata: Record<string, unknown>
  status: 'active' | 'revoked' | 'error'
  created_at: string
  updated_at: string
}

export interface ConnectionWithSecrets extends ConnectionRow {
  access_token: string | null
  refresh_token: string | null
}

export interface UpsertInput {
  userId: string
  provider: ProviderId
  kind: ProviderKind
  accessToken?: string | null
  refreshToken?: string | null
  expiresAt?: Date | null
  scopes?: string[]
  metadata?: Record<string, unknown>
  status?: 'active' | 'revoked' | 'error'
}

export async function upsertConnection(input: UpsertInput): Promise<ConnectionRow> {
  const row = {
    user_id: input.userId,
    provider: input.provider,
    kind: input.kind,
    access_token: input.accessToken ? encryptToken(input.accessToken) : null,
    refresh_token: input.refreshToken ? encryptToken(input.refreshToken) : null,
    expires_at: input.expiresAt?.toISOString() ?? null,
    scopes: input.scopes ?? [],
    metadata: input.metadata ?? {},
    status: input.status ?? 'active',
  }

  const { data, error } = await admin()
    .from('user_connections')
    .upsert(row, { onConflict: 'user_id,provider' })
    .select('id, user_id, provider, kind, expires_at, scopes, metadata, status, created_at, updated_at')
    .single()

  if (error) throw error
  return data as ConnectionRow
}

/** Fetch metadata only (no tokens). Safe to expose to the client via API. */
export async function listConnectionsForUser(userId: string): Promise<ConnectionRow[]> {
  const { data, error } = await admin()
    .from('user_connections')
    .select('id, user_id, provider, kind, expires_at, scopes, metadata, status, created_at, updated_at')
    .eq('user_id', userId)
    .eq('status', 'active')

  if (error) throw error
  return (data ?? []) as ConnectionRow[]
}

/** Fetch a single connection with decrypted tokens. Server-only — never return to client. */
export async function getConnectionWithSecrets(
  userId: string,
  provider: ProviderId
): Promise<ConnectionWithSecrets | null> {
  const { data, error } = await admin()
    .from('user_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .eq('status', 'active')
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    ...(data as ConnectionRow),
    access_token: data.access_token ? decryptToken(data.access_token) : null,
    refresh_token: data.refresh_token ? decryptToken(data.refresh_token) : null,
  }
}

export async function deleteConnection(userId: string, provider: ProviderId): Promise<void> {
  const { error } = await admin()
    .from('user_connections')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider)
  if (error) throw error
}
