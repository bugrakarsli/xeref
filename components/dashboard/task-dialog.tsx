'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { Task } from '@/lib/types'
import { Trash2 } from 'lucide-react'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onSave: (data: Partial<Task>) => Promise<void>
  onDelete?: (task: Task) => Promise<void>
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  onSave,
  onDelete,
}: TaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [status, setStatus] = useState<Task['status']>('todo')
  const [dueDate, setDueDate] = useState('')
  
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setTitle(task?.title ?? '')
      setDescription(task?.description ?? '')
      setPriority(task?.priority ?? 'medium')
      setStatus(task?.status ?? 'todo')
      setDueDate(task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '')
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open, task])

  function handleClose() {
    if (isPending) return
    onOpenChange(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    
    startTransition(async () => {
      try {
        await onSave({
          title: trimmedTitle,
          description: description.trim() || null,
          priority,
          status,
          due_date: dueDate || null,
        })
        // Dialog closing should be handled by onSave finishing if we want, or here
        // We'll let the parent handle toast but we can also just close here
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        toast.error(`Failed to save task: ${msg}`)
      }
    })
  }

  function handleDelete() {
    if (!task || !onDelete) return
    startTransition(async () => {
      try {
        await onDelete(task)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        toast.error(`Failed to delete task: ${msg}`)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {task ? 'Edit Task' : 'New Task'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-title" className="text-sm text-muted-foreground">
              Task title
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              disabled={isPending}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-description" className="text-sm text-muted-foreground">
              Description (optional)
            </Label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
              disabled={isPending}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Task['status'])} disabled={isPending}>
                <SelectTrigger className="capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Task['priority'])} disabled={isPending}>
                <SelectTrigger className="capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-due" className="text-sm text-muted-foreground">Due Date (optional)</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {task && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                disabled={isPending}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            ) : (
              <div /> // Spacer
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!title.trim() || isPending}>
                {task ? 'Save Changes' : 'Create Task'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
