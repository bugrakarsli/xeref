'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import type { Project, Chat, ViewKey, SidebarTab } from '@/lib/types'
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
  Mail,
  Bot,
  BrainCircuit,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
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
  GripVertical,
} from 'lucide-react'

import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { renameProject, deleteProject, saveProject } from '@/app/actions/projects'
import { updateChatTitle, deleteChat } from '@/app/actions/chats'
import { toast } from 'sonner'

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

/* ── Drag-and-drop sub-components ─────────────────────────────── */

interface DraggableRecentItemProps {
  chat: Chat
  onNavigate: () => void
  onSave: (title: string) => Promise<void>
  onDelete: () => Promise<void>
}

function DraggableRecentItem({ chat, onNavigate, onSave, onDelete }: DraggableRecentItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: chat.id,
    data: { chatId: chat.id },
  })
  return (
    <div
      ref={setNodeRef}
      className={cn('relative group/draggable', isDragging && 'opacity-40')}
      style={transform ? { transform: CSS.Transform.toString(transform) } : undefined}
    >
      {/* Grip handle — appears on row hover */}
      <button
        {...listeners}
        {...attributes}
        tabIndex={-1}
        aria-label="Drag to pin"
        className="absolute left-0.5 top-1/2 -translate-y-1/2 z-10 h-5 w-4 flex items-center justify-center opacity-0 group-hover/draggable:opacity-50 cursor-grab active:cursor-grabbing text-muted-foreground"
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <InlineEditRow
        label={chat.title}
        active={false}
        onNavigate={onNavigate}
        onSave={onSave}
        onDelete={onDelete}
      />
    </div>
  )
}

interface PinnedChatItemProps {
  chat: Chat
  onNavigate: () => void
  onUnpin: () => void
}

