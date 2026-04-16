'use server'

import { createClient } from '@/lib/supabase/server'

export interface HeatmapDay {
  date: string   // YYYY-MM-DD
  count: number
}

export interface VelocityWeek {
  weekLabel: string  // e.g. "Apr 7"
  count: number
}

export async function getTaskCompletionHeatmap(): Promise<HeatmapDay[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const since = new Date()
  since.setDate(since.getDate() - 364)

  const { data, error } = await supabase
    .from('tasks')
    .select('updated_at')
    .eq('user_id', user.id)
    .eq('status', 'done')
    .gte('updated_at', since.toISOString())

  if (error || !data) return []

  // Build a map of date → count
  const counts: Record<string, number> = {}
  for (const row of data) {
    const date = row.updated_at.slice(0, 10)
    counts[date] = (counts[date] ?? 0) + 1
  }

  // Fill all 365 days so heatmap has complete data
  const days: HeatmapDay[] = []
  for (let i = 364; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    days.push({ date, count: counts[date] ?? 0 })
  }

  return days
}

export async function getTaskVelocity(): Promise<VelocityWeek[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const since = new Date()
  since.setDate(since.getDate() - 84) // 12 weeks

  const { data, error } = await supabase
    .from('tasks')
    .select('updated_at')
    .eq('user_id', user.id)
    .eq('status', 'done')
    .gte('updated_at', since.toISOString())

  if (error || !data) return []

  // Group by ISO week (Mon–Sun)
  const weekCounts: Record<string, number> = {}
  for (const row of data) {
    const d = new Date(row.updated_at)
    // Compute start of week (Monday)
    const day = d.getUTCDay() // 0=Sun
    const diff = (day === 0 ? -6 : 1 - day)
    const monday = new Date(d)
    monday.setUTCDate(d.getUTCDate() + diff)
    const key = monday.toISOString().slice(0, 10)
    weekCounts[key] = (weekCounts[key] ?? 0) + 1
  }

  // Build 12-week array from oldest to newest
  const weeks: VelocityWeek[] = []
  for (let i = 11; i >= 0; i--) {
    const monday = new Date()
    const day = monday.getUTCDay()
    const diff = (day === 0 ? -6 : 1 - day)
    monday.setUTCDate(monday.getUTCDate() + diff - i * 7)
    const key = monday.toISOString().slice(0, 10)
    const weekLabel = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    weeks.push({ weekLabel, count: weekCounts[key] ?? 0 })
  }

  return weeks
}
