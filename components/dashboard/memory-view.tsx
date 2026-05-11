'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { Brain, Upload, FolderOpen, FileText, Scan, Trash2, File, FileType, MessageSquare, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { getUserMemories, saveMemory, deleteMemory } from '@/app/actions/memories'
import type { Memory } from '@/lib/types'

interface Document {
  id: string
  name: string
  size: number
  mime_type: string
  status: 'processing' | 'ready' | 'error'
  created_at: string
}

type Tab = 'documents' | 'memories'

const ACCEPTED = '.pdf,.docx,.txt,.md'

function fileIcon(mimeType: string) {
  if (mimeType === 'application/pdf') return <FileType className="h-4 w-4 text-red-400" />
  if (mimeType.includes('word')) return <FileText className="h-4 w-4 text-blue-400" />
  return <File className="h-4 w-4 text-muted-foreground" />
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MemoryView() {
  const [docs, setDocs] = useState<Document[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [ocrEnabled, setOcrEnabled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('documents')
  const [memoryDraft, setMemoryDraft] = useState('')
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const fetchAll = useCallback(async () => {
    try {
      const [docsRes, mems] = await Promise.all([
        fetch('/api/memory/documents').then(r => r.ok ? r.json() : []),
        getUserMemories().catch(() => [] as Memory[]),
      ])
      setDocs(docsRes)
      setMemories(mems)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const uploadFile = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/memory/documents', { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Upload failed')
    setDocs(prev => [data, ...prev])
  }

  const ACCEPTED_EXTS = new Set(['.pdf', '.docx', '.txt', '.md'])

  const collectFilesFromEntry = (entry: FileSystemEntry): Promise<File[]> => {
    if (entry.isFile) {
      return new Promise((resolve) => {
        (entry as FileSystemFileEntry).file((file) => resolve([file]), () => resolve([]))
      })
    }
    if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader()
      return new Promise((resolve) => {
        const allEntries: FileSystemEntry[] = []
        const readBatch = () => {
          reader.readEntries(async (batch) => {
            if (batch.length === 0) {
              const nested = await Promise.all(allEntries.map(collectFilesFromEntry))
              resolve(nested.flat())
            } else {
              allEntries.push(...batch)
              readBatch()
            }
          }, () => resolve([]))
        }
        readBatch()
      })
    }
    return Promise.resolve([])
  }

  const uploadFileList = async (files: File[]) => {
    const accepted = files.filter(f => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase()
      return ACCEPTED_EXTS.has(ext)
    })
    if (accepted.length === 0) return
    setUploadError(null)
    setUploading(accepted.length)
    for (const file of accepted) {
      try {
        await uploadFile(file)
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed')
      }
      setUploading(prev => Math.max(0, prev - 1))
    }
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    await uploadFileList(Array.from(files))
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.types.includes('Files')) setDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setDragging(false)
    }
  }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault() }
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const items = Array.from(e.dataTransfer.items)
    const entries = items.map(item => item.webkitGetAsEntry()).filter(Boolean) as FileSystemEntry[]
    if (entries.length > 0) {
      const files = (await Promise.all(entries.map(collectFilesFromEntry))).flat()
      await uploadFileList(files)
    } else {
      await handleFiles(e.dataTransfer.files)
    }
  }

  const handleDelete = async (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id))
    await fetch(`/api/memory/documents/${id}`, { method: 'DELETE' })
  }

  const handleSaveMemory = () => {
    const content = memoryDraft.trim()
    if (!content) return
    startTransition(async () => {
      const mem = await saveMemory(content, 'manual')
      setMemories(prev => [mem, ...prev])
      setMemoryDraft('')
    })
  }

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id))
    startTransition(() => deleteMemory(id))
  }

  const totalSize = docs.reduce((sum, d) => sum + d.size, 0)

  const filteredDocs = searchQuery.trim()
    ? docs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : docs

  const filteredMemories = searchQuery.trim()
    ? memories.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : memories

  return (
    <section aria-label="Memory" className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Memory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your document brain — upload files, ingest content, search knowledge.
        </p>
      </div>

      {/* Stats bar */}
      {!loading && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-muted-foreground bg-muted/40 rounded-full px-3 py-1.5 border border-border">
            {docs.length} document{docs.length !== 1 ? 's' : ''}
          </span>
          {docs.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted/40 rounded-full px-3 py-1.5 border border-border">
              {fmtSize(totalSize)} ingested
            </span>
          )}
          <span className="text-xs text-muted-foreground bg-muted/40 rounded-full px-3 py-1.5 border border-border">
            {memories.length} memor{memories.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>
      )}

      {/* Upload area */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'rounded-xl border-2 border-dashed transition-colors bg-card p-10 flex flex-col items-center justify-center gap-3 text-center mb-4 select-none',
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
          uploading > 0 && 'pointer-events-none opacity-70',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <input
          ref={folderInputRef}
          type="file"
          className="hidden"
          // @ts-expect-error webkitdirectory is not in React's types
          webkitdirectory=""
          onChange={e => handleFiles(e.target.files)}
        />
        <div className={cn('rounded-full p-4 transition-colors', dragging ? 'bg-primary/20' : 'bg-primary/10')}>
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">
            {dragging ? 'Drop files or folders here' : 'Drop files or folders here, or choose below'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, MD — up to 50 MB · files &amp; folders supported</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={uploading > 0}
            onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            {uploading > 0 ? `Uploading ${uploading} file${uploading !== 1 ? 's' : ''}…` : 'Upload files'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={uploading > 0}
            onClick={e => { e.stopPropagation(); folderInputRef.current?.click() }}
          >
            <FolderOpen className="h-3.5 w-3.5 mr-1.5" />
            Upload folder
          </Button>
        </div>
      </div>

      {uploadError && (
        <p className="mb-4 text-xs text-destructive px-1">{uploadError}</p>
      )}

      {/* OCR chip */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setOcrEnabled(prev => !prev)}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors',
            ocrEnabled
              ? 'border-primary/60 bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
          )}
        >
          <Scan className="h-3.5 w-3.5" />
          OCR ingestion
          <Badge variant="outline" className="text-[9px] ml-1 py-0">beta</Badge>
        </button>
      </div>

      {/* Main panel */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Tab bar + search */}
        <div className="px-4 py-3 border-b flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setActiveTab('documents'); setSearchQuery('') }}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                activeTab === 'documents'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Documents {!loading && `(${docs.length})`}
            </button>
            <button
              onClick={() => { setActiveTab('memories'); setSearchQuery('') }}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                activeTab === 'memories'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Memories {!loading && `(${memories.length})`}
            </button>
          </div>
          <div className="flex-1" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'documents' ? 'Search documents…' : 'Search memories…'}
            className="h-7 text-xs max-w-48"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : activeTab === 'documents' ? (
          filteredDocs.length === 0 && searchQuery ? (
            <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
              <p className="text-sm text-muted-foreground">No documents match &ldquo;{searchQuery}&rdquo;</p>
            </div>
          ) : docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Brain className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No documents ingested yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Upload files above to build your knowledge base. Your agents will be able to search and reference this content.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filteredDocs.map(doc => (
                <li key={doc.id} className="flex items-center gap-3 px-4 py-3 group">
                  {fileIcon(doc.mime_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fmtSize(doc.size)} · {new Date(doc.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] shrink-0',
                      doc.status === 'ready' && 'border-green-500/40 text-green-500',
                      doc.status === 'error' && 'border-destructive/40 text-destructive',
                    )}
                  >
                    {doc.status}
                  </Badge>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                    aria-label="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : (
          /* Memories tab */
          <div>
            <div className="px-4 py-3 border-b flex gap-2">
              <Textarea
                value={memoryDraft}
                onChange={e => setMemoryDraft(e.target.value)}
                placeholder="Write a memory snippet to save…"
                className="text-sm resize-none min-h-[64px]"
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSaveMemory()
                }}
              />
              <Button
                size="sm"
                onClick={handleSaveMemory}
                disabled={!memoryDraft.trim() || isPending}
                className="shrink-0 self-end"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
            </div>

            {filteredMemories.length === 0 && searchQuery ? (
              <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
                <p className="text-sm text-muted-foreground">No memories match &ldquo;{searchQuery}&rdquo;</p>
              </div>
            ) : memories.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
                <div className="rounded-full bg-muted p-4">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No memories saved yet</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Write memory snippets above — key facts, preferences, or notes your agents should always remember.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filteredMemories.map(mem => (
                  <li key={mem.id} className="flex items-start gap-3 px-4 py-3 group">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm whitespace-pre-wrap">{mem.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(mem.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {mem.source === 'chat' && (
                          <Badge variant="outline" className="text-[9px] py-0">from chat</Badge>
                        )}
                        {mem.tags?.map(tag => (
                          <Badge key={tag} variant="outline" className="text-[9px] py-0">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                      aria-label="Delete memory"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
