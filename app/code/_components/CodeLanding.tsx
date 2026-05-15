'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronDown, Check, Settings2 } from 'lucide-react';
import { ChatInputWithGitHub } from './ChatInputWithGitHub';
import { SessionCard } from './SessionCard';
import type { CodeSession } from '@/lib/types';
import type { ModelId } from '@/components/dashboard/chat/chat-input';
import { MODELS } from '@/components/dashboard/chat/chat-input';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type EditMode = 'default' | 'accept-edits' | 'plan';
type Effort = 'low' | 'medium' | 'high';

const MODE_LABELS: Record<EditMode, string> = {
  'default': 'Default',
  'accept-edits': 'Accept edits',
  'plan': 'Plan',
};

const EFFORT_LABELS: Record<Effort, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

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
  const [editMode, setEditMode] = useLocalStorage<EditMode>('code:edit-mode', 'accept-edits');
  const [effort, setEffort] = useLocalStorage<Effort>('code:effort', 'medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedRepo || isLoading) return;
    setIsLoading(true);
    try {
      const createRes = await fetch('/api/sessions', { method: 'POST' });
      const { id } = await createRes.json();
      // Stash the first message for CodeSessionView to auto-send via useChat
      sessionStorage.setItem(`code:initial:${id}`, JSON.stringify({ content: input, repo: selectedRepo, model }));
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
        {/* Mode + effort footer */}
        <div className="flex items-center gap-3 max-w-3xl mx-auto w-full text-xs text-white/30">
          {/* Edit mode picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 hover:text-white/60 transition-colors focus:outline-none">
                <span>{MODE_LABELS[editMode]}</span>
                <ChevronDown size={11} className="opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-36">
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Edit mode</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.entries(MODE_LABELS) as [EditMode, string][]).map(([id, label]) => (
                <DropdownMenuItem key={id} onSelect={() => setEditMode(id)} className="flex items-center gap-2 text-xs">
                  <Check size={12} className={editMode === id ? 'opacity-100' : 'opacity-0'} />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Model + effort picker */}
          {(() => {
            const modelMenuContent = (
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Model</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {MODELS.map((m) => (
                  <DropdownMenuItem key={m.id} onSelect={() => setModel(m.id)} className="flex items-center gap-2 text-xs">
                    <Check size={12} className={model === m.id ? 'opacity-100' : 'opacity-0'} />
                    {m.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Reasoning effort</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.entries(EFFORT_LABELS) as [Effort, string][]).map(([id, label]) => (
                  <DropdownMenuItem key={id} onSelect={() => setEffort(id)} className="flex items-center gap-2 text-xs">
                    <Check size={12} className={effort === id ? 'opacity-100' : 'opacity-0'} />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            );
            return (
              <div className="ml-auto flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 hover:text-white/60 transition-colors focus:outline-none">
                      <span>{MODELS.find(m => m.id === model)?.label ?? 'Xeref'} · {EFFORT_LABELS[effort]}</span>
                      <ChevronDown size={11} className="opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  {modelMenuContent}
                </DropdownMenu>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <DropdownMenu>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button
                            aria-label="Model & reasoning settings"
                            className="flex items-center justify-center rounded-md p-1 text-white/30 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                          >
                            <Settings2 size={12} />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      {modelMenuContent}
                    </DropdownMenu>
                    <TooltipContent side="top">Model & reasoning settings</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
