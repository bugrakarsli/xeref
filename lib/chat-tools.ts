import { z } from 'zod'

/**
 * Zod schemas for chat tools.
 * The full tool definitions (with execute functions) live in app/api/chat/route.ts.
 * This file documents the available tools and their input shapes for reference.
 */

export const chatToolSchemas = {
  create_task: z.object({
    title: z.string().describe('Short task title'),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    description: z.string().optional(),
  }),

  list_tasks: z.object({
    status: z.enum(['todo', 'in_progress', 'done']).optional(),
  }),

  update_task: z.object({
    title: z.string().describe('Task title to search for (partial match is fine)'),
    status: z.enum(['todo', 'in_progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }),

  rename_project: z.object({
    current_name: z.string(),
    new_name: z.string(),
  }),

  save_memory: z.object({
    content: z.string(),
    tags: z.array(z.string()).optional(),
  }),

  recall_memories: z.object({
    query: z.string().optional(),
  }),
}
