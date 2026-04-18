'use client'

import { useState } from 'react'
import { Copy, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { Artifact, ArtifactVersion } from '@/lib/types'

// ── Inline syntax tokenizer — no external deps ────────────────────────────────

const C = {
  comment: '#6b7280',
  string:  '#5DD9C1',
  number:  '#fbbf24',
  keyword: '#22d3ee',
}

const KEYWORDS: Record<string, string[]> = {
  typescript: ['const','let','var','function','return','if','else','for','while','import','export',
    'default','from','async','await','new','class','extends','interface','type','enum',
    'typeof','instanceof','void','null','undefined','true','false','throw','try','catch',
    'finally','switch','case','break','continue','of','in'],
  javascript: ['const','let','var','function','return','if','else','for','while','import','export',
    'default','from','async','await','new','class','extends','typeof','void','null',
    'undefined','true','false','throw','try','catch','finally','switch','case','break','continue'],
  python:    ['def','return','import','from','if','elif','else','for','while','class','and','or',
    'not','in','is','pass','lambda','yield','True','False','None','try','except',
    'finally','with','as','raise','async','await'],
  bash:      ['echo','if','fi','then','else','for','while','do','done','case','esac','function',
    'return','exit','set','export','local','mkdir','cd','tee','source'],
  json:      [],
}

function tokenize(code: string, language?: string): string {
  let s = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Comments (must run before strings so # inside strings isn't colored)
  s = s.replace(/(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)/g,
    `<span style="color:${C.comment};font-style:italic">$1</span>`)

  // Strings
  s = s.replace(/("(?:[^"\\<]|\\.)*"|'(?:[^'\\<]|\\.)*'|`(?:[^`\\<]|\\.)*`)/g,
    `<span style="color:${C.string}">$1</span>`)

  // Numbers (not inside spans)
  s = s.replace(/(?<![a-zA-Z"'`])(\b\d+(?:\.\d+)?\b)/g,
    `<span style="color:${C.number}">$1</span>`)

  const keywords = KEYWORDS[language ?? 'typescript'] ?? KEYWORDS.typescript
  if (keywords.length > 0) {
    const kwRegex = new RegExp(`(?<![a-zA-Z0-9_"'>])\\b(${keywords.join('|')})\\b(?![^<]*>)`, 'g')
    s = s.replace(kwRegex, `<span style="color:${C.keyword}">$1</span>`)
  }

  return s
}

// ── Minimal markdown to HTML — no external deps ───────────────────────────────

function renderMarkdown(md: string): string {
  const esc = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return esc
    .replace(/^### (.+)$/gm, '<h3 style="font-size:.875rem;font-weight:600;margin:1rem 0 .25rem">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:1rem;font-weight:600;margin:1.25rem 0 .375rem">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:1.125rem;font-weight:700;margin:1.5rem 0 .5rem">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em style="font-style:italic">$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,.06);padding:.1rem .3rem;border-radius:4px;font-family:monospace;font-size:.8rem">$1</code>')
    .replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:2px solid rgba(34,211,238,.4);padding-left:.75rem;color:rgba(255,255,255,.5);font-style:italic;margin:.5rem 0">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li style="margin-left:1.25rem;list-style-type:disc;margin-bottom:.2rem">$1</li>')
    .replace(/\n\n+/g, '</p><p style="margin-bottom:.75rem">')
    .replace(/\n/g, '<br/>')
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ArtifactPreviewProps {
  artifact: Artifact
  version: ArtifactVersion
}

export function ArtifactPreview({ artifact, version }: ArtifactPreviewProps) {
  const [tab, setTab] = useState<'preview' | 'raw'>('preview')
  const [copied, setCopied] = useState(false)
  const lang = version.language ?? artifact.language

  function handleCopy() {
    navigator.clipboard.writeText(version.content).then(() => {
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => toast.error('Copy failed'))
  }

  // Processing state
  if (artifact.status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium">Generating artifact…</p>
        <p className="text-xs text-muted-foreground">AI is working on this. Check back in a moment.</p>
        <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full w-2/3 animate-pulse" />
        </div>
      </div>
    )
  }

  // Image type
  if (artifact.type === 'image') {
    return (
      <div className="p-4">
        <div className="rounded-lg overflow-hidden border bg-muted/30">
          {artifact.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artifact.imageUrl}
              alt={artifact.title}
              className="w-full object-contain max-h-[500px]"
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Image not available
            </div>
          )}
        </div>
      </div>
    )
  }

  const isMarkdown = artifact.type === 'document' && lang === 'markdown'
  const highlighted = isMarkdown ? '' : tokenize(version.content, lang)

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTab('preview')}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors ${tab === 'preview' ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            {isMarkdown ? 'Preview' : 'Highlighted'}
          </button>
          <button
            onClick={() => setTab('raw')}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors ${tab === 'raw' ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            Raw
          </button>
          {lang && tab !== 'raw' && (
            <span className="text-xs text-muted-foreground font-mono ml-1">{lang}</span>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
          {copied
            ? <Check className="h-3.5 w-3.5 text-emerald-400" />
            : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {tab === 'preview' && isMarkdown && (
          <div
            className="px-4 py-3 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(version.content) }}
          />
        )}
        {tab === 'preview' && !isMarkdown && (
          <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        )}
        {tab === 'raw' && (
          <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto">
            <code>{version.content}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
