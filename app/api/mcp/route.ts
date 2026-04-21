import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getUserByToken(token: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('mcp_token', token)
    .single()
  return data?.id ?? null
}

// Tool definitions
const TOOL_DEFS = [
  { name: 'list_projects', description: 'List all user projects', inputSchema: { type: 'object', properties: {}, required: [] } },
  { name: 'create_project', description: 'Create a new project', inputSchema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' } }, required: ['name'] } },
  { name: 'delete_project', description: 'Delete a project by id', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'list_tasks', description: 'List all user tasks', inputSchema: { type: 'object', properties: { project_id: { type: 'string' }, status: { type: 'string', enum: ['todo', 'in_progress', 'done'] } }, required: [] } },
  { name: 'create_task', description: 'Create a new task', inputSchema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, project_id: { type: 'string' }, priority: { type: 'string', enum: ['low', 'medium', 'high'] }, due_date: { type: 'string' } }, required: ['title'] } },
  { name: 'update_task', description: 'Update an existing task', inputSchema: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' }, status: { type: 'string', enum: ['todo', 'in_progress', 'done'] }, priority: { type: 'string', enum: ['low', 'medium', 'high'] }, due_date: { type: 'string' } }, required: ['id'] } },
  { name: 'delete_task', description: 'Delete a task by id', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'list_notes', description: 'List all user notes', inputSchema: { type: 'object', properties: {}, required: [] } },
  { name: 'create_note', description: 'Create a new note', inputSchema: { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: [] } },
  { name: 'update_note', description: 'Update an existing note', inputSchema: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' } }, required: ['id'] } },
  { name: 'delete_note', description: 'Delete a note by id', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'suggest_next_task', description: 'Get top 3 priority-sorted todo tasks to work on next', inputSchema: { type: 'object', properties: {}, required: [] } },
]

async function executeTool(userId: string, name: string, args: Record<string, unknown>) {
  const sb = supabaseAdmin

  switch (name) {
    case 'list_projects': {
      const { data, error } = await sb.from('projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
      if (error) throw error
      return data
    }
    case 'create_project': {
      const { data, error } = await sb.from('projects').insert({ user_id: userId, name: args.name, description: args.description ?? null, selected_feature_ids: [] }).select().single()
      if (error) throw error
      return data
    }
    case 'delete_project': {
      const { error } = await sb.from('projects').delete().eq('id', args.id).eq('user_id', userId)
      if (error) throw error
      return { deleted: true }
    }
    case 'list_tasks': {
      let q = sb.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      if (args.project_id) q = q.eq('project_id', args.project_id)
      if (args.status) q = q.eq('status', args.status)
      const { data, error } = await q
      if (error) throw error
      return data
    }
    case 'create_task': {
      const { data, error } = await sb.from('tasks').insert({ user_id: userId, title: args.title, description: args.description ?? null, project_id: args.project_id ?? null, priority: args.priority ?? 'medium', due_date: args.due_date ?? null }).select().single()
      if (error) throw error
      return data
    }
    case 'update_task': {
      const { id, ...updates } = args
      const { data, error } = await sb.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId).select().single()
      if (error) throw error
      return data
    }
    case 'delete_task': {
      const { error } = await sb.from('tasks').delete().eq('id', args.id).eq('user_id', userId)
      if (error) throw error
      return { deleted: true }
    }
    case 'list_notes': {
      const { data, error } = await sb.from('notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
      if (error) throw error
      return data
    }
    case 'create_note': {
      const { data, error } = await sb.from('notes').insert({ user_id: userId, title: args.title ?? 'Untitled', content: args.content ?? '' }).select().single()
      if (error) throw error
      return data
    }
    case 'update_note': {
      const { id, ...updates } = args
      const { data, error } = await sb.from('notes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId).select().single()
      if (error) throw error
      return data
    }
    case 'delete_note': {
      const { error } = await sb.from('notes').delete().eq('id', args.id).eq('user_id', userId)
      if (error) throw error
      return { deleted: true }
    }
    case 'suggest_next_task': {
      const { data, error } = await sb.from('tasks').select('*').eq('user_id', userId).eq('status', 'todo').order('priority', { ascending: false }).limit(3)
      if (error) throw error
      return data
    }
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 })
  }

  const userId = await getUserByToken(token)
  if (!userId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { method, params } = body

  // MCP protocol: initialize
  if (method === 'initialize') {
    return NextResponse.json({
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'xeref-mcp', version: '1.0.0' },
    })
  }

  // MCP protocol: tools/list
  if (method === 'tools/list') {
    return NextResponse.json({ tools: TOOL_DEFS })
  }

  // MCP protocol: tools/call
  if (method === 'tools/call') {
    const { name, arguments: args = {} } = params ?? {}
    if (!name) return NextResponse.json({ error: 'Missing tool name' }, { status: 400 })
    try {
      const result = await executeTool(userId, name, args)
      return NextResponse.json({ content: [{ type: 'text', text: JSON.stringify(result) }] })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tool execution failed'
      return NextResponse.json({ error: message }, { status: 400 })
    }
  }

  return NextResponse.json({ error: `Unknown method: ${method}` }, { status: 400 })
}
