import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  await supabase.from('routine_runs').insert({
    routine_id: id, user_id: user.id, kind: 'manual', status: 'queued',
  });
  return NextResponse.redirect(new URL(`/code/routines/${id}`, process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'));
}
