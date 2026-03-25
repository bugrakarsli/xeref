---
name: context-optimization
description: Optimizes context window usage for efficient AI interactions. Use when context is growing large, before important conversations, or when you need to maximize the effectiveness of limited context.
---

# Context Optimization

## Overview
This skill optimizes context window usage for efficient AI interactions. It provides strategies for managing context to maintain performance and avoid degradation.

## Understanding Context

### What Consumes Context
- System prompts
- Conversation history
- Loaded skills
- File contents
- Code analysis
- Tool outputs

### Context Limits
- Most models have 128k-200k token limits
- Context degrades as it fills
- Important information gets lost
- Response quality decreases

## Optimization Strategies

### 1. Selective Loading
- Only load necessary files
- Use file summaries instead of full content
- Load references on-demand
- Avoid loading entire repositories

### 2. Progressive Disclosure
- Start with minimal context
- Add details as needed
- Use skills to load resources
- Keep SKILL.md files concise

### 3. Context Compression
- Summarize long conversations
- Remove redundant messages
- Use concise code snippets
- Trim whitespace and comments

### 4. File Management
- Read specific sections, not whole files
- Use line offsets and limits
- Focus on relevant code only
- Avoid copying entire files

### 5. Efficient Code Presentation
- Show only relevant code sections
- Use diff format for changes
- Summarize familiar patterns
- Highlight important differences

## Best Practices

### At Session Start
- Summarize previous context if continuing
- Load only essential skills
- Set clear objectives

### During Conversation
- Provide concise context
- Reference files by path, don't paste
- Use search instead of loading files
- Ask for summaries when needed

### Before Important Tasks
- Review what context is loaded
- Remove unnecessary files
- Load fresh context if needed
- Prioritize critical information

## Warning Signs

Context may need optimization when:
- Responses become repetitive
- Important details are missed
- Model loses track of context
- Quality degrades over time
- Generation slows down

## Techniques

### Summarization
```
Original: [500 lines]
Summarized: [50 lines - key points only]
```

### Chunking
```
Large file → Read relevant sections only
Full history → Summarize old messages
```

### Filtering
```
Keep: Requirements, current task, recent changes
Remove: Greetings, acknowledgments, off-topic
```

### Offloading
```
Move: To-do lists, specs → external files
Reference: Instead of pasting full content
```

## Context-Aware Workflows

### For Large Projects
- Create project summaries
- Use index files
- Document architecture separately
- Load context incrementally

### For Code Reviews
- Load only changed files
- Focus on diff, not full files
- Provide context as needed

### For Debugging
- Load specific files needed
- Summarize error context
- Focus on root cause area
