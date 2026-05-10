import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserPlan } from '@/app/actions/profile';
import { isSessionId } from '@/lib/ids';
import { CodeSessionView } from '@/components/dashboard/code-session-view';

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId: raw } = await params;
  // Accept "session_<ULID>" (via rewrite) and "<ULID>" (direct)
  const id = raw.startsWith('session_') ? raw : `session_${raw}`;
  if (!isSessionId(id)) notFound();

  const plan = await getUserPlan();
  if (plan !== 'ultra') redirect('/pricing?upgrade=code');

  // Verify session belongs to authed user
  const supabase = await createClient();
  const { data: session } = await supabase
    .from('code_sessions').select('id').eq('id', id).maybeSingle();
  if (!session) notFound();

  return <CodeSessionView sessionId={id} />;
}
