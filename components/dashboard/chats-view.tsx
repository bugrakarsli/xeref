'use client'

import { useState, useEffect } from 'react'
import { ChatHeader } from './chat/chat-header'
import { ChatInterface } from './chat/chat-interface'
import { ChatList } from './chat/chat-list'
import { TasksView } from './tasks-view'
import { createChat, getChatMessages, updateChatTitle } from '@/app/actions/chats'
import { toast } from 'sonner'
import type { Project, Chat, Message } from '@/lib/types'
import type { AgentSelection } from './chat/chat-input'
import { SYSTEM_AGENTS } from '@/lib/system-agents'

interface ChatsViewProps {
  projects: Project[]
  initialChats: Chat[]
  userName: string
  userPlan?: 'free' | 'pro' | 'ultra'
  selectedChatId?: string | null
}

export function ChatsView({ projects, initialChats, userName, userPlan = 'free', selectedChatId }: ChatsViewProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks'>('chat')
  const [showingList, setShowingList] = useState(false)
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [activeChat, setActiveChat] = useState<Chat | null>(initialChats[0] ?? null)
  const [chatMessages, setChatMessages] = useState<Message[]>([])

  // Restore selectedAgent from localStorage, default to XerefClaw
  const [selectedAgent, setSelectedAgent] = useState<AgentSelection>({
    type: 'system',
    agent: SYSTEM_AGENTS[0],
  })

  // Load persisted agent on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('xeref_selected_agent')
      if (saved) {
        const parsed: AgentSelection = JSON.parse(saved)
        // Validate system agent still exists
        if (parsed?.type === 'system') {
          const agent = SYSTEM_AGENTS.find((a) => a.id === parsed.agent.id)
          if (agent) setSelectedAgent({ type: 'system', agent })
        } else if (parsed?.type === 'project') {
          setSelectedAgent(parsed)
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleAgentSelect(agent: AgentSelection) {
    setSelectedAgent(agent)
    try {
      localStorage.setItem('xeref_selected_agent', JSON.stringify(agent))
    } catch {}
  }

  // Auto-load messages for the most recent chat on mount
  useEffect(() => {
    const first = initialChats[0]
    if (first) {
      getChatMessages(first.id).then(setChatMessages).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync chats state when initialChats prop changes (e.g., new chat created in parent)
  useEffect(() => {
    setChats(initialChats)
    // If activeChat was deleted, reset to first available
    if (activeChat && !initialChats.find((c) => c.id === activeChat.id)) {
      const first = initialChats[0]
      setActiveChat(first ?? null)
      if (first) {
        getChatMessages(first.id).then(setChatMessages).catch(() => {})
      } else {
        setChatMessages([])
      }
    }
  }, [initialChats, activeChat])

  // Navigate to a specific chat when selectedChatId changes (sidebar click)
  useEffect(() => {
    if (!selectedChatId) return
    const chat = chats.find((c) => c.id === selectedChatId)
    if (chat) {
      handleSelectChat(chat)
      setActiveTab('chat')
    }
  }, [selectedChatId, chats])

  function handleChatCreated(chat: Chat) {
    setChats((prev) => [chat, ...prev.filter((c) => c.id !== chat.id)])
    setActiveChat(chat)
  }

  async function handleNewChat() {
    // Save title of current chat from its first message
    if (activeChat && chatMessages.length > 0) {
      const firstUserMsg = chatMessages.find((m) => m.role === 'user')
      if (firstUserMsg && activeChat.title === 'New Chat') {
        const title = (firstUserMsg.content.match(/^.+?[.?!\n]/)?.[0] ?? firstUserMsg.content).slice(0, 80).trim()
        try {
          await updateChatTitle(activeChat.id, title)
          setChats((prev) =>
            prev.map((c) => (c.id === activeChat.id ? { ...c, title } : c))
          )
        } catch {
          // non-critical
        }
      }
    }

    // Create a new chat
    try {
      const projectId = selectedAgent?.type === 'project' ? selectedAgent.project.id : null
      const newChat = await createChat(projectId, 'New Chat')
      setChats((prev) => [newChat, ...prev])
      setActiveChat(newChat)
      setChatMessages([])
      setShowingList(false)
    } catch {
      toast.error('Failed to create new chat.')
    }
  }

  async function handleSelectChat(chat: Chat) {
    setActiveChat(chat)
    setShowingList(false)
    try {
      const messages = await getChatMessages(chat.id)
      setChatMessages(messages)
    } catch {
      toast.error('Failed to load chat messages.')
      setChatMessages([])
    }
  }

  function handleDeleteChat(chatId: string) {
    setChats((prev) => prev.filter((c) => c.id !== chatId))
    if (activeChat?.id === chatId) {
      setActiveChat(null)
      setChatMessages([])
    }
  }

  function handleTabChange(tab: 'chat' | 'tasks') {
    setActiveTab(tab)
    if (tab === 'tasks') setShowingList(false)
  }

  const agentName =
    selectedAgent?.type === 'system'
      ? selectedAgent.agent.name
      : selectedAgent?.type === 'project'
      ? selectedAgent.project.name
      : undefined

  return (
    <section aria-label="Chat" className="flex flex-col flex-1 min-h-0">
      <ChatHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNewChat={handleNewChat}
        onShowList={() => setShowingList((v) => !v)}
        showingList={showingList}
        agentName={agentName}
      />

      {activeTab === 'tasks' ? (
        <TasksView />
      ) : showingList ? (
        <ChatList
          chats={chats}
          activeChatId={activeChat?.id ?? null}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onNewChat={handleNewChat}
        />
      ) : (
        <ChatInterface
          projects={projects}
          selectedAgent={selectedAgent}
          onAgentSelect={handleAgentSelect}
          activeChat={activeChat}
          onChatCreated={handleChatCreated}
          initialMessages={chatMessages}
          userName={userName}
          userPlan={userPlan}
        />
      )}
    </section>
  )
}
