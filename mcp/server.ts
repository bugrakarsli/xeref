/**
 * Xeref MCP Server v1
 *
 * Exposes Xeref productivity data (tasks, projects, notes, chats) as MCP tools
 * so any MCP-compatible client (Claude Desktop, etc.) can read and write user data.
 *
 * Transport: stdio
 * Auth: SUPABASE_SERVICE_ROLE_KEY + XEREF_MCP_USER_ID env vars
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... XEREF_MCP_USER_ID=<uuid> npx tsx mcp/server.ts
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

// ── Supabase client ─────────────────────────────────────────────────────────

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key)
}

function getUserId(): string {
  const uid = process.env.XEREF_MCP_USER_ID
  if (!uid) throw new Error('Missing XEREF_MCP_USER_ID')
  return uid
}

// ── Server ──────────────────────────────────────────────────────────────────

const server = new McpServer({ name: 'xeref', version: '1.0.0' })

// ── Task tools ──────────────────────────────────────────────────────────────

server.tool(
  'list_tasks',
  'List all tasks for the user. Optionally filter by status.',
  { status: z.enum(['todo', 'in_progress', 'done', 'all']).optional().default('all') },
  async ({ status }) => {
    const sb = getSupabase()
    let q = sb.from('tasks').select('*').eq('user_id', getUserId()).order('created_at', { ascending: false })
    if (status !== 'all') q = q.eq('status', status)
    const { data, error } = await q
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  }
)

server.tool(
  'create_task',
  'Create a new task.',
  {
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
    due_date: z.string().optional(),
    project_id: z.string().uuid().optional(),
  },
  async ({ title, description, priority, due_date, project_id }) => {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('tasks')
      .insert({ user_id: getUserId(), title, description: description ?? null, priority, due_date: due_date ?? null, project_id: project_id ?? null })
      .select()
      .single()
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  }
)

server.tool(
  'update_task',
  'Update an existing task by ID.',
  {
    id: z.string().uuid(),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['todo', 'in_progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    due_date: z.string().nullable().optional(),
  },
  async ({ id, ...updates }) => {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', getUserId())
      .select()
      .single()
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  }
)

server.tool(
  'delete_task',
  'Delete a task by ID.',
  { id: z.string().uuid() },
  async ({ id }) => {
    const sb = getSupabase()
    const { error } = await sb.from('tasks').delete().eq('id', id).eq('user_id', getUserId())
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text', text: `Task ${id} deleted.` }] }
  }
)

// ── Project tools ────────────────────────────────────────────────────────────

server.tool(
  'list_projects',
  'List all saved agent projects for the user.',
  {},
  async () => {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('projects')
      .select('id, name, description, selected_feature_ids, created_at, updated_at')
      .eq('user_id', getUserId())
      .order('updated_at', { ascending: false })
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  }
)

server.tool(
  'create_project',
  'Create a new agent project.',
  {
    name: z.string().min(1),
    description: z.string().optional(),
  },
  async ({ name, description }) => {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('projects')
      .insert({ user_id: getUserId(), name, description: description ?? null, selected_feature_ids: [] })
      .select()
      .single()
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  }
)

server.tool(
  'rename_project',
  'Rename an existing project. Use when the user wants to change a project name.',
  {
    id: z.string().uuid(),
    new_name: z.string().min(1),
  },
  async ({ id, new_name }) => {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('projects')
      .update({ name: new_name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', getUserId())
      .select()
      .single()
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  }
)

server.tool(
  'delete_project',
  'Delete a project by ID.',
  { id: z.string().uuid() },
  async ({ id }) => {
    const sb = getSupabase()
    const { error } = await sb.from('projects').delete().eq('id', id).eq('user_id', getUserId())
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text', text: `Project ${id} deleted.` }] }
  }
)

// ── Memory tools (CLAWS Archive) ─────────────────────────────────────────────

server.tool(
  'list_memories',
  'List all memories for the user.',
  {},
  async () => {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('memories')
      .select('*')
      .eq('user_id', getUserId())
      .order('created_at', { ascending: false })
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  }
)

server.tool(
  'save_memory',
  'Save information to the user long-term memory (Archive). Call this to remember ideas, research, or preferences.',
  { content: z.string().min(1), tags: z.array(z.string()).optional().default([]) },
  async ({ content, tags }) => {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('memories')
      .insert({ user_id: getUserId(), content, source: 'mcp', tags })
      .select()
      .single()
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  }
)

server.tool(
  'recall_memories',
  'Search or recall memories by query.',
  { query: z.string().optional() },
  async ({ query }) => {
    const sb = getSupabase()
    let q = sb.from('memories').select('*').eq('user_id', getUserId()).order('created_at', { ascending: false })
    if (query) {
      // Basic text search simulation using ilike on content
      q = q.ilike('content', `%${query}%`)
    }
    const { data, error } = await q
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  }
)

server.tool(
  'delete_memory',
  'Delete a memory by ID.',
  { id: z.string().uuid() },
  async ({ id }) => {
    const sb = getSupabase()
    const { error } = await sb.from('memories').delete().eq('id', id).eq('user_id', getUserId())
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text', text: `Memory ${id} deleted.` }] }
  }
)

// ── Chat tools ────────────────────────────────────────────────────────────────

server.tool(
  'list_chats',
  'List all chat sessions for the user.',
  {},
  async () => {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('chats')
      .select('id, title, project_id, created_at, updated_at')
      .eq('user_id', getUserId())
      .order('updated_at', { ascending: false })
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  }
)

server.tool(
  'list_messages',
  'List messages in a chat session.',
  { chat_id: z.string().uuid() },
  async ({ chat_id }) => {
    const sb = getSupabase()
    // Verify chat belongs to user
    const { data: chat } = await sb.from('chats').select('id').eq('id', chat_id).eq('user_id', getUserId()).single()
    if (!chat) return { content: [{ type: 'text', text: 'Chat not found or access denied.' }], isError: true }
    const { data, error } = await sb
      .from('messages')
      .select('id, role, content, created_at')
      .eq('chat_id', chat_id)
      .order('created_at')
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  }
)

server.tool(
  'delete_chat',
  'Delete a chat session and all its messages.',
  { id: z.string().uuid() },
  async ({ id }) => {
    const sb = getSupabase()
    const { error } = await sb.from('chats').delete().eq('id', id).eq('user_id', getUserId())
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text', text: `Chat ${id} deleted.` }] }
  }
)

// ── Start ─────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch(console.error)
