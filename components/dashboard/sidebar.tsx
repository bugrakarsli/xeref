'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import type { Project, ViewKey } from '@/lib/types'
import { XerefLogo } from '@/components/xeref-logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Home,
  CheckSquare,
  BarChart2,
  CalendarDays,
  GitFork,
  Inbox,
  Bot,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  Dot,
  Menu,
} from 'lucide-react'

const SIDEBAR_PROJECT_LIMIT = 5

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  activeView: ViewKey
  onViewChange: (view: ViewKey) => void
  projects: Project[]
  userEmail: string
  onSignOut: () => void
  className?: string
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  collapsed: boolean
  onClick: () => void
}

function NavItem({ icon, label, active, collapsed, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      aria-label={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        focusRing,
        active && 'bg-accent text-accent-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  )
}

export function Sidebar({
  collapsed,
  onToggle,
  activeView,
  onViewChange,
  projects,
  userEmail,
  onSignOut,
  className,
}: SidebarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(true)
  const pathname = usePathname()
  const isBuilderActive = pathname === '/builder'

  const username = userEmail.split('@')[0]

  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        'flex flex-col h-full bg-card border-r transition-all duration-200 overflow-hidden',
        collapsed ? 'w-14' : 'w-56',
        className
      )}
    >
      {/* Logo + toggle */}
      <div
        className={cn(
          'flex items-center h-14 px-3 border-b shrink-0',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <XerefLogo className="h-6 w-6 shrink-0" />
            <span className="font-semibold text-sm tracking-tight">
              xeref<span className="text-primary">.ai</span>
            </span>
          </Link>
        )}
        {collapsed && <XerefLogo className="h-6 w-6" />}
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-7 w-7 shrink-0', collapsed && 'mt-0')}
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mobile hamburger - shown when sidebar collapsed on mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-40 h-8 w-8 md:hidden"
        onClick={onToggle}
        aria-label="Open navigation"
        style={{ display: collapsed ? undefined : 'none' }}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Scrollable nav */}
      <div className="flex flex-col gap-1 flex-1 overflow-y-auto overflow-x-hidden p-2 min-h-0">
        {/* Main nav */}
        <NavItem
          icon={<Home className="h-4 w-4" />}
          label="Home"
          active={activeView === 'home'}
          collapsed={collapsed}
          onClick={() => onViewChange('home')}
        />
        <NavItem
          icon={<CheckSquare className="h-4 w-4" />}
          label="All Tasks"
          active={activeView === 'tasks'}
          collapsed={collapsed}
          onClick={() => onViewChange('tasks')}
        />

        {/* Advanced section */}
        <div className="mt-2">
          {!collapsed && (
            <button
              onClick={() => setAdvancedOpen((o) => !o)}
              aria-expanded={advancedOpen}
              aria-controls="advanced-nav-section"
              className={cn(
                'flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors',
                focusRing
              )}
            >
              Advanced
              {advancedOpen ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}
          {(advancedOpen || collapsed) && (
            <div id="advanced-nav-section" className="flex flex-col gap-1 mt-1">
              <NavItem
                icon={<BarChart2 className="h-4 w-4" />}
                label="Stats"
                active={activeView === 'stats'}
                collapsed={collapsed}
                onClick={() => onViewChange('stats')}
              />
              <NavItem
                icon={<CalendarDays className="h-4 w-4" />}
                label="Calendar"
                active={activeView === 'calendar'}
                collapsed={collapsed}
                onClick={() => onViewChange('calendar')}
              />
              <NavItem
                icon={<GitFork className="h-4 w-4" />}
                label="Workflows"
                active={activeView === 'workflows'}
                collapsed={collapsed}
                onClick={() => onViewChange('workflows')}
              />
            </div>
          )}
        </div>

        {/* Projects section */}
        <div className="mt-2">
          {!collapsed && (
            <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Projects
            </p>
          )}
          <div className="flex flex-col gap-1 mt-1">
            <NavItem
              icon={<Inbox className="h-4 w-4" />}
              label="Inbox"
              active={activeView === 'inbox'}
              collapsed={collapsed}
              onClick={() => onViewChange('inbox')}
            />
            {!collapsed &&
              projects.slice(0, SIDEBAR_PROJECT_LIMIT).map((p) => (
                <button
                  key={p.id}
                  onClick={() => onViewChange('home')}
                  aria-label={`Open project: ${p.name}`}
                  className={cn(
                    'flex items-center gap-2 w-full rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
                    focusRing
                  )}
                  title={p.name}
                >
                  <Dot className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
          </div>
        </div>

        {/* AI Agents */}
        <div className="mt-2">
          {!collapsed && (
            <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              AI Agents
            </p>
          )}
          <Link
            href="/builder"
            aria-current={isBuilderActive ? 'page' : undefined}
            aria-label={collapsed ? 'AI Agents — XerefClaw' : undefined}
            className={cn(
              'flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              focusRing,
              isBuilderActive && 'bg-accent text-accent-foreground',
              collapsed && 'justify-center px-2'
            )}
          >
            <Bot className="h-4 w-4 shrink-0" />
            {!collapsed && <span>XerefClaw</span>}
          </Link>
        </div>
      </div>

      {/* User + sign out */}
      <div
        className={cn(
          'flex items-center gap-2 border-t p-3 shrink-0',
          collapsed && 'justify-center'
        )}
      >
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{username}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={onSignOut}
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  )
}
