'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Project, Chat, ViewKey, SidebarTab } from '@/lib/types'
import type { UserPlan } from '@/app/actions/profile'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { HomeView } from './home-view'
import { TasksView } from './tasks-view'
import { StatsView } from './stats-view'
import { CalendarView } from './calendar-view'
import { WorkflowsView } from './workflows-view'
import { InboxView } from './inbox-view'
import { ChatsView } from './chats-view'
import { SettingsView } from './settings-view'
import { ReferralView } from './referral-view'
import { AgentTeamView } from './agent-team-view'
import { ComingSoonView } from './coming-soon-view'
import { CustomizeView } from './customize-view'
import { ArtifactsView } from './artifacts-view'
import { ProjectsView } from './projects-view'
import { CodeSessionView } from './code-session-view'
import { CodeRoutinesView } from './code-routines-view'
import { DeployView } from './deploy-view'
import { AgentPanel } from './AgentPanel'
import { RhsSidebar } from './rhs-sidebar'
import { SearchPopup } from './search-popup'
import { WhatsNewToast } from './whats-new-toast'
import { OnboardingModal } from './onboarding-modal'

interface DashboardShellProps {
  user: User
  projects: Project[]
  chats: Chat[]
  userPlan: UserPlan
  onboardingCompleted: boolean
}

