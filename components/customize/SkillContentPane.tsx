'use client'

import { useState } from 'react'
import { Copy, FileCode2, Eye, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface SkillContentPaneProps {
  content: string
  filename?: string
}

type ViewMode = 'preview' | 'raw'

export function SkillContentPane({ content, filename = 'Untitled' }: SkillContentPaneProps) {
  const [mode, setMode] = useState<ViewMode>('preview')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const isMarkdown = filename.endsWith('.md')

  return (
    <div className="flex flex-col h-full bg-muted/20 border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{filename}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {isMarkdown && (
            <div className="flex bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setMode('preview')}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                  mode === 'preview' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                onClick={() => setMode('raw')}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                  mode === 'raw' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                Raw
              </button>
            </div>
          )}
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isMarkdown && mode === 'preview' ? (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-[#0d1117] prose-pre:p-4 prose-pre:rounded-xl">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="text-sm font-mono text-foreground/90 whitespace-pre-wrap break-words">
            <code>{content}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
