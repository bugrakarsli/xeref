'use client'

import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Shortcut {
  keys: string[]
  description: string
}

interface ShortcutGroup {
  label: string
  shortcuts: Shortcut[]
}

function isMac() {
  if (typeof navigator === 'undefined') return false
  return /mac/i.test(navigator.platform)
}

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  const mod = useMemo(() => (isMac() ? '⌘' : 'Ctrl'), [])

  const groups: ShortcutGroup[] = [
    {
      label: 'Navigation',
      shortcuts: [
        { keys: [mod, '1'], description: 'Switch to Chat tab' },
        { keys: [mod, '2'], description: 'Switch to Tasks tab' },
        { keys: [mod, '3'], description: 'Switch to Code tab' },
        { keys: [mod, 'E'], description: 'Toggle Agents view' },
      ],
    },
    {
      label: 'Productivity',
      shortcuts: [
        { keys: [mod, 'L'], description: 'Toggle Agent panel' },
        { keys: [mod, 'Shift', 'O'], description: 'New (chat / task / session)' },
        { keys: ['F'], description: 'Toggle search (when not in input)' },
      ],
    },
    {
      label: 'Voice',
      shortcuts: [
        { keys: ['F9'], description: 'Toggle voice recording' },
      ],
    },
    {
      label: 'Agent Manager',
      shortcuts: [
        { keys: [mod, 'B'], description: 'Toggle internal sidebar' },
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between gap-4 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <span className="text-foreground">{shortcut.description}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-border bg-muted px-1 text-[11px] font-medium text-muted-foreground"
                        >
                          {key}
                        </kbd>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
