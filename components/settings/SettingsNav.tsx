'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, User, Sliders, Code2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/settings/general', label: 'General', icon: User },
  { href: '/settings/capabilities', label: 'Capabilities', icon: Sliders },
  { href: '/settings/xeref-code', label: 'Xeref Code', icon: Code2 },
]

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col w-52 shrink-0 h-full border-r bg-card py-4 gap-1 px-3">
      <Link
        href="/"
        className="flex items-center gap-2 px-2 py-2 mb-3 rounded-lg text-sm font-semibold hover:bg-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        <span>Settings</span>
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
