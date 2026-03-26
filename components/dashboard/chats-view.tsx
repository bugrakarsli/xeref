'use client'

import { MessageSquare, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ChatsView() {
  return (
    <section aria-label="Chats" className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Chats</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Chat with your AI agents. Streaming responses with source citations coming soon.
        </p>
      </div>

      {/* Message area */}
      <div className="flex flex-col items-center justify-center flex-1 gap-3 p-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <MessageSquare className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Start a conversation</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Chat with your AI agents here. Streaming responses with source citations coming soon.
        </p>
      </div>

      {/* Input bar */}
      <div className="px-6 py-4 border-t shrink-0">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            placeholder="Type a message..."
            className="flex-1"
            disabled
          />
          <Button size="icon" disabled>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
