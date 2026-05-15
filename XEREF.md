# XEREF.md

> **This is the product identity document.** It defines what xeref is, who it's for, and the CLAWS methodology that underpins the whole platform.
> For technical setup, architecture, and API reference → see **README.md**.
> For coding conventions and invariants → see **CLAUDE.md**.

---

## What xeref is

**xeref** is a platform for building custom autonomous agents for hyperspecific use cases.

Not a generic AI assistant. Not a wrapped GPT. A builder — where you design an agent that knows your exact workflow, connects to your tools, remembers your work, and deploys to the channels you actually use. The dashboard you open every day and the agent you talk to in Telegram share the same backend.

The two-part model:
1. **Build** — use XerefClaw to configure agents via CLAWS: pick capabilities, generate a structured system prompt, save as a named project.
2. **Run** — use the dashboard to chat with your agents, manage tasks and workflows, and deploy them to messaging channels.

---

## Who it's for

**Builders and power users** who want agents tailored to how *they* work — not a generic chatbot with a system prompt. Concretely:

- Developers and solopreneurs who automate their own workflows
- Creators and content operators who need agents with memory of their content and projects
- Anyone who has hit the ceiling of generic AI tools and wants something that understands their specific context

Not for: enterprises wanting hosted SaaS AI, consumers looking for a ChatGPT replacement, or developers building agents for end customers (xeref is the agent builder, not the agent runtime you sell).

---

## The CLAWS methodology

CLAWS is a structured framework for designing agents. It forces you to think through every dimension of what an agent can do — rather than writing a single system prompt and hoping for the best.

There are five capability categories plus a sixth for core agent personality. The ordering is deliberate: you connect the agent to channels before you give it memory, and you give it memory before you make it proactive.

---

### C — Connect

> *"Messaging channels & communication"*

How the agent receives messages and sends responses. The first decision because an agent that can't talk to anything is a script.

Example capabilities: Telegram Bot, Slack Integration, Email Gateway, Discord Bot, WhatsApp Integration.

---

### L — Listen

> *"Voice, vision, and document understanding"*

Expanding the modalities the agent can process beyond text. A Telegram bot is a text loop — Listen upgrades it to understand voice notes, photos, PDFs, and files the user drops in.

Example capabilities: Voice Transcription (Whisper via Groq), Text-to-Speech (ElevenLabs), Vision / Multimodal (image analysis), Document Parsing (PDF, DOCX, TXT).

---

### A — Archive

> *"Memory systems and knowledge bases"*

How the agent remembers. Short-term (conversation buffer), medium-term (session summary), long-term (vector/semantic search), and hard facts (core memory). The xeref production implementation uses Gemini embeddings + Pinecone, namespaced per user.

Example capabilities: Core Memory (key facts injected every turn), Conversation Buffer (last N messages), Semantic Memory / RAG (Pinecone vector search), Knowledge Base ingestion.

---

### W — Wire

> *"Tools, integrations, and automation"*

External tools and APIs the agent can call. Search, calendar, task manager, code execution, database — anything that turns the agent from a text responder into something that acts on the world.

Example capabilities: Web Search (Tavily), Calendar integration (Google Calendar), Notion API, GitHub tools, custom REST API calls.

---

### S — Sense

> *"Proactive behaviors and scheduling"*

The difference between an agent that waits and an agent that acts. Cron schedules, event triggers, RSS monitoring — Sense capabilities let the agent initiate rather than just respond.

Example capabilities: Cron Scheduler, RSS/Web Monitor, Workflow Triggers, Daily Digest generation.

---

### Agent Architecture

> *"Core agent capabilities and personality"*

The foundation of the agent itself — before any channel or tool is added. Model selection, system prompt personality, response style, output format, reasoning mode. This category configures the agent as an identity, not a feature.

---

## What makes xeref different

**Configuration over prompting.** Generic tools let you add a system prompt. CLAWS forces you to walk through every dimension — channels, senses, memory, tools — before the prompt is generated. The result is a prompt that is structurally complete, not a paragraph you tweaked.

**Plan gates are server-enforced.** Model access is validated on the server before any upstream call. A Basic user cannot make the client request a Pro model — there is no client-side trust. This is not a UX decision; it is a security boundary.

**Memory is per-user-namespaced.** Pinecone indexes are filtered by `userId` at query time. Your data is never semantically mixed with another user's data. `listConnectionsForUser()` never returns raw OAuth tokens — only `getConnectionWithSecrets()` decrypts, and only on the server.

**The MCP backbone.** Projects, tasks, notes, and memory are all accessible via the Model Context Protocol. Your Claude agent and your xeref dashboard share the same data in real time — no manual sync, no copy-paste, no JSON export.

**Dark-mode-first, not dark-mode-toggled.** The dark aesthetic is intentional. There is no light-mode toggle because the product was designed in dark mode from the start. Adding a toggle would be backwards-compatibility work, not a feature.

**No marketing homepage.** `/` is the dashboard. If you are not logged in you are redirected to `/login`. Public pages (`/pricing`, `/docs`, `/changelog`, `/about`) are flat siblings — they exist to inform, not to funnel. The product is the product.

---

## Plan tiers — what each unlocks

| Tier | Price | What you get |
|---|---|---|
| **Basic** | Free | XerefClaw builder, basic chat (rate-limited), single session |
| **Pro** | $17/mo · $170/yr | Save projects, task/memory system, 2 deploy channels, 3 workflows, Haiku + Sonnet + DeepSeek Flash |
| **Ultra** | $77/mo · $770/yr | Unlimited channels + workflows, OCR document brain (Pinecone + Gemini), Claude Code workspace, all models including Opus |

Plans gate model access, channel count, workflow count, and OCR — not UI features. The dashboard is the same at every tier; what changes is what you can connect and how much the agent can remember.

---

## Brand & voice

- **Name**: lowercase `xeref` in all contexts except sentence-start and logo lockup. Never `Xeref`, never `XEREF`.
- **CLAWS**: always uppercase, always spelled out as an acronym when first introduced.
- **Tone**: concise, technical, direct. Never "powerful", "seamless", "robust", or "cutting-edge". Say what it does.
- **"Agents" not "AI assistants"**: xeref builds agents — entities with memory, tools, and channels. The word "assistant" undersells the architecture.
- **Platform, not tool**: xeref is a platform. Individual agents built on xeref are tools.
- **Attribution**: Built by Bugra Karsli — developer, content creator, AI automation builder, Turkey.

---

*For technical reference: see **README.md** (architecture, env vars, routes, DB schema) and **CLAUDE.md** (coding conventions, invariants, and rules for AI agents working in this codebase).*
