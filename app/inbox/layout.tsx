import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserProjects } from '@/app/actions/projects';
import { getUserChats } from '@/app/actions/chats';
import { getUserPlan, getProfile } from '@/app/actions/profile';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function InboxLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [projects, chats, userPlan, profile] = await Promise.all([
    getUserProjects(),
    getUserChats(),
    getUserPlan(),
    getProfile(),
  ]);

  return (
    <DashboardShell
      user={user}
      projects={projects}
      chats={chats}
      userPlan={userPlan}
      onboardingCompleted={profile?.onboarding_completed ?? false}
      initialView="inbox"
    >
      {children}
    </DashboardShell>
  );
}
