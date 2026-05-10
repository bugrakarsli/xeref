# Agent Configuration & CLAWS Methodology

This document outlines how agents are built and configured in **xeref** using the **CLAWS** methodology.

## The CLAWS Methodology

Agents in xeref are not just simple prompts. They are modular systems built by selecting features across six core categories:

### 1. Connect (C)
**Channels & Communication**  
How the agent talks to the world.
- **Telegram Bot**: Integration via `telegraf`.
- **Discord Bot**: Integration via `discord.js`.
- **WhatsApp**: Integration via `baileys`.
- **Slack**: Integration via `@slack/bolt`.
- **Email Gateway**: SMTP/IMAP communication.

### 2. Listen (L)
**Perception & Understanding**  
How the agent perceives multi-modal input.
- **Voice Transcription**: Whisper API (Groq/OpenAI).
- **Vision**: Image analysis via GPT-4o.
- **Document Parsing**: PDF, DOCX, and TXT ingestion.
- **Text-to-Speech**: Voice generation via ElevenLabs.

### 3. Archive (A)
**Memory & Knowledge**  
How the agent remembers facts and context.
- **Core Memory**: Persistent JSON storage for user preferences.
- **Conversation Buffer**: Short-term chat history management.
- **Semantic Memory (RAG)**: Long-term vector storage via Pinecone.
- **Markdown Memory**: Local file-based knowledge storage.

### 4. Wire (W)
**Orchestration & Tools**  
How the agent acts and automates tasks.
- **Web Search**: Real-time internet access via Tavily.
- **Browser Automation**: Web navigation via Playwright.
- **GitHub**: Repository and issue management.
- **Google Calendar**: Schedule and event management.
- **Shell Execution**: Secure terminal command execution.

### 5. Sense (S)
**Proactive Behaviors**  
How the agent initiates actions autonomously.
- **Daily Heartbeat**: Cron-based routines (e.g., morning briefings).
- **News Digest**: Autonomous news monitoring and summarization.

### 6. Agent Architecture
**Identity & Reasoning**  
The core logic and personality of the agent.
- **Soul / Personality**: Defined in `soul.md` to guide tone and backstory.
- **Multi-Agent Routing**: Orchestrating specialist sub-agents.
- **Three-Brain Strategy**: Adversarial reasoning (Gemini + Codex).

---

## Agent Construction Flow

1. **Project Definition**: Every agent starts as a **Project**.
2. **Feature Selection**: The user selects features from the CLAWS categories.
3. **Prompt Generation**: xeref synthesizes a comprehensive system prompt by combining the `prompt` snippets from all selected features.
4. **Deployment**: The agent is wired to its `Connect` channels and begins listening for triggers.

## Key Files
- `lib/features.ts`: Definition of all available features and their prompts.
- `app/actions/projects.ts`: Logic for saving and generating agent prompts.
- `components/dashboard/AgentPanel.tsx`: The primary UI for interacting with the active agent.
