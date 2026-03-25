---
name: verification-before-completion
description: Ensures work is verified before marking complete. Use before finishing any task to ensure quality standards are met.
---

# Verification Before Completion

## Overview
This skill ensures work is verified before marking any task as complete. It establishes quality gates to prevent incomplete or buggy work from being delivered.

## Verification Checklist

### Functionality
- [ ] All requirements met
- [ ] Edge cases handled
- [ ] Error states handled
- [ ] Loading states handled
- [ ] User feedback provided

### Code Quality
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code follows project patterns
- [ ] No hardcoded values

### Testing
- [ ] Existing tests pass
- [ ] New tests added (if applicable)
- [ ] Edge case tests included

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Proper ARIA labels
- [ ] Color contrast sufficient

### Performance
- [ ] No obvious performance issues
- [ ] Bundle size reasonable
- [ ] Images optimized
- [ ] Lazy loading implemented where needed

### Browser/Device
- [ ] Works in target browsers
- [ ] Responsive design verified
- [ ] Mobile tested (if applicable)

### Documentation
- [ ] Code comments (if needed)
- [ ] README updated (if needed)
- [ ] API docs updated (if applicable)

## Verification Process

### 1. Self Review
- Review your own changes
- Read through the diff
- Look for potential issues

### 2. Run Tests
- Execute full test suite
- Verify all tests pass
- Check for warnings

### 3. Manual Testing
- Use the feature yourself
- Try edge cases
- Verify error handling

### 4. Code Review
- Prepare for code review
- Address feedback promptly

## Completion Criteria

Before marking complete, ensure:

1. **All acceptance criteria met**
   - Review original requirements
   - Verify each criterion

2. **No regressions**
   - Existing functionality works
   - No unintended side effects

3. **Code is clean**
   - No TODO comments left
   - No commented out code
   - No debug statements

4. **Properly committed**
   - Meaningful commit message
   - Changes grouped logically

## Common Issues to Catch

- Missing error handling
- Unhandled promise rejections
- Memory leaks
- Race conditions
- Security vulnerabilities
- Missing validations
- Incomplete error messages
- Hardcoded values
- Console.log statements left in

## When to Escalate

If you encounter issues beyond your scope:
- Security concerns
- Architectural decisions
- Dependencies conflicts
- Scope creep

Document the issue and discuss with the team before proceeding.
