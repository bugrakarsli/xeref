import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatInputWithGitHub } from '@/app/code/_components/ChatInputWithGitHub'
import { isSessionId } from '@/lib/ids'
import { cn } from '@/lib/utils'

export function CodeSessionView({ sessionId }: { sessionId?: string | null }) {
  const [session, setSession] = useState<any>(null)
  const [input, setInput] = useState('')
  const supabase = createClient()

  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({ api: `/api/sessions/${sessionId}/chat` }),
    onFinish: () => {
      // Refresh session or title if needed
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status === 'streaming' || status === 'submitted') return
    sendMessage({ text: input })
    setInput('')
  }

  useEffect(() => {
    if (!sessionId) return
    const id = sessionId.startsWith('session_') ? sessionId : `session_${sessionId}`
    if (!isSessionId(id)) return

    // 1. Fetch Session Info
    supabase
      .from('code_sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => setSession(data))
    
    // 2. Fetch History
    supabase
      .from('code_messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) {
          setMessages(data.map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant' | 'system',
            parts: [{ type: 'text' as const, text: m.content }]
          })))
        }
      })
  }, [sessionId, setMessages])

  const isLoading = status === 'streaming' || status === 'submitted'

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="px-6 py-4 border-b">
        <h1 className="text-lg font-medium">{session?.title ?? 'New session'}</h1>
        {sessionId && <p className="text-xs text-muted-foreground">{sessionId}</p>}
      </header>
      
      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Start coding by selecting a repository or typing a message below.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cn(
              "flex flex-col gap-1.5 max-w-[85%]",
              m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}>
              <div className={cn(
                "rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed shadow-sm",
                m.role === 'user' 
                  ? "bg-primary text-primary-foreground rounded-tr-none" 
                  : "bg-muted border rounded-tl-none"
              )}>
                {m.parts.filter(p => p.type === 'text').map((p, i) => <span key={i}>{(p as any).text}</span>)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t p-4 pb-6">
        <ChatInputWithGitHub 
          sessionId={sessionId || undefined} 
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

