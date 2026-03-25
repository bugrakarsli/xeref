---
name: systematic-debugging
description: Structured debugging methodology for identifying and fixing issues. Use when encountering bugs, errors, or unexpected behavior in code.
---

# Systematic Debugging

## Overview
This skill provides a structured debugging methodology for identifying and fixing issues in code. It emphasizes systematic investigation rather than guesswork.

## Debugging Process

### 1. Reproduce the Issue
- Gather exact steps to reproduce
- Document the expected vs actual behavior
- Identify the scope (affects single user? all users? specific conditions?)
- Create minimal reproduction case if possible

### 2. Gather Information
- Check error messages and stack traces
- Review recent code changes
- Examine relevant logs
- Check external dependencies and API status

### 3. Form Hypothesis
- Analyze the evidence
- Form a testable hypothesis
- Prioritize by likelihood
- Never assume - verify

### 4. Test Hypothesis
- Design experiments to test each hypothesis
- Change one thing at a time
- Isolate variables
- Use debugging tools effectively

### 5. Identify Root Cause
- Find the actual source of the problem
- Distinguish symptoms from causes
- Document what you found

### 6. Implement Fix
- Choose the best solution
- Consider side effects
- Apply minimal change principle
- Test the fix thoroughly

### 7. Verify and Prevent
- Confirm the issue is resolved
- Check for similar issues elsewhere
- Add tests to prevent regression
- Document the fix

## Debugging Techniques

### Logging
- Add strategic console.logs
- Use structured logging
- Include relevant context
- Remove after debugging

### Breakpoints
- Use debugger statements
- Set conditional breakpoints
- Inspect variables at each step
- Track execution flow

### Binary Search
- Comment out half the code
- Narrow down to find where it breaks
- Repeat until isolated

### Rubber Ducking
- Explain the problem out loud
- Walk through the code step by step
- Often reveals the issue

## Common Bug Categories

### Logic Errors
- Wrong conditionals
- Off-by-one errors
- Incorrect operators
- Missing edge cases

### State Issues
- Uninitialized variables
- Stale closures
- Race conditions
- Improper state updates

### Type Errors
- Null/undefined access
- Wrong types passed
- Missing type checking
- Type coercion issues

### Async Issues
- Missing await
- Unhandled promises
- Race conditions
- Timing issues

### Environment
- Missing environment variables
- Wrong configuration
- Cache issues
- Permission problems

## Tools and Techniques

- Browser DevTools
- IDE debuggers
- Logging frameworks
- Error tracking (Sentry, etc.)
- Network inspection
- Component devtools (React)

## Best Practices

1. **Don't guess** - verify with evidence
2. **One change at a time** - isolate variables
3. **Document your findings** - helps future debugging
4. **Look for similar issues** - patterns repeat
5. **Write tests** - prevent regression
6. **Take breaks** - fresh perspective helps
