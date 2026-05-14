'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SIDEBAR_NAV_ITEMS, DEFAULT_VISIBLE_IDS, ALL_ITEM_IDS } from '@/lib/sidebar/items'
import type { SidebarPreferences } from '@/lib/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current: SidebarPreferences
  onSave: (prefs: SidebarPreferences) => Promise<void>
}

export function SidebarCustomizeModal({ open, onOpenChange, current, onSave }: Props) {
  const allIds = ALL_ITEM_IDS

  // Reconstruct full ordered list: current order first (for visible), then hidden in default order
  const initialOrder = [
    ...current.order.filter(id => allIds.includes(id)),
    ...allIds.filter(id => !current.order.includes(id)),
  ]

  const [order, setOrder] = useState<string[]>(initialOrder)
  const [visible, setVisible] = useState<Set<string>>(new Set(current.visible_tabs.filter(id => allIds.includes(id))))
  const [saving, setSaving] = useState(false)

  function move(id: string, dir: -1 | 1) {
    setOrder(prev => {
      const idx = prev.indexOf(id)
      if (idx === -1) return prev
      const next = [...prev]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  function toggle(id: string) {
    setVisible(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function reset() {
    setVisible(new Set(DEFAULT_VISIBLE_IDS))
    setOrder([
      ...DEFAULT_VISIBLE_IDS,
      ...allIds.filter(id => !DEFAULT_VISIBLE_IDS.includes(id)),
    ])
  }

  async function handleSave() {
    setSaving(true)
    try {
      const visibleOrdered = order.filter(id => visible.has(id))
      await onSave({ visible_tabs: visibleOrdered, order: visibleOrdered })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const visibleItems = order.filter(id => visible.has(id))
  const hiddenItems = order.filter(id => !visible.has(id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Customize Sidebar</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Visible section */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Visible</p>
            <div className="flex flex-col gap-1">
              {visibleItems.map((id, idx) => {
                const item = SIDEBAR_NAV_ITEMS.find(i => i.id === id)!
                return (
                  <div key={id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-accent/30">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    <span className="flex-1 text-sm">{item.label}</span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => move(id, -1)}
                        disabled={idx === 0}
                        className={cn('p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-20')}
                        aria-label={`Move ${item.label} up`}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => move(id, 1)}
                        disabled={idx === visibleItems.length - 1}
                        className={cn('p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-20')}
                        aria-label={`Move ${item.label} down`}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => toggle(id)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Hide ${item.label}`}
                    >
                      Hide
                    </button>
                  </div>
                )
              })}
              {visibleItems.length === 0 && (
                <p className="text-xs text-muted-foreground/60 italic px-2">No visible items</p>
              )}
            </div>
          </div>

          {/* Hidden section */}
          {hiddenItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Hidden</p>
              <div className="flex flex-col gap-1">
                {hiddenItems.map(id => {
                  const item = SIDEBAR_NAV_ITEMS.find(i => i.id === id)!
                  return (
                    <div key={id} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                      <span className="flex-1 text-sm text-muted-foreground">{item.label}</span>
                      <button
                        onClick={() => toggle(id)}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                        aria-label={`Show ${item.label}`}
                      >
                        Show
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={reset} className="mr-auto text-xs">
            Reset to defaults
          </Button>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
