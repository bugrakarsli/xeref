'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Home,
  CheckSquare,
  BarChart2,
  CalendarDays,
  GitFork,
  Mail,
  Bot,
  BrainCircuit,
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
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react'
import { renameProject, deleteProject } from '@/app/actions/projects'
import { updateChatTitle, deleteChat } from '@/app/actions/chats'
import { toast } from 'sonner'

const SIDEBAR_PROJECT_LIMIT = 5

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
  userPlan?: string
  onSignOut: () => void
  onProjectRenamed?: (id: string, name: string) => void
  onProjectDeleted?: (id: string) => void
  onChatRenamed?: (id: string, title: string) => void
  onChatDeleted?: (id: string) => void
  onChatSelect?: (id: string) => void
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

interface InlineEditRowProps {
  label: string
  onSave: (value: string) => Promise<void>
  onNavigate: () => void
  onDelete: () => Promise<void>
  active?: boolean
}

function InlineEditRow({ label, onSave, onNavigate, onDelete, active }: InlineEditRowProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(label)
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation()
    setValue(label)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  async function commitEdit() {
    const trimmed = value.trim()
    if (!trimmed || trimmed === label) {
      setEditing(false)
      return
    }
    try {
      await onSave(trimmed)
    } catch {
      toast.error('Failed to rename')
    }
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await onDelete()
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 px-2 py-1">
        <Dot className="h-4 w-4 shrink-0 text-primary" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitEdit}
          className="flex-1 min-w-0 bg-transparent text-sm outline-none border-b border-primary/60 pb-0.5"
        />
        <button onClick={commitEdit} className="shrink-0 text-emerald-400 hover:text-emerald-300">
          <Check className="h-3 w-3" />
        </button>
        <button onClick={() => setEditing(false)} className="shrink-0 text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-1 w-full rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer',
        active && 'bg-accent/50 text-accent-foreground'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onNavigate}
    >
      <Dot className="h-4 w-4 shrink-0 text-primary" />
      <span className="truncate flex-1 text-sm">{label}</span>
      {hovered && (
        <div className="flex items-center gap-0.5 shrink-0 ml-auto">
          <button
            onClick={startEdit}
            className="h-5 w-5 flex items-center justify-center rounded hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Rename"
          >
            <Pencil className="h-2.5 w-2.5" />
          </button>
          <button
            onClick={handleDelete}
            className="h-5 w-5 flex items-center justify-center rounded hover:bg-background/50 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
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
  userPlan = 'free',
  onSignOut,
  onProjectRenamed,
  onProjectDeleted,
  onChatRenamed,
  onChatDeleted,
  onChatSelect,
  className,
}: SidebarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(true)
  const [chatsOpen, setChatsOpen] = useState(true)
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

      {/* Nav — no outer scroll; only the Chats section scrolls */}
      <div className="flex flex-col flex-1 overflow-hidden p-2 min-h-0">
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
          <div className="flex flex-col gap-0.5 mt-1">
            <NavItem
              icon={<Mail className="h-4 w-4" />}
              label="Inbox"
              active={activeView === 'inbox'}
              collapsed={collapsed}
              onClick={() => onViewChange('inbox')}
            />
            {!collapsed &&
              projects.slice(0, SIDEBAR_PROJECT_LIMIT).map((p) => (
                <InlineEditRow
                  key={p.id}
                  label={p.name}
                  onNavigate={() => onViewChange('home')}
                  onSave={async (name) => {
                    await renameProject(p.id, name)
                    onProjectRenamed?.(p.id, name)
                  }}
                  onDelete={async () => {
                    await deleteProject(p.id)
                    onProjectDeleted?.(p.id)
                    toast.success(`"${p.name}" deleted`)
                  }}
                />
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
          <div className="flex flex-col gap-1 mt-1">
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
            <NavItem
              icon={<BrainCircuit className="h-4 w-4" />}
              label="Xeref Agents"
              active={activeView === 'agents'}
              collapsed={collapsed}
              onClick={() => onViewChange('agents')}
            />
          </div>
        </div>

        {/* Chat section — grows to fill remaining sidebar space; only this scrolls */}
        <div className="mt-2 flex flex-col flex-1 min-h-0">
          {!collapsed && (
            <button
              onClick={() => setChatsOpen((o) => !o)}
              aria-expanded={chatsOpen}
              className={cn(
                'flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors shrink-0',
                focusRing
              )}
            >
              Chats
              {chatsOpen ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}
          <div className="flex flex-col gap-0.5 mt-1 flex-1 min-h-0">
            <NavItem
              icon={<MessageSquare className="h-4 w-4" />}
              label="Chat"
              active={activeView === 'chat'}
              collapsed={collapsed}
              onClick={() => onViewChange('chat')}
            />
            {!collapsed && chatsOpen && chats.length > 0 && (
              <ScrollArea className="flex-1 min-h-0">
                <div className="flex flex-col gap-0.5 pr-1">
                  {chats.map((c) => (
                    <InlineEditRow
                      key={c.id}
                      label={c.title}
                      active={false}
                      onNavigate={() => {
                        onChatSelect?.(c.id)
                        onViewChange('chat')
                      }}
                      onSave={async (title) => {
                        await updateChatTitle(c.id, title)
                        onChatRenamed?.(c.id, title)
                      }}
                      onDelete={async () => {
                        await deleteChat(c.id)
                        onChatDeleted?.(c.id)
                        toast.success('Chat deleted')
                      }}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </div>

      {/* User navbar */}
      <div className="border-t shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              suppressHydrationWarning
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
                  <p className="text-xs text-muted-foreground truncate">Xeref {userPlan === 'free' ? 'Free' : userPlan === 'pro' ? 'Pro' : 'Ultra'}</p>
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
