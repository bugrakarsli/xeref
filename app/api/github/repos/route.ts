import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getConnectionWithSecrets } from '@/lib/connections/store'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    let conn
    try {
      conn = await getConnectionWithSecrets(user.id, 'github')
    } catch (err) {
      console.error('[github/repos] getConnectionWithSecrets failed — check CONNECTIONS_ENCRYPTION_KEY:', err instanceof Error ? err.message : err)
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    if (!conn?.access_token) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const url = 'https://api.github.com/user/repos?sort=updated&per_page=100&visibility=all&affiliation=owner,collaborator,organization_member'
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${conn.access_token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'xeref-app',
      },
    })

    if (!res.ok) {
      // 401 = token revoked, 403 = insufficient scope — both require reconnect
      if (res.status === 401 || res.status === 403) {
        console.error('[github/repos] GitHub returned', res.status, '— token may need reconnect')
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      }
      console.error('[github/repos] GitHub API error:', res.status)
      return NextResponse.json({ error: 'github_api_error' }, { status: res.status })
    }

    const repos = await res.json()
    return NextResponse.json(repos.map((r: { full_name: string }) => ({ full_name: r.full_name })))
  } catch (error) {
    console.error('[github/repos] unhandled error:', error)
    return NextResponse.json({ error: 'github_api_error' }, { status: 500 })
  }
}
