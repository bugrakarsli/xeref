import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { upsertLesson } from '@/lib/pinecone'
import type { Lesson } from '@/lib/types'

const ADMIN_EMAILS = ['bugra@bugrakarsli.com', 'bugra@xeref.ai']

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { lessonId, courseId } = await req.json() as { lessonId: string; courseId: string }

  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (error || !lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  await upsertLesson(lesson as Lesson, courseId)
  return NextResponse.json({ ok: true })
}
