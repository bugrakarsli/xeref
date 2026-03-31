import { CheckSquare } from 'lucide-react'

interface TasksViewProps {
  projectCount?: number
}

export function TasksView({ projectCount }: TasksViewProps) {
  return (
    <section aria-label="All Tasks" className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">All Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tasks created by your agents or from project plans will appear here.
        </p>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b mb-1">
        <span className="col-span-5">Task</span>
        <span className="col-span-2">Status</span>
        <span className="col-span-2">Priority</span>
        <span className="col-span-3">Due Date</span>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center flex-1 gap-3 rounded-xl border border-dashed mt-4 p-12 text-center">
        <div className="rounded-full bg-muted p-4">
          <CheckSquare className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No tasks yet</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {typeof projectCount === 'number' && projectCount > 0
            ? `You have ${projectCount} agent${projectCount !== 1 ? 's' : ''} configured. Tasks will appear here as your agents run.`
            : 'Tasks created by your agents or generated from project plans will appear here.'}
        </p>
      </div>
    </section>
  )
}
