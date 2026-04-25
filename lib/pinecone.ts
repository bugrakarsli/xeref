import { Pinecone } from '@pinecone-database/pinecone'
import type { Lesson } from './types'

const NAMESPACE = 'xeref_lessons'

function getIndex() {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
  return pc.index({ host: process.env.PINECONE_INDEX_NAME! })
}

export async function upsertLesson(lesson: Lesson, courseId: string): Promise<void> {
  await getIndex().namespace(NAMESPACE).upsertRecords({
    records: [{
      _id: lesson.id,
      text: `${lesson.title}\n\n${lesson.content}`,
      lessonId: lesson.id,
      moduleId: lesson.module_id,
      courseId,
      title: lesson.title,
    }],
  })
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await getIndex().namespace(NAMESPACE).deleteOne({ id: lessonId })
}

export interface LessonSearchResult {
  lessonId: string
  courseId: string
  moduleId: string
  title: string
  score: number
}

export async function searchLessons(query: string, topK = 8): Promise<LessonSearchResult[]> {
  const result = await getIndex().namespace(NAMESPACE).searchRecords({
    query: { topK, inputs: { text: query } },
    fields: ['lessonId', 'courseId', 'moduleId', 'title'],
  })
  return (result.result.hits ?? []).map((h) => {
    const f = (h.fields ?? {}) as Record<string, unknown>
    return {
      lessonId: f['lessonId'] as string ?? h._id,
      courseId: f['courseId'] as string ?? '',
      moduleId: f['moduleId'] as string ?? '',
      title: f['title'] as string ?? '',
      score: h._score ?? 0,
    }
  })
}
