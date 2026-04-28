import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserCodeSessions } from '@/app/actions/code-sessions';
import { getUserPlan } from '@/app/actions/profile';
import { CodeLanding } from './_components/CodeLanding';

export const dynamic = 'force-dynamic';

export default async function CodeIndexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const plan = await getUserPlan();
  if (plan !== 'ultra') redirect('/pricing?upgrade=code');

  const sessions = await getUserCodeSessions();
  const firstName =
    (user.user_metadata?.full_name as string | undefined)?.split(' ')[0] ??
    (user.user_metadata?.name as string | undefined)?.split(' ')[0] ??
    user.email?.split('@')[0] ??
    'there';

  return <CodeLanding firstName={firstName} sessions={sessions} />;
}
