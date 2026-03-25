---
name: subagent-creator
description: Creates custom subagents with specific capabilities, tools, and prompts. Use when you need to create a specialized AI assistant that handles specific tasks with custom configuration.
---

# Subagent Creator

## Overview
This skill guides the creation of custom subagents - specialized AI assistants that run in their own context window with custom system prompts, tool access, and permissions.

## When to Use Subagents

- Preserve context by keeping exploration out of main conversation
- Enforce constraints by limiting tool access
- Reuse configurations across projects
- Specialize behavior with focused prompts
- Control costs by routing to faster models

**vs Agent Teams:** Use subagents for focused tasks. Use agent teams when teammates need to communicate and coordinate.

## Subagent Scope

| Location | Scope | Priority |
|----------|-------|----------|
| `--agents` CLI flag | Current session | 1 (highest) |
| `.claude/agents/` | Current project | 2 |
| `~/.claude/agents/` | All projects | 3 |
| Plugin's `agents/` | Where plugin enabled | 4 (lowest) |

## Creating a Subagent

### Step 1: Define Purpose
- What task does the subagent handle?
- What tools does it need?
- When should it be invoked?

### Step 2: Choose Location
- Project: `.claude/agents/<name>.md`
- User-level: `~/.claude/agents/<name>.md`

### Step 3: Write Subagent File

```yaml
---
name: subagent-name
description: When Claude should delegate to this subagent
tools: Read, Grep, Glob
model: sonnet
permissionMode: default
---

Your system prompt here.
```

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier (lowercase, hyphens) |
| `description` | Yes | When to delegate to this subagent |
| `tools` | No | Tools subagent can use |
| `disallowedTools` | No | Tools to deny |
| `model` | No | sonnet, opus, haiku, inherit |
| `permissionMode` | No | default, acceptEdits, dontAsk, bypassPermissions, plan |
| `maxTurns` | No | Max agentic turns |
| `skills` | No | Skills to preload |
| `mcpServers` | No | MCP servers available |
| `hooks` | No | Lifecycle hooks |
| `memory` | No | user, project, local |
| `background` | No | Run as background task |
| `isolation` | No | worktree for git worktree isolation |

## Tools Configuration

Allow specific tools:
```yaml
tools: Read, Grep, Glob, Bash
```

Deny specific tools:
```yaml
disallowedTools: Write, Edit
```

Restrict spawned subagents:
```yaml
tools: Task(worker, researcher), Read, Bash
```

## Model Selection

- `sonnet`: Balanced capability and speed
- `opus`: Most capable, slower
- `haiku`: Fast, low-latency
- `inherit`: Use same as main conversation

## Permission Modes

| Mode | Behavior |
|------|----------|
| `default` | Standard permission prompts |
| `acceptEdits` | Auto-accept file edits |
| `dontAsk` | Auto-deny prompts |
| `bypassPermissions` | Skip all checks |
| `plan` | Read-only plan mode |

## Preload Skills

```yaml
---
skills:
  - api-conventions
  - error-handling-patterns
---
```

Full skill content is injected into subagent context.

## Persistent Memory

```yaml
memory: user  # or project, local
```

Scopes:
- `user`: `~/.claude/agent-memory/<name>/`
- `project`: `.claude/agent-memory/<name>/`
- `local`: `.claude/agent-memory-local/<name>/`

## Hooks Example

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-command.sh"
```

## Subagent Templates

### Code Reviewer (Read-only)
```yaml
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer. Focus on:
- Code clarity and readability
- Proper error handling
- Security vulnerabilities
- Test coverage
- Performance considerations
```

### Debugger
```yaml
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior.
tools: Read, Edit, Bash, Grep, Glob
---

You are an expert debugger. Process:
1. Capture error and stack trace
2. Identify reproduction steps
3. Isolate failure location
4. Implement minimal fix
5. Verify solution
```

### Data Scientist
```yaml
---
name: data-scientist
description: Data analysis expert for SQL queries and data insights.
tools: Bash, Read, Write
model: sonnet
---

You are a data scientist. When invoked:
1. Write efficient SQL queries
2. Analyze and summarize results
3. Present findings clearly
```

### Database Reader (With Validation)
```yaml
---
name: db-reader
description: Execute read-only database queries.
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---

You are a database analyst with read-only access.
```

## Usage

After creating the subagent, invoke it:
```
Use the code-reviewer subagent to review my changes
```

Or let Claude auto-delegate based on description.

## Best Practices

1. **Focused purpose**: One specific task
2. **Clear description**: Helps Claude decide when to delegate
3. **Minimal tools**: Grant only necessary permissions
4. **Version control**: Share project subagents with team
