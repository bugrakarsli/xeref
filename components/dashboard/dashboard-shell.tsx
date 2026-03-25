'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Project, ViewKey } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { HomeView } from './home-view'
import { ComingSoonView } from './coming-soon-view'

const VIEW_LABELS: Record<Exclude<ViewKey, 'home'>, string> = {
  tasks: 'All Tasks',
  stats: 'Stats',
  calendar: 'Calendar',
  workflows: 'Workflows',
  inbox: 'Inbox',
}

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
        onSignOut={handleSignOut}
        className={cn(
          'fixed z-30 md:relative md:z-auto transition-transform duration-200',
          collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
        )}
      />

      <main className="flex flex-col flex-1 overflow-y-auto min-w-0">
        {activeView === 'home' ? (
          <HomeView
            user={user}
            projects={projects}
            onProjectDeleted={handleProjectDeleted}
          />
        ) : (
          <ComingSoonView viewName={VIEW_LABELS[activeView]} />
        )}
      </main>
    </div>
  )
}
