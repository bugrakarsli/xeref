# Xeref Landing Page — Implementation Guide

> Reference document for `app/login/page.tsx` redesign.
> Created: 2026-03-27 | Status: In progress

---

## Prerequisites

- [ ] `components/pricing-section.tsx` created (client component with Monthly/Annual toggle)
- [ ] All Lucide icons imported at top of `app/login/page.tsx`
- [ ] Dev server running: `npm run dev`

---

## Section Inventory

| # | Section | Bg | Component type |
|---|---------|-----|----------------|
| 0 | Navigation | transparent + backdrop-blur | Existing (keep as-is) |
| 1 | Hero | gradient `from-primary/10 to-background` | Server |
| 2 | Pillars | `bg-muted/50` | Server |
| 3 | Features | default | Server |
| 4 | Memory Architecture | `bg-muted/50` | Server |
| 5 | Dashboard Overview | default | Server |
| 6 | Tech Stack | `bg-muted/50` | Server |
| 7 | Pricing | default | Server wrapper → `<PricingSection />` (Client) |
| 8 | Roadmap | `bg-muted/50` | Server |
| 9 | CTA | gradient `from-primary/10 to-background` | Server |
| 10 | Footer | border-t | Existing (updated) |

---

## Component Dependency Map

```
app/login/page.tsx  (Server Component)
├── components/xeref-logo.tsx                (existing)
├── components/start-building-button.tsx     (existing, Client)
├── components/mobile-nav.tsx                (existing, Client)
├── components/pricing-section.tsx           (NEW, Client)
│   ├── components/ui/tabs.tsx
│   ├── components/ui/badge.tsx
│   ├── components/ui/button.tsx
│   └── components/start-building-button.tsx
├── components/ui/badge.tsx
└── components/ui/button.tsx
```

---

## Section 0 — Navigation

**File:** `app/login/page.tsx`
**Keep identical to current lines 14-36.**

Pattern:
```tsx
<header className="px-4 lg:px-6 h-14 flex items-center border-b backdrop-blur-sm sticky top-0 z-50 relative">
  {/* Logo: XerefLogo + "xeref.ai" text */}
  {/* Center nav (absolute positioned): XerefClaw | Docs | Pricing */}
  {/* Right: StartBuildingButton size="sm" + MobileNav */}
</header>
```

---

## Section 1 — Hero

**File:** `app/login/page.tsx`

### Copy
- **Badge:** "NOW LIVE IN BETA"
- **Headline:** "Build agents that remember everything"
- **Subtitle:** "Xeref is an agent-first productivity platform. Design AI agents, manage projects with AI-generated plans, and deploy to Telegram, Discord, and WhatsApp — all powered by long-term memory."
- **Primary CTA:** `<StartBuildingButton size="lg" showArrow />` — text: "Get Started"
- **Secondary CTA:** `<Button variant="outline" size="lg" asChild><Link href="/builder">Try as guest</Link></Button>`

### Image
- Src: `/xeref-ai-og-image.jpg`
- Width: 1200, Height: 630
- Container: `max-w-5xl mx-auto rounded-2xl overflow-hidden border shadow-2xl`

### Patterns reused
- Pulsing green dot: `animate-ping` on outer span, solid inner span (both `bg-green-400`)
- Gradient text: `bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60`

---

## Section 2 — Pillars

**File:** `app/login/page.tsx`
**Bg:** `bg-muted/50`

### Copy
- **Badge:** "Core Platform"
- **Heading:** "Three pillars. One platform."
- **Subheading:** "Everything you need to go from idea to deployed agent, with memory that grows with you."

### Cards data
| Icon | Color | Title | Description |
|------|-------|-------|-------------|
| `Cpu` | `bg-blue-500/10 text-blue-500` | Build | Use XerefClaw to design agents with modular features. AI goal decomposition turns your high-level idea into a structured project plan with phases and tasks in seconds. |
| `LayoutDashboard` | `bg-purple-500/10 text-purple-500` | Manage | Projects, Tasks, Notes, Daily Targets — all connected to the same MCP backend your agent uses. What you manage is what your agent knows. |
| `Send` | `bg-amber-500/10 text-amber-500` | Deploy | Ship your agent to Telegram, Discord, WhatsApp, or a web chat widget. No infra expertise required — just paste your API key and go. |

