'use client';
import { useEffect, useRef, useState } from 'react';
import { Github, Check } from 'lucide-react';

type Repo = { full_name: string };

export function GitHubRepoButton({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch('/api/github/repos')
      .then(r => r.json())
      .then(data => {
        if (data.error === 'unauthorized') {
          setError('unauthorized');
          setRepos([]);
        } else if (data.error) {
          setError(data.error);
          setRepos([]);
        } else {
          setError(null);
          setRepos(data);
        }
      })
      .catch(() => {
        setError('Failed to fetch repositories');
        setRepos([]);
      });
  }, [open]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pick = async (full_name: string) => {
    setSelected(full_name);
    setOpen(false);
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ repo_full_name: full_name }),
    });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 rounded-md border border-black/10 dark:border-white/10 px-2.5 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5"
        aria-label="Select a GitHub repository"
      >
        <Github size={14} />
        <span className="max-w-[160px] truncate">{selected ?? 'Select a repository'}</span>
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 left-0 z-50 w-72 max-h-72 overflow-y-auto rounded-md border border-black/10 dark:border-white/10 bg-[var(--color-surface)] shadow-lg">
          {error === 'unauthorized' ? (
            <div className="p-4 flex flex-col gap-2 items-center text-center">
              <p className="text-xs opacity-70">Connect your GitHub account to select a repository.</p>
              <a 
                href="/api/github/login"
                className="w-full py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                Connect to GitHub
              </a>
            </div>
          ) : repos.length === 0 ? (
            <div className="p-3 text-xs opacity-60">{error || 'No repositories found.'}</div>
          ) : (
            repos.map(r => (
              <button
                key={r.full_name}
                onClick={() => pick(r.full_name)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/5 text-left"
              >
                <span className="truncate">{r.full_name}</span>
                {selected === r.full_name && <Check size={12} />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
