'use client'

import { useState } from 'react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { MessageSquare, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteChat } from '@/app/actions/chats'
import type { Chat } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ChatListProps {
  chats: Chat[]
  activeChatId: string | null
  onSelectChat: (chat: Chat) => void
  onDeleteChat: (chatId: string) => void
  onNewChat: () => void
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

export function ChatList({ chats, activeChatId, onSelectChat, onDeleteChat, onNewChat }: ChatListProps) {
  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 p-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <MessageSquare className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No chats yet</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Start a new conversation with one of your activated agents.
        </p>
        <Button size="sm" variant="outline" onClick={onNewChat} className="mt-1 gap-2">
          <Plus className="h-3.5 w-3.5" />
          New Chat
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto p-3 gap-1 min-h-0">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          active={activeChatId === chat.id}
          onSelect={() => onSelectChat(chat)}
          onDelete={() => onDeleteChat(chat.id)}
        />
      ))}
    </div>
  )
}