export function DashboardShell({ user, projects: initialProjects, chats: initialChats, userPlan, onboardingCompleted }: DashboardShellProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [activeView, setActiveView] = useState<ViewKey>('home')
  const [activeTab, setActiveTab] = useState<SidebarTab>('chat')

  // Default main-area view for each sidebar tab
  const TAB_DEFAULT_VIEW: Record<SidebarTab, ViewKey> = {
    chat: 'chat',
    tasks: 'tasks',
    code: 'code',
  }

  function handleTabChange(tab: SidebarTab) {
    setActiveTab(tab)
    const defaultView = TAB_DEFAULT_VIEW[tab]
    setActiveView(defaultView)
    localStorage.setItem('xeref_active_view', defaultView)
    window.dispatchEvent(new CustomEvent('xeref_active_view_changed', { detail: defaultView }))
    if (window.innerWidth < 768) setCollapsed(true)
  }

  const [showAgentPanel, setShowAgentPanel] = useState(false)
  const [agentPanelMinimized, setAgentPanelMinimized] = useState(false)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(!onboardingCompleted)
  const [searchOpen, setSearchOpen] = useState(false)

  const userName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''
  const userEmail = user.email ?? ''

  function handleNewChat() {
    if (activeView === 'chat' && selectedChatId === null) {
      window.dispatchEvent(new CustomEvent('xeref_focus_chat_input'))
      return
    }
    setSelectedChatId(null)
    setActiveView('chat')
    setActiveTab('chat')
    localStorage.setItem('xeref_active_view', 'chat')
    window.dispatchEvent(new CustomEvent('xeref_active_view_changed', { detail: 'chat' }))
    if (window.innerWidth < 768) setCollapsed(true)
  }

  function handleChatCreated(chat: Chat) {
    setChats((prev) => [chat, ...prev.filter((c) => c.id !== chat.id)])
    setSelectedChatId(chat.id)
  }

  useEffect(() => {
    const saved = localStorage.getItem('xeref_active_view') as ViewKey | null
    if (saved) {
      setActiveView(saved)
      window.dispatchEvent(new CustomEvent('xeref_active_view_changed', { detail: saved }))
    } else {
      window.dispatchEvent(new CustomEvent('xeref_active_view_changed', { detail: 'home' }))
    }

    // Load agent panel states
    const savedPanelOpen = localStorage.getItem('xeref_agent_panel_open') === 'true'
    const savedPanelMinimized = localStorage.getItem('xeref_agent_panel_minimized') === 'true'
    setShowAgentPanel(savedPanelOpen)
    setAgentPanelMinimized(savedPanelMinimized)
  }, [])

  // Keyboard shortcuts: Ctrl+1/2/3 for tab switching, Ctrl+Shift+O for new item (context-aware)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case '1':
            e.preventDefault()
            handleTabChange('chat')
            break
          case '2':
            e.preventDefault()
            handleTabChange('tasks')
            break
          case '3':
            e.preventDefault()
            handleTabChange('code')
            break
          case 'e':
            e.preventDefault()
            setActiveView(prev => prev === 'agents' ? 'home' : 'agents')
            break
          case 'l':
            e.preventDefault()
            setShowAgentPanel(prev => {
              const next = !prev
              localStorage.setItem('xeref_agent_panel_open', String(next))
              return next
            })
            break
        }
      }

      // F to open search (unless in an input/textarea or using modifier keys)
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement).tagName
        const isEditable = (e.target as HTMLElement).isContentEditable
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && !isEditable) {
          e.preventDefault()
          setSearchOpen(prev => !prev)
        }
      }

      // Ctrl+Shift+O for new item (context-aware based on active tab)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        e.stopPropagation()

        if (activeTab === 'chat') {
          handleNewChat()
        } else if (activeTab === 'tasks') {
          if (activeView !== 'tasks') {
            handleTabChange('tasks')
            setActiveView('tasks')
          }
          window.dispatchEvent(new CustomEvent('xeref_open_task_dialog'))
        } else if (activeTab === 'code') {
          if (activeTab !== 'code') handleTabChange('code')
          setActiveView('code_session')
          localStorage.setItem('xeref_active_view', 'code_session')
          window.dispatchEvent(new CustomEvent('xeref_active_view_changed', { detail: 'code_session' }))
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [activeTab, handleNewChat, handleTabChange])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function handleProjectDeleted(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  function handleProjectUpdated(project: Project) {
    setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)))
  }

  function handleProjectRenamed(id: string, name: string) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)))
  }

  function handleChatRenamed(id: string, title: string) {
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)))
  }

  function handleChatDeleted(id: string) {
    setChats((prev) => prev.filter((c) => c.id !== id))
  }

  function handleChatProjectAdded(chatId: string, projectId: string) {
    setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, project_id: projectId } : c))
  }

  function handleChatProjectRemoved(chatId: string) {
    setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, project_id: null } : c))
  }

  function handleProjectCreated(project: Project) {
    setProjects((prev) => [project, ...prev])
    setActiveView('home')
  }

  const isChatView = activeView === 'chat'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Onboarding modal */}
      {showOnboarding && (
        <OnboardingModal
          userName={userName}
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      {/* Mobile overlay backdrop */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        activeView={activeView}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onViewChange={(view) => {
          setActiveView(view)
          localStorage.setItem('xeref_active_view', view)
          window.dispatchEvent(new CustomEvent('xeref_active_view_changed', { detail: view }))
          if (window.innerWidth < 768) setCollapsed(true)
        }}
        onChatSelect={(id) => {
          setSelectedChatId(id)
          setActiveView('chat')
          localStorage.setItem('xeref_active_view', 'chat')
          window.dispatchEvent(new CustomEvent('xeref_active_view_changed', { detail: 'chat' }))
          if (window.innerWidth < 768) setCollapsed(true)
        }}
        onNewChat={handleNewChat}
        projects={projects}
        chats={chats}
        userEmail={userEmail}
        userName={userName}
        userPlan={userPlan}
        onSignOut={handleSignOut}
        onProjectCreated={handleProjectCreated}
        onProjectRenamed={handleProjectRenamed}
        onProjectDeleted={handleProjectDeleted}
        onChatRenamed={handleChatRenamed}
        onChatDeleted={handleChatDeleted}
        onChatProjectAdded={handleChatProjectAdded}
        onChatProjectRemoved={handleChatProjectRemoved}
        className={cn(
          'fixed z-30 md:relative md:z-auto transition-transform duration-200',
          collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
        )}
      />

      {/* Main + RHS */}
      <div className="flex flex-1 overflow-hidden min-w-0">
        <main className="relative flex flex-col flex-1 overflow-y-auto min-w-0">
          {(() => {
            switch (activeView) {
              case 'home':
                return (
                  <HomeView
                    user={user}
                    projects={projects}
                    chats={chats}
                    userName={userName}
                    userPlan={userPlan}
                    onProjectDeleted={handleProjectDeleted}
                    onProjectUpdated={handleProjectUpdated}
                    onChatProjectRemoved={handleChatProjectRemoved}
                  />
                )
              case 'tasks':
                return <TasksView projectCount={projects.length} />
              case 'stats':
                return <StatsView projects={projects} chats={chats} />
              case 'calendar':
                return <CalendarView />
              case 'workflows':
                return <WorkflowsView projectCount={projects.length} />
              case 'inbox':
                return <InboxView />
              case 'chat':
                return (
                  <ChatsView
                    projects={projects}
                    initialChats={chats}
                    userName={userName || userEmail.split('@')[0]}
                    userPlan={userPlan}
                    selectedChatId={selectedChatId}
                    onNewChat={handleNewChat}
                    onChatCreated={handleChatCreated}
                  />
                )
              case 'settings':
                return (
                <SettingsView
                    userEmail={userEmail}
                    userName={userName}
                    userPlan={userPlan}
                  />
                )
              case 'referral':
                return <ReferralView />
              case 'agents':
                return <AgentTeamView />
              case 'code':
                return <ArtifactsView />
              case 'code_session':
                return <CodeSessionView sessionId={null} />
              case 'code_routines':
                return <CodeRoutinesView />
              case 'customize':
                return (
                  <CustomizeView
                    onBack={() => {
                      setActiveView('home')
                      setCollapsed(false)
                      localStorage.setItem('xeref_active_view', 'home')
                    }}
                  />
                )
              case 'projects':
                return <ProjectsView />
              case 'deploy':
                return <DeployView />
            }
          })()}
        </main>

        {/* Right-hand sidebar/AgentPanel area */}
        {showAgentPanel && (
          <div className={cn(
            "border-l bg-card transition-all duration-300 shrink-0",
            agentPanelMinimized ? "w-12" : "w-80 xl:w-96"
          )}>
            <AgentPanel 
              theme="dark" // Or detect system theme
              isMinimized={agentPanelMinimized}
              onMinimize={() => {
                setAgentPanelMinimized(p => {
                  const next = !p
                  localStorage.setItem('xeref_agent_panel_minimized', String(next))
                  return next
                })
              }}
              onClose={() => {
                setShowAgentPanel(false)
                setAgentPanelMinimized(false)
                localStorage.setItem('xeref_agent_panel_open', 'false')
                localStorage.setItem('xeref_agent_panel_minimized', 'false')
              }}
            />
          </div>
        )}
        
        {/* Legacy RhsSidebar if needed or fallback when agent is closed */}
        {isChatView && !showAgentPanel && <RhsSidebar onOpenSearch={() => setSearchOpen(true)} />}
      </div>

      {searchOpen && (
        <SearchPopup
          onClose={() => setSearchOpen(false)}
          chats={chats}
          projects={projects}
          onChatSelect={(id) => {
            setSelectedChatId(id)
            setActiveView('chat')
            localStorage.setItem('xeref_active_view', 'chat')
            window.dispatchEvent(new CustomEvent('xeref_active_view_changed', { detail: 'chat' }))
          }}
          onViewChange={(view) => {
            setActiveView(view)
            localStorage.setItem('xeref_active_view', view)
            window.dispatchEvent(new CustomEvent('xeref_active_view_changed', { detail: view }))
          }}
        />
      )}

      <WhatsNewToast />
    </div>
  )
}
