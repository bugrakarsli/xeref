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
import { AgentManagerView } from './AgentManagerView'
import { ComingSoonView } from './coming-soon-view'
import { AgentPanel } from './AgentPanel'
import { RhsSidebar } from './rhs-sidebar'
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

  const [showAgentPanel, setShowAgentPanel] = useState(true)
  const [agentPanelMinimized, setAgentPanelMinimized] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('xeref_active_view') as ViewKey | null
    if (saved) {
      setActiveView(saved)
      window.dispatchEvent(new CustomEvent('xeref_active_view_changed', { detail: saved }))
    } else {
      window.dispatchEvent(new CustomEvent('xeref_active_view_changed', { detail: 'home' }))
    }
    
    // Load agent panel states
    const savedPanelOpen = localStorage.getItem('xeref_agent_panel_open') !== 'false'
    const savedPanelMinimized = localStorage.getItem('xeref_agent_panel_minimized') === 'true'
    setShowAgentPanel(savedPanelOpen)
    setAgentPanelMinimized(savedPanelMinimized)
  }, [])

  // Ctrl+1/2/3 keyboard shortcuts for tab switching
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') { e.preventDefault(); handleTabChange('chat') }
        if (e.key === '2') { e.preventDefault(); handleTabChange('tasks') }
        if (e.key === '3') { e.preventDefault(); handleTabChange('code') }
        if (e.key === 'e' || e.key === 'E') {
          e.preventDefault()
          setActiveView(prev => prev === 'agents' ? 'home' : 'agents')
        }
        if (e.key === 'l' || e.key === 'L') {
          e.preventDefault()
          setShowAgentPanel(prev => {
            const next = !prev
            localStorage.setItem('xeref_agent_panel_open', String(next))
            return next
          })
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(!onboardingCompleted)

  const userName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''
  const userEmail = user.email ?? ''

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

  function handleProjectCreated(project: Project) {
    setProjects((prev) => [project, ...prev])
    window.history.pushState({}, '', `/builder?project=${project.id}`)
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
                return <AgentManagerView onOpenEditor={() => setActiveView('home')} />
              case 'code':
                return <ComingSoonView viewName="Workspaces" />
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
                localStorage.setItem('xeref_agent_panel_open', 'false')
              }}
            />
          </div>
        )}
        
        {/* Legacy RhsSidebar if needed or fallback when agent is closed */}
        {isChatView && !showAgentPanel && <RhsSidebar />}
      </div>

      <WhatsNewToast />
    </div>
  )
}
