'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Upload, Loader2 } from 'lucide-react'

interface Props {
  userId: string
  currentUrl: string | null
  displayName: string | null
  onSaved: (url: string) => void
}

function initials(name: string | null, email?: string): string {
  const src = name || email || '?'
  return src
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function AvatarSelector({ userId, currentUrl, displayName, onSaved }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return }
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2 MB.'); return }
    setError(null)
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'png'
      const path = `${userId}/avatar.${ext}`
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (upErr) throw upErr

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`
      setPreview(publicUrl)
      onSaved(publicUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          'relative h-16 w-16 rounded-full overflow-hidden border-2 border-border',
          'bg-accent flex items-center justify-center',
          'hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          uploading && 'cursor-not-allowed opacity-60'
        )}
        aria-label="Change avatar"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xl font-semibold text-muted-foreground select-none">
            {initials(displayName)}
          </span>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          {uploading
            ? <Loader2 className="h-5 w-5 text-white animate-spin" />
            : <Upload className="h-5 w-5 text-white" />
          }
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm text-muted-foreground">Click to upload a new avatar</p>
        <p className="text-xs text-muted-foreground/60">PNG, JPG or WebP — max 2 MB</p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  )
}
