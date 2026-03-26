import { Inbox } from 'lucide-react'

export function InboxView() {
  return (
    <section aria-label="Inbox" className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Notifications and outputs from your running agents.
        </p>
      </div>

      {/* Empty notification list area */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Notifications
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No new notifications</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Notifications from your running agents and system updates will appear here.
          </p>
        </div>
      </div>
    </section>
  )
}
