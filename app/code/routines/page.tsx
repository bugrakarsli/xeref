import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { NewRoutineButton } from './_components/NewRoutineButton';

export const dynamic = 'force-dynamic';

export default async function RoutinesPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: routines = [] } = await supabase
    .from('routines').select('*').order('created_at', { ascending: false });

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">⚡ Routines</h1>
          <p className="mt-2 text-sm opacity-70">
            Create templated routines that can be kicked off on schedule, by API, or webhook.
          </p>
          <p className="mt-3 text-xs opacity-60">{routines?.length ?? 0} / 5 included daily runs used.</p>
        </div>
        <NewRoutineButton defaultOpen={sp.new === '1'} />
      </div>

      <div className="mt-6 flex gap-2 text-sm">
        <button className="px-3 py-1.5 rounded-md bg-black/5 dark:bg-white/10">All routines</button>
        <button className="px-3 py-1.5 rounded-md opacity-70">Calendar</button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(routines ?? []).map(r => (
          <Link
            key={r.id}
            href={`/code/routines/${r.id}`}
            className="rounded-xl border border-black/10 dark:border-white/10 p-4 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{r.name}</h3>
              {r.repo_full_name && (
                <span className="text-xs rounded bg-black/5 dark:bg-white/10 px-2 py-0.5">
                  {r.repo_full_name.split('/').pop()}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs opacity-70">{r.schedule_cron ?? 'No schedule'}</p>
          </Link>
        ))}
        {(!routines || routines.length === 0) && (
          <p className="text-sm opacity-60">No routines yet.</p>
        )}
      </div>
    </div>
  );
}
