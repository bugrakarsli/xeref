'use client'

import { useRef, forwardRef, useImperativeHandle, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { ArrowUp, ChevronDown, Bot, BrainCircuit, Cpu, Lock, Plus, Paperclip, Globe, X, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Project, ChatAttachment } from '@/lib/types'
import { SYSTEM_AGENTS, type SystemAgent } from '@/lib/system-agents'

export type ModelId = 'xeref-free' | 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6' | 'claude-opus-4-6' | 'opus-plan' | 'best'
export type UserPlan = 'free' | 'pro' | 'ultra'
export type AgentSelection =
  | { type: 'system'; agent: SystemAgent }
  | { type: 'project'; project: Project }
  | null

const PLAN_RANK: Record<UserPlan, number> = { free: 0, pro: 1, ultra: 2 }

export const MODELS: { id: ModelId; label: string; description: string; plan: UserPlan; planLabel: string }[] = [
  { id: 'xeref-free',                label: 'Xeref',          description: 'Fast and free for everyday use',                       plan: 'free',  planLabel: 'BASIC' },
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5',     description: 'Fastest for quick answers',                            plan: 'pro',   planLabel: 'PRO'   },
  { id: 'claude-sonnet-4-6',         label: 'Sonnet 4.6',    description: 'Best balance of speed and intelligence',               plan: 'pro',   planLabel: 'PRO'   },
  { id: 'best',                      label: 'Best (Auto)',    description: 'Dynamically routes your query to the best model',     plan: 'ultra', planLabel: 'ULTRA' },
  { id: 'claude-opus-4-6',           label: 'Opus 4.6',      description: 'Most capable for complex work',                       plan: 'ultra', planLabel: 'ULTRA' },
  { id: 'opus-plan',                 label: 'Opus Plan Mode', description: 'Uses Opus 4.6 for planning, Sonnet 4.6 otherwise',   plan: 'ultra', planLabel: 'ULTRA' },
]

function canUse(userPlan: UserPlan, modelPlan: UserPlan) {
  return PLAN_RANK[userPlan] >= PLAN_RANK[modelPlan]
}

function AgentIcon({ iconName, className }: { iconName: string; className?: string }) {
  if (iconName === 'BrainCircuit') return <BrainCircuit className={className} />
  return <Bot className={className} />
}

interface ChatInputProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  projects: Project[]
  selectedAgent: AgentSelection
  onAgentSelect: (agent: AgentSelection) => void
  selectedModel: ModelId
  onModelSelect: (model: ModelId) => void
  userPlan: UserPlan
  attachments: ChatAttachment[]
  onFileSelect: (files: FileList) => void
  onRemoveAttachment: (index: number) => void
  webSearchEnabled: boolean
  onWebSearchToggle: () => void
  tall?: boolean
  noBorder?: boolean
  leadingToolbar?: React.ReactNode
  hideAgentSelector?: boolean
}

