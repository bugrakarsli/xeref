---
name: brainstorming
description: Mandatory before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
---

# Brainstorming

## Overview
This skill must be used before any creative work including creating features, building components, adding functionality, or modifying behavior. It ensures thorough exploration of user intent, requirements, and design before implementation begins.

## Process Checklist

### 1. Explore Project Context
- Check relevant files in the project
- Review recent commits and changes
- Understand existing architecture and patterns
- Identify any constraints or dependencies

### 2. Ask Clarifying Questions
- Ask one question at a time
- Understand the purpose behind the request
- Identify constraints (deadlines, tech stack, budget)
- Establish success criteria

### 3. Propose Approaches
- Present 2-3 different approaches
- Explain trade-offs for each
- Provide your recommendation with reasoning
- Consider alternatives user might not have considered

### 4. Present Design
- Structure the design in sections scaled to complexity
- Use diagrams or code snippets where helpful
- Get user approval after each major section
- Don't proceed to implementation without explicit approval

### 5. Write Design Doc
- Save to `docs/plans/YYYY-MM-DD-<topic>-design.md`
- Include: Problem statement, Proposed solution, Alternative approaches considered, Implementation notes, Success criteria
- Commit the design document

### 6. Transition to Implementation
- Once design is approved, invoke the `writing-plans` skill
- Create a detailed implementation plan
- Begin implementation only after plan is approved

## Critical Rules

- **DO NOT** invoke any implementation skill
- **DO NOT** write any code
- **DO NOT** scaffold any project
- **DO NOT** take any implementation action

Until you have:
1. Presented a design
2. Received explicit user approval on the design
3. Created a design document and saved it

## Design Document Template

```markdown
# [Feature Name] Design

## Problem Statement
What problem are we solving?

## Goals
- Goal 1
- Goal 2

## Non-Goals
- What we're NOT solving

## Proposed Solution
[Detailed solution description]

## Alternatives Considered
[Other approaches and why they were rejected]

## Implementation Notes
[Technical considerations]

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```
