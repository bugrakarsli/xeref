import { GitFork } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WorkflowsView() {
  return (
    <section aria-label="Workflows" className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Workflows</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Chain agents together into automated multi-step workflows.
        </p>
      </div>

      {/* Description card */}
      <div className="rounded-xl border bg-card p-5 mb-4">
        <div className="flex gap-4 items-start">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <GitFork className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Automate your agent pipelines</p>
            <p className="text-sm text-muted-foreground">
              Define triggers (cron schedules or webhooks), set conditions, and chain multiple agent
              actions together. Workflows let you automate repetitive tasks without manual intervention.
            </p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center flex-1 gap-3 rounded-xl border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-4">
          <GitFork className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No workflows yet</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Create your first workflow to automate agent runs on a schedule or trigger.
        </p>
        <Button size="sm" variant="outline" className="mt-1" disabled>
          Create Workflow
        </Button>
      </div>
    </section>
  )
}
