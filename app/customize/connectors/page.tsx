import { Plug } from 'lucide-react'

export default function ConnectorsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-16 text-center">
      <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-4">
        <Plug className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-bold mb-2">Connectors</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        Connect external services to your agents. Coming soon.
      </p>
    </div>
  )
}
