'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Brain, Upload, FileText, Search, Scan, Trash2, File, FileType, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Document {
  id: string
  name: string
  size: number
  mime_type: string
  status: 'processing' | 'ready' | 'error'
  created_at: string
}

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
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [ocrEnabled, setOcrEnabled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch('/api/memory/documents')
      if (res.ok) setDocs(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const uploadFile = async (file: File) => {
    setUploadError(null)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/memory/documents', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(data.error ?? 'Upload failed')
        return
      }
      setDocs(prev => [data, ...prev])
    } catch {
      setUploadError('Upload failed — please try again')
    } finally {
      setUploading(false)
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    uploadFile(files[0])
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setDragging(false)
  }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault() }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const filteredDocs = searchQuery.trim()
    ? docs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : docs

  const toggleSearch = () => {
    setSearchOpen(prev => {
      if (prev) setSearchQuery('')
      else setTimeout(() => searchInputRef.current?.focus(), 50)
      return !prev
    })
  }

  const handleDelete = async (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id))
    await fetch(`/api/memory/documents/${id}`, { method: 'DELETE' })
  }

  return (
    <section aria-label="Memory" className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Memory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your document brain — upload files, ingest content, search knowledge.
        </p>
      </div>

      {/* Upload area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          'rounded-xl border-2 border-dashed transition-colors bg-card p-10 flex flex-col items-center justify-center gap-3 text-center mb-4 cursor-pointer select-none',
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
          uploading && 'pointer-events-none opacity-70',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <div className={cn('rounded-full p-4 transition-colors', dragging ? 'bg-primary/20' : 'bg-primary/10')}>
          <Upload className={cn('h-6 w-6 transition-colors', dragging ? 'text-primary' : 'text-primary')} />
        </div>
        <div>
          <p className="text-sm font-medium">
            {dragging ? 'Drop to upload' : 'Drop files here or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, MD — up to 50 MB</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          disabled={uploading}
          onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
        >
          {uploading ? 'Uploading…' : 'Upload document'}
        </Button>
      </div>

      {uploadError && (
        <p className="mb-4 text-xs text-destructive px-1">{uploadError}</p>
      )}

      {/* Capability chips */}
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
        <button
          onClick={toggleSearch}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors',
            searchOpen
              ? 'border-primary/60 bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
          )}
        >
          <Search className="h-3.5 w-3.5" />
          Semantic search
          <Badge variant="outline" className="text-[9px] ml-1 py-0">beta</Badge>
        </button>
      </div>

      {/* Semantic search bar */}
      {searchOpen && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search documents…"
            className="pl-8 pr-8 h-9 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Document list */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Documents
          </span>
          {docs.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {searchQuery ? `${filteredDocs.length} of ${docs.length}` : `${docs.length} file${docs.length !== 1 ? 's' : ''}`}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filteredDocs.length === 0 && searchQuery ? (
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
                    {fmtSize(doc.size)} · {new Date(doc.created_at).toLocaleDateString()}
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
        )}
      </div>
    </section>
  )
}
