'use client'

import { useState, useEffect } from 'react'
import { BarChart2, Bot, Zap, CheckSquare, MessageSquare } from 'lucide-react'
import type { Project, Chat, Task } from '@/lib/types'
import { getUserTasks } from '@/app/actions/tasks'
import { getTaskCompletionHeatmap, getTaskVelocity, type HeatmapDay, type VelocityWeek } from '@/app/actions/stats'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const T = {
  accent: '#5DD9C1',
  accentDim: '#4CB8A6',
  accentLight: '#8CF0C8',
  cardBg: '#222222',
  cardBorder: '#333333',
  textPrimary: '#FFFFFF',
  textSecondary: '#999999',
  emptyCell: '#2A2A2A',
} as const

const CARD = {
  style: { background: T.cardBg, border: `1px solid ${T.cardBorder}`, fontFamily: 'Inter, sans-serif' } as React.CSSProperties,
  className: 'rounded-xl p-5',
}

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Activity Bar Chart ────────────────────────────────────────────────────────

function ActivityChart({ days }: { days: DayActivity[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const maxCount = Math.max(...days.map((d) => d.total), 1)
  const CHART_H = 96
  const BAR_W = 24
  const GAP = 6
  const LEFT_PAD = 28
  const TOTAL_W = days.length * (BAR_W + GAP) - GAP

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${TOTAL_W + LEFT_PAD + 8} ${CHART_H + 36}`}
        className="w-full"
        style={{ minWidth: '340px', maxHeight: '160px' }}
      >
        <defs>
          <filter id="glow-bar" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(93,217,193,0.45)" />
          </filter>
        </defs>

        {/* Y-axis guides */}
        {[0, Math.ceil(maxCount / 2), maxCount].map((val, i) => {
          const y = CHART_H - Math.round((val / maxCount) * CHART_H)
          return (
            <g key={i}>
              <line x1={LEFT_PAD} y1={y} x2={TOTAL_W + LEFT_PAD + 8} y2={y} stroke={T.cardBorder} strokeWidth={0.5} strokeDasharray={i === 0 ? '0' : '3,3'} />
              <text x={LEFT_PAD - 4} y={y + 4} textAnchor="end" fontSize={8} fill={T.textSecondary}>{val}</text>
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
            const isHovered = hovered === day.dateStr
            const filter = isHovered ? 'url(#glow-bar)' : undefined

            return (
              <g
                key={day.dateStr}
                onMouseEnter={() => setHovered(day.dateStr)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: day.total > 0 ? 'pointer' : 'default' }}
                filter={filter}
              >
                {totalH > 0 ? (
                  <>
                    {projectH > 0 && (
                      <rect x={x} y={CHART_H - totalH} width={BAR_W} height={projectH} rx={2} fill={T.accentDim} />
                    )}
                    {chatH > 0 && (
                      <rect x={x} y={CHART_H - totalH + projectH} width={BAR_W} height={chatH} rx={chatH === totalH ? 2 : 0} fill={T.accentLight} />
                    )}
                  </>
                ) : (
                  <rect x={x} y={CHART_H - 2} width={BAR_W} height={2} rx={1} fill={T.cardBorder} />
                )}

                <text x={x + BAR_W / 2} y={CHART_H + 14} textAnchor="middle" fontSize={8} fill={day.isToday ? T.accent : T.textSecondary} fontWeight={day.isToday ? '600' : '400'}>
                  {day.shortLabel}
                </text>
                {day.isToday && (
                  <text x={x + BAR_W / 2} y={CHART_H + 26} textAnchor="middle" fontSize={7} fill={T.accent}>today</text>
                )}
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

// ── Heatmap ───────────────────────────────────────────────────────────────────

const HEAT_COLORS = [
  T.emptyCell,
  `rgba(93,217,193,0.30)`,
  `rgba(93,217,193,0.55)`,
  `rgba(93,217,193,0.80)`,
  T.accent,
]

function heatColor(count: number): string {
  if (count === 0) return HEAT_COLORS[0]
  if (count === 1) return HEAT_COLORS[1]
  if (count === 2) return HEAT_COLORS[2]
  if (count <= 4) return HEAT_COLORS[3]
  return HEAT_COLORS[4]
}

function ActivityHeatmap({ days }: { days: HeatmapDay[] }) {
  const CELL = 11
  const GAP = 2
  const STEP = CELL + GAP
  const WEEKS = 53
  const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

  const firstDay = days[0] ? new Date(days[0].date).getUTCDay() : 0
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const cells: ({ date: string; count: number } | null)[] = [...Array(offset).fill(null), ...days]

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${WEEKS * STEP + 28} ${7 * STEP + 20}`} style={{ minWidth: '560px', maxHeight: '120px' }} className="w-full">
        {DAY_LABELS.map((label, i) =>
          label ? <text key={i} x={0} y={i * STEP + CELL} fontSize={7} fill={T.textSecondary}>{label}</text> : null
        )}
        {cells.map((cell, idx) => {
          const col = Math.floor(idx / 7)
          const row = idx % 7
          if (!cell) return null
          return (
            <rect key={cell.date} x={col * STEP + 28} y={row * STEP} width={CELL} height={CELL} rx={2} fill={heatColor(cell.count)}>
              <title>{cell.date}: {cell.count} task{cell.count !== 1 ? 's' : ''} completed</title>
            </rect>
          )
        })}
      </svg>

      <div className="flex items-center gap-1.5 mt-1">
        <span style={{ color: T.textSecondary, fontSize: '10px' }}>Less</span>
        {HEAT_COLORS.map((c, i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: c }} />
        ))}
        <span style={{ color: T.textSecondary, fontSize: '10px' }}>More</span>
      </div>
    </div>
  )
}

