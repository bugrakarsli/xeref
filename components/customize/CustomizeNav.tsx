'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Zap, Plug } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/customize/skills', label: 'Skills', icon: Zap },
  { href: '/customize/connectors', label: 'Connectors', icon: Plug },
]

export function CustomizeNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col w-52 shrink-0 h-full border-r bg-card py-4 gap-1 px-3">
      <Link
        href="/"
        className="flex items-center gap-2 px-2 py-2 mb-3 rounded-lg text-sm font-semibold hover:bg-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        <span>Customize</span>
      </Link>

      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              active ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
