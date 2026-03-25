---
name: agent-team-creator
description: Orchestrates teams of Claude Code sessions working together. Use when a task benefits from parallel exploration, multiple perspectives, or dividing work among independent agents. Best for research, code review, debugging with competing hypotheses, and cross-layer coordination.
---

# Agent Team Creator

## Overview
This skill enables coordination of multiple Claude Code instances working together as a team. One session acts as the team lead, coordinating work, assigning tasks, and synthesizing results. Teammates work independently, each in its own context window.

## When to Use Agent Teams

**Best Use Cases:**
- Research and review: teammates investigate different aspects simultaneously
- New modules or features: each teammate owns a separate piece
- Debugging with competing hypotheses: teammates test different theories in parallel
- Cross-layer coordination: frontend, backend, and tests handled by different teammates

**When NOT to Use:**
- Sequential tasks (use subagents instead)
- Same-file edits
- Work with many dependencies
- Simple, quick tasks (overhead not worth it)

## Enable Agent Teams

Before creating a team, ensure agent teams are enabled:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Or set as environment variable:
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

## Creating a Team

### Step 1: Define the Task
Identify a task that benefits from parallel work:
- Complex, multi-faceted problems
- Tasks requiring different expertise
- Research or investigation work
- Code review across multiple dimensions

### Step 2: Specify Teammates
Choose teammate structure:
- Number of teammates
- Each teammate's focus/role
- Model to use (if specific)

**Example prompts:**
```
"Create a team with 3 teammates to explore this problem from different angles"
"Spawn five agents to investigate different hypotheses"
```

### Step 3: Assign Roles
Each teammate should have a clear, independent focus:

**Review roles:**
- Security reviewer
- Performance analyst
- Test coverage validator

**Research roles:**
- UX researcher
- Technical architect
- Devil's advocate

**Debugging roles:**
- Theory A investigator
- Theory B investigator
- etc.

### Step 4: Coordinate Work
Use the shared task list:
- Lead creates tasks
- Teammates claim available work
- Task dependencies handled automatically
- Use Shift+Down to cycle through teammates

## Team Communication

### Messaging
- **message**: send to specific teammate
- **broadcast**: send to all teammates (use sparingly)

### Display Modes
- **In-process**: all in main terminal, Shift+Down to cycle
- **Split panes**: each teammate in own pane (requires tmux/iTerm2)

```json
{
  "teammateMode": "in-process"
}
```

## Quality Gates

### Require Plan Approval
For complex tasks, require teammates to plan before implementing:

```
"Spawn an architect teammate to refactor the module. Require plan approval before changes."
```

### Use Hooks
- `TeammateIdle`: runs when teammate about to go idle
- `TaskCompleted`: runs when task being marked complete

Exit with code 2 to send feedback and keep working.

## Best Practices

### Give Enough Context
Teammates load project context (CLAUDE.md, MCP, skills) but not lead's conversation history. Include task-specific details:

```
"Spawn a security reviewer with the prompt: 'Review auth module for vulnerabilities. Focus on token handling...'"
```

### Size Tasks Appropriately
- **Too small**: coordination overhead not worth it
- **Too large**: teammates work too long without check-ins
- **Just right**: produces clear deliverable (function, test file, review)

### Avoid File Conflicts
Break work so each teammate owns different files.

### Monitor and Steer
Check progress, redirect approaches, synthesize findings. Don't let team run unattended.

## Example Team Scenarios

### Parallel Code Review
```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
```

### Debugging with Competing Hypotheses
```
Users report the app exits after one message. Spawn 5 teammates to investigate different hypotheses. Have them debate to disprove each other's theories.
```

### Research Task
```
Research three approaches for implementing this feature. Each teammate explores one approach, then present findings.
```

## Cleanup

When done:
```
"Clean up the team"
```

Always use the lead to clean up. Teammates should not run cleanup.

## Known Limitations

- No session resumption with in-process teammates
- Task status can lag
- One team per session
- No nested teams
- Lead is fixed for lifetime
- Split panes require tmux or iTerm2

## Compare with Subagents

| | Subagents | Agent Teams |
|---|---|---|
| Context | Own context, results return to caller | Own context, fully independent |
| Communication | Report to main only | Teammates message each other |
| Coordination | Main agent manages all | Shared task list |
| Best for | Focused tasks | Complex work requiring collaboration |
| Token cost | Lower | Higher |
