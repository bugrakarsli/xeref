'use client';
import { useState } from 'react';
import { NewRoutineModal } from './NewRoutineModal';
import { Plus } from 'lucide-react';

export function NewRoutineButton({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md border border-black/10 dark:border-white/10 px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
      >
        <Plus size={14} /> New routine
      </button>
      {open && <NewRoutineModal onClose={() => setOpen(false)} />}
    </>
  );
}
