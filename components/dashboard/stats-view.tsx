'use client'

import { useState, useEffect } from 'react'
import { BarChart2, Bot, Zap, CheckSquare, MessageSquare } from 'lucide-react'
import type { Project, Chat, Task } from '@/lib/types'
import { getUserTasks } from '@/app/actions/tasks'

interface StatsViewProps {
  projects?: Project[]
  chats?: Chat[]
}

interface DayActivity {
  dateStr: string
  shortLabel: string
  isToday: boolean
  chatCount: number
  projectCount: number
  total: number
}

function buildActivityData(chats: Chat[], projects: Project[]): DayActivity[] {
  const now = new Date()
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (13 - i))
    const dateStr = d.toISOString().split('T')[0]
    const shortLabel = `${d.getMonth() + 1}/${d.getDate()}`
    const isToday = i === 13

    const chatCount = chats.filter((c) => c.created_at.startsWith(dateStr)).length
    const projectCount = projects.filter((p) => p.created_at.startsWith(dateStr)).length

    return { dateStr, shortLabel, isToday, chatCount, projectCount, total: chatCount + projectCount }
  })
}

function ActivityChart({ days }: { days: DayActivity[] }) {
  const maxCount = Math.max(...days.map((d) => d.total), 1)
  const CHART_H = 96
  const BAR_W = 24
  const GAP = 6
  const TOTAL_W = days.length * (BAR_W + GAP) - GAP
  const LEFT_PAD = 28

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${TOTAL_W + LEFT_PAD + 8} ${CHART_H + 36}`}
        className="w-full"
        style={{ minWidth: '340px', maxHeight: '160px' }}
      >
        {/* Y-axis guide lines + labels */}
        {[0, Math.ceil(maxCount / 2), maxCount].map((val, i) => {
          const y = CHART_H - Math.round((val / maxCount) * CHART_H)
          return (
            <g key={i}>
              <line
                x1={LEFT_PAD}
                y1={y}
                x2={TOTAL_W + LEFT_PAD + 8}
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth={0.5}
                strokeDasharray={i === 0 ? '0' : '3,3'}
              />
              <text
                x={LEFT_PAD - 4}
                y={y + 4}
                textAnchor="end"
                fontSize={8}
                fill="hsl(var(--muted-foreground))"
              >
                {val}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        <g transform={`translate(${LEFT_PAD}, 0)`}>
          {days.map((day, i) => {
            const x = i * (BAR_W + GAP)
            const totalH = day.total > 0 ? Math.max(Math.round((day.total / maxCount) * CHART_H), 3) : 0
            const chatH = day.total > 0 ? Math.round((day.chatCount / day.total) * totalH) : 0
            const projectH = totalH - chatH

            return (
              <g key={day.dateStr}>
                {totalH > 0 ? (
                  <>
                    {/* Project segment (bottom, dimmer) */}
                    {projectH > 0 && (
                      <rect
                        x={x}
                        y={CHART_H - totalH}
                        width={BAR_W}
                        height={projectH}
                        rx={2}
                        fill="hsl(var(--primary))"
                        opacity={0.35}
                      />
                    )}
                    {/* Chat segment (top) */}
                    {chatH > 0 && (
                      <rect
                        x={x}
                        y={CHART_H - totalH + projectH}
                        width={BAR_W}
                        height={chatH}
                        rx={chatH === totalH ? 2 : 0}
                        fill="hsl(var(--primary))"
                        opacity={day.isToday ? 1 : 0.75}
                      />
                    )}
                  </>
                ) : (
                  <rect x={x} y={CHART_H - 2} width={BAR_W} height={2} rx={1} fill="hsl(var(--border))" />
                )}

                {/* Date label */}
                <text
                  x={x + BAR_W / 2}
                  y={CHART_H + 14}
                  textAnchor="middle"
                  fontSize={8}
                  fill={day.isToday ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                  fontWeight={day.isToday ? '600' : '400'}
                >
                  {day.shortLabel}
                </text>
                {day.isToday && (
                  <text
                    x={x + BAR_W / 2}
                    y={CHART_H + 26}
                    textAnchor="middle"
                    fontSize={7}
                    fill="hsl(var(--primary))"
                  >
                    today
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

export function StatsView({ projects = [], chats = [] }: StatsViewProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const activityDays = buildActivityData(chats, projects)
  const totalActivity = activityDays.reduce((sum, d) => sum + d.total, 0)

  useEffect(() => {
    getUserTasks().then(setTasks).catch(() => {})
  }, [])

  const completedTasks = tasks.filter((t) => t.status === 'done').length

  const stats = [
    { label: 'Agents Created', value: projects.length, icon: Bot, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Prompts Generated', value: projects.filter((p) => p.prompt).length, icon: Zap, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { label: 'Tasks Completed', value: completedTasks, icon: CheckSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Chat Sessions', value: chats.length, icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ]

  return (
    <section aria-label="Stats" className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Stats</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your agent usage, prompt generation, and productivity over time.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="flex flex-col gap-3 rounded-xl border bg-card p-5">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">All time</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div className="rounded-xl border bg-card p-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Activity — last 14 days</h2>
          </div>
          <span className="text-xs text-muted-foreground">{totalActivity} events</span>
        </div>

        <ActivityChart days={activityDays} />

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-3 rounded-sm inline-block bg-primary opacity-75" />
            Chats
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-3 rounded-sm inline-block bg-primary opacity-35" />
            Agents
          </div>
          <p className="text-xs text-muted-foreground ml-auto">
            {totalActivity === 0 ? 'Start chatting to see activity here.' : 'Based on created chats and agents.'}
          </p>
        </div>
      </div>
    </section>
  )
}
