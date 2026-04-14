'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const CURRENT_VERSION = 'v1.6.0'
const STORAGE_KEY = 'xeref_dismissed_version'

const highlights = [
  'Xeref model — free plan default',
  'Plan-aware model routing (Basic / Pro / Ultra)',
  'Per-plan API key isolation for cost control',
]

export function WhatsNewToast() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY)
      if (dismissed !== CURRENT_VERSION) {
        setVisible(true)
      }
    } catch {
      // localStorage unavailable
    }
  }, [])

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, CURRENT_VERSION)
    } catch {
      // ignore
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className={cn(
        'fixed bottom-5 right-5 z-50 w-72 rounded-xl border bg-card shadow-lg',
        'animate-in slide-in-from-bottom-4 fade-in duration-300'
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold">What&apos;s new in {CURRENT_VERSION}</p>
          </div>
          <ul className="space-y-0.5 mb-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/60 shrink-0" />
                {h}
              </li>
            ))}
          </ul>
          <Link
            href="/changelog"
            onClick={dismiss}
            className="text-xs font-medium text-primary hover:underline"
          >
            See full changelog →
          </Link>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
