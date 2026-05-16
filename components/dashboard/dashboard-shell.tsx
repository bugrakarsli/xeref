'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Project, Chat, CodeSession, ViewKey, SidebarTab } from '@/lib/types'
import { getUserCodeSessions } from '@/app/actions/code-sessions'
import type { UserPlan } from '@/app/actions/profile'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
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
import { ProjectsView } from './projects-view'
import { DeployView } from './deploy-view'
import { MemoryView } from './memory-view'
import { ClassroomView } from './classroom-view'
import { PlansView } from './plans-view'
import { AgentPanel } from './AgentPanel'
import { RhsSidebar } from './rhs-sidebar'
import { SearchPopup } from './search-popup'
import { WhatsNewToast } from './whats-new-toast'
import { OnboardingModal } from './onboarding-modal'

const Sidebar = dynamic(
  () => import('./sidebar').then((m) => ({ default: m.Sidebar })),
  {
    ssr: false,
    loading: () => (
      <div
        className={cn(
          'flex h-full bg-card border-r transition-all duration-200 shrink-0',
          'w-56'
        )}
      />
    ),
  }
)

interface DashboardShellProps {
  user: User
  projects: Project[]
  chats: Chat[]
  userPlan: UserPlan
  onboardingCompleted: boolean
  children?: React.ReactNode
  initialTab?: SidebarTab
  initialView?: ViewKey
  forceCollapsed?: boolean
}

export function DashboardShell({ user, projects: initialProjects, chats: initialChats, userPlan, onboardingCompleted, children, initialTab = 'chat', initialView = 'home', forceCollapsed }: DashboardShellProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Compute actual initial state based on pathname
  const isCodeRoute = pathname?.startsWith('/code')
  const isCustomizeRoute = pathname?.startsWith('/customize')
  const isSettingsRoute = pathname?.startsWith('/settings')
  const isInboxRoute = pathname?.startsWith('/inbox')
  const actualInitialTab = isCodeRoute ? 'code' : initialTab
  const actualInitialView: ViewKey = isCustomizeRoute
    ? 'customize'
    : isSettingsRoute
      ? 'settings'
      : isInboxRoute
        ? 'inbox'
        : isCodeRoute
          ? (pathname.includes('/session') ? 'code_session' : pathname.includes('/routines') ? 'code_routines' : 'code')
          : initialView

  const [collapsed, setCollapsed] = useState(forceCollapsed ?? true)
  const [activeView, setActiveView] = useState<ViewKey>(actualInitialView)
  const [activeTab, setActiveTab] = useState<SidebarTab>(actualInitialTab)

  // Default main-area view for each sidebar tab
  const TAB_DEFAULT_VIEW: Record<SidebarTab, ViewKey> = {
    chat: 'chat',
    tasks: 'tasks',
    code: 'code_session',
  }

  function handleTabChange(tab: SidebarTab) {
    // On /customize, /settings, or /inbox, any tab click exits back to the dashboard
    if (isCustomizeRoute || isSettingsRoute || isInboxRoute) {
      if (tab === 'code') { router.push('/code'); return }
      localStorage.setItem('xeref_pending_tab', tab)
      router.push('/')
      return
    }
    if (tab === 'code' && activeTab !== 'code') {
      router.push('/code')
      return
    }
    if (tab !== 'code' && activeTab === 'code') {
      localStorage.setItem('xeref_pending_tab', tab)
      router.push('/')
      return
    }
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
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [codeSessions, setCodeSessions] = useState<CodeSession[]>([])
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

  function handleNewSession() {
    router.push('/code')
  }

  function handleSessionSelected(id: string) {
    setSelectedSessionId(id)
    localStorage.setItem('xeref_selected_session_id', id)
    router.push(`/code/${id}`)
  }

  // Hydrate localStorage-persisted state after mount (avoids SSR/client mismatch)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const pendingTab = localStorage.getItem('xeref_pending_tab') as SidebarTab | null
    if (pendingTab) {
      localStorage.removeItem('xeref_pending_tab')
      setActiveTab(pendingTab)
      const defaultView = TAB_DEFAULT_VIEW[pendingTab]
      setActiveView(defaultView)
      localStorage.setItem('xeref_active_view', defaultView)
    } else if (initialTab === 'chat' && !isCustomizeRoute && !isCodeRoute && !isSettingsRoute && !isInboxRoute) {
      const savedView = localStorage.getItem('xeref_active_view') as ViewKey | null
      if (savedView) setActiveView(savedView)
    }

    if (localStorage.getItem('xeref_agent_panel_open') === 'true') setShowAgentPanel(true)
    if (localStorage.getItem('xeref_agent_panel_minimized') === 'true') setAgentPanelMinimized(true)
    const savedSession = localStorage.getItem('xeref_selected_session_id')
    if (savedSession) setSelectedSessionId(savedSession)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('xeref_active_view_changed', { detail: activeView }))
  }, [activeView])

  useEffect(() => {
    // Load code sessions
    getUserCodeSessions().then(setCodeSessions)

    const supabase = createClient()
    const userId = user.id

    const channel = supabase
      .channel('code_sessions_dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'code_sessions' },
        (payload) => {
          const row = (payload.new ?? payload.old) as CodeSession
          if (row.user_id !== userId) return
          if (payload.eventType === 'INSERT') {
            setCodeSessions((prev) => [row, ...prev].slice(0, 30))
          } else if (payload.eventType === 'UPDATE') {
            setCodeSessions((prev) =>
              prev.map((s) => (s.id === row.id ? { ...s, ...row } : s))
            )
          } else if (payload.eventType === 'DELETE') {
            setCodeSessions((prev) => prev.filter((s) => s.id !== row.id))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user.id])

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
          handleNewSession()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [activeTab, activeView, handleNewChat, handleNewSession, handleTabChange])

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
          if (view === 'customize') { router.push('/customize'); return }
          if (view === 'settings') { router.push('/settings/general'); return }
          if (view === 'inbox') { router.push('/inbox'); return }
          // On /customize, /settings, or /inbox, any other view navigates back to the dashboard
          if (isCustomizeRoute || isSettingsRoute || isInboxRoute) {
            localStorage.setItem('xeref_active_view', view)
            router.push('/')
            return
          }
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
        onNewSession={handleNewSession}
        codeSessions={codeSessions}
        selectedSessionId={(() => {
          // Derive from URL so the highlight works on direct navigation / page reload
          const m = pathname?.match(/^\/code\/(.+)$/)
          if (!m) return selectedSessionId
          const raw = m[1]
          return raw.startsWith('session_') ? raw : `session_${raw}`
        })()}
        onSessionSelect={handleSessionSelected}
        onSessionRenamed={(id, title) => setCodeSessions((prev) => prev.map((s) => s.id === id ? { ...s, title } : s))}
        onSessionDeleted={(id) => {
          setCodeSessions((prev) => prev.filter((s) => s.id !== id))
          if (selectedSessionId === id) {
            setSelectedSessionId(null)
            localStorage.removeItem('xeref_selected_session_id')
          }
        }}
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
                if (isSettingsRoute) return children || null
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
              case 'code_session':
              case 'code_routines':
              case 'customize':
                return children || null
              case 'projects':
                return <ProjectsView />
              case 'deploy':
                return <DeployView />
              case 'memory':
                return <MemoryView />
              case 'classroom':
                return <ClassroomView userEmail={userEmail} userId={user.id} />
              case 'plans':
                return <PlansView />
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
            if (view === 'customize') { router.push('/customize'); return }
            if (isCustomizeRoute) {
              localStorage.setItem('xeref_active_view', view)
              router.push('/')
              return
            }
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
