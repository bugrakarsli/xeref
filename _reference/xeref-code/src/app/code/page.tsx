import { redirect } from 'next/navigation';
import { newSessionId } from '@/lib/ids';
import { getSupabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function CodeIndexPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const id = newSessionId();
  if (user) {
    await supabase.from('code_sessions').insert({ id, user_id: user.id });
  }
  // Public URL: /code/session_<ULID> (next.config rewrite → /code/session/<ULID>)
  redirect(`/code/${id}`);
}
