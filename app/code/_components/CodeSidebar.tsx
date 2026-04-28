'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Zap,
  Box,
  Wrench,
  ChevronDown,
  ChevronRight,
  Pin,
  Settings,
  HelpCircle,
  Pencil,
  Trash2,
  Check,
  X,
  MoreVertical,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { renameCodeSession, deleteCodeSession } from '@/app/actions/code-sessions';
import { toast } from 'sonner';
import type { CodeSession } from '@/lib/types';

function StatusDot({ className }: { className?: string }) {
  return <span className={cn('inline-block w-1.5 h-1.5 rounded-full shrink-0', className)} />;
}

function UserAvatar({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name[0].toUpperCase();
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
      {initials}
    </div>
  );
}

interface SessionItemProps {
  session: CodeSession;
  active: boolean;
  onNavigate: () => void;
  onRenamed: (id: string, title: string) => void;
  onDeleted: (id: string) => void;
}

function SessionItem({ session, active, onNavigate, onRenamed, onDeleted }: SessionItemProps) {
  const [renaming, setRenaming] = useState(false);
  const [value, setValue] = useState(session.title ?? 'New session');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(session.title ?? 'New session');
  }, [session.title]);

  async function commitRename() {
    const trimmed = value.trim();
    const current = session.title ?? 'New session';
    if (!trimmed || trimmed === current) {
      setValue(current);
      setRenaming(false);
      return;
    }
    try {
      await renameCodeSession(session.id, trimmed);
      onRenamed(session.id, trimmed);
    } catch {
      toast.error('Failed to rename session');
      setValue(current);
    }
    setRenaming(false);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await deleteCodeSession(session.id);
      onDeleted(session.id);
    } catch {
      toast.error('Failed to delete session');
    }
  }

  if (renaming) {
    return (
      <div className="flex items-center gap-1 px-2 py-1">
        <StatusDot className="bg-blue-400 shrink-0" />
        <input
          ref={inputRef}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') {
              setValue(session.title ?? 'New session');
              setRenaming(false);
            }
          }}
          onBlur={commitRename}
          className="flex-1 min-w-0 bg-transparent text-sm text-white/80 outline-none border-b border-primary/60 pb-0.5"
        />
        <button onClick={commitRename} className="shrink-0 text-emerald-400 hover:text-emerald-300 p-1">
          <Check className="h-3 w-3" />
        </button>
        <button onClick={() => { setValue(session.title ?? 'New session'); setRenaming(false); }} className="shrink-0 text-white/40 hover:text-white/80 p-1">
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onNavigate}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(); } }}
      className={cn(
        'group flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm text-left cursor-pointer transition-colors',
        active ? 'bg-white/8' : 'hover:bg-white/5'
      )}
    >
      <StatusDot className="bg-blue-400 shrink-0" />
      <span className="truncate flex-1 text-white/80">{session.title ?? 'New session'}</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'h-5 w-5 flex items-center justify-center rounded shrink-0 transition-colors',
              'opacity-0 group-hover:opacity-100 focus:opacity-100',
              'text-white/40 hover:text-white/80 hover:bg-white/10'
            )}
            aria-label="Session options"
          >
            <MoreVertical className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="min-w-[140px]">
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setValue(session.title ?? 'New session');
              setRenaming(true);
            }}
          >
            <Pencil className="h-3 w-3" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function CodeSidebar({
  sessions: initialSessions = [],
  userName = 'Account',
}: {
  sessions?: CodeSession[];
  userName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [sessions, setSessions] = useState<CodeSession[]>(initialSessions);

  useEffect(() => {
    const supabase = createClient();
    let userId: string | null = null;
    supabase.auth.getUser().then(({ data }) => { userId = data.user?.id ?? null; });

    const channel = supabase
      .channel('code_sessions_sidebar')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'code_sessions' },
        (payload) => {
          const row = (payload.new ?? payload.old) as CodeSession;
          if (userId && row.user_id !== userId) return;
          if (payload.eventType === 'INSERT') {
            setSessions((prev) => [payload.new as CodeSession, ...prev].slice(0, 30));
          } else if (payload.eventType === 'UPDATE') {
            setSessions((prev) =>
              prev.map((s) => (s.id === payload.new.id ? { ...s, ...(payload.new as CodeSession) } : s))
            );
          } else if (payload.eventType === 'DELETE') {
            setSessions((prev) => prev.filter((s) => s.id !== (payload.old as CodeSession).id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const isRoutines = pathname?.startsWith('/code/routines');
  const isCustomize = pathname?.startsWith('/customize');

  const activeSessionId = (() => {
    const match = pathname?.match(/^\/code\/(?!routines)(session_\w+|\w{26,})$/);
    return match ? match[0].split('/').pop() : null;
  })();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="w-64 shrink-0 border-r border-white/10 flex flex-col h-full bg-[var(--color-bg)]">
      {/* Brand row */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-white/10">
        <span className="text-sm font-semibold leading-none">Claude Code</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-medium leading-none">
          Research preview
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-0.5 p-2">
        <button
          onClick={() => router.push('/code')}
          className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm hover:bg-white/5 text-left"
        >
          <Plus size={15} className="shrink-0" />
          New session
        </button>

        <Link
          href="/code/routines"
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
            isRoutines ? 'bg-white/8' : 'hover:bg-white/5'
          )}
        >
          <Zap size={15} className="shrink-0" />
          Routines
        </Link>

        <Link
          href="/dispatch"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5"
        >
          <Box size={15} className="shrink-0" />
          Dispatch
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-medium ml-auto">
            Beta
          </span>
        </Link>

        <Link
          href="/customize"
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
            isCustomize ? 'bg-white/8' : 'hover:bg-white/5'
          )}
        >
          <Wrench size={15} className="shrink-0" />
          Customize
        </Link>

        <button
          onClick={() => setMoreOpen((o) => !o)}
          className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm hover:bg-white/5 text-left"
        >
          {moreOpen ? <ChevronDown size={15} className="shrink-0" /> : <ChevronRight size={15} className="shrink-0" />}
          More
        </button>

        {moreOpen && (
          <div className="ml-3 flex flex-col gap-0.5">
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5"
            >
              <Settings size={14} className="shrink-0" />
              Settings
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5 text-white/50"
            >
              <HelpCircle size={14} className="shrink-0" />
              Help
            </Link>
          </div>
        )}
      </nav>

      {/* Pinned */}
      <div className="px-2 mt-1">
        <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
          Pinned
        </p>
        <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white/30 select-none">
          <Pin size={13} className="shrink-0" />
          Drag to pin
        </div>
      </div>

      {/* Recents */}
      <div className="px-2 mt-1 flex-1 overflow-y-auto min-h-0">
        <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
          Recents
        </p>
        {sessions.length === 0 && (
          <p className="px-3 py-2 text-xs text-white/30">No recent sessions</p>
        )}
        {sessions.map((s) => (
          <SessionItem
            key={s.id}
            session={s}
            active={activeSessionId === s.id}
            onNavigate={() => router.push(`/code/${s.id}`)}
            onRenamed={(id, title) =>
              setSessions((prev) => prev.map((x) => (x.id === id ? { ...x, title } : x)))
            }
            onDeleted={(id) => {
              setSessions((prev) => prev.filter((x) => x.id !== id));
              if (activeSessionId === id) router.push('/code');
            }}
          />
        ))}
      </div>

      {/* Account chip */}
      <div className="p-2 border-t border-white/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm hover:bg-white/5 cursor-pointer text-left">
              <UserAvatar name={userName} />
              <span className="flex-1 truncate text-white/80">{userName}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="min-w-[160px]">
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push('/settings')}>
              <Settings className="h-3.5 w-3.5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
