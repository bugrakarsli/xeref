'use client';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CodeSession } from '@/lib/types';

function age(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

type Badge = 'Needs input' | 'Unread' | null;

export function SessionCard({ session, badge }: { session: CodeSession; badge: Badge }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/code/${session.id}`)}
      className="group flex items-center gap-3 w-full rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 px-4 py-3 text-left transition-colors"
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full shrink-0',
          badge === 'Needs input' ? 'bg-orange-400' : 'bg-blue-400'
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {badge && (
            <span
              className={cn(
                'text-[10px] font-medium px-1.5 py-0.5 rounded',
                badge === 'Needs input'
                  ? 'bg-orange-400/15 text-orange-400'
                  : 'bg-blue-400/15 text-blue-400'
              )}
            >
              {badge}
            </span>
          )}
          <span className="text-sm font-medium truncate text-white/90">
            {session.title ?? 'New session'}
          </span>
        </div>
        {session.repo_full_name && (
          <p className="text-xs text-white/40 truncate">
            {session.repo_full_name.split('/')[1] ?? session.repo_full_name}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 text-white/40 text-xs">
        <span>{age(session.updated_at)}</span>
        <ChevronRight size={14} className="group-hover:text-white/60 transition-colors" />
      </div>
    </button>
  );
}
