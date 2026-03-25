---
name: test-driven-development
description: Red-Green-Refactor cycle for code quality. Use when writing new code to ensure testability and code quality from the start.
---

# Test-Driven Development (TDD)

## Overview
TDD is a development methodology that emphasizes writing tests before code. It follows a short, iterative cycle of writing a failing test, making it pass, and then refactoring.

## The TDD Cycle

### RED - Write a Failing Test
1. Write a test that describes the behavior you want
2. Run the test to confirm it fails
3. The test should fail for the right reason (not compilation errors)

### GREEN - Write Minimal Code
1. Write the minimum code to make the test pass
2. Don't worry about perfection
3. Focus on making the test pass
4. If the test passes, move to REFACTOR

### REFACTOR - Improve Code
1. Clean up the code while keeping tests passing
2. Remove duplication
3. Improve naming
4. Add comments
5. Run tests after each change

## TDD Principles

### Test First
- Write the test before the code
- Let the test guide your implementation
- Focus on behavior, not implementation

### Keep Tests Simple
- Each test should test one thing
- Avoid test interdependence
- Use clear, descriptive names

### Test Behavior, Not Implementation
- Test what, not how
- Don't test internal methods
- Focus on the interface

### Fast Feedback
- Tests should run quickly
- Run tests frequently
- Fix failures immediately

## Test Structure

### AAA Pattern
```typescript
describe('Feature', () => {
  it('should do something', () => {
    // Arrange - Set up test data
    const input = createInput();
    
    // Act - Execute the behavior
    const result = execute(input);
    
    // Assert - Verify the result
    expect(result).toEqual(expected);
  });
});
```

### Naming Conventions
- Use descriptive test names
- Follow pattern: `should [expected behavior] when [condition]`
- Example: `should return error when user not authenticated`

## When to Use TDD

###适合TDD的场景
- New features with clear requirements
- Bug fixes (write test first)
- Refactoring legacy code
- API development
- Library/utility functions

### 可能不需要TDD的场景
- Exploratory work
- Quick prototypes
- UI layout (visual testing better)
- Performance tuning

## Test Types

### Unit Tests
- Test single functions/components
- Mock dependencies
- Fast and isolated

### Integration Tests
- Test multiple units together
- Test real dependencies
- Slower but more realistic

### E2E Tests
- Test complete user flows
- Use real browser
- Slowest but most comprehensive

## Best Practices

1. **Run tests frequently** - every few minutes
2. **Keep tests fast** - under 100ms each
3. **Tests should be independent** - no shared state
4. **One assertion per test** - when possible
5. **Descriptive names** - explain what you're testing
6. **Test edge cases** - null, empty, boundary values
7. **Test error handling** - verify error messages

## Common Mistakes

- Writing tests after code (not TDD)
- Testing implementation details
- Making tests depend on each other
- Not running tests regularly
- Ignoring failing tests
- Testing too much at once