### Card pattern
```tsx
<div className="flex flex-col items-center space-y-2 border p-6 rounded-xl bg-background shadow-sm hover:shadow-md transition-shadow">
  <div className="p-3 {color-class} rounded-full mb-2">{Icon}</div>
  <h3 className="text-xl font-bold">{title}</h3>
  <p className="text-sm text-center text-muted-foreground">{description}</p>
</div>
```

---

## Section 3 — Features

**File:** `app/login/page.tsx`

### Copy
- **Badge:** "Features"
- **Heading:** "Built for how you actually work"

### Feature cards
| Icon | Color | Title | Description |
|------|-------|-------|-------------|
| `Target` | `bg-blue-500/10 text-blue-500` | AI Goal Decomposition | Type a goal. Xeref's AI generates a complete project plan — phases, tasks, priorities — and writes it to your workspace instantly. |
| `Zap` | `bg-purple-500/10 text-purple-500` | AI Task Prioritization | Ask "what should I work on next?" and get a reasoned top-3 list based on your context, daily targets, priorities, and deadlines. |
| `Sun` | `bg-amber-500/10 text-amber-500` | Daily Targets | Set 3 daily goals each morning. They surface on your Home view, inform AI prioritization, and give your agent real context about today's focus. |

### Wide card (MCP Backend)
| Icon | Color | Title | Description |
|------|-------|-------|-------------|
| `GitBranch` | `bg-emerald-500/10 text-emerald-500` | MCP-Native Backend | Every feature is exposed as an MCP tool. Your Xeref dashboard and your Claude/Antigravity agent use the exact same backend. |

Tags: `list_projects` · `create_task` · `search_memory` · `suggest_next_task`

---

## Section 4 — Memory Architecture

**File:** `app/login/page.tsx`
**Bg:** `bg-muted/50`

### Copy
- **Badge:** "Memory Architecture"
- **Heading:** "Long-term memory that grows with you"
- **Subtitle:** "Powered by Gemini Embedding 2 and Pinecone. Every task, note, and document is embedded and searchable — by you and your agents."

### Left column — tech items
| Icon | Color | Title | Description |
|------|-------|-------|-------------|
| `Database` | `text-blue-500` | Supabase — Structured Data | All your projects, tasks, notes, and context live here with row-level security. Your data is always isolated. |
| `Search` | `text-emerald-500` | Pinecone — Semantic Search | Embeddings stored in per-user namespaces. Millisecond hybrid search across your personal memory and Xeref's knowledge base. |
| `Layers` | `text-purple-500` | Gemini Embedding 2 | Google's natively multimodal embedding model. 3072-dimensional vectors, 8192-token context. Auto-embeds every write. |

### Right column — namespace visualization
Styled monospace card showing:
```
PINECONE NAMESPACES
● xeref_lessons     Classroom content
● xeref_posts       Community posts
● xeref_resources   Guides, PDFs, news
● xeref_youtube     Video transcripts
● user_{id}         Personal tasks & notes
```

Use `font-mono text-sm` for namespace names, `bg-muted/30 border rounded-xl p-6`.

---

## Section 5 — Dashboard Overview

**File:** `app/login/page.tsx`

### Copy
- **Badge:** "Dashboard"
- **Heading:** "Everything in one place"
- **Subtitle:** "Home and XerefClaw are live. The full platform rolls out in phases."

### Cards (12 total)
| Icon | Title | Description | Status |
|------|-------|-------------|--------|
| `Home` | Home | Agent overview, Daily Targets, saved agents | LIVE |
| `Cpu` | XerefClaw | Agent builder, CLAWS methodology | LIVE |
| `CheckSquare` | All Tasks | Unified tasks + AI prioritization | COMING SOON |
| `FolderKanban` | Projects | Goal decomposition + kanban board | COMING SOON |
| `BookOpen` | Classroom | Lessons + semantic search | COMING SOON |
| `Brain` | Memory | Document brain, OCR ingestion | COMING SOON |
| `Send` | Deploy | Telegram, Discord, WhatsApp, web widget | COMING SOON |
| `Calendar` | Calendar | Deadlines + focus blocks + Google Sync | COMING SOON |
| `Zap` | Workflows | Cron triggers + multi-channel automation | COMING SOON |
| `MessageSquare` | Chats | In-app agent chat with streaming + sources | COMING SOON |
| `BarChart2` | Stats | Productivity trends + agent usage | COMING SOON |
| `Inbox` | Inbox | Bot replies + activity feed | COMING SOON |

