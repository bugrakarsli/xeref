'use client'

import { useTransition, useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import type { Project, Chat, Message, ProjectGoal } from '@/lib/types'
import type { UserPlan } from '@/app/actions/profile'
import { deleteProject, updateProjectPrompt, getProjectGoals, toggleProjectGoal } from '@/app/actions/projects'
import { createChat, getChatMessages, updateChatTitle, removeChatFromProject } from '@/app/actions/chats'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Calendar, Layers, CheckCircle2, Zap, Bot, Pencil, MessageSquare, FolderMinus, Target, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatInterface } from './chat/chat-interface'
import { ChatList } from './chat/chat-list'
import { TasksView } from './tasks-view'
import type { AgentSelection } from './chat/chat-input'
import { SYSTEM_AGENTS } from '@/lib/system-agents'

type HomeTab = 'home' | 'chat' | 'tasks'

interface HomeViewProps {
  user: User
  projects: Project[]
  chats: Chat[]
  userName: string
  userPlan: UserPlan
  onProjectDeleted: (id: string) => void
  onProjectUpdated: (project: Project) => void
  onChatProjectRemoved?: (chatId: string) => void
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function ProjectGoalsList({ projectId }: { projectId: string }) {
  const [goals, setGoals] = useState<ProjectGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [, startTransition] = useTransition()

  useEffect(() => {
    getProjectGoals(projectId).then((g) => {
      setGoals(g)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [projectId])

  function handleToggle(goal: ProjectGoal) {
    const next = !goal.completed
    setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, completed: next } : g))
    startTransition(async () => {
      try {
        await toggleProjectGoal(goal.id, next)
      } catch {
        setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, completed: goal.completed } : g))
      }
    })
  }

  if (loading || goals.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5 border-t pt-3 mt-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
        <Target className="h-3 w-3" />
        <span className="font-medium">Sub-goals</span>
        <span className="ml-auto text-muted-foreground/60">
          {goals.filter((g) => g.completed).length}/{goals.length}
        </span>
      </div>
      {goals.map((goal) => (
        <button
          key={goal.id}
          onClick={() => handleToggle(goal)}
          className="flex items-start gap-2 text-left group/goal"
        >
          <span className={cn(
            'mt-0.5 h-3.5 w-3.5 shrink-0 rounded-sm border flex items-center justify-center transition-colors',
            goal.completed
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-muted-foreground/40 group-hover/goal:border-primary/60'
          )}>
            {goal.completed && <Check className="h-2.5 w-2.5" />}
          </span>
          <span className={cn(
            'text-xs leading-snug transition-colors',
            goal.completed
              ? 'line-through text-muted-foreground/50'
              : 'text-muted-foreground group-hover/goal:text-foreground'
          )}>
            {goal.title}
          </span>
        </button>
      ))}
    </div>
  )
}

