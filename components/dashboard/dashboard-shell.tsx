'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { Project, ViewKey } from '@/lib/types'
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

interface DashboardShellProps {
  user: User
  projects: Project[]
}

export function DashboardShell({ user, projects: initialProjects }: DashboardShellProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [activeView, setActiveView] = useState<ViewKey>('home')
  const [projects, setProjects] = useState<Project[]>(initialProjects)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function handleProjectDeleted(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

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
          // Auto-collapse on mobile after navigation
          if (window.innerWidth < 768) setCollapsed(true)
        }}
        projects={projects}
        userEmail={user.email ?? ''}
        userName={user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''}
        onSignOut={handleSignOut}
        className={cn(
          'fixed z-30 md:relative md:z-auto transition-transform duration-200',
          collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
        )}
      />

      <main className="relative flex flex-col flex-1 overflow-y-auto min-w-0">
        {(() => {
          switch (activeView) {
            case 'home':
              return <HomeView user={user} projects={projects} onProjectDeleted={handleProjectDeleted} />
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
            case 'chats':
              return <ChatsView />
            case 'settings':
              return (
                <SettingsView
                  userEmail={user.email ?? ''}
                  userName={user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''}
                />
              )
            case 'referral':
              return <ReferralView />
          }
        })()}

        {/* Changelog badge */}
        <Link
          href="/changelog"
          className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full border border-primary/30 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/60 hover:text-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          v1
        </Link>
      </main>
    </div>
  )
}
