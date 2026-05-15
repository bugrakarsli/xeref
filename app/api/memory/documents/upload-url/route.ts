import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseBody, UploadUrlSchema } from '@/lib/validation'


export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const rawBody = await request.json().catch(() => null)
  const { data: body, error: bodyError } = parseBody(UploadUrlSchema, rawBody)
  if (bodyError) return bodyError

  const { name, size, mimeType, ocr = false } = body

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
