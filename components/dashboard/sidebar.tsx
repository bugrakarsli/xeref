'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { Project, Chat, CodeSession, ViewKey, SidebarTab } from '@/lib/types'
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
  CheckSquare,
  BarChart2,
  CalendarDays,
  GitFork,
  Mail,
  Bot,
  BrainCircuit,
  PanelLeft,
  ChevronDown,
  ChevronRight,
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
  Code2,
  Pin,
  FolderOpen,
  List,
  Paintbrush,
  Box,
  Layers,
  Send,
  Brain,
  BookOpen,
  Map,
} from 'lucide-react'

import { renameProject, deleteProject } from '@/app/actions/projects'
import { updateChatTitle, deleteChat, removeChatFromProject } from '@/app/actions/chats'
import { renameCodeSession, deleteCodeSession } from '@/app/actions/code-sessions'
import { toast } from 'sonner'
import { MoreVertical, SlidersHorizontal } from 'lucide-react'
import { AddChatToProjectDialog } from '@/components/dashboard/add-chat-to-project-dialog'
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { SidebarCustomizeModal } from '@/components/dashboard/sidebar-customize-modal'
import { SIDEBAR_NAV_ITEMS, DEFAULT_VISIBLE_IDS } from '@/lib/sidebar/items'
import type { SidebarPreferences } from '@/lib/types'

const SIDEBAR_PROJECT_LIMIT = 5

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  activeView: ViewKey
  onViewChange: (view: ViewKey) => void
  activeTab: SidebarTab
  onTabChange: (tab: SidebarTab) => void
  projects: Project[]
  chats: Chat[]
  userEmail: string
  userName: string
  userPlan?: string
  onSignOut: () => void
  onProjectRenamed?: (id: string, name: string) => void
  onProjectDeleted?: (id: string) => void
  onProjectCreated?: (project: Project) => void
  onChatRenamed?: (id: string, title: string) => void
  onChatDeleted?: (id: string) => void
  onChatSelect?: (id: string) => void
  onNewChat?: () => void
  onNewSession?: () => void
  codeSessions?: CodeSession[]
  selectedSessionId?: string | null
  onSessionSelect?: (id: string) => void
  onSessionRenamed?: (id: string, title: string) => void
  onSessionDeleted?: (id: string) => void
  onChatProjectAdded?: (chatId: string, projectId: string) => void
  onChatProjectRemoved?: (chatId: string) => void
  onShowChatList?: () => void
  onOpenTaskDialog?: () => void
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
        'text-muted-foreground hover:bg-accent hover:text-white',
        focusRing,
        active && 'bg-accent text-white',
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
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const initials = parts.length >= 2
    ? (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
    : name.charAt(0).toUpperCase()
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
      {initials}
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
          aria-label={`Rename ${label}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitEdit}
          className="flex-1 min-w-0 bg-transparent text-sm outline-none border-b border-primary/60 pb-0.5"
        />
        <button onClick={commitEdit} aria-label="Confirm rename" className="shrink-0 text-emerald-400 hover:text-emerald-300 p-1">
          <Check className="h-3 w-3" />
        </button>
        <button onClick={() => setEditing(false)} aria-label="Cancel rename" className="shrink-0 text-muted-foreground hover:text-foreground p-1">
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'group/row flex items-center gap-1 w-full rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer',
        active && 'bg-accent/50 text-accent-foreground'
      )}
      onClick={onNavigate}
    >
      <Dot className="h-4 w-4 shrink-0 text-primary" />
      <span className="truncate flex-1 text-sm">{label}</span>
      <div className="flex items-center gap-0.5 shrink-0 ml-auto opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 transition-opacity">
        <button
          onClick={startEdit}
          className="h-5 w-5 flex items-center justify-center rounded hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Rename ${label}`}
        >
          <Pencil className="h-2.5 w-2.5" />
        </button>
        <button
          onClick={handleDelete}
          className="h-5 w-5 flex items-center justify-center rounded hover:bg-background/50 text-muted-foreground hover:text-destructive transition-colors"
          aria-label={`Delete ${label}`}
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  )
}

