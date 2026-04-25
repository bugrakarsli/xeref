import Link from 'next/link'
import { Briefcase, Plug, Zap } from 'lucide-react'

const CARDS = [
  {
    href: '/customize/connectors',
    icon: Plug,
    title: 'Connect your apps',
    desc: 'Let Xeref read and write to the tools you already use.',
  },
  {
    href: '/customize/skills',
    icon: Zap,
    title: 'Create new skills',
    desc: 'Teach Xeref your processes, team norms, and expertise.',
  },
]

export default function CustomizePage() {
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
        {CARDS.map(({ href, icon: Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-muted/60 hover:bg-muted transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/80 border border-border">
              <Icon className="h-5 w-5 text-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
