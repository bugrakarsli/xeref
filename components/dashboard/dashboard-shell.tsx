'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Project, Chat, ViewKey } from '@/lib/types'
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
import { RhsSidebar } from './rhs-sidebar'

interface DashboardShellProps {
  user: User
  projects: Project[]
  chats: Chat[]
}

export function DashboardShell({ user, projects: initialProjects, chats: initialChats }: DashboardShellProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [activeView, setActiveView] = useState<ViewKey>('home')
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [chats] = useState<Chat[]>(initialChats)

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

  const isChatView = activeView === 'chat'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
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
          if (window.innerWidth < 768) setCollapsed(true)
        }}
        projects={projects}
        chats={chats}
        userEmail={userEmail}
        userName={userName}
        onSignOut={handleSignOut}
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
                    onProjectDeleted={handleProjectDeleted}
                    onProjectUpdated={handleProjectUpdated}
                  />
                )
              case 'tasks':
                return <TasksView />
              case 'stats':
                return <StatsView />
              case 'calendar':
                return <CalendarView />
              case 'workflows':
                return <WorkflowsView />
              case 'inbox':
                return <InboxView />
              case 'chat':
                return (
                  <ChatsView
                    projects={projects}
                    initialChats={chats}
                    userName={userName || userEmail.split('@')[0]}
                  />
                )
              case 'settings':
                return (
                  <SettingsView
                    userEmail={userEmail}
                    userName={userName}
                  />
                )
              case 'referral':
                return <ReferralView />
            }
          })()}
        </main>

        {/* Right-hand sidebar — always visible on large screens */}
        {isChatView && <RhsSidebar />}
      </div>
    </div>
  )
}
