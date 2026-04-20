import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { newSessionId } from '@/lib/ids';

export async function POST() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = newSessionId();
  const { error } = await supabase.from('code_sessions').insert({ id, user_id: user.id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id });
}