/* ── CodeSessionItem ──────────────────────────────────────────── */

interface CodeSessionItemProps {
  session: CodeSession
  active?: boolean
  onNavigate: () => void
  onSave: (title: string) => Promise<void>
  onDelete: () => Promise<void>
}

function CodeSessionItem({ session, active, onNavigate, onSave, onDelete }: CodeSessionItemProps) {
  const [renaming, setRenaming] = useState(false)
  const [value, setValue] = useState(session.title ?? 'New session')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleRename() {
    const trimmed = value.trim()
    if (!trimmed || trimmed === (session.title ?? 'New session')) {
      setRenaming(false)
      setValue(session.title ?? 'New session')
      return
    }
    try {
      await onSave(trimmed)
      setRenaming(false)
    } catch {
      toast.error('Failed to rename')
      setValue(session.title ?? 'New session')
    }
  }

  if (renaming) {
    return (
      <div className="flex items-center gap-1 px-2 py-1">
        <Code2 className="h-3 w-3 shrink-0 text-primary" />
        <input
          ref={inputRef}
          autoFocus
          aria-label={`Rename session`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename()
            if (e.key === 'Escape') { setRenaming(false); setValue(session.title ?? 'New session') }
          }}
          onBlur={handleRename}
          className="flex-1 min-w-0 bg-transparent text-sm outline-none border-b border-primary/60 pb-0.5"
        />
        <button onClick={handleRename} aria-label="Confirm rename" className="shrink-0 text-emerald-400 hover:text-emerald-300 p-1">
          <Check className="h-3 w-3" />
        </button>
        <button onClick={() => { setRenaming(false); setValue(session.title ?? 'New session') }} aria-label="Cancel" className="shrink-0 text-muted-foreground hover:text-foreground p-1">
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'group flex items-center gap-1 w-full rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer relative',
        active && 'bg-accent text-accent-foreground',
        focusRing
      )}
      onClick={onNavigate}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate() } }}
    >
      <Code2 className="h-3 w-3 shrink-0 text-primary" />
      <span className="truncate flex-1 text-sm">{session.title ?? 'New session'}</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'h-5 w-5 flex items-center justify-center rounded shrink-0 transition-colors',
              'opacity-0 group-hover:opacity-100 focus:opacity-100',
              'text-muted-foreground hover:bg-background/50 hover:text-foreground',
              focusRing
            )}
            aria-label={`Options for ${session.title ?? 'session'}`}
          >
            <MoreVertical className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="min-w-[140px]">
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setValue(session.title ?? 'New session'); setRenaming(true) }}
          >
            <Pencil className="h-3 w-3" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/* ── Drag-and-drop sub-components ─────────────────────────────── */

interface RecentChatItemProps {
  chat: Chat
  onNavigate: () => void
  onSave: (title: string) => Promise<void>
  onDelete: () => Promise<void>
  onPin: () => void
  isPinned?: boolean
  onUnpin?: () => void
  onAddToProject?: (chat: Chat) => void
  onRemoveFromProject?: (chat: Chat) => void
}

