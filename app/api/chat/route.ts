import { streamText, convertToModelMessages, tool, stepCountIs, createTextStreamResponse } from 'ai'
import { z } from 'zod'
import { tavily } from '@tavily/core'
import { createClient } from '@/lib/supabase/server'
import { SYSTEM_AGENTS } from '@/lib/system-agents'
import { createTask, getUserTasks, updateTask } from '@/app/actions/tasks'
import { saveMemory, getUserMemories } from '@/app/actions/memories'
import { renameProject } from '@/app/actions/projects'
import { isMemoryWorkflowEnabled } from '@/app/actions/workflows'
import {
  DEFAULT_MODEL,
  createOpenRouterForPlan,
  isModelAllowedForPlan,
  resolveModelId,
  type UserPlan,
} from '@/lib/ai/openrouter-config'

function getTextFromParts(parts?: Array<{ type: string; text?: string }>): string {
  if (!parts) return ''
  return parts.filter(p => p.type === 'text').map(p => p.text ?? '').join('')
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Fetch user plan alongside auth — reuses the same supabase client, no extra round-trip
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()
  const userPlan = (profile?.plan ?? 'free') as UserPlan

  const body = await req.json()
  const { messages, projectId, systemAgentId, model, webSearchEnabled, legacyMode } = body
  const requestedModel = typeof model === 'string' && model ? model : DEFAULT_MODEL

  // Server-side plan enforcement — never trust the client model ID
  if (!isModelAllowedForPlan(requestedModel, userPlan)) {
    console.warn('[Chat] plan violation', { userId: user.id, plan: userPlan, requested: requestedModel })
    return Response.json(
      { error: 'Model not available on your plan', code: 'PLAN_LIMIT' },
      { status: 403 }
    )
  }

  const lastUserMsg = messages?.slice().reverse().find((m: { role: string }) => m.role === 'user')
  const lastUserMessage = getTextFromParts(lastUserMsg?.parts)?.toLowerCase() || ''

  const resolvedModelId = resolveModelId(requestedModel, lastUserMessage)

  // Observability — log routing decision on every request
  console.log('[Chat]', {
    userId: user.id,
    plan: userPlan,
    requested: requestedModel,
    resolved: resolvedModelId,
    keyTier: userPlan,
  })

  // Resolve system prompt: system agent takes priority, then project prompt
  let systemPrompt: string | undefined

  if (systemAgentId) {
    const agent = SYSTEM_AGENTS.find((a) => a.id === systemAgentId)
    if (agent) systemPrompt = agent.systemPrompt
  } else if (projectId) {
    const { data: project } = await supabase
      .from('projects')
      .select('name, prompt')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (project?.prompt) {
      systemPrompt = `You are a helpful AI assistant for the project "${project.name}". You have deep knowledge of this project's agent architecture and features. Use the following project specification as context to inform your responses, but respond conversationally — do not follow the build instructions below literally.\n\n---\nProject Specification (reference only):\n${project.prompt}`
    }
  }

  const modelMessages = await convertToModelMessages(messages)
  const memoryEnabled = await isMemoryWorkflowEnabled().catch(() => true)

  // Per-request provider — key and attribution headers vary by plan
  const openrouter = createOpenRouterForPlan(userPlan)

  try {
    const result = streamText({
      model: openrouter(resolvedModelId),
      system: systemPrompt,
      messages: modelMessages,
      stopWhen: stepCountIs(5),
      tools: {
        create_task: tool({
          description:
            "Create a new task when the user asks to add, create, or remember a to-do item. Use for 'create a task', 'add a task', 'remind me to', 'I need to'.",
          inputSchema: z.object({
            title: z.string().describe('Short task title'),
            priority: z.enum(['low', 'medium', 'high']).optional(),
            description: z.string().optional(),
          }),
          execute: async ({ title, priority, description }: { title: string; priority?: 'low' | 'medium' | 'high'; description?: string }) => {
            const task = await createTask(title, { priority, description })
            return { success: true, task: { id: task.id, title: task.title, priority: task.priority, status: task.status } }
          },
        }),

        list_tasks: tool({
          description:
            "List the user's tasks. Use for 'show tasks', 'what tasks do I have', 'list my todos'.",
          inputSchema: z.object({
            status: z.enum(['todo', 'in_progress', 'done']).optional(),
          }),
          execute: async ({ status }: { status?: 'todo' | 'in_progress' | 'done' }) => {
            const tasks = await getUserTasks()
            const filtered = status ? tasks.filter((t) => t.status === status) : tasks
            return {
              tasks: filtered.map((t) => ({
                id: t.id,
                title: t.title,
                status: t.status,
                priority: t.priority,
                due_date: t.due_date,
              })),
              count: filtered.length,
            }
          },
        }),

        update_task: tool({
          description:
            "Update a task. Use for 'mark X as done', 'complete X', 'change priority of X'.",
          inputSchema: z.object({
            title: z.string().describe('Task title to search for'),
            status: z.enum(['todo', 'in_progress', 'done']).optional(),
            priority: z.enum(['low', 'medium', 'high']).optional(),
          }),
          execute: async ({ title, status, priority }: { title: string; status?: 'todo' | 'in_progress' | 'done'; priority?: 'low' | 'medium' | 'high' }) => {
            const tasks = await getUserTasks()
            const match = tasks.find((t) =>
              t.title.toLowerCase().includes(title.toLowerCase())
            )
            if (!match) return { success: false, message: `No task found matching "${title}"` }
            const updates: Parameters<typeof updateTask>[1] = {}
            if (status) updates.status = status
            if (priority) updates.priority = priority
            const updated = await updateTask(match.id, updates)
            return { success: true, task: { id: updated.id, title: updated.title, status: updated.status, priority: updated.priority } }
          },
        }),

        rename_project: tool({
          description:
            "Rename a project. Use for 'rename project X to Y', 'change the name of X to Y'.",
          inputSchema: z.object({
            current_name: z.string(),
            new_name: z.string(),
          }),
          execute: async ({ current_name, new_name }: { current_name: string; new_name: string }) => {
            const { data: projects } = await supabase
              .from('projects')
              .select('id, name')
              .eq('user_id', user.id)

            const match = (projects ?? []).find((p: { id: string; name: string }) =>
              p.name.toLowerCase().includes(current_name.toLowerCase())
            )
            if (!match) return { success: false, message: `No project found matching "${current_name}"` }
            await renameProject(match.id, new_name)
            return { success: true, message: `Renamed "${match.name}" to "${new_name}"` }
          },
        }),

        save_memory: tool({
          description:
            "Save something to long-term memory. Use when the user says 'remember', 'save this', 'note this', 'don't forget'.",
          inputSchema: z.object({
            content: z.string(),
            tags: z.array(z.string()).optional(),
          }),
          execute: async ({ content, tags }: { content: string; tags?: string[] }) => {
            if (!memoryEnabled) {
              return { success: false, message: 'Memory saving is currently disabled. Enable the "Save Memories from Chat" workflow in Workflows settings.' }
            }
            await saveMemory(content, 'chat', tags ?? [])
            return { success: true, message: `Saved to memory: "${content}"` }
          },
        }),

        recall_memories: tool({
          description:
            "Recall saved memories. Use when the user asks 'what do you remember', 'what did I ask you to save'.",
          inputSchema: z.object({
            query: z.string().optional(),
          }),
          execute: async ({ query }: { query?: string }) => {
            const memories = await getUserMemories()
            const filtered = query
              ? memories.filter((m) =>
                  m.content.toLowerCase().includes(query.toLowerCase()) ||
                  m.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
                )
              : memories
            return {
              memories: filtered.map((m) => ({
                content: m.content,
                tags: m.tags,
                saved_at: m.created_at,
              })),
              count: filtered.length,
            }
          },
        }),

        ...(webSearchEnabled && process.env.TAVILY_API_KEY ? {
          web_search: tool({
            description: 'Search the web for current, up-to-date information. Use when the user asks about recent events, news, live data, or anything that may have changed after your training cutoff.',
            inputSchema: z.object({
              query: z.string().describe('The search query to look up'),
            }),
            execute: async ({ query }: { query: string }) => {
              const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY! })
              const result = await tvly.search(query, { maxResults: 5 })
              return result.results.map((r) => ({
                title: r.title,
                url: r.url,
                content: r.content,
              }))
            },
          }),
        } : {}),
      },
    })

    // Legacy mode: plain text stream for non-SDK clients (AgentPanel)
    if (legacyMode) {
      return createTextStreamResponse(result.textStream)
    }

    return result.toUIMessageStreamResponse({
      onError: (err) => {
        console.error('[Chat] stream error', { model: resolvedModelId, plan: userPlan, error: err })
        return err instanceof Error ? err.message : 'Model request failed'
      },
    })
  } catch (err) {
    console.error('[Chat] streamText failed', { model: resolvedModelId, plan: userPlan, error: err })
    return Response.json(
      { error: 'Failed to connect to model provider' },
      { status: 502 }
    )
  }
}
