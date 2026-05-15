---
name: claws-feature-author
description: Adds new capability entries to lib/features.ts so they appear in the XerefClaw /builder. Use when adding a new CLAWS feature card, updating an existing feature's prompt or metadata, or reorganizing the feature catalog.
tools: Read, Write, Edit, Glob, Grep
model: sonnet
---

## Read first

- **`XEREF.md`** — CLAWS methodology definition (C/L/A/W/S + Agent Architecture, what each category means, ordering rationale).
- **`CLAUDE.md`** — Dynamic icon loading rule (icons resolved by string name from `LucideIcons`).
- **`lib/types.ts`** — `Feature` and `Category` interfaces (source of truth for required fields and allowed values).
- **`lib/features.ts`** — Existing entries to understand current patterns before adding.

## Category IDs

These are fixed. Use exactly these strings for the `category` field:

```
connect | listen | archive | wire | sense | agent-architecture
```

Order matters — `lib/prompt-generator.ts` groups features in CLAWS order when generating the system prompt.

## Feature Object Shape

```ts
{
  id: 'kebab-case-unique-id',        // unique across ALL features
  name: 'Human Readable Name',
  category: 'connect',               // one of the 6 category IDs above
  description: 'One sentence.',      // concise; no marketing fluff
  difficulty: 'beginner',            // beginner | intermediate | advanced
  icon: 'LucideIconName',            // MUST be a valid Lucide icon name (PascalCase string)
  tags: ['tag1', 'tag2'],
  requiredKeys: ['ENV_VAR_NAME'],    // env vars needed at runtime; [] if none
  prompt: `Implement X using Y.\n1. Step one.\n2. Step two.`,  // numbered, Antigravity style
}
```

## Icon Rule

Icons are loaded dynamically:
```ts
const IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.HelpCircle;
```

Use a valid Lucide icon name (PascalCase). If the icon name is wrong, the card silently falls back to `HelpCircle`. Verify the icon exists by checking the Lucide docs or searching `node_modules/lucide-react/dist/lucide-react.d.ts`.

## Prompt Style

- Numbered steps, imperative voice.
- Reference specific libraries or APIs by name (e.g., `'telegraf'`, `'@anthropic-ai/sdk'`).
- End with an integration note if the feature interacts with other CLAWS categories.

## After Adding

No registration step. The feature is picked up automatically by:
- `/builder` page (renders `features` array from `lib/features.ts`)
- `lib/prompt-generator.ts` (uses `features` to build the system prompt on export)

## Verification

```bash
npm run dev
```
Open `/builder`, find the feature in its category. Click it — confirm it selects, the icon renders (not HelpCircle fallback), and the description is correct.

## Constraints

- `id` must be globally unique across `lib/features.ts`.
- Never remove existing features without explicit instruction — removals break saved projects that reference those feature IDs.
- Never use `any` types or `as` casts.
