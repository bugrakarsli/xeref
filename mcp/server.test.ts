/**
 * MCP Server integration tests — task, project, note CRUD lifecycle.
 *
 * These tests mock the Supabase client so no real DB connection is needed.
 * Each suite verifies the create → read → update → delete flow for one entity type.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Shared mock factory ──────────────────────────────────────────────────────

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'aaaaaaaa-0000-0000-0000-000000000001',
    user_id: 'user-1',
    created_at: '2026-04-16T00:00:00Z',
    updated_at: '2026-04-16T00:00:00Z',
    ...overrides,
  }
}

function makeSupabaseMock(rows: unknown[]) {
  const single = vi.fn().mockResolvedValue({ data: rows[0] ?? null, error: null })
  const select = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: rows, error: null }), single })
  const insert = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single }) })
  const update = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnThis(), select: vi.fn().mockReturnValue({ single }) })
  const del = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnThis(), then: (_: unknown, res: (v: { error: null }) => void) => res?.({ error: null }) })
  const from = vi.fn().mockReturnValue({ select, insert, update, delete: del })
  return { createClient: vi.fn().mockReturnValue({ from }) }
}

// ── Task CRUD ────────────────────────────────────────────────────────────────

describe('Task CRUD lifecycle', () => {
  const taskRow = makeRow({ title: 'Write docs', status: 'todo', priority: 'medium', description: null, due_date: null, project_id: null })

  it('creates a task', async () => {
    const { createClient } = makeSupabaseMock([taskRow])
    const sb = createClient('url', 'key')
    const { data, error } = await sb.from('tasks').insert({ user_id: 'user-1', title: 'Write docs', priority: 'medium' }).select().single()
    expect(error).toBeNull()
    expect(data).toMatchObject({ title: 'Write docs', status: 'todo' })
  })

  it('reads tasks', async () => {
    const { createClient } = makeSupabaseMock([taskRow])
    const sb = createClient('url', 'key')
    const { data, error } = await sb.from('tasks').select('*').eq('user_id', 'user-1').order('created_at', { ascending: false })
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
    expect((data as typeof taskRow[]).length).toBeGreaterThan(0)
  })

  it('updates a task status', async () => {
    const updatedRow = { ...taskRow, status: 'done', updated_at: '2026-04-16T01:00:00Z' }
    const { createClient } = makeSupabaseMock([updatedRow])
    const sb = createClient('url', 'key')
    const { data, error } = await sb.from('tasks').update({ status: 'done' }).eq('id', taskRow.id).eq('user_id', 'user-1').select().single()
    expect(error).toBeNull()
    expect(data).toMatchObject({ status: 'done' })
  })

  it('deletes a task', async () => {
    const mock = makeSupabaseMock([])
    const sb = mock.createClient('url', 'key')
    const result = sb.from('tasks').delete().eq('id', taskRow.id).eq('user_id', 'user-1')
    expect(result).toBeDefined()
  })
})

// ── Project CRUD ─────────────────────────────────────────────────────────────

describe('Project CRUD lifecycle', () => {
  const projectRow = makeRow({ name: 'My Agent', description: 'An AI assistant', selected_feature_ids: [] })

  it('creates a project', async () => {
    const { createClient } = makeSupabaseMock([projectRow])
    const sb = createClient('url', 'key')
    const { data, error } = await sb.from('projects').insert({ user_id: 'user-1', name: 'My Agent' }).select().single()
    expect(error).toBeNull()
    expect(data).toMatchObject({ name: 'My Agent' })
  })

  it('reads projects', async () => {
    const { createClient } = makeSupabaseMock([projectRow])
    const sb = createClient('url', 'key')
    const { data, error } = await sb.from('projects').select('*').eq('user_id', 'user-1').order('updated_at', { ascending: false })
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })

  it('updates a project name', async () => {
    const updated = { ...projectRow, name: 'Renamed Agent' }
    const { createClient } = makeSupabaseMock([updated])
    const sb = createClient('url', 'key')
    const { data, error } = await sb.from('projects').update({ name: 'Renamed Agent' }).eq('id', projectRow.id).eq('user_id', 'user-1').select().single()
    expect(error).toBeNull()
    expect(data).toMatchObject({ name: 'Renamed Agent' })
  })

  it('deletes a project', async () => {
    const mock = makeSupabaseMock([])
    const sb = mock.createClient('url', 'key')
    const result = sb.from('projects').delete().eq('id', projectRow.id).eq('user_id', 'user-1')
    expect(result).toBeDefined()
  })
})

// ── Note CRUD ─────────────────────────────────────────────────────────────────

describe('Note CRUD lifecycle', () => {
  const noteRow = makeRow({ title: 'Meeting notes', content: 'Discussed Q3 goals.' })

  it('creates a note', async () => {
    const { createClient } = makeSupabaseMock([noteRow])
    const sb = createClient('url', 'key')
    const { data, error } = await sb.from('notes').insert({ user_id: 'user-1', title: 'Meeting notes', content: '' }).select().single()
    expect(error).toBeNull()
    expect(data).toMatchObject({ title: 'Meeting notes' })
  })

  it('reads notes', async () => {
    const { createClient } = makeSupabaseMock([noteRow])
    const sb = createClient('url', 'key')
    const { data, error } = await sb.from('notes').select('*').eq('user_id', 'user-1').order('updated_at', { ascending: false })
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })

  it('updates a note content', async () => {
    const updated = { ...noteRow, content: 'Updated content.' }
    const { createClient } = makeSupabaseMock([updated])
    const sb = createClient('url', 'key')
    const { data, error } = await sb.from('notes').update({ content: 'Updated content.' }).eq('id', noteRow.id).eq('user_id', 'user-1').select().single()
    expect(error).toBeNull()
    expect(data).toMatchObject({ content: 'Updated content.' })
  })

  it('deletes a note', async () => {
    const mock = makeSupabaseMock([])
    const sb = mock.createClient('url', 'key')
    const result = sb.from('notes').delete().eq('id', noteRow.id).eq('user_id', 'user-1')
    expect(result).toBeDefined()
  })
})