function PinnedChatItem({ chat, onNavigate, onUnpin }: PinnedChatItemProps) {
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!ctx) return
    const close = () => setCtx(null)
    window.addEventListener('click', close)
    window.addEventListener('keydown', close)
    return () => { window.removeEventListener('click', close); window.removeEventListener('keydown', close) }
  }, [ctx])

  return (
    <>
      <div
        onClick={onNavigate}
        onContextMenu={(e) => { e.preventDefault(); setCtx({ x: e.clientX, y: e.clientY }) }}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
      >
        <Pin className="h-3 w-3 shrink-0 text-primary" />
        <span className="truncate flex-1 text-sm">{chat.title}</span>
      </div>
      {ctx && (
        <div
          className="fixed z-50 min-w-[120px] rounded-md border bg-popover text-popover-foreground shadow-md py-1"
          style={{ left: ctx.x, top: ctx.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { onUnpin(); setCtx(null) }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Unpin
          </button>
        </div>
      )}
    </>
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
  className,
}: SidebarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(true)
  const [chatsOpen, setChatsOpen] = useState(true)
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [pinnedChats, setPinnedChats] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem('xeref_pinned_chats') ?? '[]') } catch { return [] }
  })
  const pathname = usePathname()
  const isBuilderActive = pathname === '/builder'

  // Persist pinned chats to localStorage
  useEffect(() => {
    localStorage.setItem('xeref_pinned_chats', JSON.stringify(pinnedChats))
  }, [pinnedChats])

  // Drop zone for Pinned section
  const { setNodeRef: setPinnedRef, isOver: isPinnedOver } = useDroppable({ id: 'pinned-zone' })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over?.id === 'pinned-zone') {
      const chatId = active.id as string
      setPinnedChats((prev) => prev.includes(chatId) ? prev : [...prev, chatId])
    }
  }

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

      {/* Three-tab icon strip */}
      {!collapsed && (
        <div
          role="tablist"
          aria-label="Sidebar sections"
          className="flex items-center gap-1 px-2 py-1.5 border-b shrink-0"
        >
          {([
            { id: 'chat' as SidebarTab, icon: <MessageSquare className="h-4 w-4" />, label: 'Chat', shortcut: 'Ctrl+1' },
            { id: 'tasks' as SidebarTab, icon: <CheckSquare className="h-4 w-4" />, label: 'Tasks', shortcut: 'Ctrl+2' },
            { id: 'code' as SidebarTab, icon: <Code2 className="h-4 w-4" />, label: 'Code', shortcut: 'Ctrl+3' },
          ] as { id: SidebarTab; icon: React.ReactNode; label: string; shortcut: string }[]).map((tab) => {
            const isActive = activeTab === tab.id
            const btn = (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md text-xs font-medium transition-all duration-150 px-2 py-1.5',
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                  focusRing
                )}
              >
                {tab.icon}
                {isActive && <span className="whitespace-nowrap">{tab.label}</span>}
              </button>
            )
            if (isActive) return btn
            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent side="bottom">
                  {tab.label} <kbd className="ml-1 text-[10px] opacity-60">{tab.shortcut}</kbd>
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
            {/* Home always visible */}
            <NavItem
              icon={<Home className="h-4 w-4" />}
              label="Home"
              active={activeView === 'home'}
              collapsed={collapsed}
              onClick={() => onViewChange('home')}
            />

            <NavItem
              icon={<Mail className="h-4 w-4" />}
              label="Inbox"
              active={activeView === 'inbox'}
              collapsed={collapsed}
              onClick={() => onViewChange('inbox')}
            />

            {/* ── DnD: Pinned drop zone + Recents draggable list ── */}
            {!collapsed && (
              <DndContext onDragEnd={handleDragEnd}>
                {/* Pinned drop zone */}
                <div
                  ref={setPinnedRef}
                  className={cn(
                    'mt-2 rounded-lg transition-all duration-150',
                    isPinnedOver && 'ring-2 ring-primary/40 bg-primary/5'
                  )}
                >
                  <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </p>
                  {pinnedChats.length === 0 ? (
                    <div className={cn(
                      'mx-2 mb-1 px-2 py-2 rounded border border-dashed border-muted-foreground/20 text-xs text-muted-foreground/50 italic text-center transition-colors',
                      isPinnedOver && 'border-primary/50 text-primary/70 bg-primary/5'
                    )}>
                      Drag to pin
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
                            onNavigate={() => { onChatSelect?.(c!.id); onViewChange('chat') }}
                            onUnpin={() => setPinnedChats((prev) => prev.filter((id) => id !== c!.id))}
                          />
                        ))}
                    </div>
                  )}
                </div>

                {/* Recents — draggable items, isolated scroll */}
                <div className="mt-2">
                  <button
                    onClick={() => setChatsOpen((o) => !o)}
                    aria-expanded={chatsOpen}
                    className={cn(
                      'flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors shrink-0',
                      focusRing
                    )}
                  >
                    <span className="flex items-center gap-1">
                      Recents
                      <ChevronRight
                        className={cn('h-3 w-3 transition-transform duration-150', chatsOpen && 'rotate-90')}
                      />
                    </span>
                  </button>
                  {chatsOpen && (
                    <div
                      className="mt-1 flex flex-col gap-0.5"
                      style={{ overflowY: 'auto', maxHeight: '40vh' }}
                    >
                      {chats.length > 0 ? (
                        chats.map((c) => (
                          <DraggableRecentItem
                            key={c.id}
                            chat={c}
                            onNavigate={() => { onChatSelect?.(c.id); onViewChange('chat') }}
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
                        ))
                      ) : (
                        <p className="px-3 py-2 text-xs text-muted-foreground/60 italic">No recent chats</p>
                      )}
                    </div>
                  )}
                </div>
              </DndContext>
            )}
          </>
        )}

        {/* ── TASKS TAB ────────────────────────────────────── */}
        {!collapsed && activeTab === 'tasks' && (
          <>
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
                      active={activeView === 'home' && pathname === `/builder?project=${project.id}`}
                      onNavigate={() => {
                        window.history.pushState({}, '', `/builder?project=${project.id}`)
                        onViewChange('home')
                      }}
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
                    onClick={async () => {
                      try {
                        const newProj = await saveProject('New Project', [])
                        onProjectCreated?.(newProj)
                        toast.success('Project created')
                      } catch (err) {
                        toast.error('Failed to create project')
                      }
                    }}
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

            {/* Advanced section */}
            <div className="mt-1">
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

            <div className="mt-2">
              <NavItem
                icon={<CheckSquare className="h-4 w-4" />}
                label="Tasks"
                active={activeView === 'tasks'}
                collapsed={collapsed}
                onClick={() => onViewChange('tasks')}
              />
            </div>
          </>
        )}

        {/* ── CODE TAB ─────────────────────────────────────── */}
        {!collapsed && activeTab === 'code' && (
          <div className="flex flex-col gap-4 mt-1">
            <div>
              <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Workspaces
              </p>
              <div className="flex flex-col gap-0.5 mt-1">
                {[
                  'portfolio',
                  'xeref-claw',
                  'XerefWhisper-desktop',
                ].map((ws) => (
                  <div
                    key={ws}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    <FolderOpen className="h-4 w-4 shrink-0" />
                    <span className="truncate">{ws}</span>
                  </div>
                ))}
              </div>
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
          </div>
        )}

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