LIVE badge: `variant="secondary"` + green dot or just green text color
COMING SOON badge: `variant="outline"`

---

## Section 6 — Tech Stack

**File:** `app/login/page.tsx`
**Bg:** `bg-muted/50`

### Copy
- **Badge:** "Tech Stack"
- **Heading:** "Built on the right foundations"

### Stack items (6 total, 3-col grid)
| Icon | Color | Title | Description |
|------|-------|-------|-------------|
| `Database` | `bg-blue-500/10 text-blue-500` | Supabase | Auth, RLS, Edge Functions, structured data |
| `Brain` | `bg-emerald-500/10 text-emerald-500` | Pinecone | Vector memory, hybrid semantic search |
| `Layers` | `bg-purple-500/10 text-purple-500` | Gemini Embedding 2 | 3072-dim multimodal embeddings, 100+ languages |
| `Server` | `bg-amber-500/10 text-amber-500` | Xeref MCP Server | Projects, Tasks, Notes, Memory, Daily Targets |
| `Cpu` | `bg-rose-500/10 text-rose-500` | XerefClaw | Agent prompt builder, CLAWS methodology |
| `Smartphone` | `bg-cyan-500/10 text-cyan-500` | Mobile App | React Native companion (roadmap Phase 4) |

---

## Section 7 — Pricing

**File:** `app/login/page.tsx` (wrapper) + `components/pricing-section.tsx` (client)

### Copy (header, in server page)
- **Badge:** "Pricing"
- **Heading:** "Start for free. Scale as you grow."
- **Subtitle:** "No credit card required. Basic plan lets you explore without signing up."

### Pricing data (in `components/pricing-section.tsx`)

#### Toggle
- Monthly | Annual
- Annual shows "2 months free" badge

#### Basic (free)
| | Monthly | Annual |
|-|---------|--------|
| Price | Free | Free |
| Period | forever | forever |

Features:
- ✓ XerefClaw prompt builder
- ✓ Rate-limited API access
- ✓ Local-first — nothing stored in the cloud
- ✓ Antigravity IDE compatible output
- ✗ Projects & tasks
- ✗ Personal memory
- ✗ Deploy to channels

CTA: `<Button variant="outline" asChild><Link href="/builder">Try as guest</Link></Button>`

#### Pro (featured — "MOST POPULAR")
| | Monthly | Annual |
|-|---------|--------|
| Price | $17 | $170 |
| Per month equiv | $17/mo | $14.17/mo |
| Badge | — | "2 months free" |

Card style: `border-primary/30 bg-primary/5 relative overflow-hidden` + `<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />`

Features:
- ✓ Everything in Basic
- ✓ Projects, Tasks, Notes, Daily Targets
- ✓ AI goal decomposition & prioritization
- ✓ Gemini Embedding 2 + Pinecone memory
- ✓ Deploy to 2 channels

CTA: `<StartBuildingButton size="default" />`

#### Ultra
| | Monthly | Annual |
|-|---------|--------|
| Price | $77 | $770 |
| Per month equiv | $77/mo | $64.17/mo |
| Badge | — | "2 months free" |

Features:
- ✓ Everything in Pro
- ✓ Unlimited deploy channels
- ✓ Workflows & automation (cron/webhook)
- ✓ OCR Document Brain (18 file types)
- ✓ Unlimited memory namespaces
- ✓ Priority support

CTA: `<Button variant="outline" className="w-full" asChild><Link href="/builder">Get Ultra</Link></Button>`

---

## Section 8 — Roadmap

**File:** `app/login/page.tsx`
**Bg:** `bg-muted/50`

### Copy
- **Badge:** "Roadmap"
- **Heading:** "What's being built"

