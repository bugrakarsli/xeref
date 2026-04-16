'use client'

import { useState } from 'react'
import { ArrowLeft, LayoutGrid, FileText, Briefcase, Plug, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

type Section = 'home' | 'connectors' | 'skills'

const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'skills', label: 'Skills', icon: FileText },
  { id: 'connectors', label: 'Connectors', icon: LayoutGrid },
]

function CustomizeHome({ onNavigate }: { onNavigate: (s: Section) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="mb-6 text-foreground/80">
          <Briefcase className="h-20 w-20" strokeWidth={1} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Customize Xeref</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Skills, connectors, and plugins shape how Xeref works with you.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-lg">
        {[
          { id: 'connectors' as Section, icon: LayoutGrid, title: 'Connect your apps', desc: 'Let Xeref read and write to the tools you already use.' },
          { id: 'skills' as Section, icon: FileText, title: 'Create new skills', desc: 'Teach Xeref your processes, team norms, and expertise.' },
        ].map(({ id, icon: Icon, title, desc }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-muted/60 hover:bg-muted transition-colors text-left"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/80 border border-border">
              <Icon className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function ConnectorsContent() {
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

function SkillsContent() {
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

interface CustomizeViewProps {
  onBack: () => void
}

export function CustomizeView({ onBack }: CustomizeViewProps) {
  const [section, setSection] = useState<Section>('home')

  return (
    <div className="flex h-full">
      {/* Narrow left nav */}
      <nav className="flex flex-col w-52 shrink-0 h-full border-r bg-card py-4 gap-1 px-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-2 py-2 mb-3 rounded-lg text-sm font-semibold hover:bg-accent transition-colors text-left"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Customize</span>
        </button>

        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={cn(
              'flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors text-left',
              'hover:bg-accent hover:text-accent-foreground',
              section === id ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {section === 'home' && <CustomizeHome onNavigate={setSection} />}
        {section === 'connectors' && <ConnectorsContent />}
        {section === 'skills' && <SkillsContent />}
      </div>
    </div>
  )
}
