import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('gh_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    // visibility=all + affiliation=owner,collaborator,organization_member covers almost everything the user can see
    const url = 'https://api.github.com/user/repos?sort=updated&per_page=100&visibility=all&affiliation=owner,collaborator,organization_member';
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'xeref-app',
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: res.status });
    }

    const repos = await res.json();
    
    // Return only the full_name as expected by the frontend
    return NextResponse.json(repos.map((r: any) => ({ full_name: r.full_name })));
  } catch (error) {
    console.error('GitHub Repos Error:', error);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
}
