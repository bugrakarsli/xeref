// Text extraction for the Memory OCR ingestion pipeline.
// Gemini is the primary provider; Mistral OCR is the fallback.
// Plain-text files are always extracted without any API call.

export async function extractText(
  buffer: Buffer,
  mimeType: string,
  ocr: boolean,
): Promise<string> {
  const type = mimeType.toLowerCase()

  if (type === 'text/plain' || type === 'text/markdown' || type === 'application/octet-stream') {
    return buffer.toString('utf-8')
  }

  if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    throw new Error('DOCX extraction not yet supported — upload as .txt or .md instead')
  }

  if (type === 'application/pdf' || type.startsWith('image/')) {
    if (!ocr) return ''
    return runOcrWithFallback(buffer, type)
  }

  return ''
}

async function runOcrWithFallback(buffer: Buffer, mimeType: string): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await runGeminiOcr(buffer, mimeType)
    } catch (err) {
      console.warn('[ocr] gemini failed, falling back to mistral:', err instanceof Error ? err.message : err)
    }
  }
  return runMistralOcr(buffer, mimeType)
}

async function runGeminiOcr(buffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY!
  const base64 = buffer.toString('base64')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Extract all text from this document. Return only the extracted text as clean markdown, preserving headings, lists, and paragraphs. No commentary.' },
            { inline_data: { mime_type: mimeType, data: base64 } },
          ],
        }],
      }),
    },
  )

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Gemini OCR error ${res.status}: ${body}`)
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  return (data.candidates?.[0]?.content?.parts ?? []).map(p => p.text ?? '').join('').trim()
}

async function runMistralOcr(buffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new Error('No OCR provider configured — set GEMINI_API_KEY or MISTRAL_API_KEY')

  const base64 = buffer.toString('base64')
  const docType = mimeType === 'application/pdf' ? 'document_url' : 'image_url'
  const dataUri = `data:${mimeType};base64,${base64}`

  const res = await fetch('https://api.mistral.ai/v1/ocr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-ocr-latest',
      document: { type: docType, [docType]: dataUri },
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Mistral OCR error ${res.status}: ${body}`)
  }

  const data = (await res.json()) as { pages?: Array<{ markdown?: string }> }
  return (data.pages ?? []).map(p => p.markdown ?? '').join('\n\n').trim()
}
