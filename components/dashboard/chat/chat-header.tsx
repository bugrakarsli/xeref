'use client'

import { useEffect } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SquarePen, Search } from 'lucide-react'

interface ChatHeaderProps {
  onNewChat: () => void
  agentName?: string
}

export function ChatHeader({ onNewChat, agentName }: ChatHeaderProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('xeref_show_chat_list', { detail: { focusSearch: true } }))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex items-center gap-2 px-4 h-14 border-b shrink-0">
      {/* Agent name */}
      {agentName && (
        <span className="text-xs text-muted-foreground truncate hidden sm:block">
          {agentName}
        </span>
      )}

      <div className="ml-auto flex items-center gap-1">
        {/* Search */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('xeref_show_chat_list', { detail: { focusSearch: true } }))}
              aria-label="Search chats"
              className="flex items-center justify-center h-8 w-8 rounded-lg transition-colors hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Search chats <kbd className="ml-1 text-[10px] opacity-60">Ctrl+K</kbd>
          </TooltipContent>
        </Tooltip>

        {/* New Chat */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onNewChat}
              aria-label="New Chat"
              className="flex items-center justify-center h-8 w-8 rounded-lg transition-colors hover:bg-accent"
            >
              <SquarePen className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">New Chat</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
