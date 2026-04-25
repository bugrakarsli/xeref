'use server'

import { createClient } from '@/lib/supabase/server'
import { deleteLesson as deleteLessonFromPinecone } from '@/lib/pinecone'
import type { Course, CourseModule, Lesson } from '@/lib/types'

const ADMIN_EMAILS = ['bugra@bugrakarsli.com', 'bugra@xeref.ai']

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) throw new Error('Forbidden')
  return supabase
}

// ── Read ────────────────────────────────────────────────────────────────────

export async function getCourses(): Promise<Course[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as Course[]
}

export async function getCourseWithModules(courseId: string): Promise<{
  course: Course
  modules: (CourseModule & { lessons: Lesson[] })[]
}> {
  const supabase = await createClient()
  const { data: course, error: ce } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()
  if (ce || !course) throw ce ?? new Error('Course not found')

  const { data: modules, error: me } = await supabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })
  if (me) throw me

  const sorted = (modules ?? []).map((m: CourseModule & { lessons: Lesson[] }) => ({
    ...m,
    lessons: (m.lessons ?? []).sort((a, b) => a.order_index - b.order_index),
  }))

  return { course: course as Course, modules: sorted }
}

export async function getLessonProgress(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', userId)
  return (data ?? []).map((r: { lesson_id: string }) => r.lesson_id)
}

export async function markLessonComplete(lessonId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  await supabase.from('lesson_progress').upsert({ user_id: user.id, lesson_id: lessonId })
}

export async function markLessonIncomplete(lessonId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  await supabase.from('lesson_progress').delete().eq('user_id', user.id).eq('lesson_id', lessonId)
}

// ── Admin CRUD ───────────────────────────────────────────────────────────────

export async function createCourse(data: Pick<Course, 'title' | 'description' | 'cover_image_url'>): Promise<Course> {
  const supabase = await assertAdmin()
  const { data: course, error } = await supabase.from('courses').insert(data).select().single()
  if (error) throw error
  return course as Course
}

export async function updateCourse(id: string, data: Partial<Pick<Course, 'title' | 'description' | 'cover_image_url' | 'published'>>): Promise<void> {
  const supabase = await assertAdmin()
  const { error } = await supabase.from('courses').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function deleteCourse(id: string): Promise<void> {
  const supabase = await assertAdmin()
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw error
}

export async function createModule(courseId: string, title: string, orderIndex: number): Promise<CourseModule> {
  const supabase = await assertAdmin()
  const { data, error } = await supabase
    .from('modules')
    .insert({ course_id: courseId, title, order_index: orderIndex })
    .select()
    .single()
  if (error) throw error
  return data as CourseModule
}

export async function createLesson(
  moduleId: string,
  courseId: string,
  data: Pick<Lesson, 'title' | 'content' | 'duration_minutes' | 'order_index'>
): Promise<Lesson> {
  const supabase = await assertAdmin()
  const { data: lesson, error } = await supabase.from('lessons').insert({ module_id: moduleId, ...data }).select().single()
  if (error) throw error

  await fetch('/api/classroom/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lessonId: lesson.id, courseId }),
  })

  return lesson as Lesson
}

export async function updateLesson(
  id: string,
  courseId: string,
  data: Partial<Pick<Lesson, 'title' | 'content' | 'duration_minutes'>>
): Promise<void> {
  const supabase = await assertAdmin()
  const { error } = await supabase.from('lessons').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error

  await fetch('/api/classroom/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lessonId: id, courseId }),
  })
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const supabase = await assertAdmin()
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId)
  if (error) throw error
  await deleteLessonFromPinecone(lessonId)
}
