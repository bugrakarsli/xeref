'use server'

import { createClient } from '@/lib/supabase/server'
import type { ChatAttachment } from '@/lib/types'

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
])
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export async function uploadChatAttachment(formData: FormData): Promise<ChatAttachment> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const file = formData.get('file')
  if (!(file instanceof File)) throw new Error('No file provided')

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Allowed: images (jpg, png, gif, webp) and PDF.`)
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max allowed: 10 MB.`)
  }

  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { error } = await supabase.storage
    .from('chat-attachments')
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data: urlData } = supabase.storage
    .from('chat-attachments')
    .getPublicUrl(path)

  return {
    url: urlData.publicUrl,
    contentType: file.type,
    name: file.name,
  }
}