export interface ChatInputHandle {
  focus: () => void
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  projects,
  selectedAgent,
  onAgentSelect,
  tall = false,
  selectedModel,
  onModelSelect,
  userPlan,
  attachments,
  onFileSelect,
  onRemoveAttachment,
  webSearchEnabled,
  onWebSearchToggle,
  noBorder = false,
  leadingToolbar,
  hideAgentSelector = false,
}: ChatInputProps, ref) {
  const currentModel = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0]
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus()
      const len = textareaRef.current?.value.length ?? 0
      textareaRef.current?.setSelectionRange(len, len)
    },
  }))

  const activatedProjects = projects.filter((p) => p.prompt)

  const selectedLabel =
    selectedAgent?.type === 'system'
      ? selectedAgent.agent.name
      : selectedAgent?.type === 'project'
      ? selectedAgent.project.name
      : 'Select agent'

  const selectedIconName =
    selectedAgent?.type === 'system'
      ? selectedAgent.agent.icon
      : 'Bot'

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

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files)
      // Reset so the same file can be re-selected
      e.target.value = ''
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items
    if (!items) return
    const dt = new DataTransfer()
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) dt.items.add(file)
      }
    }
    if (dt.files.length > 0) {
      e.preventDefault()
      onFileSelect(dt.files)
    }
  }

  const placeholderText =
    selectedAgent?.type === 'system'
      ? `Ask ${selectedAgent.agent.name} anything…`
      : selectedAgent?.type === 'project'
      ? `Ask ${selectedAgent.project.name} anything…`
      : 'Type a message…'

  const hasExtras = attachments.length > 0 || webSearchEnabled

  return (
    <form onSubmit={onSubmit} className={cn(
      "w-full px-4 py-3 bg-background/80 backdrop-blur-sm",
      !noBorder && "border-t"
    )}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="chat-file-input"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div className="w-full max-w-2xl mx-auto">
        <div className="relative flex flex-col rounded-2xl border bg-card focus-within:border-primary/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              onInputChange(e.target.value)
              handleInput()
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholderText}
            rows={tall ? 4 : 1}
            className={cn(
              'w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm outline-none',
              'placeholder:text-muted-foreground',
              tall ? 'min-h-[100px] max-h-[200px]' : 'min-h-[44px] max-h-[200px]'
            )}
          />

          {/* Attachment previews + active indicators */}
          {hasExtras && (
            <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2">
              {attachments.map((att, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 text-xs max-w-[160px]"
                >
                  {att.contentType.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={att.url}
                      alt={att.name}
                      className="h-4 w-4 rounded object-cover shrink-0"
                    />
                  ) : (
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate text-muted-foreground">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(i)}
                    className="ml-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`Remove ${att.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {webSearchEnabled && (
                <div className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-xs text-primary">
                  <Globe className="h-3 w-3 shrink-0" />
                  <span>Web search on</span>
                  <button
                    type="button"
                    onClick={onWebSearchToggle}
                    className="ml-0.5 shrink-0 hover:text-foreground transition-colors"
                    aria-label="Turn off web search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between px-3 pb-2.5 gap-2">
            {/* Left: Plus button + Agent selector */}
            <div className="flex items-center gap-1">
              {leadingToolbar}
              
              {/* Plus button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
                    aria-label="Add attachment or enable web search"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  <DropdownMenuItem asChild>
                    <label
                      htmlFor="chat-file-input"
                      className="cursor-pointer gap-2 flex items-center w-full"
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span>Files & Photos</span>
                    </label>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onWebSearchToggle}
                    className="cursor-pointer gap-2"
                  >
                    <Globe className={cn('h-4 w-4', webSearchEnabled ? 'text-primary' : 'text-muted-foreground')} />
                    <span>Web Search</span>
                    {webSearchEnabled && (
                      <span className="ml-auto text-[10px] font-semibold text-primary">ON</span>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Agent selector */}
              {!hideAgentSelector && <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2"
                  >
                    <AgentIcon iconName={selectedIconName} className="h-3.5 w-3.5" />
                    <span className="max-w-[120px] truncate">{selectedLabel}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-60">
                  {/* System agents */}
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2 py-1">
                    System Agents
                  </DropdownMenuLabel>
                  {SYSTEM_AGENTS.map((agent) => (
                    <DropdownMenuItem
                      key={agent.id}
                      onClick={() => onAgentSelect({ type: 'system', agent })}
                      className={cn(
                        'cursor-pointer gap-2 flex-col items-start py-2',
                        selectedAgent?.type === 'system' && selectedAgent.agent.id === agent.id && 'bg-accent'
                      )}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <AgentIcon iconName={agent.icon} className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="font-medium truncate">{agent.name}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground pl-5 leading-snug">{agent.description}</span>
                    </DropdownMenuItem>
                  ))}

                  {/* User project agents */}
                  {activatedProjects.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2 py-1">
                        My Projects
                      </DropdownMenuLabel>
                      {activatedProjects.map((p) => (
                        <DropdownMenuItem
                          key={p.id}
                          onClick={() => onAgentSelect({ type: 'project', project: p })}
                          className={cn(
                            'cursor-pointer gap-2',
                            selectedAgent?.type === 'project' && selectedAgent.project.id === p.id && 'bg-accent'
                          )}
                        >
                          <Bot className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{p.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}

                  {activatedProjects.length === 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-2 text-xs text-muted-foreground">
                        No custom agents yet. Add Prompt to your saved projects to activate them.
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>}
            </div>

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
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
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
})
