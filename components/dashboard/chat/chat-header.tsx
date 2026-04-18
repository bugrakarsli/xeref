'use client'

import { useEffect } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SquarePen } from 'lucide-react'

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
