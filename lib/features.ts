import { Category, Feature } from './types';

export const categories: Category[] = [
  {
    id: 'connect',
    name: 'Connect',
    description: 'Messaging channels & communication',
    icon: 'MessageSquare',
    color: 'text-blue-500',
  },
  {
    id: 'listen',
    name: 'Listen',
    description: 'Voice, vision, and document understanding',
    icon: 'Mic',
    color: 'text-cyan-500',
  },
  {
    id: 'archive',
    name: 'Archive',
    description: 'Memory systems and knowledge bases',
    icon: 'Brain',
    color: 'text-amber-500',
  },
  {
    id: 'wire',
    name: 'Wire',
    description: 'Tools, integrations, and automation',
    icon: 'Plug',
    color: 'text-green-500',
  },
  {
    id: 'sense',
    name: 'Sense',
    description: 'Proactive behaviors and scheduling',
    icon: 'Activity',
    color: 'text-red-500',
  },
  {
    id: 'agent-architecture',
    name: 'Agent Architecture',
    description: 'Core agent capabilities and personality',
    icon: 'Cpu',
    color: 'text-cyan-500',
  },
];

export const features: Feature[] = [
  // --- CONNECT ---
  {
    id: 'telegram-bot',
    name: 'Telegram Bot',
    category: 'connect',
    description: 'Full integration with Telegram Bot API for chat.',
    difficulty: 'beginner',
    icon: 'MessageCircle',
    tags: ['messaging', 'chat'],
    requiredKeys: ['TELEGRAM_BOT_TOKEN'],
    prompt: `Integrate Telegram bot functionality using 'telegraf' or 'grammy'.
1. Create a Telegram bot service that listens for messages.
2. Map incoming messages to the agent's input handler.
3. Send agent responses back to the user via Telegram.
4. Support text, images, and voice notes if possible.`,
    dependencies: ['telegraf'],
  },
  {
    id: 'discord-bot',
    name: 'Discord Bot',
    category: 'connect',
    description: 'chat helper for Discord servers.',
    difficulty: 'intermediate',
    icon: 'Disc',
    tags: ['messaging', 'community'],
    requiredKeys: ['DISCORD_BOT_TOKEN', 'DISCORD_APPLICATION_ID'],
    prompt: `Integrate Discord bot functionality using 'discord.js'.
1. Create a Discord client layout.
2. Implement messageCreate event handler.
3. Allow the bot to reply to mentions or specific channels.`,
    dependencies: ['discord.js'],
  },
  {
    id: 'whatsapp-integration',
    name: 'WhatsApp Integration',
    category: 'connect',
    description: 'Connect via Baileys or Evolution API.',
    difficulty: 'advanced',
    icon: 'Phone',
    tags: ['messaging', 'mobile'],
    requiredKeys: [],
    prompt: `Integrate WhatsApp using '@whiskeysockets/baileys'.
1. Set up a socket connection for WhatsApp Web.
2. Handle QR code generation for authentication.
3. Listen for incoming messages and route to agent.`,
    dependencies: ['@whiskeysockets/baileys'],
  },
  {
    id: 'slack-integration',
    name: 'Slack Integration',
    category: 'connect',
    description: 'Slack bot for workspace automation.',
    difficulty: 'intermediate',
    icon: 'Hash',
    tags: ['messaging', 'work'],
    requiredKeys: ['SLACK_BOT_TOKEN', 'SLACK_APP_TOKEN'],
    prompt: `Integrate Slack using '@slack/bolt'.
1. Set up a Bolt app.
2. Listen for app_mention events.
3. Respond in threads.`,
    dependencies: ['@slack/bolt'],
  },
  {
    id: 'email-gateway',
    name: 'Email Gateway',
    category: 'connect',
    description: 'Send and receive emails via SMTP/IMAP.',
    difficulty: 'intermediate',
    icon: 'Mail',
    tags: ['communication', 'classic'],
    requiredKeys: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'],
    prompt: `Implement an Email Gateway.
1. Use 'nodemailer' for sending emails.
2. Use 'imap-simple' for reading emails.
3. Create a polling loop to check for new emails.`,
    dependencies: ['nodemailer', 'imap-simple'],
  },

  // --- LISTEN ---
  {
    id: 'voice-transcription',
    name: 'Voice Transcription',
    category: 'listen',
    description: 'Convert speech to text using Whisper.',
    difficulty: 'intermediate',
    icon: 'Mic',
    tags: ['audio', 'ai'],
    requiredKeys: ['GROQ_API_KEY'],
    prompt: `Implement voice transcription using Groq's Whisper API (fastest).
1. Accept audio files (mp3, wav, ogg).
2. Send to Groq API for transcription.
3. Return text to the agent pipeline.`,
  },
  {
    id: 'text-to-speech',
    name: 'Text-to-Speech',
    category: 'listen',
    description: 'Lifelike voice generation with ElevenLabs.',
    difficulty: 'beginner',
    icon: 'Speaker',
    tags: ['audio', 'voice'],
    requiredKeys: ['ELEVENLABS_API_KEY'],
    prompt: `Integrate ElevenLabs for TTS.
1. Create a helper to send text to ElevenLabs API.
2. Stream the audio response or save to file.
3. Play back audio if running locally.`,
  },
  {
    id: 'image-understanding',
    name: 'Vision (Multimodal)',
    category: 'listen',
    description: 'Analyze images using GPT-4o or similar.',
    difficulty: 'intermediate',
    icon: 'Eye',
    tags: ['vision', 'multimodal'],
    requiredKeys: ['OPENAI_API_KEY'],
    prompt: `Enable image understanding.
1. Allow the agent to accept image inputs (urls or base64).
2. Use GPT-4o or any vision-capable model to describe the image.
3. Inject the description into the conversation context.`,
  },
  {
    id: 'document-parsing',
    name: 'Document Parsing',
    category: 'listen',
    description: 'Ingest PDF, DOCX, and TXT files.',
    difficulty: 'intermediate',
    icon: 'FileText',
    tags: ['documents', 'data'],
    requiredKeys: [],
    prompt: `Implement document parsing.
1. Use 'pdf-parse' for PDFs.
2. Use 'mammoth' for DOCX.
3. Extract text and add to agent memory/context.`,
    dependencies: ['pdf-parse', 'mammoth'],
  },

  // --- ARCHIVE ---
  {
    id: 'core-memory',
    name: 'Core Memory',
    category: 'archive',
    description: 'Persistent facts about the user and agent.',
    difficulty: 'beginner',
    icon: 'HardDrive',
    tags: ['memory', 'system'],
    requiredKeys: [],
    prompt: `Implement a Core Memory system.
1. Create a 'core_memory.json' file.
2. Store key-value pairs (e.g., User Name, Preferences).
3. Inject these facts into the system prompt of every interaction.`,
  },
  {
    id: 'conversation-buffer',
    name: 'Conversation Buffer',
    category: 'archive',
    description: 'Short-term memory of recent chats.',
    difficulty: 'beginner',
    icon: 'MessageSquare',
    tags: ['memory', 'chat'],
    requiredKeys: [],
    prompt: `Implement a Conversation Buffer.
1. Keep the last N messages in memory.
2. If the buffer exceeds token limit, summarize older messages.`,
  },
  {
    id: 'semantic-memory',
    name: 'Semantic Memory (RAG)',
    category: 'archive',
    description: 'Long-term vector memory with Pinecone.',
    difficulty: 'advanced',
    icon: 'Database',
    tags: ['memory', 'vectors'],
    requiredKeys: ['PINECONE_API_KEY', 'OPENAI_API_KEY'],
    prompt: `Implement Semantic Memory using Pinecone.
1. Embed incoming messages using OpenAI embeddings.
2. Store vectors in Pinecone.
3. Retrieve relevant past context for each new query.`,
    dependencies: ['@pinecone-database/pinecone'],
  },
  {
    id: 'markdown-memory',
    name: 'Markdown Memory',
    category: 'archive',
    description: 'Local file-based memory system.',
    difficulty: 'beginner',
    icon: 'File',
    tags: ['memory', 'local'],
    requiredKeys: [],
    prompt: `Implement Markdown Memory.
1. Create a 'memory/' directory.
2. Store notes and logs as .md files.
3. Allow the agent to read/write these files.`,
  },

  // --- WIRE ---
  {
    id: 'web-search',
    name: 'Web Search',
    category: 'wire',
    description: 'Live internet access via Tavily or Serper.',
    difficulty: 'beginner',
    icon: 'Globe',
    tags: ['search', 'tools'],
    requiredKeys: ['TAVILY_API_KEY'],
    prompt: `Integrate Web Search using Tavily.
1. Create a tool 'search_web(query)'.
2. Call Tavily API to get search results.
3. Return snippets to the agent.`,
  },
  {
    id: 'browser-automation',
    name: 'Browser Automation',
    category: 'wire',
    description: 'Control a headless browser (Puppeteer/Playwright).',
    difficulty: 'advanced',
    icon: 'Monitor',
    tags: ['automation', 'scraping'],
    requiredKeys: [],
    prompt: `Implement Browser Automation with Playwright.
1. Create tools to 'goto', 'click', 'type', 'scrape'.
2. Run a headless browsing session.
3. allow the agent to navigate the web.`,
    dependencies: ['playwright'],
  },
  {
    id: 'github-integration',
    name: 'GitHub Integration',
    category: 'wire',
    description: 'Manage issues, PRs, and repos.',
    difficulty: 'intermediate',
    icon: 'Github',
    tags: ['dev', 'tools'],
    requiredKeys: ['GITHUB_TOKEN'],
    prompt: `Integrate GitHub API.
1. Use Octokit to authenticate.
2. Create tools to list issues, read code, and create PRs.`,
    dependencies: ['octokit'],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'wire',
    description: 'Manage schedule and events.',
    difficulty: 'intermediate',
    icon: 'Calendar',
    tags: ['productivity', 'google'],
    requiredKeys: ['GOOGLE_CALENDAR_CLIENT_ID'],
    prompt: `Integrate Google Calendar.
1. OAuth flow for user authentication.
2. Tools to list events and create new events.`,
    dependencies: ['googleapis'],
  },
  {
    id: 'shell-execution',
    name: 'Shell Execution',
    category: 'wire',
    description: 'Run terminal commands securely.',
    difficulty: 'advanced',
    icon: 'Terminal',
    tags: ['system', 'dangerous'],
    requiredKeys: [],
    prompt: `Implement Shell Execution tool.
1. Allow the agent to run bash/powershell commands.
2. IMPORTANT: Sandbox or require user confirmation for every command.`,
  },

  // --- SENSE ---
  {
    id: 'daily-heartbeat',
    name: 'Daily Heartbeat',
    category: 'sense',
    description: 'Cron-based morning routine.',
    difficulty: 'intermediate',
    icon: 'Clock',
    tags: ['scheduling', 'active'],
    requiredKeys: [],
    prompt: `Implement a Daily Heartbeat.
1. Use 'node-cron' to schedule a task at 8 AM.
2. Trigger the agent to wake up and check news/schedule.
3. Send a morning briefing to the user.`,
    dependencies: ['node-cron'],
  },
  {
    id: 'news-digest',
    name: 'News Digest',
    category: 'sense',
    description: 'Fetch and summarize top news.',
    difficulty: 'beginner',
    icon: 'Newspaper',
    tags: ['news', 'info'],
    requiredKeys: ['NEWS_API_KEY'],
    prompt: `Implement News Digest.
1. Fetch top headlines from NewsAPI.
2. Summarize them using the LLM.
3. Present as a daily report.`,
  },

  // --- AGENT ARCHITECTURE ---
  {
    id: 'soul-personality',
    name: 'Soul / Personality',
    category: 'agent-architecture',
    description: 'Define the agent\'s character in soul.md.',
    difficulty: 'beginner',
    icon: 'User',
    tags: ['personality', 'core'],
    requiredKeys: [],
    prompt: `Create a 'soul.md' file.
1. Define the agent's name, role, and backstory.
2. Define speaking style and quirks.
3. Load this into the system prompt.`,
  },
  {
    id: 'multi-agent-routing',
    name: 'Multi-Agent Routing',
    category: 'agent-architecture',
    description: 'Route tasks to specialist sub-agents.',
    difficulty: 'advanced',
    icon: 'Users',
    tags: ['architecture', 'scaling'],
    requiredKeys: [],
    prompt: `Implement Multi-Agent Routing.
1. Create a "Router" agent that analyzes the request.
2. Forward the request to "Coder", "Researcher", or "Chatter" sub-agents.
3. Aggregate the results.`,
  },
];
