'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatInputWithGitHub } from '@/app/code/_components/ChatInputWithGitHub'
import { isSessionId } from '@/lib/ids'

export function CodeSessionView({ sessionId }: { sessionId?: string | null }) {
  const [session, setSession] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!sessionId) return
    const id = sessionId.startsWith('session_') ? sessionId : `session_${sessionId}`
    if (!isSessionId(id)) return

    supabase
      .from('code_sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => setSession(data))
  }, [sessionId])

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="px-6 py-4 border-b">
        <h1 className="text-lg font-medium">{session?.title ?? 'New session'}</h1>
        {sessionId && <p className="text-xs text-muted-foreground">{sessionId}</p>}
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {/* Existing chat transcript goes here */}
        <p className="text-muted-foreground text-sm">Start coding by selecting a repository or pasting your code below.</p>
      </div>
      <div className="border-t p-4">
        <ChatInputWithGitHub sessionId={sessionId || undefined} />
      </div>
    </div>
  )
}
