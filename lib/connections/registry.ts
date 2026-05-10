export type ProviderId = 'github' | 'google' | 'notion' | 'slack' | 'supabase' | 'webhook' | 'vercel'
export type ProviderKind = 'oauth' | 'pat' | 'webhook'

export interface ProviderDef {
  id: ProviderId
  name: string
  kind: ProviderKind
  scopes: string[]
  /** Env var names that must be set for this provider to be usable. */
  requiredEnv: string[]
  /** UI sub-cards that share this single connection row (e.g. google → gmail + gcal). */
  uiCards: { id: string; name: string; description: string }[]
}

export const PROVIDERS: Record<ProviderId, ProviderDef> = {
  github: {
    id: 'github',
    name: 'GitHub',
    kind: 'oauth',
    scopes: ['repo', 'read:user'],
    requiredEnv: ['GITHUB_APP_CLIENT_ID', 'GITHUB_APP_CLIENT_SECRET'],
    uiCards: [
      { id: 'github', name: 'GitHub', description: 'Access repos, issues, and pull requests.' },
    ],
  },
  google: {
    id: 'google',
    name: 'Google',
    kind: 'oauth',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/calendar.events',
      'openid',
      'email',
      'profile',
    ],
    requiredEnv: ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET'],
    uiCards: [
      { id: 'gmail', name: 'Gmail', description: 'Read and send emails on your behalf.' },
      { id: 'gcal',  name: 'Google Calendar', description: 'View and create calendar events.' },
    ],
  },
  notion: {
    id: 'notion',
    name: 'Notion',
    kind: 'oauth',
    scopes: [],
    requiredEnv: ['NOTION_OAUTH_CLIENT_ID', 'NOTION_OAUTH_CLIENT_SECRET'],
    uiCards: [
      { id: 'notion', name: 'Notion', description: 'Read and write Notion pages and databases.' },
    ],
  },
  slack: {
    id: 'slack',
    name: 'Slack',
    kind: 'oauth',
    scopes: ['chat:write', 'channels:read', 'groups:read', 'im:read', 'mpim:read'],
    requiredEnv: ['SLACK_OAUTH_CLIENT_ID', 'SLACK_OAUTH_CLIENT_SECRET'],
    uiCards: [
      { id: 'slack', name: 'Slack', description: 'Send messages and read channels.' },
    ],
  },
  supabase: {
    id: 'supabase',
    name: 'Supabase',
    kind: 'pat',
    scopes: [],
    requiredEnv: [],
    uiCards: [
      { id: 'supabase', name: 'Supabase', description: 'Query your Supabase project tables.' },
    ],
  },
  webhook: {
    id: 'webhook',
    name: 'Custom Webhook',
    kind: 'webhook',
    scopes: [],
    requiredEnv: [],
    uiCards: [
      { id: 'webhook', name: 'Custom Webhook', description: 'Call any HTTP endpoint from your agents.' },
    ],
  },
  vercel: {
    id: 'vercel',
    name: 'Vercel',
    kind: 'oauth',
    scopes: [],
    requiredEnv: ['VERCEL_CLIENT_ID', 'VERCEL_CLIENT_SECRET'],
    uiCards: [
      { id: 'vercel', name: 'Vercel', description: 'Manage deployments and project settings.' },
    ],
  },
}

export function isProviderConfigured(id: ProviderId): boolean {
  return PROVIDERS[id].requiredEnv.every((v) => !!process.env[v])
}

/** Map a UI sub-card id (gmail, gcal, github, etc.) to the provider that owns it. */
export function providerForCard(cardId: string): ProviderId | null {
  for (const p of Object.values(PROVIDERS)) {
    if (p.uiCards.some((c) => c.id === cardId)) return p.id
  }
  return null
}
