'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useEffect, useRef, useState, useCallback } from 'react'
import { ChatMessage } from './chat-message'
import { toast } from 'sonner'
import { ChatInput, type ChatInputHandle, type ModelId, type AgentSelection, MODELS } from './chat-input'
import { saveMessage, createChat } from '@/app/actions/chats'
import { uploadChatAttachment } from '@/app/actions/upload'
import type { Project, Chat, Message, ChatAttachment } from '@/lib/types'
import { SYSTEM_AGENTS } from '@/lib/system-agents'
import { Bot, ArrowDown } from 'lucide-react'

function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts) return ''
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map(p => p.text)
    .join('')
}

interface ChatInterfaceProps {
  projects: Project[]
  selectedAgent: AgentSelection
  onAgentSelect: (agent: AgentSelection) => void
  activeChat: Chat | null
  onChatCreated: (chat: Chat) => void
  initialMessages: Message[]
  userName: string
  userPlan?: 'free' | 'pro' | 'ultra'
}

export function ChatInterface({
  projects,
  selectedAgent,
  onAgentSelect,
  activeChat,
  onChatCreated,
  initialMessages,
  userName,
  userPlan = 'free',
}: ChatInterfaceProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<ChatInputHandle>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState<ModelId>('xeref-free')
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const activeChatIdRef = useRef<string | null>(null)

  // Restore persisted model on mount.
  // If a previously-saved model is no longer on the user's plan, fall back to xeref-free.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('xeref_selected_model')
      if (saved && MODELS.find((m) => m.id === saved)) {
        const savedModel = saved as ModelId
        // Haiku moved from free→pro; reset free users who had it saved
        if (savedModel === 'claude-haiku-4-5-20251001' && userPlan === 'free') {
          setSelectedModel('xeref-free')
        } else {
          setSelectedModel(savedModel)
        }
      }
    } catch {}
  }, [])

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: (err) => {
      toast.error(err.message || 'Failed to get a response. Check your API key or try again.')
    },
    onFinish: async ({ message }) => {
      const chatId = activeChatIdRef.current
      if (message.role === 'assistant') {
        const text = getMessageText(message)
        if (!text?.trim()) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === message.id
                ? { ...m, parts: [{ type: 'text' as const, text: "I wasn't able to generate a response. Please try again." }] }
                : m
            )
          )
          return
        }
        if (!chatId) return
        try {
          await saveMessage(chatId, 'assistant', text)
        } catch {
          // non-critical
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
      }))
    )
  }, [activeChat?.id, initialMessages, setMessages])

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Auto-scroll to bottom on new messages (only when already near bottom)
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distanceFromBottom < 120) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  // Show/hide scroll-to-bottom button
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    function onScroll() {
      const distanceFromBottom = el!.scrollHeight - el!.scrollTop - el!.clientHeight
      setShowScrollButton(distanceFromBottom > 120)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    // Check immediately in case content overflows on mount
    onScroll()
    return () => el.removeEventListener('scroll', onScroll)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isLoading = status === 'streaming' || status === 'submitted'

  async function handleFileSelect(files: FileList) {
    const toUpload = Array.from(files)
    const uploading = toast.loading(`Uploading ${toUpload.length > 1 ? `${toUpload.length} files` : toUpload[0].name}…`)

    const results: ChatAttachment[] = []
    for (const file of toUpload) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const att = await uploadChatAttachment(formData)
        results.push(att)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Failed to upload ${file.name}`)
      }
    }

    toast.dismiss(uploading)
    if (results.length > 0) {
      setAttachments((prev) => [...prev, ...results])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if ((!input.trim() && attachments.length === 0) || isLoading) return

    const text = input.trim()
    setInput('')
    const currentAttachments = attachments
    setAttachments([])

    // Handle slash commands for model selection
    if (text.startsWith('/model ')) {
      const commandArgs = text.split(' ').slice(1)
      if (commandArgs[0] === 'opusplan') {
        if (userPlan === 'ultra') {
          setSelectedModel('opus-plan')
          try { localStorage.setItem('xeref_selected_model', 'opus-plan') } catch {}
          toast.success('Switched to Opus Plan Mode.')
        } else {
          toast.error('Opus Plan Mode requires an ULTRA plan.')
        }
      } else {
        const matchingModel = MODELS.find(m => m.id.includes(commandArgs[0]) || m.label.toLowerCase().includes(commandArgs[0].toLowerCase()))
        if (matchingModel) {
          const planRank: Record<string, number> = { free: 0, pro: 1, ultra: 2 }
          if (planRank[userPlan] >= planRank[matchingModel.plan]) {
            setSelectedModel(matchingModel.id)
            try { localStorage.setItem('xeref_selected_model', matchingModel.id) } catch {}
            toast.success(`Switched to ${matchingModel.label}.`)
          } else {
            toast.error(`${matchingModel.label} requires ${matchingModel.planLabel} plan.`)
          }
        } else {
          toast.error(`Unknown model: ${commandArgs[0]}`)
        }
      }
      return
    }

    // Ensure a chat record exists before persisting messages
    let chatId = activeChat?.id ?? null
    if (!chatId) {
      try {
        const projectId = selectedAgent?.type === 'project' ? selectedAgent.project.id : null
        const firstSentence = text ? (text.match(/^.+?[.?!\n]/)?.[0] ?? text).slice(0, 80).trim() : null
        const chatTitle = firstSentence || currentAttachments[0]?.name || 'New Chat'
        const newChat = await createChat(projectId, chatTitle)
        chatId = newChat.id
        activeChatIdRef.current = newChat.id
        onChatCreated(newChat)
      } catch {
        // non-critical — messages won't persist but the send still works
      }
    }

    // Persist user message (text only for DB; attachments are ephemeral links)
    if (chatId && text) {
      try {
        await saveMessage(chatId, 'user', text)
      } catch {
        // non-critical
      }
    }

    // Build body — pass either systemAgentId or projectId, and webSearchEnabled
    const body: Record<string, unknown> = { model: selectedModel, webSearchEnabled }
    if (selectedAgent?.type === 'system') {
      body.systemAgentId = selectedAgent.agent.id
    } else if (selectedAgent?.type === 'project') {
      body.projectId = selectedAgent.project.id
    }

    // Build multimodal message content if there are attachments
    if (currentAttachments.length > 0) {
      type AnyPart = { type: string; [key: string]: unknown }
      const parts: AnyPart[] = []
      if (text) parts.push({ type: 'text', text })
      for (const att of currentAttachments) {
        if (att.contentType.startsWith('image/')) {
          parts.push({ type: 'image', image: new URL(att.url) })
        } else {
          parts.push({ type: 'file', data: new URL(att.url), mimeType: att.contentType })
        }
      }
      // AI SDK v6: UIMessagePart doesn't include image/file shapes in types but
      // the runtime accepts them — cast to satisfy the compiler.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await sendMessage({ role: 'user', parts: parts as any }, { body })
    } else {
      await sendMessage({ text }, { body })
    }
  }

  const renderedMessages = messages.map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: getMessageText(m),
    parts: m.parts,
  }))

  async function handleEditMessage(index: number, newContent: string) {
    setMessages((prev) => prev.slice(0, index))
    const body: Record<string, unknown> = { model: selectedModel, webSearchEnabled }
    if (selectedAgent?.type === 'system') body.systemAgentId = selectedAgent.agent.id
    else if (selectedAgent?.type === 'project') body.projectId = selectedAgent.project.id
    await sendMessage({ text: newContent }, { body })
  }

  async function handleRetry(assistantIndex: number) {
    if (isLoading) return
    const userMsg = renderedMessages.slice(0, assistantIndex).reverse().find((m) => m.role === 'user')
    if (!userMsg) return
    setMessages((prev) => prev.slice(0, assistantIndex))
    const body: Record<string, unknown> = { model: selectedModel, webSearchEnabled }
    if (selectedAgent?.type === 'system') body.systemAgentId = selectedAgent.agent.id
    else if (selectedAgent?.type === 'project') body.projectId = selectedAgent.project.id
    await sendMessage({ text: userMsg.content }, { body })
  }

  const hasActivatedAgents = projects.some((p) => p.prompt)

  const selectedLabel =
    selectedAgent?.type === 'system'
      ? selectedAgent.agent.name
      : selectedAgent?.type === 'project'
      ? selectedAgent.project.name
      : null

  const sharedInputProps = {
    input,
    onInputChange: setInput,
    onSubmit: handleSubmit,
    isLoading,
    projects,
    selectedAgent,
    onAgentSelect,
    selectedModel,
    onModelSelect: (model: ModelId) => {
      setSelectedModel(model)
      try { localStorage.setItem('xeref_selected_model', model) } catch {}
    },
    userPlan,
    attachments,
    onFileSelect: handleFileSelect,
    onRemoveAttachment: (i: number) => setAttachments((prev) => prev.filter((_, idx) => idx !== i)),
    webSearchEnabled,
    onWebSearchToggle: () => setWebSearchEnabled((v) => !v),
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col flex-1 min-h-0 items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
          {selectedAgent ? (
            <>
              <div className="rounded-full bg-primary/10 p-4">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold">
                  Ask {selectedLabel} anything
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedAgent.type === 'system'
                    ? selectedAgent.agent.description
                    : `Powered by ${selectedAgent.project.selected_feature_ids.length} features · ${MODELS.find((m) => m.id === selectedModel)?.label ?? 'Haiku 4.5'}`}
                </p>
              </div>
            </>
          ) : hasActivatedAgents ? (
            <>
              <div className="rounded-full bg-muted p-4">
                <Bot className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Select an agent to start chatting</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose XerefClaw, Xeref Agents, or one of your custom agents below
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-full bg-muted p-4">
                <Bot className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Choose an agent below</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Pick XerefClaw or Xeref Agents to start, or go to Home to activate a custom agent.
                </p>
              </div>
            </>
          )}
          <ChatInput ref={chatInputRef} {...sharedInputProps} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto">
        <div className="py-4">
          {renderedMessages.map((message, i) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              parts={message.parts}
              isStreaming={isLoading && i === renderedMessages.length - 1 && message.role === 'assistant'}
              userName={userName}
              messageId={message.id}
              onEdit={(content) => handleEditMessage(i, content)}
              onRetry={message.role === 'assistant' ? () => handleRetry(i) : undefined}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="relative">
        {showScrollButton && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-10">
            <button
              onClick={scrollToBottom}
              aria-label="Scroll to bottom"
              className="flex items-center justify-center h-9 w-9 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-white/10 shadow-lg transition-all duration-150 text-white"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        )}
        <ChatInput ref={chatInputRef} {...sharedInputProps} />
      </div>
    </div>
  )
}
