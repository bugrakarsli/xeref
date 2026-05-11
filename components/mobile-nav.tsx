'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StartBuildingButton } from '@/components/start-building-button'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  return (
    <div className="relative sm:hidden" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <div 
        className={`absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-background shadow-lg z-50 overflow-hidden transition-all duration-200 origin-top-right ${
          open 
            ? 'scale-100 opacity-100 visible' 
            : 'scale-95 opacity-0 invisible pointer-events-none'
        }`}
      >
        <Link
          href="/builder"
          className="block px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
          onClick={() => setOpen(false)}
        >
          XerefClaw
        </Link>
        <Link
          href="/docs"
          className="block px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
          onClick={() => setOpen(false)}
        >
          Docs
        </Link>
        <Link
          href="/pricing"
          className="block px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
          onClick={() => setOpen(false)}
        >
          Pricing
        </Link>
        <Link
          href="/changelog"
          className="block px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
          onClick={() => setOpen(false)}
        >
          Changelog
        </Link>
        <div className="border-t border-border p-3" onClick={() => setOpen(false)}>
          <StartBuildingButton size="sm" />
        </div>
      </div>
    </div>
  )
}
