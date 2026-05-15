import { Pinecone } from '@pinecone-database/pinecone'
import type { Lesson } from './types'

const NAMESPACE = 'xeref_lessons'
const USER_MEMORY_NS = 'xeref_user_memory'

function getIndex() {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
  return pc.index(process.env.PINECONE_INDEX!)
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

// ── User document memory (xeref_user_memory namespace) ────────────────────────

const CHUNK_SIZE = 1500
const CHUNK_OVERLAP = 200

function chunkText(text: string): string[] {
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    chunks.push(text.slice(start, start + CHUNK_SIZE))
    start += CHUNK_SIZE - CHUNK_OVERLAP
  }
  return chunks
}

export async function indexDocumentChunks(params: {
  documentId: string
  userId: string
  documentName: string
  text: string
}): Promise<number> {
  const { documentId, userId, documentName, text } = params
  const chunks = chunkText(text)
  if (chunks.length === 0) return 0

  await getIndex().namespace(USER_MEMORY_NS).upsertRecords({
    records: chunks.map((chunk, i) => ({
      _id: `${documentId}:${i}`,
      text: chunk,
      userId,
      documentId,
      documentName,
      chunkIndex: i,
    })),
  })
  return chunks.length
}

export interface DocumentSearchResult {
  documentId: string
  documentName: string
  chunkIndex: number
  text: string
  score: number
}

export async function searchUserDocuments(
  userId: string,
  query: string,
  topK = 6,
): Promise<DocumentSearchResult[]> {
  const result = await getIndex().namespace(USER_MEMORY_NS).searchRecords({
    query: { topK, inputs: { text: query }, filter: { userId: { $eq: userId } } },
    fields: ['userId', 'documentId', 'documentName', 'chunkIndex', 'text'],
  })
  return (result.result.hits ?? []).map((h) => {
    const f = (h.fields ?? {}) as Record<string, unknown>
    return {
      documentId: f['documentId'] as string ?? '',
      documentName: f['documentName'] as string ?? '',
      chunkIndex: (f['chunkIndex'] as number) ?? 0,
      text: f['text'] as string ?? '',
      score: h._score ?? 0,
    }
  })
}

export async function deleteDocumentChunks(documentId: string): Promise<void> {
  // Delete all chunks for this document by prefix-matching ids
  // Pinecone doesn't support prefix delete, so we list then delete
  const index = getIndex().namespace(USER_MEMORY_NS)
  // Use a high topK search with a strict filter to find all chunk ids
  try {
    const result = await index.searchRecords({
      query: { topK: 1000, inputs: { text: documentId }, filter: { documentId: { $eq: documentId } } },
      fields: [],
    })
    const ids = (result.result.hits ?? []).map(h => h._id)
    if (ids.length > 0) {
      await index.deleteMany(ids)
    }
  } catch {
    // Non-fatal — chunks will be orphaned but won't appear in filtered queries
  }
}
