import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProjects } from '@/app/actions/projects'
import { getUserChats } from '@/app/actions/chats'
import { getUserPlan, getProfile } from '@/app/actions/profile'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import type { ViewKey } from '@/lib/types'

export const metadata: Metadata = {
  title: 'xeref.ai',
}

const VALID_VIEWS = new Set<ViewKey>([
  'home', 'tasks', 'stats', 'calendar', 'workflows', 'inbox', 'chat',
  'settings', 'referral', 'agents', 'code', 'customize', 'code_session',
  'code_routines', 'projects', 'deploy', 'memory', 'classroom', 'plans',
])

interface HomePageProps {
  searchParams: Promise<{ code?: string; view?: string }>
}

export default async function Home({ searchParams }: HomePageProps) {
  const { code, view } = await searchParams

  if (code) {
    redirect(`/auth/callback?code=${code}`)
  }

  const initialView: ViewKey = (view && VALID_VIEWS.has(view as ViewKey)) ? (view as ViewKey) : 'home'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [projects, chats, userPlan, profile] = await Promise.all([
    getUserProjects(),
    getUserChats(),
    getUserPlan(),
    getProfile(),
  ])

  return (
    <DashboardShell
      user={user}
      projects={projects}
      chats={chats}
      userPlan={userPlan}
      onboardingCompleted={profile?.onboarding_completed ?? false}
      avatarUrl={profile?.avatar_url ?? null}
      initialView={initialView}
    />
  )
}
