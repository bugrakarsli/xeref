import { Zap } from 'lucide-react'

export default function SkillsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-16 text-center">
      <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center mb-4">
        <Zap className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-bold mb-2">Skills</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        Build reusable prompt templates and tool chains for your agents. Coming soon.
      </p>
    </div>
  )
}
