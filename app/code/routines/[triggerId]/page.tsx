import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Play, Pencil, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { isTriggerId } from '@/lib/ids';

export default async function RoutineDetailPage({
  params,
}: {
  params: Promise<{ triggerId: string }>;
}) {
  const { triggerId } = await params;
  if (!isTriggerId(triggerId)) notFound();

  const supabase = await createClient();
  const { data: routine } = await supabase
    .from('routines').select('*').eq('id', triggerId).maybeSingle();
  if (!routine) notFound();

  const { data: runs = [] } = await supabase
    .from('routine_runs').select('*').eq('routine_id', triggerId)
    .order('started_at', { ascending: false }).limit(20);

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto">
      <Link href="/code/routines" className="text-xs opacity-70 hover:underline">‹ All routines</Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{routine.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${routine.active ? 'bg-green-500/15 text-green-500' : 'bg-black/10'}`}>
              ● {routine.active ? 'Active' : 'Paused'}
            </span>
            <span className="opacity-70">Next run: {nextRunLabel(routine.schedule_cron)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="Edit" className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5"><Pencil size={16} /></button>
          <button aria-label="Delete" className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5"><Trash2 size={16} /></button>
          <form action={`/api/routines/${routine.id}/run-now`} method="post">
            <button className="flex items-center gap-1.5 rounded-md bg-white text-black px-3 py-1.5 text-sm"><Play size={14} /> Run now</button>
          </form>
        </div>
      </div>

      <hr className="my-6 border-black/10 dark:border-white/10" />

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-6 text-sm">
          <Section title="Repositories">
            {routine.repo_full_name
              ? <span className="rounded bg-black/5 dark:bg-white/10 px-2 py-1 text-xs">{routine.repo_full_name}</span>
              : <span className="opacity-60 text-xs">—</span>}
          </Section>
          <Section title="Repeats">
            <p className="text-xs">{scheduleLabel(routine.schedule_cron, routine.timezone)}</p>
          </Section>
          <Section title="Connectors">
            <div className="flex flex-wrap gap-1.5">
              {(routine.connectors as string[] ?? []).map(c => (
                <span key={c} className="text-xs rounded border border-black/10 dark:border-white/10 px-2 py-0.5">{c}</span>
              ))}
            </div>
          </Section>
        </aside>

        <div>
          <h2 className="text-sm font-medium">Instructions</h2>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-black/10 dark:border-white/10 p-4 text-xs leading-5 max-h-72 overflow-auto">{routine.prompt}</pre>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-sm font-medium">Runs</h2>
            <div className="flex gap-1 text-xs">
              {['All', 'Scheduled', 'API', 'Webhook', 'Manual'].map(k => (
                <button key={k} className={`px-2 py-1 rounded ${k === 'All' ? 'bg-black/5 dark:bg-white/10' : 'opacity-70'}`}>{k}</button>
              ))}
            </div>
          </div>
          <ul className="mt-3 divide-y divide-black/10 dark:divide-white/10">
            {runs?.map((r: { id: string; started_at: string; kind: string }) => (
              <li key={r.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="h-4 w-4 rounded-full border border-green-500/60 grid place-items-center text-green-500">✓</span>
                <span>{new Date(r.started_at).toLocaleString()}</span>
                <span className="text-xs uppercase opacity-60 ml-2">{r.kind}</span>
              </li>
            ))}
            {(!runs || runs.length === 0) && <li className="py-4 text-sm opacity-60">No runs yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div><h3 className="text-xs uppercase tracking-wide opacity-60 mb-2">{title}</h3>{children}</div>);
}
function scheduleLabel(cron: string | null, tz: string) {
  if (!cron) return 'Manual only';
  if (cron === '0 9 * * 1-5') return `Runs weekdays at 9:00 AM ${tz === 'Europe/Istanbul' ? 'GMT+3' : tz}`;
  return `Cron: ${cron} (${tz})`;
}
function nextRunLabel(cron: string | null) {
  if (!cron) return '—';
  const next = new Date(); next.setDate(next.getDate() + 1); next.setHours(9, 0, 0, 0);
  return `Tomorrow at ${next.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}
