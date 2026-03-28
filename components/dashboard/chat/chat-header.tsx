'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SquarePen, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatHeaderProps {
  activeTab: 'chat' | 'tasks'
  onTabChange: (tab: 'chat' | 'tasks') => void
  onNewChat: () => void
  onShowList: () => void
  showingList: boolean
  agentName?: string
}

export function ChatHeader({
  activeTab,
  onTabChange,
  onNewChat,
  onShowList,
  showingList,
  agentName,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-4 h-14 border-b shrink-0">
      {/* Chat/Tasks toggle */}
      <div className="flex items-center gap-1 bg-muted rounded-full p-1 text-sm">
        <button
          onClick={() => onTabChange('chat')}
          className={cn(
            'px-4 py-1 rounded-full text-xs font-medium transition-colors',
            activeTab === 'chat'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          chat
        </button>
        <button
          onClick={() => onTabChange('tasks')}
          className={cn(
            'px-4 py-1 rounded-full text-xs font-medium transition-colors',
            activeTab === 'tasks'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          tasks
        </button>
      </div>

      {/* Agent name */}
      {agentName && activeTab === 'chat' && (
        <span className="text-xs text-muted-foreground truncate hidden sm:block">
          — {agentName}
        </span>
      )}

      <div className="ml-auto flex items-center gap-1">
        {/* Chat list toggle */}
        {activeTab === 'chat' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onShowList}
                aria-label="Show chat history"
                className={cn(
                  'flex items-center justify-center h-8 w-8 rounded-lg transition-colors hover:bg-accent',
                  showingList && 'bg-accent text-accent-foreground'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Chat History</TooltipContent>
          </Tooltip>
        )}

        {/* New Chat */}
        {activeTab === 'chat' && (
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
        )}
      </div>
    </div>
  )
}
