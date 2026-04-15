'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Project, Chat } from '@/lib/types'
import { addChatToProject } from '@/app/actions/chats'
import { toast } from 'sonner'
import { FolderOpen, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddChatToProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chat: Chat | null
  projects: Project[]
  onProjectAdded?: (chatId: string, projectId: string) => void
}

export function AddChatToProjectDialog({
  open,
  onOpenChange,
  chat,
  projects,
  onProjectAdded,
}: AddChatToProjectDialogProps) {
  const [loading, setLoading] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  async function handleAddToProject() {
    if (!chat || !selectedProjectId) return

    setLoading(true)
    try {
      await addChatToProject(chat.id, selectedProjectId)
      toast.success('Chat added to project')
      onProjectAdded?.(chat.id, selectedProjectId)
      onOpenChange(false)
      setSelectedProjectId(null)
    } catch (error) {
      toast.error('Failed to add chat to project')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add chat to project</DialogTitle>
          <DialogDescription>
            Select a project to organize this chat
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {projects.length > 0 ? (
            projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={cn(
                  'flex items-center gap-3 w-full rounded-lg px-3 py-2 text-left transition-colors',
                  'hover:bg-accent/50',
                  selectedProjectId === project.id
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card text-foreground'
                )}
              >
                <FolderOpen className="h-4 w-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  {project.description && (
                    <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                  )}
                </div>
                {selectedProjectId === project.id && (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                )}
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No projects yet. Create one to organize your chats.
            </p>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddToProject}
            disabled={!selectedProjectId || loading}
          >
            {loading ? 'Adding...' : 'Add to project'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
