'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { ChatMessage } from './chat-message'
import { toast } from 'sonner'
import { ChatInput, type ChatInputHandle, type ModelId, type AgentSelection, MODELS } from './chat-input'
import { saveMessage, createChat, updateMessage } from '@/app/actions/chats'
import { uploadChatAttachment } from '@/app/actions/upload'
import type { Project, Chat, Message, ChatAttachment } from '@/lib/types'
import { ScrollToBottomButton } from '@/components/ui/ScrollToBottomButton'
import Image from 'next/image'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

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
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState<ModelId>('xeref-free')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('xeref_selected_model')
      if (saved && MODELS.find((m) => m.id === saved)) {
        const savedModel = saved as ModelId
        // Haiku moved from free→pro; reset free users who had it saved
        if (savedModel === 'claude-haiku-4-5-20251001' && userPlan === 'free') return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedModel(savedModel)
      }
    } catch {}
  }, [userPlan])
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const greeting = useMemo(
    () => `${getGreeting()}${userName ? `, ${userName.split(' ')[0]}` : ''}`,
    [userName]
  )
  const activeChatIdRef = useRef<string | null>(null)


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

  // Focus input when a new-chat-requested event fires on an already-empty chat
  useEffect(() => {
    const focus = () => chatInputRef.current?.focus()
    window.addEventListener('xeref_focus_chat_input', focus)
    return () => window.removeEventListener('xeref_focus_chat_input', focus)
  }, [])

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


  const isLoading = status === 'streaming' || status === 'submitted'
  const isThinking = status === 'submitted'

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
    const message = messages[index]
    if (!message) return

    if (message.role === 'user') {
      // Regenerate from this user message
      setMessages((prev) => prev.slice(0, index))
      const body: Record<string, unknown> = { model: selectedModel, webSearchEnabled }
      if (selectedAgent?.type === 'system') body.systemAgentId = selectedAgent.agent.id
      else if (selectedAgent?.type === 'project') body.projectId = selectedAgent.project.id
      await sendMessage({ text: newContent }, { body })
    } else {
      // Just update the assistant response content
      setMessages((prev) =>
        prev.map((m, i) =>
          i === index
            ? { ...m, parts: [{ type: 'text' as const, text: newContent }] }
            : m
        )
      )
      
      // Persist to DB if we have a message ID
      if (message.id) {
        try {
          await updateMessage(message.id, newContent)
          toast.success('Response updated')
        } catch (err) {
          console.error('Failed to update message:', err)
          toast.error('Failed to save changes to database')
        }
      }
    }
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
      <div className="flex flex-col flex-1 min-h-0 items-center justify-center py-6">
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{userPlan === 'ultra' ? 'Ultra Plan' : userPlan === 'pro' ? 'Pro Plan' : 'Free plan'}</span>
            {userPlan !== 'ultra' && (
              <>
                <span>·</span>
                <a
                  href="/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Upgrade
                </a>
              </>
            )}
          </div>
          <div className="rounded-full bg-primary/10 p-4">
            <Image src="/xeref.svg" alt="Xeref" width={28} height={28} className="h-7 w-7" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold">{greeting}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedAgent?.type === 'system'
                ? selectedAgent.agent.description
                : selectedAgent?.type === 'project'
                ? `Powered by ${selectedAgent.project.selected_feature_ids.length} features · ${MODELS.find((m) => m.id === selectedModel)?.label ?? 'Xeref'}`
                : hasActivatedAgents
                ? 'Choose XerefClaw, Xeref Agents, or one of your custom agents below'
                : 'Pick XerefClaw or Xeref Agents to start, or go to Home to activate a custom agent.'}
            </p>
          </div>
          <ChatInput ref={chatInputRef} {...sharedInputProps} noBorder />
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
              isLast={i === renderedMessages.length - 1}
              onEdit={(content) => handleEditMessage(i, content)}
              onEditPrompt={() => {
                const prevUser = renderedMessages.slice(0, i).reverse().find(m => m.role === 'user')
                if (prevUser) {
                  window.dispatchEvent(new CustomEvent('xeref_edit_message', { detail: { messageId: prevUser.id } }))
                }
              }}
              onRetry={message.role === 'assistant' ? () => handleRetry(i) : undefined}
            />
          ))}
          {/* Rainbow Thinking Indicator */}
          {isThinking && (
            <>
              <style>{`
                @keyframes rainbow-wave-main {
                  0%   { background-position: 0% 50%; }
                  100% { background-position: 300% 50%; }
                }
                @keyframes rainbow-dot-main {
                  0%   { background-position: 0% 50%; }
                  100% { background-position: 300% 50%; }
                }
                .rainbow-thinking-main {
                  background: linear-gradient(
                    90deg,
                    #ff6b6b, #ff9f43, #ffd32a,
                    #0be881, #17c0eb, #a29bfe,
                    #fd79a8, #ff6b6b, #ff9f43, #ffd32a
                  );
                  background-size: 300% auto;
                  -webkit-background-clip: text;
                  background-clip: text;
                  -webkit-text-fill-color: transparent;
                  animation: rainbow-wave-main 8s linear infinite;
                }
                .rainbow-dot-main {
                  background: linear-gradient(
                    90deg,
                    #ff6b6b, #ff9f43, #ffd32a,
                    #0be881, #17c0eb, #a29bfe,
                    #fd79a8, #ff6b6b
                  );
                  background-size: 300% auto;
                  animation: rainbow-dot-main 8s linear infinite;
                }
                @keyframes bounce-1 { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-4px); } }
                @keyframes bounce-2 { 0%, 80%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
                @keyframes bounce-3 { 0%, 80%, 100% { transform: translateY(0); } 60% { transform: translateY(-4px); } }
                .thinking-dot-1 { animation: bounce-1 1.2s ease-in-out infinite; }
                .thinking-dot-2 { animation: bounce-2 1.2s ease-in-out infinite; }
                .thinking-dot-3 { animation: bounce-3 1.2s ease-in-out infinite; }
              `}</style>
              <div className="flex items-center gap-2 px-4 py-3 ml-2">
                <span className="text-xs font-semibold tracking-wide rainbow-thinking-main">Thinking</span>
                <div className="flex items-end space-x-0.5">
                  <span className="w-1 h-1 rounded-full rainbow-dot-main thinking-dot-1" />
                  <span className="w-1 h-1 rounded-full rainbow-dot-main thinking-dot-2" />
                  <span className="w-1 h-1 rounded-full rainbow-dot-main thinking-dot-3" />
                </div>
              </div>
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      <ScrollToBottomButton scrollContainerRef={scrollContainerRef} />
      <div className="relative">
        <ChatInput ref={chatInputRef} {...sharedInputProps} />
      </div>
    </div>
  )
}
