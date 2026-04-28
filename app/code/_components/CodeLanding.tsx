'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { ChatInputWithGitHub } from './ChatInputWithGitHub';
import { SessionCard } from './SessionCard';
import type { CodeSession } from '@/lib/types';
import type { ModelId } from '@/components/dashboard/chat/chat-input';

function getBadge(session: CodeSession, index: number) {
  // Heuristic until real status fields exist:
  // First session → "Needs input", rest → "Unread"
  if (index === 0) return 'Needs input' as const;
  return 'Unread' as const;
}

export function CodeLanding({
  firstName,
  sessions,
}: {
  firstName: string;
  sessions: CodeSession[];
}) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [model, setModel] = useState<ModelId>('xeref-free');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedRepo || isLoading) return;
    setIsLoading(true);
    try {
      const createRes = await fetch('/api/sessions', { method: 'POST' });
      const { id } = await createRes.json();
      await fetch(`/api/sessions/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input, model, repo: selectedRepo }),
      });
      router.push(`/code/${id}`);
    } catch {
      setIsLoading(false);
    }
  };

  const displayed = sessions.slice(0, 5);

  return (
    <div className="flex flex-col h-full">
      {/* Center content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl flex flex-col gap-8">
          {/* Welcome */}
          <div className="flex flex-col items-center gap-2 text-center">
            <Sparkles size={28} className="text-orange-400" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back, {firstName}
            </h1>
          </div>

          {/* Sessions */}
          {displayed.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-white/60 px-1">Sessions</p>
              <div className="flex flex-col gap-1.5">
                {displayed.map((s, i) => (
                  <SessionCard key={s.id} session={s} badge={getBadge(s, i)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-white/10 px-6 py-4 flex flex-col gap-2">
        {/* Default chip */}
        <div className="flex items-center gap-2 max-w-3xl mx-auto w-full">
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-white/8 hover:bg-white/12 text-white/70 transition-colors border border-white/10">
            <span className="text-white/50">☁</span> Default
          </button>
        </div>
        <ChatInputWithGitHub
          sessionId={undefined}
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          selectedRepo={selectedRepo}
          onRepoSelect={setSelectedRepo}
          selectedModel={model}
          onModelSelect={setModel}
        />
        {/* Accept edits footer */}
        <div className="flex items-center gap-3 max-w-3xl mx-auto w-full text-xs text-white/30 select-none">
          <span>Accept edits</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 rounded bg-white/8 text-white/40">⊞</kbd>
            <kbd className="px-1 rounded bg-white/8 text-white/40">+</kbd>
            <kbd className="px-1 rounded bg-white/8 text-white/40">🎤</kbd>
            <span className="text-white/20">▾</span>
          </span>
          <span className="ml-auto">Sonnet 4.6 · Medium</span>
        </div>
      </div>
    </div>
  );
}
