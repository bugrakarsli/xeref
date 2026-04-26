import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getConnectionWithSecrets } from '@/lib/connections/store'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const conn = await getConnectionWithSecrets(user.id, 'github')
  if (!conn?.access_token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const url = 'https://api.github.com/user/repos?sort=updated&per_page=100&visibility=all&affiliation=owner,collaborator,organization_member'
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${conn.access_token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'xeref-app',
      },
    })

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: res.status })
    }

    const repos = await res.json()
    return NextResponse.json(repos.map((r: { full_name: string }) => ({ full_name: r.full_name })))
  } catch (error) {
    console.error('GitHub Repos Error:', error)
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 })
  }
}
