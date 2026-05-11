# OCR Ingestion Pipeline

**Date:** 2026-05-11  
**Status:** Implemented

## What this does

Wires up the "OCR ingestion" beta toggle on the Memory view so that uploading files actually extracts text, chunks it, and indexes it into Pinecone — making documents searchable by agents in chat.

## Architecture

```
Upload  ──► POST /api/memory/documents          (status: processing)
                │
                └─ next/server after() ────────► lib/ocr.ts            extract text
                                            ───► lib/pinecone.ts       chunk + upsert → xeref_user_memory
                                            ───► documents row         status: ready, extracted_text

Chat    ──► POST /api/chat   ──►  recall_documents tool  ──►  searchUserDocuments()  ──►  Pinecone
```

## OCR toggle semantics

- **Off (default)** — `.txt` and `.md` are extracted (free). PDFs/images stored but not indexed.
- **On (beta)** — PDFs and images are additionally sent to Gemini OCR; Mistral used as fallback.

## Providers

Primary: **Gemini** (`gemini-2.5-flash`) via `https://generativelanguage.googleapis.com/v1beta`  
Fallback: **Mistral OCR** (`mistral-ocr-latest`) via `https://api.mistral.ai/v1/ocr`

Env vars required:
- `GEMINI_API_KEY` (primary)
- `MISTRAL_API_KEY` (fallback — used when Gemini call fails)

If both keys are absent and OCR is toggled on for a PDF/image, the document status becomes `error` with a clear message.

## Files changed

| File | Change |
|---|---|
| `supabase/migrations/20260511_documents_extracted.sql` | Added `extracted_text`, `processing_error` columns |
| `lib/ocr.ts` | New — dispatches by mime type; Gemini primary, Mistral fallback |
| `lib/pinecone.ts` | Added `xeref_user_memory` namespace: `indexDocumentChunks`, `searchUserDocuments`, `deleteDocumentChunks` |
| `app/api/memory/documents/route.ts` | Reads `ocr` flag, inserts with `processing`, background extraction via `after()` |
| `app/api/memory/documents/[id]/route.ts` | Cascade-deletes Pinecone chunks on doc delete |
| `components/dashboard/memory-view.tsx` | Sends `ocr` flag, polls every 3s while processing, surfaces `processing_error` |
| `app/api/chat/route.ts` | Added `recall_documents` tool — searches `xeref_user_memory` namespace |
| `CLAUDE.md` | Pinecone section updated to document active namespaces |

## Out of scope (deferred)

- DOCX support
- PDF text-layer extraction without OCR (pdfjs-dist)
- Re-process button for failed docs
