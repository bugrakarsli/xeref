'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { NewRoutineButton } from '@/app/code/routines/_components/NewRoutineButton'
import { Zap } from 'lucide-react'

export function CodeRoutinesView() {
  const [routines, setRoutines] = useState<{ id: string; name: string; trigger_type: string; created_at: string; repo_full_name?: string | null; schedule_cron?: string | null }[]>([])

  useEffect(() => {
    createClient()
      .from('routines')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setRoutines(data)
      })
  }, [])

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto w-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" /> Routines
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create templated routines that can be kicked off on schedule, by API, or webhook.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{routines.length} / 5 included daily runs used.</p>
        </div>
        <NewRoutineButton />
      </div>

      <div className="mt-6 flex gap-2 text-sm">
        <button className="px-3 py-1.5 rounded-md bg-accent text-accent-foreground font-medium">All routines</button>
        <button className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">Calendar</button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {routines.map(r => (
          <div
            key={r.id}
            className="rounded-xl border p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium group-hover:text-primary transition-colors">{r.name}</h3>
              {r.repo_full_name && (
                <span className="text-xs rounded bg-accent px-2 py-0.5 text-muted-foreground">
                  {r.repo_full_name.split('/').pop()}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{r.schedule_cron ?? 'No schedule'}</p>
          </div>
        ))}
        {routines.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-2">No routines yet.</p>
        )}
      </div>
    </div>
  )
}
