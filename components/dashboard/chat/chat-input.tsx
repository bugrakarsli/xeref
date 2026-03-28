'use client'

import { useRef, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ArrowUp, ChevronDown, Bot, Cpu, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/types'

export type ModelId = 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6' | 'claude-opus-4-6'
export type UserPlan = 'free' | 'pro' | 'ultra'

const PLAN_RANK: Record<UserPlan, number> = { free: 0, pro: 1, ultra: 2 }

export const MODELS: { id: ModelId; label: string; description: string; plan: UserPlan; planLabel: string }[] = [
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5',  description: 'Fastest for quick answers',                plan: 'free',  planLabel: 'FREE'  },
  { id: 'claude-sonnet-4-6',         label: 'Sonnet 4.6', description: 'Best balance of speed and intelligence',   plan: 'pro',   planLabel: 'PRO'   },
  { id: 'claude-opus-4-6',           label: 'Opus 4.6',   description: 'Most capable for complex work',            plan: 'ultra', planLabel: 'ULTRA' },
]

function canUse(userPlan: UserPlan, modelPlan: UserPlan) {
  return PLAN_RANK[userPlan] >= PLAN_RANK[modelPlan]
}

interface ChatInputProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  projects: Project[]
  selectedProject: Project | null
  onProjectSelect: (project: Project | null) => void
  selectedModel: ModelId
  onModelSelect: (model: ModelId) => void
  userPlan: UserPlan
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  projects,
  selectedProject,
  onProjectSelect,
  selectedModel,
  onModelSelect,
  userPlan,
}: ChatInputProps) {
  const currentModel = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0]
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        const form = textareaRef.current?.closest('form')
        form?.requestSubmit()
      }
    }
  }

  function handleInput() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  function handleModelClick(m: typeof MODELS[number]) {
    if (!canUse(userPlan, m.plan)) {
      toast.error(`Upgrade to ${m.planLabel} to use ${m.label}`, {
        action: { label: 'Upgrade', onClick: () => window.location.href = '/pricing' },
      })
      return
    }
    onModelSelect(m.id)
  }

  return (
    <form onSubmit={onSubmit} className="px-4 py-3 border-t bg-background/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex flex-col rounded-2xl border bg-card focus-within:border-primary/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              onInputChange(e.target.value)
              handleInput()
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedProject
                ? `Ask ${selectedProject.name} anything…`
                : 'Type a message…'
            }
            rows={1}
            className={cn(
              'w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm outline-none',
              'placeholder:text-muted-foreground',
              'min-h-[44px] max-h-[200px]'
            )}
          />
          <div className="flex items-center justify-between px-3 pb-2.5 gap-2">
            {/* Agent selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2"
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span className="max-w-[120px] truncate">
                    {selectedProject ? selectedProject.name : 'Select agent'}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {projects.filter((p) => p.prompt).length === 0 ? (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    No activated agents yet. Add Prompt to your agents first.
                  </div>
                ) : (
                  projects
                    .filter((p) => p.prompt)
                    .map((p) => (
                      <DropdownMenuItem
                        key={p.id}
                        onClick={() => onProjectSelect(p)}
                        className={cn(
                          'cursor-pointer gap-2',
                          selectedProject?.id === p.id && 'bg-accent'
                        )}
                      >
                        <Bot className="h-3.5 w-3.5 text-primary" />
                        <span className="truncate">{p.name}</span>
                      </DropdownMenuItem>
                    ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Model selector + send */}
            <div className="flex items-center gap-2 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 hidden sm:flex"
                  >
                    <Cpu className="h-3.5 w-3.5" />
                    <span>{currentModel.label}</span>
                    <span className="text-[10px] font-semibold text-primary/70">· {currentModel.planLabel}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {MODELS.map((m, i) => {
                    const locked = !canUse(userPlan, m.plan)
                    return (
                      <div key={m.id}>
                        {i > 0 && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                          onClick={() => handleModelClick(m)}
                          className={cn(
                            'cursor-pointer flex-col items-start gap-0.5 py-2.5',
                            selectedModel === m.id && 'bg-accent',
                            locked && 'opacity-60'
                          )}
                        >
                          <div className="flex items-center gap-1.5 w-full">
                            {locked && <Lock className="h-3 w-3 shrink-0" />}
                            <span className="font-medium text-sm">{m.label}</span>
                            <span className={cn(
                              'ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded',
                              m.plan === 'ultra' ? 'bg-amber-500/20 text-amber-400' :
                              m.plan === 'pro'   ? 'bg-primary/20 text-primary' :
                                                   'bg-muted text-muted-foreground'
                            )}>
                              {m.planLabel}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{m.description}</span>
                        </DropdownMenuItem>
                      </div>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                type="submit"
                size="icon"
                className="h-7 w-7 rounded-full bg-primary hover:bg-primary/90"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </form>
  )
}
