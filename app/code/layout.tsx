import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CodeSidebar } from './_components/CodeSidebar';
import { getUserCodeSessions } from '@/app/actions/code-sessions';

export default async function CodeLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const sessions = await getUserCodeSessions();
  const userName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    'Account';

  return (
    <div className="flex h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)]">
      <CodeSidebar sessions={sessions} userName={userName} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
