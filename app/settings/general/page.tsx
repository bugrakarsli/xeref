'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AvatarSelector } from '@/components/settings/avatar-selector'
import { toast } from 'sonner'

interface Profile {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
}

export default function GeneralSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          const p: Profile = {
            id: user.id,
            email: user.email ?? null,
            display_name: data?.display_name ?? null,
            avatar_url: data?.avatar_url ?? null,
          }
          setProfile(p)
          setDisplayName(data?.display_name ?? '')
        })
    })
  }, [])

  const saveField = useCallback(async (updates: { display_name?: string; avatar_url?: string }) => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings/general', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
      toast.success('Saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }, [])

  function handleDisplayNameChange(val: string) {
    setDisplayName(val)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveField({ display_name: val }), 800)
  }

  function handleAvatarSaved(url: string) {
    setProfile((p) => p ? { ...p, avatar_url: url } : p)
    saveField({ avatar_url: url })
  }

  if (!profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold">General</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your profile and account settings.</p>
      </div>

      {/* Avatar */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Avatar</h2>
        <AvatarSelector
          userId={profile.id}
          currentUrl={profile.avatar_url}
          displayName={profile.display_name}
          onSaved={handleAvatarSaved}
        />
      </section>

      {/* Display name */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Display name</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={displayName}
            onChange={(e) => handleDisplayNameChange(e.target.value)}
            maxLength={80}
            placeholder="Your name"
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {saving && (
            <span className="text-xs text-muted-foreground">Saving…</span>
          )}
        </div>
      </section>

      {/* Email — read-only */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Email</h2>
        <input
          type="email"
          value={profile.email ?? ''}
          readOnly
          className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground/60">Email cannot be changed here. Contact support if needed.</p>
      </section>
    </div>
  )
}
