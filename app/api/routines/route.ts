import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { newTriggerId } from '@/lib/ids';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('routines').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json();
  const id = newTriggerId();
  const { error } = await supabase.from('routines').insert({
    id, user_id: user.id,
    name: body.name,
    prompt: body.prompt ?? '',
    model: body.model ?? 'haiku-4.5',
    repo_full_name: body.repo_full_name ?? null,
    connectors: body.connectors ?? [],
    schedule_cron: body.schedule_cron ?? null,
    timezone: body.timezone ?? 'Europe/Istanbul',
    active: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id });
}
