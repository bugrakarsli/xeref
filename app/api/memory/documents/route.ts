import { after } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { extractText } from '@/lib/ocr';
import { indexDocumentChunks } from '@/lib/pinecone';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('documents')
    .select('id, name, size, mime_type, status, extracted_text, processing_error, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 413 });
  }

  const ocr = formData.get('ocr') === '1';

  const safeName = file.name.replace(/[^a-zA-Z0-9._\-() ]/g, '_');
  const storagePath = `${user.id}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, { contentType: file.type || 'application/octet-stream', upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: doc, error: dbError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      name: file.name,
      size: file.size,
      mime_type: file.type || 'application/octet-stream',
      storage_path: storagePath,
      status: 'processing',
    })
    .select('id, name, size, mime_type, status, processing_error, created_at')
    .single();

  if (dbError) {
    await supabase.storage.from('documents').remove([storagePath]);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Run extraction in background — client gets the 'processing' row immediately
  const documentId = doc.id;
  const userId = user.id;
  const fileName = file.name;
  const mimeType = file.type || 'application/octet-stream';

  after(async () => {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const text = await extractText(buffer, mimeType, ocr);
      if (text.trim()) {
        await indexDocumentChunks({ documentId, userId, documentName: fileName, text });
      }
      await admin.from('documents').update({
        status: 'ready',
        extracted_text: text || null,
        processing_error: null,
      }).eq('id', documentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Processing failed';
      await admin.from('documents').update({
        status: 'error',
        processing_error: message,
      }).eq('id', documentId);
    }
  });

  return NextResponse.json(doc, { status: 201 });
}
