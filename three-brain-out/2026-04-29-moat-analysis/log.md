# Moat Analysis — 2026-04-29

## Source files
- `docs/doc/xeref-ai.png` — strategy infographic (NotebookLM-generated) ✅ read visually
- `docs/doc/three-brain-SKILL.md` — three-brain routing skill spec ✅ read in full
- `docs/doc/Architecting_the_Xeref_Moat.pdf` — ❌ pdftoppm missing; Gemini @file not supported in v0.1.9
- `docs/doc/The_human_moat_for_AI_solopreneurs.m4a` — ❌ Gemini @file not supported in v0.1.9
- `docs/doc/Tek_Girişimcinin_Hendeği.mp4` — ❌ Gemini @file not supported in v0.1.9

## Gemini CLI note
Gemini v0.1.9 does not support `@path` file syntax. Use stdin pipe instead:
```bash
cat file.pdf | gemini -p "your prompt"
```
For binary files (audio/video), a different approach is needed — either the Gemini API directly or upgrade the CLI.

## Strategy extracted from PNG
Thesis: technical fluency is the baseline by 2030; moat = community + trust + design.
2025 execution: Harden Security → Scale Community → Elevate UI/UX.
Product foundation already built: XerefClaw (CLAWS) / MCP-native / Telegram endpoint / Pinecone memory.

## Actions taken
- CLAUDE.md updated with Key Infrastructure section (connections, MCP, Pinecone, three-brain)
- `docs/runbooks/oauth-token-revocation.md` created
- `docs/runbooks/mcp-incident.md` created
- `docs/runbooks/creem-webhook-failure.md` created
- Security audit completed: connections stack is solid (AES-256-GCM, HMAC state, no raw token exposure)

## Next
- Step 2: Expand `lib/pinecone.ts` to `xeref_user_memory` namespace
- Step 3: Web Widget endpoint (highest acquisition impact after Telegram)
