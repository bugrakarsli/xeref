'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Project, Chat, ViewKey } from '@/lib/types'
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

  useEffect(() => {
    const saved = localStorage.getItem('xeref_active_view') as ViewKey | null
    if (saved) setActiveView(saved)
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
        onViewChange={(view) => {
          setActiveView(view)
          localStorage.setItem('xeref_active_view', view)
          if (window.innerWidth < 768) setCollapsed(true)
        }}
        onChatSelect={(id) => {
          setSelectedChatId(id)
          setActiveView('chat')
          localStorage.setItem('xeref_active_view', 'chat')
          if (window.innerWidth < 768) setCollapsed(true)
        }}
        projects={projects}
        chats={chats}
        userEmail={userEmail}
        userName={userName}
        userPlan={userPlan}
        onSignOut={handleSignOut}
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
                return <AgentTeamView />
            }
          })()}
        </main>

        {/* Right-hand sidebar — always visible on large screens */}
        {isChatView && <RhsSidebar />}
      </div>

      <WhatsNewToast />
    </div>
  )
}
