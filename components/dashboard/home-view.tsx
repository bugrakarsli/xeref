'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import type { Project } from '@/lib/types'
import { deleteProject } from '@/app/actions/projects'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Bot, Trash2, Calendar, Layers } from 'lucide-react'

interface HomeViewProps {
  user: User
  projects: Project[]
  onProjectDeleted: (id: string) => void
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function ProjectCard({
  project,
  onDelete,
}: {
  project: Project
  onDelete: (id: string) => void
}) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteProject(project.id)
        onDelete(project.id)
      } catch {
        toast.error('Failed to delete project. Please try again.')
      }
    })
  }

  return (
    <div
      className="group flex flex-col gap-3 rounded-xl border bg-card p-5 hover:border-primary/40 transition-colors"
      role="article"
      aria-label={project.name}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">{project.name}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 opacity-40 md:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
          aria-label={`Delete project: ${project.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {project.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center gap-3 mt-auto pt-1">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Layers className="h-3 w-3" />
          <span>{project.selected_feature_ids.length} features</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(project.updated_at)}</span>
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full h-8 text-xs" asChild>
        <Link href="/builder">
          Open in Builder <ArrowRight className="h-3 w-3 ml-1" />
        </Link>
      </Button>
    </div>
  )
}

export function HomeView({ user, projects, onProjectDeleted }: HomeViewProps) {
  const raw = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'there'
  const username = raw.charAt(0).toUpperCase() + raw.slice(1)

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 max-w-5xl w-full mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()},{' '}
          <span className="text-primary">{username}</span>.
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          You have {projects.length} saved agent{projects.length !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* Quick action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border bg-card p-5">
        <div className="rounded-full bg-primary/10 p-3 shrink-0">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Build a new agent</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Open XerefClaw to select features and generate your agent prompt.
          </p>
        </div>
        <Button size="sm" asChild className="shrink-0 w-full sm:w-auto bg-white text-black hover:bg-white/90">
          <Link href="/builder">
            Start Building <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">
            Saved Agents
          </h2>
          <Badge variant="secondary">{projects.length}</Badge>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <Bot className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No saved agents yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Head to the builder, select features, and save your first agent configuration.
            </p>
            <Button size="sm" variant="outline" asChild className="mt-1">
              <Link href="/builder">Go to Builder</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={onProjectDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
