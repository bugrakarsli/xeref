# GEMINI.md

This file provides guidance to Gemini (gemini.google.com) and the Gemini CLI when working with code in this repository.

## What This App Is

**xeref** is an AI agent builder and productivity dashboard. It follows the CLAWS methodology for configuring agents and uses a "Three-Brain" strategy for complex reasoning.

## Gemini-Specific Workflows

### Long-Context Analysis
Gemini is the preferred "Brain" for tasks requiring massive context, such as:
- Repository-wide code reviews.
- Synthesizing long documentation or multiple PDF sources.
- Analyzing large datasets in `three-brain-out/`.

### Multimodal Capabilities
Use Gemini for:
- Reviewing UI/UX screenshots.
- Analyzing video strategy sessions (Remotion outputs).
- Parsing complex diagrams or hand-drawn wireframes.

## CLI Usage (v0.1.9)

> [!IMPORTANT]
> The current Gemini CLI (v0.1.9) does **not** support the `@file` syntax for local files. 

**Correct usage:**
```bash
# Pipe files via stdin
cat path/to/file.tsx | gemini -p "Analyze this React component"

# For multiple files
cat app/page.tsx components/Dashboard.tsx | gemini -p "Check for prop consistency"
```

## Critical Repository Patterns

### CLAWS Methodology
When designing prompts or features, follow the CLAWS order:
1. **Connect**: Integration logic (Google, Notion, Slack).
2. **Listen**: Event triggers and ingestion.
3. **Archive**: Semantic storage and memory (Pinecone).
4. **Wire**: Orchestration and agent logic.
5. **Sense**: Multimodal perception and reasoning.

### Tech Stack
- **Framework**: Next.js 16+ (Turbopack)
- **Styling**: Tailwind CSS v4 + OKLch colors
- **Database/Auth**: Supabase
- **Memory**: Pinecone
- **AI SDK**: Vercel AI SDK (`ai` package)

## Known Issues & Tips

- **Turbopack Panics**: If Turbopack panics on Windows with `os error 10054`, check for invalid CSS imports or clear the `.next` directory.
- **Client Components**: Always use `'use client'` for components using Supabase Browser Client or local storage.
- **Server Actions**: Preferred for all data mutations and AI orchestration.