// ── Velocity Chart ────────────────────────────────────────────────────────────

function VelocityChart({ weeks }: { weeks: VelocityWeek[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const maxCount = Math.max(...weeks.map((w) => w.count), 1)
  const CHART_H = 80
  const BAR_W = 22
  const GAP = 8
  const LEFT_PAD = 24
  const TOTAL_W = weeks.length * (BAR_W + GAP) - GAP

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${TOTAL_W + LEFT_PAD + 8} ${CHART_H + 28}`} style={{ minWidth: '360px', maxHeight: '130px' }} className="w-full">
        <defs>
          <filter id="glow-vel" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(93,217,193,0.45)" />
          </filter>
        </defs>

        {[0, Math.ceil(maxCount / 2), maxCount].map((val, i) => {
          const y = CHART_H - Math.round((val / maxCount) * CHART_H)
          return (
            <g key={i}>
              <line x1={LEFT_PAD} y1={y} x2={TOTAL_W + LEFT_PAD + 8} y2={y} stroke={T.cardBorder} strokeWidth={0.5} strokeDasharray={i === 0 ? '0' : '3,3'} />
              <text x={LEFT_PAD - 4} y={y + 4} textAnchor="end" fontSize={8} fill={T.textSecondary}>{val}</text>
            </g>
          )
        })}

        <g transform={`translate(${LEFT_PAD}, 0)`}>
          {weeks.map((week, i) => {
            const x = i * (BAR_W + GAP)
            const h = week.count > 0 ? Math.max(Math.round((week.count / maxCount) * CHART_H), 3) : 0
            const isLatest = i === weeks.length - 1
            const isHovered = hovered === week.weekLabel

            return (
              <g
                key={week.weekLabel}
                onMouseEnter={() => setHovered(week.weekLabel)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: week.count > 0 ? 'pointer' : 'default' }}
                filter={isHovered ? 'url(#glow-vel)' : undefined}
              >
                {h > 0 ? (
                  <rect x={x} y={CHART_H - h} width={BAR_W} height={h} rx={3} fill={T.accent} opacity={isLatest ? 1 : 0.65} />
                ) : (
                  <rect x={x} y={CHART_H - 2} width={BAR_W} height={2} rx={1} fill={T.cardBorder} />
                )}
                {week.count > 0 && (
                  <text x={x + BAR_W / 2} y={CHART_H - h - 3} textAnchor="middle" fontSize={7} fill={T.textSecondary}>{week.count}</text>
                )}
                <text x={x + BAR_W / 2} y={CHART_H + 12} textAnchor="middle" fontSize={7} fill={isLatest ? T.accent : T.textSecondary}>{week.weekLabel}</text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function StatsView({ projects = [], chats = [] }: StatsViewProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [heatmapDays, setHeatmapDays] = useState<HeatmapDay[]>([])
  const [velocityWeeks, setVelocityWeeks] = useState<VelocityWeek[]>([])
  const activityDays = buildActivityData(chats, projects)
  const totalActivity = activityDays.reduce((sum, d) => sum + d.total, 0)

  useEffect(() => {
    getUserTasks().then(setTasks).catch(() => {})
    getTaskCompletionHeatmap().then(setHeatmapDays).catch(() => {})
    getTaskVelocity().then(setVelocityWeeks).catch(() => {})
  }, [])

  const completedTasks = tasks.filter((t) => t.status === 'done').length

  const statCards = [
    { label: 'Agents Created',    value: projects.length,                            icon: Bot,          accent: '#60A5FA' },
    { label: 'Prompts Generated', value: projects.filter((p) => p.prompt).length,   icon: Zap,          accent: T.accent },
    { label: 'Tasks Completed',   value: completedTasks,                             icon: CheckSquare,  accent: '#34D399' },
    { label: 'Chat Sessions',     value: chats.length,                               icon: MessageSquare, accent: '#FBBF24' },
  ]

  return (
    <section
      aria-label="Stats"
      className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto gap-6"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: T.textPrimary }}>Stats</h1>
        <p className="text-sm mt-1" style={{ color: T.textSecondary }}>
          Track your agent usage, prompt generation, and productivity over time.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} {...CARD} style={{ ...CARD.style }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${accent}18` }}>
              <Icon className="h-5 w-5" style={{ color: accent }} />
            </div>
            <p className="text-3xl font-bold" style={{ color: T.textPrimary }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: T.textSecondary }}>{label}</p>
            <p className="text-[11px] mt-0.5" style={{ color: `${T.textSecondary}80` }}>All time</p>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div {...CARD} style={{ ...CARD.style, padding: '24px' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" style={{ color: T.textSecondary }} />
            <h2 className="text-sm font-semibold" style={{ color: T.textPrimary }}>Activity — last 14 days</h2>
          </div>
          <span className="text-xs" style={{ color: T.textSecondary }}>{totalActivity} events</span>
        </div>

        <ActivityChart days={activityDays} />

        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: `1px solid ${T.cardBorder}` }}>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: T.textSecondary }}>
            <span className="h-2 w-3 rounded-sm inline-block" style={{ background: T.accentLight }} />
            Chats
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: T.textSecondary }}>
            <span className="h-2 w-3 rounded-sm inline-block" style={{ background: T.accentDim }} />
            Agents
          </div>
          <p className="text-xs ml-auto" style={{ color: T.textSecondary }}>
            {totalActivity === 0 ? 'Start chatting to see activity here.' : 'Based on created chats and agents.'}
          </p>
        </div>
      </div>

      {/* Task completion heatmap */}
      <div {...CARD} style={{ ...CARD.style, padding: '24px' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" style={{ color: T.textSecondary }} />
            <h2 className="text-sm font-semibold" style={{ color: T.textPrimary }}>Task completions — last 52 weeks</h2>
          </div>
          <span className="text-xs" style={{ color: T.textSecondary }}>
            {heatmapDays.reduce((s, d) => s + d.count, 0)} total
          </span>
        </div>
        {heatmapDays.length > 0 ? (
          <ActivityHeatmap days={heatmapDays} />
        ) : (
          <p className="text-xs py-4 text-center" style={{ color: T.textSecondary }}>Complete tasks to see your heatmap.</p>
        )}
      </div>

      {/* Weekly velocity */}
      <div {...CARD} style={{ ...CARD.style, padding: '24px' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" style={{ color: T.textSecondary }} />
            <h2 className="text-sm font-semibold" style={{ color: T.textPrimary }}>Weekly velocity — last 12 weeks</h2>
          </div>
          <span className="text-xs" style={{ color: T.textSecondary }}>tasks completed / week</span>
        </div>
        {velocityWeeks.some((w) => w.count > 0) ? (
          <VelocityChart weeks={velocityWeeks} />
        ) : (
          <p className="text-xs py-4 text-center" style={{ color: T.textSecondary }}>Complete tasks to see velocity.</p>
        )}
      </div>
    </section>
  )
}
