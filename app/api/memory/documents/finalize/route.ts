import { after } from 'next/server'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseBody, FinalizeDocumentSchema } from '@/lib/validation'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { extractText } from '@/lib/ocr'
import { indexDocumentChunks } from '@/lib/pinecone'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const rawBody = await request.json().catch(() => null)
  const { data: body, error: bodyError } = parseBody(FinalizeDocumentSchema, rawBody)
  if (bodyError) return bodyError

  const { documentId, ocr = false } = body

  // Verify the document belongs to this user
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('id, name, mime_type, storage_path, status')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  if (doc.status !== 'processing') {
    return NextResponse.json({ error: 'Document is not in processing state' }, { status: 409 })
  }

  const documentName = doc.name
  const mimeType = doc.mime_type
  const storagePath = doc.storage_path
  const userId = user.id

  after(async () => {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    try {
      const { data: fileData, error: downloadError } = await admin.storage
        .from('documents')
        .download(storagePath)

      if (downloadError) throw new Error(`Storage download failed: ${downloadError.message}`)

      const buffer = Buffer.from(await fileData.arrayBuffer())
      const text = await extractText(buffer, mimeType, ocr)

      if (text.trim()) {
        await indexDocumentChunks({ documentId, userId, documentName, text })
      }

      await admin.from('documents').update({
        status: 'ready',
        extracted_text: text || null,
        processing_error: null,
      }).eq('id', documentId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Processing failed'
      await admin.from('documents').update({
        status: 'error',
        processing_error: message,
      }).eq('id', documentId)
    }
  })

  return NextResponse.json({ ok: true })
}