### Phase cards
| Phase | Title | Timeline | Priority items |
|-------|-------|----------|----------------|
| 0 | Immediate | This week | Fix Google OAuth display name, Coming Soon views for all sidebar sections, Waitlist CTAs per section |
| 1 | Core Platform | 4–8 weeks | Classroom section + semantic search, UserContext onboarding form, Projects CRUD + AI goal decomposition, Tasks & Notes CRUD + Daily Targets, Xeref MCP Server v1, Guest mode, Streaming responses in Chat |
| 2 | Memory & Community | 8–16 weeks | Gemini Embedding 2 auto-embedding, Pinecone user namespaces + Memory dashboard, YouTube Chat with timestamped sources, Calendar + Google Calendar sync, Image uploads in Chat |
| 3 | Deploy & Automate | 16–24 weeks | Telegram bot wizard, Discord/WhatsApp/web widget, Workflows: cron + webhook triggers, AI News Feed + daily digest, OCR Document Brain (18 file types), Stats: heatmap + velocity charts |

Phase badge colors:
- Phase 0: `bg-primary/10 text-primary border border-primary/20`
- Phase 1: `bg-blue-500/10 text-blue-500`
- Phase 2: `bg-purple-500/10 text-purple-500`
- Phase 3: `bg-amber-500/10 text-amber-500`

---

## Section 9 — CTA

**File:** `app/login/page.tsx`

### Copy
- **Badge:** "Early Access Open" (with pulsing green dot, same pattern as hero)
- **Heading:** "Your agents deserve a memory"
- **Body:** "Start with XerefClaw for free. No credit card. No signup wall for your first agent."
- **Primary CTA:** `<StartBuildingButton size="lg" showArrow />`
- **Secondary CTA:** `<Button variant="outline" size="lg" asChild><Link href="/builder">Try as guest</Link></Button>`

Background: `bg-gradient-to-b from-primary/10 to-background` outer, `border rounded-2xl bg-card p-12 md:p-16` inner card.

---

## Section 10 — Footer

**File:** `app/login/page.tsx`

```tsx
<footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t font-mono text-xs text-muted-foreground">
  <p>© 2026 Xeref LLC. All rights reserved.</p>
  <nav className="sm:ml-auto flex flex-wrap gap-4 sm:gap-6 justify-center">
    <Link href="/docs">Docs</Link>
    <Link href="/pricing">Pricing</Link>
    <Link href="/changelog">Changelog</Link>
    <Link href="/faq">FAQ</Link>
    <Link href="/about">About</Link>
    <Link href="/terms">Terms of Service</Link>
    <Link href="/privacy">Privacy</Link>
  </nav>
</footer>
```

---

## Lucide Icon Import List

```ts
import {
  // Pillars
  Cpu, LayoutDashboard, Send,
  // Features
  Target, Zap, Sun, GitBranch,
  // Memory
  Database, Search, Layers,
  // Dashboard overview
  Home, CheckSquare, FolderKanban, BookOpen, Brain,
  Calendar, MessageSquare, BarChart2, Inbox,
  // Tech stack
  Server, Smartphone,
} from 'lucide-react';
```

Note: `Cpu` and `Send` are reused across sections. `Zap` used in Features and Dashboard.

---

## Responsive Breakpoints

| Section | Mobile (default) | Tablet (sm) | Desktop (md/lg) |
|---------|-----------------|-------------|-----------------|
| Pillars | `grid-cols-1` | `grid-cols-2` | `md:grid-cols-3` |
| Features | `grid-cols-1` | — | `md:grid-cols-2` |
| Memory | `grid-cols-1` | — | `md:grid-cols-2` |
| Dashboard | `grid-cols-1` | `sm:grid-cols-2` | `lg:grid-cols-4` |
| Tech Stack | `grid-cols-1` | `sm:grid-cols-2` | `md:grid-cols-3` |
| Pricing | `grid-cols-1` | — | `md:grid-cols-3` |
| Roadmap | `grid-cols-1` | — | `md:grid-cols-2` |

---

## Reusable Code Patterns

### Pulsing live indicator
```tsx
<span className="relative flex h-2 w-2">
  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
</span>
```

### Section header (centered)
```tsx
<div className="flex flex-col items-center text-center mb-12">
  <Badge variant="secondary" className="mb-3">{label}</Badge>
  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{title}</h2>
  <p className="mt-3 max-w-[600px] text-muted-foreground">{subtitle}</p>
</div>
```

### Hover card
```tsx
<div className="flex flex-col items-center space-y-2 border p-6 rounded-xl bg-background shadow-sm hover:shadow-md transition-shadow">
```

### Monospace tag
```tsx
<span className="inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
  {tag}
</span>
```
