import { Pinecone } from '@pinecone-database/pinecone'
import type { Lesson } from './types'
import { embedText } from './ai/embeddings'

const NAMESPACE = 'xeref_lessons'

function getClient() {
  return new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
}

export function getPineconeIndex() {
  return getClient().index(process.env.PINECONE_INDEX_NAME!)
}

export async function upsertLesson(lesson: Lesson, courseId: string): Promise<void> {
  const text = `${lesson.title}\n\n${lesson.content}`
  const values = await embedText(text)
  const index = getPineconeIndex()
  await index.namespace(NAMESPACE).upsert({
    records: [{
      id: lesson.id,
      values,
      metadata: {
        lessonId: lesson.id,
        moduleId: lesson.module_id,
        courseId,
        title: lesson.title,
      },
    }],
  })
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const index = getPineconeIndex()
  await index.namespace(NAMESPACE).deleteOne({ id: lessonId })
}

export interface LessonSearchResult {
  lessonId: string
  courseId: string
  moduleId: string
  title: string
  score: number
}

export async function searchLessons(query: string, topK = 8): Promise<LessonSearchResult[]> {
  const values = await embedText(query)
  const index = getPineconeIndex()
  const result = await index.namespace(NAMESPACE).query({
    vector: values,
    topK,
    includeMetadata: true,
  })
  return (result.matches ?? []).map((m) => ({
    lessonId: m.metadata!.lessonId as string,
    courseId: m.metadata!.courseId as string,
    moduleId: m.metadata!.moduleId as string,
    title: m.metadata!.title as string,
    score: m.score ?? 0,
  }))
}
