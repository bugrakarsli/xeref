'use client'

import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import type { Project, Chat, Message } from '@/lib/types'
import type { UserPlan } from '@/app/actions/profile'
import { deleteProject } from '@/app/actions/projects'
import { activateProjectPrompt } from '@/app/actions/prompt'
import { createChat, getChatMessages, updateChatTitle } from '@/app/actions/chats'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Calendar, Layers, CheckCircle2, Zap, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatInterface } from './chat/chat-interface'
import { ChatList } from './chat/chat-list'
import { TasksView } from './tasks-view'

type HomeTab = 'home' | 'chat' | 'tasks'

interface HomeViewProps {
  user: User
  projects: Project[]
  chats: Chat[]
  userName: string
  userPlan: UserPlan
  onProjectDeleted: (id: string) => void
  onProjectUpdated: (project: Project) => void
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

function ProjectCard({
  project,
  onDelete,
  onPromptAdded,
}: {
  project: Project
  onDelete: (id: string) => void
  onPromptAdded: (id: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [isActivating, setIsActivating] = useState(false)
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

  async function handleAddPrompt() {
    if (hasPrompt) return
    setIsActivating(true)
    try {
      await activateProjectPrompt(project.id)
      onPromptAdded(project.id)
      toast.success('Agent activated! You can now chat with it.')
    } catch {
      toast.error('Failed to activate agent. Please try again.')
    } finally {
      setIsActivating(false)
    }
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

      {hasPrompt ? (
        <div className="flex items-center justify-center gap-1.5 w-full h-8 text-xs rounded-md border border-primary/30 text-primary bg-primary/5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Prompt Added
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={handleAddPrompt}
          disabled={isActivating}
        >
          {isActivating ? (
            <>Activating…</>
          ) : (
            <>
              <Zap className="h-3 w-3 mr-1" />
              Add Prompt
            </>
          )}
        </Button>
      )}
    </div>
  )
}

export function HomeView({ user, projects, chats: initialChats, userName, userPlan, onProjectDeleted, onProjectUpdated }: HomeViewProps) {
  const raw = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'there'
  const displayName = raw.charAt(0).toUpperCase() + raw.slice(1)

  const [activeTab, setActiveTab] = useState<HomeTab>('home')
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    () => projects.find((p) => p.prompt) ?? null
  )
  const [showingList, setShowingList] = useState(false)

  async function handleNewChat() {
    if (activeChat && chatMessages.length > 0) {
      const firstUserMsg = chatMessages.find((m) => m.role === 'user')
      if (firstUserMsg && activeChat.title === 'New Chat') {
        const title = firstUserMsg.content.slice(0, 50).trim()
        try {
          await updateChatTitle(activeChat.id, title)
          setChats((prev) => prev.map((c) => (c.id === activeChat.id ? { ...c, title } : c)))
        } catch {
          // non-critical
        }
      }
    }
    try {
      const newChat = await createChat(selectedProject?.id ?? null, 'New Chat')
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

  function handlePromptAdded(id: string) {
    const project = projects.find((p) => p.id === id)
    if (project) {
      onProjectUpdated({ ...project, prompt: '__activated__' })
    }
  }

  const activatedProjects = projects.filter((p) => p.prompt)
  const selectedProjectObj = selectedProject
    ? (activatedProjects.find((p) => p.id === selectedProject.id) ?? null)
    : null

  return (
    <div className="flex flex-col flex-1 min-h-0 p-6 md:p-8 max-w-5xl w-full mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()},{' '}
          <span className="text-primary">{displayName}</span>.
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          You have {projects.length} saved agent{projects.length !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* Chat / Tasks / Home toggle */}
      <div className="flex items-center gap-1 bg-muted rounded-full p-1 text-sm w-fit mb-6">
        {(['home', 'chat', 'tasks'] as HomeTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-1 rounded-full text-xs font-medium transition-colors capitalize',
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'home' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">
              Saved Agents
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
                  onDelete={onProjectDeleted}
                  onPromptAdded={handlePromptAdded}
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
              selectedProject={selectedProjectObj}
              onProjectSelect={setSelectedProject}
              activeChat={activeChat}
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
