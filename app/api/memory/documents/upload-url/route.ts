import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'application/msword',
])

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json() as { name?: string; size?: number; mimeType?: string; ocr?: boolean }
  const { name, size, mimeType = 'application/octet-stream', ocr = false } = body

  if (!name || typeof size !== 'number') {
    return NextResponse.json({ error: 'name and size are required' }, { status: 400 })
  }

  if (size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 413 })
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 415 })
  }

  const safeName = name.replace(/[^a-zA-Z0-9._\-() ]/g, '_')
  const storagePath = `${user.id}/${Date.now()}-${safeName}`

  // Create the DB row first so we have an ID to return
  const { data: doc, error: dbError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      name,
      size,
      mime_type: mimeType,
      storage_path: storagePath,
      status: 'processing',
    })
    .select('id, name, size, mime_type, status, processing_error, created_at')
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // Create a signed upload URL valid for 5 minutes
  const { data: uploadData, error: signedError } = await supabase.storage
    .from('documents')
    .createSignedUploadUrl(storagePath)

  if (signedError) {
    await supabase.from('documents').delete().eq('id', doc.id)
    return NextResponse.json({ error: signedError.message }, { status: 500 })
  }

  return NextResponse.json({
    documentId: doc.id,
    doc,
    signedUrl: uploadData.signedUrl,
    token: uploadData.token,
    storagePath,
    ocr,
  }, { status: 201 })
}
