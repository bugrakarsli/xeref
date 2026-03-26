'use client'

import { cn } from '@/lib/utils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function buildCalendarGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const rows: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}

export function CalendarView() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const currentDay = today.getDate()
  const rows = buildCalendarGrid(year, month)

  return (
    <section aria-label="Calendar" className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Schedule and review agent runs, deadlines, and deployment events.
        </p>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Month header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold">{MONTHS[month]} {year}</h2>
        </div>

        {/* Day-of-week row */}
        <div className="grid grid-cols-7 border-b">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        {rows.map((row, ri) => (
          <div key={ri} className={cn('grid grid-cols-7', ri < rows.length - 1 && 'border-b')}>
            {row.map((day, ci) => (
              <div
                key={ci}
                className={cn(
                  'min-h-[72px] p-2 text-sm',
                  ci < 6 && 'border-r',
                  !day && 'bg-muted/20',
                )}
              >
                {day && (
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                      day === currentDay
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground',
                    )}
                  >
                    {day}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
