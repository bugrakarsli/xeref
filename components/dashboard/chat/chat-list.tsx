'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import { MessageSquare, Trash2, Search, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { deleteChat } from '@/app/actions/chats'
import type { Chat } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ChatListProps {
  chats: Chat[]
  activeChatId: string | null
  onSelectChat: (chat: Chat) => void
  onDeleteChat: (chatId: string) => void
  onNewChat: () => void
  initialFocusSearch?: boolean
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ChatListItem({
  chat,
  active,
  onSelect,
  onDelete,
}: {
  chat: Chat
  active: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [isHovered, setIsHovered] = useState(false)

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    startTransition(async () => {
      try {
        await deleteChat(chat.id)
        onDelete()
      } catch {
        toast.error('Failed to delete chat.')
      }
    })
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect() }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer',
        'hover:bg-accent',
        active && 'bg-accent'
      )}
    >
      <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{chat.title}</p>
        <p className="text-xs text-muted-foreground">{formatRelativeTime(chat.updated_at)}</p>
      </div>
      {(isHovered || active) && (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="shrink-0 p-1 rounded hover:text-destructive text-muted-foreground transition-colors"
          aria-label="Delete chat"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export function ChatList({ chats, activeChatId, onSelectChat, onDeleteChat, onNewChat, initialFocusSearch = false }: ChatListProps) {
  const [searchExpanded, setSearchExpanded] = useState(initialFocusSearch)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredChats = searchQuery.trim()
    ? chats.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats

  useEffect(() => {
    if (searchExpanded) {
      searchInputRef.current?.focus()
    }
  }, [searchExpanded])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setSearchExpanded(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header — matches image-2 */}
      <div className="flex items-center gap-3 px-5 h-14 border-b shrink-0">
        <h2 className="text-xl font-semibold">Chats</h2>

        <div className="ml-auto flex items-center gap-2">
          {/* Search: expanded = input + X, collapsed = icon only (image-3) */}
          {searchExpanded ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/60 bg-background focus-within:border-primary transition-colors">
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter chats"
                className="bg-transparent text-sm outline-none w-32"
              />
              <button
                onClick={() => {
                  setSearchExpanded(false)
                  setSearchQuery('')
                }}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSearchExpanded(true)}
                  className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Search chats"
                >
                  <Search className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Search chats <kbd className="ml-1 text-[10px] opacity-60">Ctrl+K</kbd>
              </TooltipContent>
            </Tooltip>
          )}

          <button
            onClick={onNewChat}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border hover:bg-accent transition-colors whitespace-nowrap"
          >
            New chat
          </button>
        </div>
      </div>

      {/* List body */}
      {filteredChats.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 p-8 text-center">
          {searchQuery ? (
            <>
              <div className="rounded-full bg-muted p-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No chats found</p>
              <p className="text-xs text-muted-foreground">Try a different search term</p>
            </>
          ) : (
            <>
              <div className="rounded-full bg-muted p-4">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No chats yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Start a new conversation with one of your activated agents.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-y-auto p-3 gap-1 min-h-0">
          {filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              active={activeChatId === chat.id}
              onSelect={() => onSelectChat(chat)}
              onDelete={() => onDeleteChat(chat.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
