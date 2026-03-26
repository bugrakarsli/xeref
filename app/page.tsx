import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProjects } from '@/app/actions/projects'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export const metadata: Metadata = {
  title: 'xeref.ai',
}

interface HomePageProps {
  searchParams: Promise<{ code?: string }>
}

export default async function Home({ searchParams }: HomePageProps) {
  const { code } = await searchParams

  // If OAuth/magic-link lands here with a code, forward to the dedicated callback handler
  if (code) {
    redirect(`/auth/callback?code=${code}`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const projects = await getUserProjects()

  return <DashboardShell user={user} projects={projects} />
}
