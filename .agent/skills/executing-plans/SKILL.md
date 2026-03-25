---
name: executing-plans
description: Loads and executes a written plan with batch execution and review checkpoints. Use when you have an approved implementation plan and need to execute it step by step.
---

# Executing Plans

## Overview
Use this skill when you have an approved implementation plan and need to execute it step by step with proper review checkpoints. This ensures systematic progress and quality control.

## Process

### 1. Load the Plan
- Read the implementation plan document
- Verify all prerequisites are met
- Understand the scope and sequence

### 2. Execute in Batches
- Group related steps into logical batches
- Execute batched steps sequentially
- Track progress as you complete each step

### 3. Review Checkpoints
- After each batch, pause and review
- Verify the changes are correct
- Run relevant tests
- Get user confirmation if needed

### 4. Document Progress
- Note completed steps
- Update the plan with any deviations
- Record any new information discovered

## Execution Workflow

```
[Plan Loaded]
    │
    ▼
[Execute Step 1] ──► [Execute Step 2] ──► [Execute Step 3]
    │                   │                   │
    ▼                   ▼                   ▼
[Verify]             [Verify]             [Verify]
    │                   │                   │
    └───────────────────┴───────────────────┘
                       │
                       ▼
                 [Review Checkpoint]
                       │
                       ▼
              [More Steps? Yes/No]
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
        [Continue]              [Complete]
```

## Guidelines

### During Execution
- Complete each step fully before moving on
- Don't skip steps or combine them
- If a step fails, diagnose and fix before proceeding
- Document any deviations from the plan

### At Checkpoints
- Verify all changes are working
- Run tests to confirm nothing broke
- Check for edge cases
- Confirm with user if needed

### When Issues Arise
- Document the issue clearly
- Explain the impact on the plan
- Propose solutions
- Wait for guidance before proceeding

## Completion Criteria

Before marking a plan as complete:
- [ ] All steps executed successfully
- [ ] All tests passing
- [ ] Functionality verified
- [ ] Changes committed (if appropriate)
- [ ] No outstanding issues or TODO items

## Plan Status States

- **pending**: Not started
- **in_progress**: Currently executing
- **blocked**: Waiting on external input
- **completed**: All steps done and verified
- **abandoned**: No longer relevant
