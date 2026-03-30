'use client'

import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport } from 'ai'
import { useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './chat-message'
import { ChatInput, type ModelId, type UserPlan, MODELS } from './chat-input'
import { saveMessage } from '@/app/actions/chats'
import type { Project, Chat, Message } from '@/lib/types'
import { Bot } from 'lucide-react'

interface ChatInterfaceProps {
  projects: Project[]
  selectedProject: Project | null
  onProjectSelect: (project: Project | null) => void
  activeChat: Chat | null
  initialMessages: Message[]
  userName: string
  userPlan?: 'free' | 'pro' | 'ultra'
}

function getMessageText(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((p) => p.type === 'text' && p.text)
    .map((p) => p.text as string)
    .join('')
}

export function ChatInterface({
  projects,
  selectedProject,
  onProjectSelect,
  activeChat,
  initialMessages,
  userName,
  userPlan = 'free',
}: ChatInterfaceProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState<ModelId>(() => {
    const planRank: Record<string, number> = { free: 0, pro: 1, ultra: 2 }
    const rank = planRank[userPlan] ?? 0
    const best = [...MODELS].reverse().find((m) => planRank[m.plan] <= rank)
    return best?.id ?? 'claude-haiku-4-5-20251001'
  })
  const activeChatIdRef = useRef<string | null>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new TextStreamChatTransport({
      api: '/api/chat',
      body: { projectId: selectedProject?.id ?? null },
    }),
    onFinish: async ({ messages: allMessages }) => {
      const chatId = activeChatIdRef.current
      if (!chatId) return
      const lastMsg = allMessages[allMessages.length - 1]
      if (lastMsg?.role === 'assistant') {
        const text = getMessageText(lastMsg.parts as { type: string; text?: string }[])
        if (text) {
          try {
            await saveMessage(chatId, 'assistant', text)
          } catch {
            // non-critical
          }
        }
      }
    },
  })

  // Keep ref in sync with prop
  useEffect(() => {
    activeChatIdRef.current = activeChat?.id ?? null
  }, [activeChat?.id])

  // Load existing messages when active chat changes
  useEffect(() => {
    setMessages(
      initialMessages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        parts: [{ type: 'text' as const, text: m.content }],
        metadata: {},
      }))
    )
  }, [activeChat?.id])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isLoading = status === 'streaming' || status === 'submitted'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const text = input
    setInput('')

    // Persist user message
    if (activeChat) {
      try {
        await saveMessage(activeChat.id, 'user', text)
      } catch {
        // non-critical
      }
    }

    await sendMessage({ text }, { body: { model: selectedModel } })
  }

  const hasActivatedAgents = projects.some((p) => p.prompt)

  const renderedMessages = messages.map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: getMessageText(m.parts as { type: string; text?: string }[]),
  }))

  if (messages.length === 0) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
          {selectedProject ? (
            <>
              <div className="rounded-full bg-primary/10 p-4">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-base font-semibold">
                  Ask {selectedProject.name} anything
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Powered by {selectedProject.selected_feature_ids.length} features · {MODELS.find((m) => m.id === selectedModel)?.label ?? 'Sonnet 4.6'}
                </p>
              </div>
            </>
          ) : hasActivatedAgents ? (
            <>
              <div className="rounded-full bg-muted p-4">
                <Bot className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Select an agent to start chatting</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose an agent from the selector below
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-full bg-muted p-4">
                <Bot className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">No activated agents yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Go to Home and click &quot;Add Prompt&quot; on your saved agents to activate them.
                </p>
              </div>
            </>
          )}
        </div>
        <ChatInput
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          projects={projects}
          selectedProject={selectedProject}
          onProjectSelect={onProjectSelect}
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
          userPlan={userPlan}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ScrollArea className="flex-1 min-h-0">
        <div className="py-4">
          {renderedMessages.map((message, i) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              isStreaming={isLoading && i === renderedMessages.length - 1 && message.role === 'assistant'}
              userName={userName}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        projects={projects}
        selectedProject={selectedProject}
        onProjectSelect={onProjectSelect}
        selectedModel={selectedModel}
        onModelSelect={setSelectedModel}
        userPlan={userPlan}
      />
    </div>
  )
}
