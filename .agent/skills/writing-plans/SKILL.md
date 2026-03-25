---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code. Creates detailed implementation plans with bite-sized tasks.
---

# Writing Plans

## Overview
Use this skill when you have a spec or requirements for a multi-step task and need to create a detailed implementation plan before touching code. Plans should be actionable and precise.

## Plan Structure

Plans assume the engineer has zero codebase context. Each step should be:
- **One action** (2-5 minutes max)
- **Atomic** - can be completed independently
- **Verifiable** - you can confirm it succeeded

### Good Step Examples:
- "Write the failing test"
- "Run the test to confirm it fails"
- "Implement minimal code to pass the test"
- "Run all tests to verify"
- "Commit the changes"

### Bad Step Examples:
- "Implement the feature" (too large)
- "Write tests and implementation" (not atomic)
- "Debug and fix issues" (not specific)

## Process

### 1. Analyze Requirements
- Break down the feature into smallest possible pieces
- Identify dependencies between pieces
- Determine order of operations
- Note any setup or configuration needed

### 2. Create Step List
- Write each step as a single action
- Number steps in execution order
- Add notes for complex steps
- Include review/checkpoint steps

### 3. Add Context
- For each step, note relevant files
- Include specific details (function names, variables, etc.)
- Mention any decisions that need to be made

### 4. Review and Refine
- Ensure each step is truly one action
- Check for missing steps
- Verify dependencies are clear
- Make steps achievable in 2-5 minutes

## Implementation Plan Template

```markdown
# Implementation Plan: [Feature Name]

## Prerequisites
- [ ] Prerequisite 1
- [ ] Prerequisite 2

## Steps

### Step 1: [Brief description]
**Files:** `path/to/file.ts`
**Notes:** Any specific details

### Step 2: [Brief description]
**Files:** `path/to/another.ts`
**Notes:** Additional context

[... additional steps ...]

### Step N: Final verification
- Run tests
- Verify functionality
- Commit changes
```

## Key Principles

1. **Atomicity**: Each step is one action
2. **Verifiability**: You can confirm step completion
3. **Independence**: Steps can be done in any order unless specified
4. **Brevity**: 2-5 minutes per step maximum
5. **Context**: Include relevant file paths and details
