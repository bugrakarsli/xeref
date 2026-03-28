'use client'

import { useState } from 'react'
import { ChatHeader } from './chat/chat-header'
import { ChatInterface } from './chat/chat-interface'
import { ChatList } from './chat/chat-list'
import { TasksView } from './tasks-view'
import { createChat, getChatMessages, updateChatTitle } from '@/app/actions/chats'
import { toast } from 'sonner'
import type { Project, Chat, Message } from '@/lib/types'

interface ChatsViewProps {
  projects: Project[]
  initialChats: Chat[]
  userName: string
}

export function ChatsView({ projects, initialChats, userName }: ChatsViewProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks'>('chat')
  const [showingList, setShowingList] = useState(false)
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    () => projects.find((p) => p.prompt) ?? null
  )

  async function handleNewChat() {
    // Save title of current chat from its first message
    if (activeChat && chatMessages.length > 0) {
      const firstUserMsg = chatMessages.find((m) => m.role === 'user')
      if (firstUserMsg && activeChat.title === 'New Chat') {
        const title = firstUserMsg.content.slice(0, 50).trim()
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
      const newChat = await createChat(selectedProject?.id ?? null, 'New Chat')
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

  const activatedProjects = projects.filter((p) => p.prompt)
  const selectedProjectObj = selectedProject
    ? (activatedProjects.find((p) => p.id === selectedProject.id) ?? null)
    : null

  return (
    <section aria-label="Chat" className="flex flex-col flex-1 min-h-0">
      <ChatHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNewChat={handleNewChat}
        onShowList={() => setShowingList((v) => !v)}
        showingList={showingList}
        agentName={selectedProjectObj?.name}
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
          selectedProject={selectedProjectObj}
          onProjectSelect={setSelectedProject}
          activeChat={activeChat}
          initialMessages={chatMessages}
          userName={userName}
        />
      )}
    </section>
  )
}
