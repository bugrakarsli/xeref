import { BarChart2, Bot, Zap, CheckSquare, Brain } from 'lucide-react'

const stats = [
  { label: 'Agents Created', value: 0, icon: Bot, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Prompts Generated', value: 0, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { label: 'Tasks Completed', value: 0, icon: CheckSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Memory Entries', value: 0, icon: Brain, color: 'text-amber-500', bg: 'bg-amber-500/10' },
]

export function StatsView() {
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

      {/* Placeholder chart */}
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center flex-1">
        <div className="rounded-full bg-muted p-4 mb-3">
          <BarChart2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Activity chart coming soon</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Visualizations for agent runs, task velocity, and usage trends will appear here.
        </p>
      </div>
    </section>
  )
}
