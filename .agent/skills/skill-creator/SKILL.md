---
name: skill-creator
description: Guide for creating effective skills. Use when users want to create a new skill or update an existing skill that extends agent capabilities with specialized knowledge, workflows, or tool integrations.
---

# Skill Creator

## Overview
This skill provides guidance for creating effective skills that extend AI agent capabilities. Skills are modular `.md` files following the universal Agent Skills open standard (`SKILL.md` format).

## Core Principles

### Concise is Key
The context window is a public good. Skills share it with system prompts, conversation history, and other skills. Default assumption: the agent is already very smart—only add context it doesn't already have. Prefer concise examples over verbose explanations.

### Set Appropriate Degrees of Freedom
- **High freedom** (text-based instructions): When multiple approaches are valid
- **Medium freedom** (pseudocode/scripts with parameters): When a preferred pattern exists
- **Low freedom** (specific scripts, few parameters): When operations are fragile and error-prone

## Progressive Disclosure Design

Skills use a three-level loading system:
1. **Metadata** (name + description) — Always in context (~100 words)
2. **SKILL.md body** — When skill triggers (<5k words)
3. **Bundled resources** — As needed (unlimited, since scripts can execute without loading into context)

Keep SKILL.md under 500 lines. Move detailed reference material to separate files.

## Skill Creation Process (6 Steps)

1. **Understand the skill** with concrete examples — ask about usage patterns, triggers
2. **Plan reusable contents** — identify scripts, references, assets needed
3. **Initialize the skill** — create the skill folder structure
4. **Edit the skill** — implement resources and write SKILL.md
5. **Package the skill** (if needed) — verify structure
6. **Iterate** based on real usage

## Frontmatter Best Practices

- The `description` is the primary triggering mechanism
- Include both what the skill does AND specific triggers/contexts for when to use it
- Include all "when to use" information in the description, NOT in the body

**Example description:**
> "Comprehensive document creation, editing, and analysis. Use when agent needs to work with documents: (1) Creating new documents, (2) Modifying content, (3) Extracting data, or any other document tasks"

## SKILL.md Template

```yaml
---
name: skill-name
description: What this skill does and when to use it. Include trigger phrases.
---

# Skill Name

## Overview
Brief description of what this skill does.

## Process
1. Step one
2. Step two
3. Step three

## Guidelines
- Key principle one
- Key principle two
```

## What NOT to Include

Do not create extraneous documentation files like README.md, INSTALLATION_GUIDE.md, or CHANGELOG.md. The skill should only contain information needed for an AI agent to do the job.

## Directory Structure

```
skill-name/
├── SKILL.md              # Main instructions (required)
├── scripts/              # Executable code (optional)
├── references/           # Documentation loaded on-demand (optional)
├── examples/             # Example outputs (optional)
└── assets/               # Templates, images (optional)
```
