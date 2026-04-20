'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, Plus } from 'lucide-react';

export function CodeSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isRoutines = pathname?.startsWith('/code/routines');

  const newSession = async () => {
    const r = await fetch('/api/sessions', { method: 'POST' });
    const { id } = await r.json();
    router.push(`/code/${id}`);
  };

  return (
    <aside className="w-64 shrink-0 border-r border-black/10 dark:border-white/10 p-3 flex flex-col gap-1">
      <button
        onClick={newSession}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 text-left"
      >
        <Plus size={16} /> New session
      </button>
      <Link
        href="/code/routines"
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
          isRoutines ? 'bg-black/5 dark:bg-white/5' : 'hover:bg-black/5 dark:hover:bg-white/5'
        }`}
      >
        <Zap size={16} /> Routines
      </Link>
    </aside>
  );
}
