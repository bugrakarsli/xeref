'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatInputWithGitHub } from '@/app/code/_components/ChatInputWithGitHub'
import { isSessionId } from '@/lib/ids'
import { cn } from '@/lib/utils'
import type { CodeSession } from '@/lib/types'
import type { ModelId } from '@/components/dashboard/chat/chat-input'

interface CodeSessionViewProps {
  sessionId?: string | null
  onSessionCreated?: (session: CodeSession) => void
}

export function CodeSessionView({ sessionId, onSessionCreated }: CodeSessionViewProps) {
  const [sessionTitle, setSessionTitle] = useState('New session')
  const [input, setInput] = useState('')
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
  const [model, setModel] = useState<ModelId>('xeref-free')
  // Refs hold latest values so prepareSendMessagesRequest always reads them
  // without the transport needing to be recreated.
  const sessionIdRef = useRef<string | null>(sessionId ?? null)
  const selectedRepoRef = useRef<string | null>(null)
  const modelRef = useRef<ModelId>('xeref-free')
  const supabase = createClient()

  useEffect(() => { selectedRepoRef.current = selectedRepo }, [selectedRepo])
  useEffect(() => { modelRef.current = model }, [model])

  // Keep ref in sync when prop changes (e.g. user selects a different session)
  useEffect(() => {
    sessionIdRef.current = sessionId ?? null
    if (!sessionId) {
      setSessionTitle('New session')
    }
  }, [sessionId])

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        prepareSendMessagesRequest: (options) => ({
          api: `/api/sessions/${sessionIdRef.current}/chat`,
          body: {
            id: options.id,
            messages: options.messages,
            trigger: options.trigger,
            messageId: options.messageId,
            repo: selectedRepoRef.current,
            model: modelRef.current,
          },
        }),
      }),
    [],
  )

  const { messages, sendMessage, setMessages, status } = useChat({ transport })

  // Load history when we already have a session ID on mount or when sessionId changes
  useEffect(() => {
    setMessages([])
    const sid = sessionId
    if (!sid) return
    const id = sid.startsWith('session_') ? sid : `session_${sid}`
    if (!isSessionId(id)) return

    supabase
      .from('code_sessions')
      .select('title')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => { if (data?.title) setSessionTitle(data.title) })

    supabase
      .from('code_messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMessages(data.map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant' | 'system',
            parts: [{ type: 'text' as const, text: m.content }],
          })))
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!input.trim() || status === 'streaming' || status === 'submitted') return
    // Create session on first message
    if (!sessionIdRef.current) {
      const res = await fetch('/api/sessions', { method: 'POST' })
      const data = await res.json()
      const newId = data.id as string
      sessionIdRef.current = newId
      const newSession: CodeSession = {
        id: newId,
        user_id: '',
        title: 'New session',
        repo_full_name: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      onSessionCreated?.(newSession)
    }
    sendMessage({ text: input })
    setInput('')
  }

  const isLoading = status === 'streaming' || status === 'submitted'

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="px-6 py-4 border-b">
        <h1 className="text-lg font-medium">{sessionTitle}</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Start coding by selecting a repository or typing a message below.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cn(
              'flex flex-col gap-1.5 max-w-[85%]',
              m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start',
            )}>
              <div className={cn(
                'rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed shadow-sm',
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                  : 'bg-muted border rounded-tl-none',
              )}>
                {m.parts.filter(p => p.type === 'text').map((p, i) => (
                  <span key={i}>{'text' in p ? p.text : null}</span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t p-4 pb-6">
        <ChatInputWithGitHub
          sessionId={sessionIdRef.current || undefined}
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          selectedRepo={selectedRepo}
          onRepoSelect={setSelectedRepo}
          selectedModel={model}
          onModelSelect={setModel}
        />
      </div>
    </div>
  )
}