function RecentChatItem({ chat, onNavigate, onSave, onDelete, onPin, isPinned, onUnpin, onAddToProject, onRemoveFromProject }: RecentChatItemProps) {
  const [value, setValue] = useState(chat.title)
  const [renaming, setRenaming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleRename() {
    const trimmed = value.trim()
    if (!trimmed || trimmed === chat.title) {
      setRenaming(false)
      setValue(chat.title)
      return
    }
    try {
      await onSave(trimmed)
      setRenaming(false)
    } catch {
      toast.error('Failed to rename')
      setValue(chat.title)
    }
  }

  if (renaming) {
    return (
      <div className="flex items-center gap-1 px-2 py-1">
        <Dot className="h-4 w-4 shrink-0 text-primary" />
        <input
          ref={inputRef}
          autoFocus
          aria-label={`Rename ${chat.title}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename()
            if (e.key === 'Escape') { setRenaming(false); setValue(chat.title) }
          }}
          onBlur={handleRename}
          className="flex-1 min-w-0 bg-transparent text-sm outline-none border-b border-primary/60 pb-0.5"
        />
        <button onClick={handleRename} aria-label="Confirm rename" className="shrink-0 text-emerald-400 hover:text-emerald-300 p-1">
          <Check className="h-3 w-3" />
        </button>
        <button onClick={() => { setRenaming(false); setValue(chat.title) }} aria-label="Cancel rename" className="shrink-0 text-muted-foreground hover:text-foreground p-1">
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'group flex items-center gap-1 w-full rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer relative',
        focusRing
      )}
      onClick={onNavigate}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate() } }}
    >
      <Dot className="h-4 w-4 shrink-0 text-primary" />
      <span className="truncate flex-1 text-sm">{chat.title}</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'h-5 w-5 flex items-center justify-center rounded shrink-0 transition-colors',
              'opacity-0 group-hover:opacity-100 focus:opacity-100',
              'text-muted-foreground hover:bg-background/50 hover:text-foreground',
              focusRing
            )}
            aria-label={`Options for ${chat.title}`}
          >
            <MoreVertical className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="min-w-[160px]">
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              if (isPinned) { onUnpin?.(); toast.success('Chat unpinned') }
              else { onPin(); toast.success('Chat pinned') }
            }}
          >
            <Pin className="h-3 w-3" />
            {isPinned ? 'Unpin' : 'Pin'}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setValue(chat.title); setRenaming(true) }}
          >
            <Pencil className="h-3 w-3" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              if (chat.project_id) onRemoveFromProject?.(chat)
              else onAddToProject?.(chat)
            }}
          >
            <FolderOpen className="h-3 w-3" />
            {chat.project_id ? 'Remove from project' : 'Add to project'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

interface PinnedChatItemProps {
  chat: Chat
  onNavigate: () => void
  onUnpin: () => void
}

function PinnedChatItem({ chat, onNavigate, onUnpin }: PinnedChatItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'group relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer',
        focusRing
      )}
      onClick={onNavigate}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate() } }}
    >
      <Pin className="h-3 w-3 shrink-0 text-primary" />
      <span className="truncate flex-1 text-sm">{chat.title}</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'h-5 w-5 flex items-center justify-center rounded shrink-0 transition-colors',
              'opacity-0 group-hover:opacity-100 focus:opacity-100',
              'text-muted-foreground hover:bg-background/50 hover:text-foreground',
              focusRing
            )}
            aria-label={`Options for ${chat.title}`}
          >
            <MoreVertical className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="min-w-[160px]">
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onUnpin(); toast.success('Chat unpinned') }}
          >
            <X className="h-3 w-3" />
            Unpin
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function Sidebar({
  collapsed,
  onToggle,
  activeView,
  onViewChange,
  activeTab,
  onTabChange,
  projects,
  chats,
  userEmail,
  userName,
  userPlan = 'free',
  onSignOut,
  onProjectRenamed,
  onProjectDeleted,
  onProjectCreated,
  onChatRenamed,
  onChatDeleted,
  onChatSelect,
  onNewChat,
  onNewSession,
  codeSessions = [],
  selectedSessionId,
  onSessionSelect,
  onSessionRenamed,
  onSessionDeleted,
  onChatProjectAdded,
  onChatProjectRemoved,
  onShowChatList,
  onOpenTaskDialog,
  className,
}: SidebarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(true)
  const [chatsOpen, setChatsOpen] = useState(true)
  const [codeSessionsOpen, setCodeSessionsOpen] = useState(true)
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [pinnedChats, setPinnedChats] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem('xeref_pinned_chats')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isHydrated] = useState(true)
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false)
  const [selectedChatForProject, setSelectedChatForProject] = useState<Chat | null>(null)
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false)
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [sidebarPrefs, setSidebarPrefs] = useState<SidebarPreferences>({
    visible_tabs: DEFAULT_VISIBLE_IDS,
    order: DEFAULT_VISIBLE_IDS,
  })
  const pathname = usePathname()
  const router = useRouter()
  const isBuilderActive = pathname === '/builder'
  const isDesignActive = pathname === '/design'

  // Icon map for config-driven nav items (all already imported above)
  const ICON_MAP: Record<string, React.ReactNode> = {
    FolderOpen: <FolderOpen className="h-4 w-4" />,
    Settings: <Settings className="h-4 w-4" />,
    Box: <Box className="h-4 w-4" />,
    Paintbrush: <Paintbrush className="h-4 w-4" />,
    Mail: <Mail className="h-4 w-4" />,
    BookOpen: <BookOpen className="h-4 w-4" />,
    Brain: <Brain className="h-4 w-4" />,
    BarChart2: <BarChart2 className="h-4 w-4" />,
    CalendarDays: <CalendarDays className="h-4 w-4" />,
    GitFork: <GitFork className="h-4 w-4" />,
    BrainCircuit: <BrainCircuit className="h-4 w-4" />,
    Users: <Users className="h-4 w-4" />,
    Map: <Map className="h-4 w-4" />,
  }

  useEffect(() => {
    if (!isHydrated) return
    localStorage.setItem('xeref_pinned_chats', JSON.stringify(pinnedChats))
  }, [pinnedChats, isHydrated])

  useEffect(() => {
    fetch('/api/settings/sidebar')
      .then(r => r.ok ? r.json() : null)
      .then((prefs: SidebarPreferences | null) => {
        if (prefs) setSidebarPrefs(prefs)
      })
      .catch(() => {/* keep defaults */})
  }, [])

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
      <div className="flex items-center h-14 border-b shrink-0 px-3 gap-2">
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
                <PanelLeft className="h-5 w-5 absolute opacity-0 transition-opacity duration-150 group-hover:opacity-100 text-primary" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand Sidebar</TooltipContent>
          </Tooltip>
        ) : (
          <>
            <Link href="/" className="flex items-center gap-2 flex-1 min-w-0">
              <XerefLogo className="h-5 w-5 shrink-0" />
              <span className="font-semibold text-sm tracking-tight truncate">
                xeref<span className="text-primary">.ai</span>
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggle}
                  aria-label="Collapse sidebar"
                  className={cn(
                    'flex items-center justify-center h-7 w-7 rounded-lg transition-colors hover:bg-accent shrink-0',
                    focusRing
                  )}
                >
                  <PanelLeft className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Collapse Sidebar</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className={cn('fixed top-3 left-3 z-40 h-8 w-8', collapsed ? 'flex md:hidden' : 'hidden')}
        onClick={onToggle}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Three-tab icon strip */}
      {!collapsed && (
        <div
          role="tablist"
          aria-label="Sidebar sections"
          className="grid grid-cols-3 gap-1 px-2 py-1.5 border-b shrink-0"
        >
          {([
            { id: 'chat' as SidebarTab, icon: <MessageSquare className="h-4 w-4" />, label: 'Chat', shortcut: 'Ctrl+1', newItemShortcut: 'Ctrl+Shift+O' },
            { id: 'tasks' as SidebarTab, icon: <CheckSquare className="h-4 w-4" />, label: 'Tasks', shortcut: 'Ctrl+2', newItemShortcut: 'Ctrl+Shift+O' },
            { id: 'code' as SidebarTab, icon: <Code2 className="h-4 w-4" />, label: 'Code', shortcut: 'Ctrl+3', newItemShortcut: 'Ctrl+Shift+O' },
          ] as { id: SidebarTab; icon: React.ReactNode; label: string; shortcut: string; newItemShortcut: string }[]).map((tab) => {
            const isActive = activeTab === tab.id
            const btn = (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'group relative flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all duration-150 px-2 py-1.5',
                  isActive
                    ? 'text-white bg-accent'
                    : 'text-muted-foreground hover:text-white hover:bg-accent',
                  focusRing
                )}
              >
                {tab.icon}
                <span className={cn('whitespace-nowrap', !isActive && 'sr-only')}>{tab.label}</span>
              </button>
            )
            if (isActive) return btn
            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent side="bottom">
                  {tab.label} <kbd className="ml-1 text-[10px] opacity-60">{tab.shortcut}</kbd>
                  <div className="mt-1 text-[10px] opacity-50">New: {tab.newItemShortcut}</div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      )}

      {/* Nav — no outer scroll; only the Chats/Recents section scrolls */}
      <div className="flex flex-col flex-1 overflow-hidden p-2 min-h-0">

        {/* ── CHAT TAB ─────────────────────────────────────── */}
        {(collapsed || activeTab === 'chat') && (
          <>
            {/* Collapsed quick-nav icons — derived from sidebar prefs */}
            {collapsed && (
              <div className="flex flex-col gap-1 mb-1">
                <NavItem icon={<MessageSquare className="h-4 w-4" />} label="New Chat" active={activeView === 'chat'} collapsed={collapsed} onClick={() => onNewChat?.()} />
                {sidebarPrefs.order
                  .filter(id => sidebarPrefs.visible_tabs.includes(id))
                  .map(id => {
                    const item = SIDEBAR_NAV_ITEMS.find(i => i.id === id)
                    if (!item) return null
                    const isActive = item.viewKey
                      ? activeView === item.viewKey
                      : item.href === '/design' ? isDesignActive : pathname?.startsWith(item.href ?? '__') ?? false
                    return (
                      <NavItem
                        key={id}
                        icon={ICON_MAP[item.icon]}
                        label={item.label}
                        active={isActive}
                        collapsed={collapsed}
                        onClick={() => item.viewKey ? onViewChange(item.viewKey) : router.push(item.href!)}
                      />
                    )
                  })}
                <NavItem
                  icon={<SlidersHorizontal className="h-4 w-4" />}
                  label="Customize Sidebar"
                  collapsed={collapsed}
                  onClick={() => setCustomizeModalOpen(true)}
                />
              </div>
            )}

            {/* Config-driven nav items (expanded only) */}
            {!collapsed && (
              <div className="flex flex-col gap-1 mb-2">
                {/* New Chat — always first */}
                <div className="group relative">
                  <button
                    onClick={() => onNewChat?.()}
                    className={cn(
                      'flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      'text-muted-foreground hover:bg-accent hover:text-white',
                      focusRing
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4" />
                      New chat
                    </span>
                    <kbd className="hidden group-hover:block text-xs text-muted-foreground ml-auto">⌘⇧O</kbd>
                  </button>
                </div>

                {/* Visible items in user-defined order */}
                {sidebarPrefs.order
                  .filter(id => sidebarPrefs.visible_tabs.includes(id))
                  .map(id => {
                    const item = SIDEBAR_NAV_ITEMS.find(i => i.id === id)
                    if (!item) return null
                    const isActive = item.viewKey
                      ? activeView === item.viewKey
                      : item.href === '/design' ? isDesignActive : pathname?.startsWith(item.href ?? '__') ?? false
                    return (
                      <NavItem
                        key={id}
                        icon={ICON_MAP[item.icon]}
                        label={item.label}
                        active={isActive}
                        collapsed={false}
                        onClick={() => item.viewKey ? onViewChange(item.viewKey) : router.push(item.href!)}
                      />
                    )
                  })}

                {/* More section — hidden items */}
                {(() => {
                  const hiddenItems = SIDEBAR_NAV_ITEMS.filter(
                    item => !sidebarPrefs.visible_tabs.includes(item.id)
                  )
                  if (hiddenItems.length === 0) return null
                  return (
                    <div>
                      <button
                        onClick={() => setMoreOpen(o => !o)}
                        className={cn(
                          'flex items-center gap-2 w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors rounded-lg',
                          focusRing
                        )}
                      >
                        <ChevronDown className={cn('h-3 w-3 transition-transform duration-150', moreOpen && 'rotate-180')} />
                        More
                      </button>
                      {moreOpen && (
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          {hiddenItems.map(item => {
                            const isActive = item.viewKey
                              ? activeView === item.viewKey
                              : item.href === '/design' ? isDesignActive : pathname?.startsWith(item.href ?? '__') ?? false
                            return (
                              <NavItem
                                key={item.id}
                                icon={ICON_MAP[item.icon]}
                                label={item.label}
                                active={isActive}
                                collapsed={false}
                                onClick={() => item.viewKey ? onViewChange(item.viewKey) : router.push(item.href!)}
                              />
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Customize Sidebar button */}
                <button
                  onClick={() => setCustomizeModalOpen(true)}
                  className={cn(
                    'flex items-center gap-3 w-full rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                    'text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent/50',
                    focusRing
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Customize Sidebar
                </button>
              </div>
            )}

            {/* ── Pinned Chats + Recents section ── */}
            {!collapsed && isHydrated && (
              <div className="flex flex-col flex-1 mt-2 min-h-0">
                {/* Pinned section */}
                <div className="rounded-lg transition-all duration-150 shrink-0">
                  <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </p>
                  {pinnedChats.length === 0 ? (
                    <div className="mx-2 mb-1 px-2 py-2 rounded border border-dashed border-muted-foreground/20 text-xs text-muted-foreground/50 italic text-center">
                      Right-click a chat to pin it
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {pinnedChats
                        .map((id) => chats.find((c) => c.id === id))
                        .filter(Boolean)
                        .map((c) => (
                          <PinnedChatItem
                            key={c!.id}
                            chat={c!}
                            onNavigate={() => {
                              onChatSelect?.(c!.id)
                              onViewChange('chat')
                            }}
                            onUnpin={() =>
                              setPinnedChats((prev) =>
                                prev.filter((id) => id !== c!.id)
                              )
                            }
                          />
                        ))}
                    </div>
                  )}
                </div>

                {/* Recents section */}
                <div className="mt-auto pt-2 flex flex-col-reverse min-h-0">
                  <div
                    className={cn(
                      'group flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0 rounded-lg',
                      focusRing
                    )}
                  >
                    <button onClick={() => setChatsOpen((o) => !o)} className="flex items-center gap-1 flex-1 outline-none text-left">
                      Recents
                      <ChevronRight
                        className={cn(
                          'h-3 w-3 transition-transform duration-150',
                          chatsOpen && 'rotate-90'
                        )}
                      />
                    </button>
                    {chatsOpen && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (onShowChatList) { onShowChatList() } else { window.dispatchEvent(new CustomEvent('xeref_show_chat_list')) }
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/50 rounded p-0.5 text-muted-foreground hover:text-foreground"
                            aria-label="Chat history"
                          >
                            <List className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <kbd className="text-[10px] opacity-80">Ctrl+K</kbd>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  {chatsOpen && (
                    <div
                      className="mb-1 flex flex-col gap-0.5 min-h-0 overflow-y-auto max-h-[40vh]"
                    >
                      {chats.length > 0 ? (
                        chats.map((c) => (
                          <RecentChatItem
                            key={c.id}
                            chat={c}
                            isPinned={pinnedChats.includes(c.id)}
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
                            onPin={() =>
                              setPinnedChats((prev) =>
                                prev.includes(c.id)
                                  ? prev
                                  : [...prev, c.id]
                              )
                            }
                            onUnpin={() =>
                              setPinnedChats((prev) =>
                                prev.filter((id) => id !== c.id)
                              )
                            }
                            onAddToProject={(chat) => {
                              setSelectedChatForProject(chat)
                              setAddProjectDialogOpen(true)
                            }}
                            onRemoveFromProject={async (chat) => {
                              await removeChatFromProject(chat.id)
                              onChatProjectRemoved?.(chat.id)
                              toast.success('Chat removed from project')
                            }}
                          />
                        ))
                      ) : (
                        <p className="px-3 py-2 text-xs text-muted-foreground/60 italic">
                          No recent chats
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── TASKS TAB ────────────────────────────────────── */}
        {!collapsed && activeTab === 'tasks' && (
          <>
            {/* New Task Button */}
            <div className="mb-2">
              <div className="group relative">
                <button
                  onClick={() => {
                    onViewChange('tasks')
                    if (onOpenTaskDialog) onOpenTaskDialog()
                    else setTimeout(() => window.dispatchEvent(new CustomEvent('xeref_open_task_dialog')), 0)
                  }}
                  className={cn(
                    'flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    focusRing
                  )}
                >
                  <span className="flex items-center gap-3">
                    <CheckSquare className="h-4 w-4" />
                    New task
                  </span>
                  <kbd className="hidden group-hover:block text-xs text-muted-foreground ml-auto">⌘⇧O</kbd>
                </button>
              </div>
            </div>

            {/* Projects section */}
            <div className="mt-2">
              <button
                onClick={() => setProjectsOpen((o) => !o)}
                aria-expanded={projectsOpen}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors shrink-0',
                  focusRing
                )}
              >
                <span className="flex items-center gap-1">
                  Projects
                  <ChevronRight
                    className={cn(
                      'h-3 w-3 transition-transform duration-150',
                      projectsOpen && 'rotate-90'
                    )}
                  />
                </span>
                <FolderOpen className="h-3 w-3" />
              </button>
              {projectsOpen && (
                <div className="flex flex-col gap-0.5 mt-1">
                  {projects.slice(0, SIDEBAR_PROJECT_LIMIT).map((project) => (
                    <InlineEditRow
                      key={project.id}
                      label={project.name}
                      active={false}
                      onNavigate={() => onViewChange('home')}
                      onSave={async (name) => {
                        await renameProject(project.id, name)
                        onProjectRenamed?.(project.id, name)
                      }}
                      onDelete={async () => {
                        await deleteProject(project.id)
                        onProjectDeleted?.(project.id)
                        toast.success('Project deleted')
                      }}
                    />
                  ))}
                  
                  {/* Creation row */}
                  <div
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-colors cursor-pointer"
                    onClick={() => setCreateProjectDialogOpen(true)}
                  >
                    <div className="flex items-center justify-center h-4 w-4 rounded-full border border-dashed border-muted-foreground/40 group-hover:border-primary transition-colors">
                      <X className="h-2.5 w-2.5 rotate-45" />
                    </div>
                    <span>New Project</span>
                  </div>

                  {projects.length > SIDEBAR_PROJECT_LIMIT && (
                    <button
                      onClick={() => onViewChange('home')}
                      className="px-8 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                    >
                      View all...
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Projects view nav item */}
            <div className="mt-2">
              <NavItem
                icon={<Layers className="h-4 w-4" />}
                label="All Projects"
                active={activeView === 'projects'}
                collapsed={collapsed}
                onClick={() => onViewChange('projects')}
              />
            </div>

            {/* Deploy nav item */}
            <div className="mt-1">
              <NavItem
                icon={<Send className="h-4 w-4" />}
                label="Deploy"
                active={activeView === 'deploy'}
                collapsed={collapsed}
                onClick={() => onViewChange('deploy')}
              />
            </div>

            {/* Memory nav item */}
            <div className="mt-1">
              <NavItem
                icon={<Brain className="h-4 w-4" />}
                label="Memory"
                active={activeView === 'memory'}
                collapsed={collapsed}
                onClick={() => onViewChange('memory')}
              />
            </div>

            {/* Advanced section */}
            <div className="mt-1">
              {!collapsed && (
                <button
                  onClick={() => setAdvancedOpen((o) => !o)}
                  aria-expanded={advancedOpen}
                  aria-controls="advanced-nav-section"
                  className={cn(
                    'flex items-center gap-1.5 w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors',
                    focusRing
                  )}
                >
                  Advanced
                  <ChevronDown className={cn('h-3 w-3 transition-transform duration-200', !advancedOpen && '-rotate-90')} />
                </button>
              )}
              {advancedOpen && (
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
          </>
        )}

        {/* ── CODE TAB ─────────────────────────────────────── */}
        {!collapsed && activeTab === 'code' && (
          <div className="flex flex-col gap-4 mt-1">
            {/* New Session Button */}
            <div>
              <div className="group relative">
                <button
                  onClick={() => onNewSession?.()}
                  className={cn(
                    'flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    focusRing
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Code2 className="h-4 w-4" />
                    New session
                  </span>
                  <kbd className="hidden group-hover:block text-xs text-muted-foreground ml-auto">⌘⇧O</kbd>
                </button>
              </div>
            </div>

            {/* Artifacts */}
            <div>
              <Link
                href="/artifacts"
                className={cn(
                  'flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  focusRing
                )}
              >
                <Layers className="h-4 w-4" />
                Artifacts
              </Link>
            </div>

            {/* Routines */}
            <div>
              <button
                onClick={() => onViewChange('code_routines')}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors',
                  focusRing
                )}
              >
                <Zap className="h-3 w-3" />
                Routines
              </button>
            </div>

            {/* Customize */}
            <div>
              <button
                onClick={() => onViewChange('customize')}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors',
                  focusRing
                )}
              >
                <Settings className="h-3 w-3" />
                Customize
              </button>
            </div>

            <div>
              <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                AI Agents
              </p>
              <div className="flex flex-col gap-1 mt-1">
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
                <NavItem
                  icon={<BrainCircuit className="h-4 w-4" />}
                  label="Xeref Agents"
                  active={activeView === 'agents'}
                  collapsed={collapsed}
                  onClick={() => onViewChange('agents')}
                />
              </div>
            </div>

            {/* ── Session History section ── */}
            <div className="mt-4 flex flex-col flex-1 min-h-0">
              <div
                className={cn(
                  'group flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0 rounded-lg',
                  focusRing
                )}
              >
                <button onClick={() => setCodeSessionsOpen((o) => !o)} className="flex items-center gap-1 flex-1 outline-none text-left">
                  History
                  <ChevronRight
                    className={cn(
                      'h-3 w-3 transition-transform duration-150',
                      codeSessionsOpen && 'rotate-90'
                    )}
                  />
                </button>
              </div>
              {codeSessionsOpen && (
                <div className="mt-1 flex flex-col gap-0.5 min-h-0 overflow-y-auto max-h-[40vh]">
                  {codeSessions.length === 0 ? (
                    <div className="mx-2 mb-1 px-2 py-2 rounded border border-dashed border-muted-foreground/20 text-xs text-muted-foreground/50 italic text-center">
                      No sessions yet
                    </div>
                  ) : (
                    codeSessions.map((s) => (
                      <CodeSessionItem
                        key={s.id}
                        session={s}
                        active={s.id === selectedSessionId}
                        onNavigate={() => onSessionSelect?.(s.id)}
                        onSave={async (title) => {
                          await renameCodeSession(s.id, title)
                          onSessionRenamed?.(s.id, title)
                        }}
                        onDelete={async () => {
                          await deleteCodeSession(s.id)
                          onSessionDeleted?.(s.id)
                          toast.success('Session deleted')
                        }}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

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
        {!collapsed && userPlan === 'free' && (
          <Link
            href="/pricing"
            className="mx-2 mb-2 flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <Zap className="h-3 w-3" />
            Upgrade to Pro
          </Link>
        )}
      </div>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={createProjectDialogOpen}
        onOpenChange={setCreateProjectDialogOpen}
        onProjectCreated={(project) => {
          onProjectCreated?.(project)
          // goals are stored by the server action; ProjectCard fetches them on mount
        }}
      />

      {/* Add Chat to Project Dialog */}
      <AddChatToProjectDialog
        open={addProjectDialogOpen}
        onOpenChange={setAddProjectDialogOpen}
        chat={selectedChatForProject}
        projects={projects}
        onProjectAdded={(chatId, projectId) => {
          onChatProjectAdded?.(chatId, projectId)
        }}
      />

      {/* Sidebar Customize Modal */}
      <SidebarCustomizeModal
        open={customizeModalOpen}
        onOpenChange={setCustomizeModalOpen}
        current={sidebarPrefs}
        onSave={async (prefs) => {
          const res = await fetch('/api/settings/sidebar', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prefs),
          })
          if (res.ok) {
            const saved = await res.json() as SidebarPreferences
            setSidebarPrefs(saved)
            toast.success('Sidebar saved')
          } else {
            const msg = (await res.json().catch(() => ({}))).error ?? 'unknown'
            toast.error(`Failed to save sidebar: ${msg}`)
          }
        }}
      />
    </aside>
  )
}
