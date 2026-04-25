'use client'

import { Brain, Upload, FileText, Search, Scan } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function MemoryView() {
  return (
    <section aria-label="Memory" className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Memory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your document brain — upload files, ingest content, search knowledge.
        </p>
      </div>

      {/* Upload area */}
      <div className="rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-card p-10 flex flex-col items-center justify-center gap-3 text-center mb-6 cursor-pointer">
        <div className="rounded-full bg-primary/10 p-4">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">Drop files here or click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, MD — up to 50 MB</p>
        </div>
        <Button variant="outline" size="sm" className="mt-2">
          Upload document
        </Button>
      </div>

      {/* Coming-soon capability chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
          <Scan className="h-3.5 w-3.5" />
          OCR ingestion
          <Badge variant="outline" className="text-[9px] ml-1 py-0">soon</Badge>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          Semantic search
          <Badge variant="outline" className="text-[9px] ml-1 py-0">soon</Badge>
        </div>
      </div>

      {/* Document list — empty state */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Documents
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <Brain className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No documents ingested yet</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Upload files above to build your knowledge base. Your agents will be able to search and reference this content.
          </p>
        </div>
      </div>
    </section>
  )
}
