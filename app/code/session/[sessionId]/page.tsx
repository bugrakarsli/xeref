import { notFound, redirect } from 'next/navigation';
import { ChatInputWithGitHub } from '../../_components/ChatInputWithGitHub';
import { createClient } from '@/lib/supabase/server';
import { getUserPlan } from '@/app/actions/profile';
import { isSessionId } from '@/lib/ids';

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

  const supabase = await createClient();
  const { data: session } = await supabase
    .from('code_sessions').select('*').eq('id', id).maybeSingle();

  return (
    <div className="flex flex-col h-full">
      <header className="px-6 py-4 border-b border-black/10 dark:border-white/10">
        <h1 className="text-lg font-medium">{session?.title ?? 'New session'}</h1>
        <p className="text-xs opacity-60">{id}</p>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {/* existing chat transcript goes here */}
      </div>
      <div className="border-t border-black/10 dark:border-white/10 p-4">
        <ChatInputWithGitHub sessionId={id} />
      </div>
    </div>
  );
}
