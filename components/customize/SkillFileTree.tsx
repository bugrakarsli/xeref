'use client'

import { useState, useEffect } from 'react'
import { Folder, FolderOpen, File as FileIcon, ChevronRight, ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FileNode {
  name: string
  type: 'file' | 'directory'
  path: string
  children?: FileNode[]
}

interface SkillFileTreeProps {
  skillId: string
  onSelectFile?: (path: string) => void
  selectedPath?: string | null
}

export function SkillFileTree({ skillId, onSelectFile, selectedPath }: SkillFileTreeProps) {
  const [files, setFiles] = useState<FileNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']))

  useEffect(() => {
    async function loadFiles() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/skills/${skillId}/files`)
        if (!res.ok) throw new Error('Failed to load files')
        const data = await res.json()
        setFiles(data.files || [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (skillId) {
      loadFiles()
    }
  }, [skillId])

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const renderNode = (node: FileNode, level = 0) => {
    const isExpanded = expandedFolders.has(node.path)
    const isSelected = selectedPath === node.path

    if (node.type === 'directory') {
      return (
        <div key={node.path} className="flex flex-col">
          <button
            onClick={() => toggleFolder(node.path)}
            className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-accent rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
            style={{ paddingLeft: `${level * 12 + 8}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-amber-500/70 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-amber-500/70 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </button>
          {isExpanded && node.children && (
            <div className="flex flex-col">
              {node.children.map(child => renderNode(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <button
        key={node.path}
        onClick={() => onSelectFile?.(node.path)}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-md text-sm transition-colors",
          isSelected 
            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium" 
            : "text-muted-foreground hover:text-foreground"
        )}
        style={{ paddingLeft: `${level * 12 + 24}px` }}
      >
        <FileIcon className={cn("w-4 h-4 shrink-0", isSelected ? "opacity-100" : "opacity-50")} />
        <span className="truncate">{node.name}</span>
      </button>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg">
        {error}
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        No files found for this skill.
      </div>
    )
  }

  return (
    <div className="flex flex-col py-2">
      {files.map(file => renderNode(file))}
    </div>
  )
}
