import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GITHUB_APP_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectUri = `${siteUrl}/api/auth/callback/github`;
  
  if (!clientId) {
    return NextResponse.json({ error: 'GITHUB_APP_CLIENT_ID not configured' }, { status: 500 });
  }

  // scope=repo allows us to list repositories the user has access to
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo`;
  
  return NextResponse.redirect(githubUrl);
}