function ProjectCard({
  project,
  chats,
  onDelete,
  onPromptAdded,
  onChatRemoved,
}: {
  project: Project
  chats: Chat[]
  onDelete: (id: string) => void
  onPromptAdded: (id: string, prompt: string) => void
  onChatRemoved: (chatId: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [promptText, setPromptText] = useState(project.prompt ?? '')
  const hasPrompt = !!project.prompt

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteProject(project.id)
        onDelete(project.id)
      } catch {
        toast.error('Failed to delete project. Please try again.')
      }
    })
  }

  function handleSavePrompt() {
    const trimmed = promptText.trim()
    if (!trimmed) return
    startTransition(async () => {
      try {
        await updateProjectPrompt(project.id, trimmed)
        onPromptAdded(project.id, trimmed)
        setEditing(false)
        toast.success('Prompt saved.')
      } catch {
        toast.error('Failed to save prompt. Please try again.')
      }
    })
  }

  return (
    <div
      className="group flex flex-col gap-3 rounded-xl border bg-card p-5 hover:border-primary/40 transition-colors"
      role="article"
      aria-label={project.name}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">{project.name}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 opacity-40 md:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
          aria-label={`Delete project: ${project.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {project.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
      )}

      <ProjectGoalsList projectId={project.id} />

      <div className="flex items-center gap-3 mt-auto pt-1">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Layers className="h-3 w-3" />
          <span>{project.selected_feature_ids.length} features</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(project.updated_at)}</span>
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Enter a system prompt for this agent…"
            rows={4}
            autoFocus
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={handleSavePrompt}
              disabled={!promptText.trim() || isPending}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => {
                setPromptText(project.prompt ?? '')
                setEditing(false)
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : hasPrompt ? (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center justify-center gap-1.5 w-full h-8 text-xs rounded-md border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Prompt Added
          <Pencil className="h-3 w-3 ml-1 opacity-60" />
        </button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={() => {
            setPromptText('')
            setEditing(true)
          }}
        >
          <Zap className="h-3 w-3 mr-1" />
          Add Prompt
        </Button>
      )}

      {/* Chats linked to this project */}
      <div className="border-t pt-3 mt-1">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-3 text-center">
            <MessageSquare className="h-4 w-4 text-muted-foreground/40" />
            <p className="text-[11px] text-muted-foreground/60 leading-snug">
              Start a chat to keep conversations organized and re-use project knowledge.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent/40 transition-colors"
              >
                <MessageSquare className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-xs truncate text-muted-foreground">{chat.title}</span>
                <button
                  onClick={() => {
                    startTransition(async () => {
                      try {
                        await removeChatFromProject(chat.id)
                        onChatRemoved(chat.id)
                      } catch {
                        toast.error('Failed to remove chat from project')
                      }
                    })
                  }}
                  disabled={isPending}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  aria-label="Remove from project"
                >
                  <FolderMinus className="h-3 w-3" />
                  Remove from project
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function HomeView({ user, projects, chats: initialChats, userName, userPlan, onProjectDeleted, onProjectUpdated, onChatProjectRemoved }: HomeViewProps) {
  const raw = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'there'
  const displayName = raw.charAt(0).toUpperCase() + raw.slice(1)

  const [activeTab, setActiveTab] = useState<HomeTab>('home')
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [selectedAgent, setSelectedAgent] = useState<AgentSelection>({
    type: 'system',
    agent: SYSTEM_AGENTS[0],
  })
  const [showingList, setShowingList] = useState(false)
  const [greeting, setGreeting] = useState('')
  useEffect(() => { setGreeting(getGreeting()) }, [])

  async function handleNewChat() {
    if (activeChat && chatMessages.length > 0) {
      const firstUserMsg = chatMessages.find((m) => m.role === 'user')
      if (firstUserMsg && activeChat.title === 'New Chat') {
        const title = (firstUserMsg.content.match(/^.+?[.?!\n]/)?.[0] ?? firstUserMsg.content).slice(0, 80).trim()
        try {
          await updateChatTitle(activeChat.id, title)
          setChats((prev) => prev.map((c) => (c.id === activeChat.id ? { ...c, title } : c)))
        } catch {
          // non-critical
        }
      }
    }
    try {
      const projectId = selectedAgent?.type === 'project' ? selectedAgent.project.id : null
      const newChat = await createChat(projectId, 'New Chat')
      setChats((prev) => [newChat, ...prev])
      setActiveChat(newChat)
      setChatMessages([])
      setShowingList(false)
    } catch {
      toast.error('Failed to create new chat.')
    }
  }

  async function handleSelectChat(chat: Chat) {
    setActiveChat(chat)
    setShowingList(false)
    try {
      const messages = await getChatMessages(chat.id)
      setChatMessages(messages)
    } catch {
      toast.error('Failed to load chat messages.')
      setChatMessages([])
    }
  }

  function handleDeleteChat(chatId: string) {
    setChats((prev) => prev.filter((c) => c.id !== chatId))
    if (activeChat?.id === chatId) {
      setActiveChat(null)
      setChatMessages([])
    }
  }

  function handlePromptAdded(id: string, prompt: string) {
    const project = projects.find((p) => p.id === id)
    if (project) {
      onProjectUpdated({ ...project, prompt })
    }
  }

  function handleChatCreated(chat: Chat) {
    setChats((prev) => [chat, ...prev.filter((c) => c.id !== chat.id)])
    setActiveChat(chat)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 p-6 md:p-8 max-w-5xl w-full mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting && <>{greeting}, </>}
          <span className="text-primary">{displayName}</span>.
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          You have {projects.length} saved agent{projects.length !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* Tab content */}
      {activeTab === 'home' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">
              Saved Projects
            </h2>
            <Badge variant="secondary">{projects.length}</Badge>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No saved agents yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Head to the builder, select features, and save your first agent configuration.
              </p>
              <Button size="sm" variant="outline" className="mt-1" onClick={() => window.location.href = '/builder'}>
                Go to Builder
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  chats={chats.filter((c) => c.project_id === project.id)}
                  onDelete={onProjectDeleted}
                  onPromptAdded={handlePromptAdded}
                  onChatRemoved={(chatId) => {
                    setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, project_id: null } : c))
                    onChatProjectRemoved?.(chatId)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 min-h-0 -mx-6 md:-mx-8 -mb-6 md:-mb-8">
          {showingList ? (
            <ChatList
              chats={chats}
              activeChatId={activeChat?.id ?? null}
              onSelectChat={handleSelectChat}
              onDeleteChat={handleDeleteChat}
              onNewChat={handleNewChat}
            />
          ) : (
            <ChatInterface
              projects={projects}
              selectedAgent={selectedAgent}
              onAgentSelect={setSelectedAgent}
              activeChat={activeChat}
              onChatCreated={handleChatCreated}
              initialMessages={chatMessages}
              userName={userName || (user.email?.split('@')[0] ?? '')}
              userPlan={userPlan}
            />
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="flex flex-col flex-1 min-h-0 -mx-6 md:-mx-8 -mb-6 md:-mb-8">
          <TasksView projectCount={projects.length} />
        </div>
      )}
    </div>
  )
}
