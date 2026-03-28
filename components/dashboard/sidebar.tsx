'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import type { Project, Chat, ViewKey } from '@/lib/types'
import { XerefLogo } from '@/components/xeref-logo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Home,
  CheckSquare,
  BarChart2,
  CalendarDays,
  GitFork,
  Inbox,
  Bot,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  LogOut,
  Dot,
  Menu,
  MessageSquare,
  Settings,
  Zap,
  Users,
} from 'lucide-react'

const SIDEBAR_PROJECT_LIMIT = 5
const SIDEBAR_CHAT_LIMIT = 5

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  activeView: ViewKey
  onViewChange: (view: ViewKey) => void
  projects: Project[]
  chats: Chat[]
  userEmail: string
  userName: string
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
  const button = (
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

  if (!collapsed) return button

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

function UserAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
      {initial}
    </div>
  )
}

export function Sidebar({
  collapsed,
  onToggle,
  activeView,
  onViewChange,
  projects,
  chats,
  userEmail,
  userName,
  onSignOut,
  className,
}: SidebarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(true)
  const pathname = usePathname()
  const isBuilderActive = pathname === '/builder'

  const emailUsername = userEmail.split('@')[0]
  const displayName = userName || (emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1))

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
          'flex items-center h-14 border-b shrink-0',
          collapsed ? 'justify-center px-3' : 'px-3 gap-2'
        )}
      >
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggle}
                aria-label="Expand sidebar"
                className={cn(
                  'group relative flex items-center justify-center h-8 w-8 rounded-lg transition-colors hover:bg-accent',
                  focusRing
                )}
              >
                <XerefLogo className="h-6 w-6 absolute transition-opacity duration-150 group-hover:opacity-0" />
                <LayoutDashboard className="h-5 w-5 absolute opacity-0 transition-opacity duration-150 group-hover:opacity-100 text-primary" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand Sidebar</TooltipContent>
          </Tooltip>
        ) : (
          <>
            <button
              onClick={onToggle}
              aria-label="Collapse sidebar"
              className={cn(
                'group flex items-center justify-center h-8 w-8 rounded-lg transition-colors hover:bg-accent shrink-0',
                focusRing
              )}
            >
              <LayoutDashboard className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
            </button>
            <Link href="/" className="flex items-center gap-2 flex-1 min-w-0">
              <XerefLogo className="h-5 w-5 shrink-0" />
              <span className="font-semibold text-sm tracking-tight truncate">
                xeref<span className="text-primary">.ai</span>
              </span>
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
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
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/builder"
                  aria-current={isBuilderActive ? 'page' : undefined}
                  aria-label="XerefClaw"
                  className={cn(
                    'flex items-center justify-center w-full rounded-lg px-2 py-2 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    focusRing,
                    isBuilderActive && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Bot className="h-4 w-4 shrink-0" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">XerefClaw</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/builder"
              aria-current={isBuilderActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                focusRing,
                isBuilderActive && 'bg-accent text-accent-foreground'
              )}
            >
              <Bot className="h-4 w-4 shrink-0" />
              <span>XerefClaw</span>
            </Link>
          )}
        </div>

        {/* Chat section */}
        <div className="mt-2">
          {!collapsed && (
            <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Chats
            </p>
          )}
          <div className="flex flex-col gap-1 mt-1">
            <NavItem
              icon={<MessageSquare className="h-4 w-4" />}
              label="Chat"
              active={activeView === 'chat'}
              collapsed={collapsed}
              onClick={() => onViewChange('chat')}
            />
            {/* Recent chats */}
            {!collapsed &&
              chats.slice(0, SIDEBAR_CHAT_LIMIT).map((c) => (
                <button
                  key={c.id}
                  onClick={() => onViewChange('chat')}
                  aria-label={`Open chat: ${c.title}`}
                  className={cn(
                    'flex items-center gap-2 w-full rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
                    focusRing
                  )}
                  title={c.title}
                >
                  <Dot className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{c.title}</span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* User navbar */}
      <div className="border-t shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex items-center gap-2 w-full p-3 text-left transition-colors hover:bg-accent',
                focusRing,
                collapsed && 'justify-center'
              )}
              aria-label="User menu"
            >
              <UserAvatar name={displayName} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">Xeref Free</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align={collapsed ? 'center' : 'start'}
            className="w-56 mb-1"
          >
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">{userEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onViewChange('settings')}>
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" asChild>
              <Link href="/pricing">
                <Zap className="h-4 w-4 text-primary" />
                Upgrade Plan
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onViewChange('referral')}>
              <Users className="h-4 w-4 text-blue-400" />
              Referral Program
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={onSignOut}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
