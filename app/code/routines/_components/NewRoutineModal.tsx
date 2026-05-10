'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Github, Clock, Webhook, Braces } from 'lucide-react';

const DEFAULT_CONNECTORS = ['Gmail', 'Google Calendar', 'Google Drive', 'Slack'];

export function NewRoutineModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [repo, setRepo] = useState('');
  const [trigger, setTrigger] = useState<'schedule' | 'github' | 'api'>('schedule');
  const [connectors, setConnectors] = useState<string[]>(DEFAULT_CONNECTORS);
  const [busy, setBusy] = useState(false);

  const toggle = (c: string) =>
    setConnectors(cs => cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c]);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    const res = await fetch('/api/routines', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name, prompt, repo_full_name: repo || null,
        connectors,
        schedule_cron: trigger === 'schedule' ? '0 9 * * 1-5' : null,
      }),
    });
    const { id } = await res.json();
    router.push(`/code/routines/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-10" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-xl bg-[var(--color-surface)] border border-black/10 dark:border-white/10 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold">New routine</h2>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <label className="block mt-6 text-sm">Name *
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g., Daily code review"
            className="mt-1 w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm" />
        </label>

        <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
          placeholder="Describe what Xeref should do in each session"
          rows={6}
          className="mt-4 w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent p-3 text-sm" />

        <div className="mt-3 flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              const v = window.prompt('owner/repo (e.g., bugrakarsli/xeref)', repo);
              if (v) setRepo(v);
            }}
            className="flex items-center gap-1.5 rounded-md border border-black/10 dark:border-white/10 px-2.5 py-1.5 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <Github size={12} /> {repo || 'Select a repository'}
          </button>
        </div>

        <h3 className="mt-6 text-sm font-medium">Select a trigger</h3>
        <div className="mt-2 grid gap-2">
          <TriggerRow icon={<Clock size={16} />} label="Schedule" desc="Run on a recurring cron schedule"
            active={trigger === 'schedule'} onClick={() => setTrigger('schedule')} />
          <TriggerRow icon={<Webhook size={16} />} label="GitHub event" desc="Run when a GitHub webhook event fires"
            active={trigger === 'github'} onClick={() => setTrigger('github')} disabled={!repo} rightHint={!repo ? 'Select a repository first' : ''} />
          <TriggerRow icon={<Braces size={16} />} label="API" desc="Trigger from your own code by sending a POST request"
            active={trigger === 'api'} onClick={() => setTrigger('api')} />
        </div>

        <h3 className="mt-6 text-sm font-medium">Connectors</h3>
        <p className="text-xs opacity-70 mt-1">All connected integrations are included by default. Remove any you don&apos;t need for this task.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEFAULT_CONNECTORS.map(c => (
            <button key={c} onClick={() => toggle(c)}
              className={`text-xs rounded-md px-2.5 py-1 border ${connectors.includes(c) ? 'border-black/20 dark:border-white/30' : 'opacity-50 border-black/10 dark:border-white/10'}`}>
              {c} {connectors.includes(c) ? '×' : '+'}
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5">Cancel</button>
          <button disabled={!name.trim() || busy} onClick={create}
            className="rounded-md bg-white text-black px-4 py-2 text-sm disabled:opacity-50">Create</button>
        </div>
      </div>
    </div>
  );
}

function TriggerRow({ icon, label, desc, active, onClick, disabled, rightHint }: {
  icon: React.ReactNode; label: string; desc: string; active: boolean;
  onClick: () => void; disabled?: boolean; rightHint?: string;
}) {
  return (
    <button disabled={disabled} onClick={onClick}
      className={`flex items-center justify-between text-left rounded-md border p-3 ${
        active ? 'border-black/30 dark:border-white/40 bg-black/5 dark:bg-white/5' : 'border-black/10 dark:border-white/10'
      } ${disabled ? 'opacity-40' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-sm">{label}</div>
          <div className="text-xs opacity-70">{desc}</div>
        </div>
      </div>
      {rightHint && <span className="text-xs opacity-60">{rightHint}</span>}
    </button>
  );
}
