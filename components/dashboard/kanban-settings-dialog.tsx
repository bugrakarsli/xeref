'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Trash2, GripVertical, Flag, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KanbanColumn {
  id: string
  name: string
  color: string
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: '1', name: 'To Do', color: 'bg-blue-500' },
  { id: '2', name: 'In Progress', color: 'bg-amber-500' },
  { id: '3', name: 'Testing', color: 'bg-purple-500' },
  { id: '4', name: 'Completed', color: 'bg-emerald-500' },
]

interface KanbanSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KanbanSettingsDialog({ open, onOpenChange }: KanbanSettingsDialogProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(DEFAULT_COLUMNS)
  const [hideCompleted, setHideCompleted] = useState(false)

  function handleSave() {
    // In a real app, save to backend or global state here
    onOpenChange(false)
  }

  function handleReset() {
    setColumns(DEFAULT_COLUMNS)
    setHideCompleted(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#1e1e24] text-white border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium tracking-tight">
            Kanban Column Settings
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 overflow-x-auto py-4 scrollbar-thin">
          {columns.map((col, index) => (
            <div
              key={col.id}
              className="flex-shrink-0 w-64 bg-[#141418] rounded-xl p-4 border border-white/5 flex flex-col gap-4 relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center h-6 w-6 rounded-full border border-white/10 text-xs">
                  {index + 1}
                </div>
                <GripVertical className="h-4 w-4 text-white/40 cursor-grab" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-white/60">Name:</Label>
                <Input
                  value={col.name}
                  onChange={(e) => {
                    const next = [...columns]
                    next[index].name = e.target.value
                    setColumns(next)
                  }}
                  className="bg-[#0f0f13] border-white/10 text-sm font-medium"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <Label className="text-xs text-white/60">Icon:</Label>
                <Flag className="h-4 w-4 text-white/60" />
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/5 pb-4">
                <Label className="text-xs text-white/60">Color:</Label>
                <div className={cn('h-4 w-4 rounded-full', col.color)} />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setColumns(columns.filter(c => c.id !== col.id))}
                  className="text-white/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Column Button */}
          <button
            onClick={() => {
              setColumns([...columns, { id: Math.random().toString(), name: 'New Column', color: 'bg-gray-500' }])
            }}
            className="flex-shrink-0 w-64 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm">Add Column</span>
          </button>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-4 mt-2 border-t border-white/5">
          <div className="flex items-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Switch checked={hideCompleted} onCheckedChange={setHideCompleted} className="data-[state=checked]:bg-blue-600" />
              <span>Hide completed column</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <span>Drag columns to reorder</span>
            <div className="w-px h-4 bg-white/10" />
            <button onClick={handleReset} className="hover:text-white transition-colors">
              Reset to defaults
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white border-none"
            >
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
