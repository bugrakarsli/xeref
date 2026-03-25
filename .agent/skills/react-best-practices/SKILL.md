---
name: react-best-practices
description: Official guidelines for React and Next.js performance optimization, component patterns, and best practices. Use when building React applications or working with React/Next.js codebases.
---

# React Best Practices

## Overview
This skill provides comprehensive guidelines for building performant React applications with Next.js. It covers component patterns, performance optimization, and production-ready practices.

## Component Patterns

### Component Structure
- Keep components small and focused
- Single responsibility principle
- Colocate related code
- Extract reusable logic into custom hooks

### Functional Components
- Use functional components with hooks
- Prefer arrow functions for callbacks
- Memoize expensive computations
- Use TypeScript for type safety

### Props
- Define prop types explicitly
- Use default props for optional values
- Avoid passing unnecessary props
- Destructure props in function signature

## State Management

### Local State
- Use `useState` for component-local state
- Keep state as simple as possible
- Derive state when possible (avoid redundancy)
- Reset state when conditions change

### Global State
- Use context for truly global state
- Consider Zustand, Jotai, or Redux for complex state
- Split contexts by domain to avoid re-renders
- Avoid context for frequently changing values

### Server State
- Use React Query or SWR for server data
- Implement proper caching strategies
- Handle loading and error states
- Optimize refetching patterns

## Performance Optimization

### Rendering
- Use `React.memo` for expensive components
- Implement `useMemo` for expensive calculations
- Use `useCallback` for stable function references
- Virtualize long lists

### Code Splitting
- Use dynamic imports for route-based splitting
- Lazy load components
- Implement skeleton loading states
- Bundle analysis and optimization

### Images and Media
- Use next/image for automatic optimization
- Implement lazy loading
- Use appropriate image formats (WebP, AVIF)
- Specify dimensions to prevent layout shift

## Next.js Specific

### App Router
- Use Server Components by default
- Implement proper data fetching patterns
- Use streaming with Suspense
- Optimize routing and layouts

### SEO and Metadata
- Use the Metadata API
- Generate proper Open Graph tags
- Implement structured data
- Ensure proper heading hierarchy

### API Routes
- Validate all inputs
- Implement proper error handling
- Use proper HTTP methods
- Add rate limiting where needed

## Hooks Best Practices

### useState
```typescript
// Good: Functional updates
const [count, setCount] = useState(0);
setCount(prev => prev + 1);

// Good: Lazy initialization
const [data] = useState(() => expensiveCalculation());
```

### useEffect
```typescript
// Good: Proper cleanup
useEffect(() => {
  const subscription = subscribe(id);
  return () => subscription.unsubscribe();
}, [id]);

// Good: Empty deps for once
useEffect(() => {
  init();
}, []);
```

### useMemo/useCallback
```typescript
// Good: Memoize expensive computation
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// Good: Stable callback reference
const handleClick = useCallback((id: string) => {
  setSelected(id);
}, []);
```

## TypeScript Patterns

### Prop Types
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}
```

### Generics
```typescript
function useFetch<T>(url: string): {
  data: T | null;
  loading: boolean;
  error: Error | null;
} {
  // Implementation
}
```

## Testing

- Write unit tests for utilities
- Test component behavior, not implementation
- Use React Testing Library
- Mock external dependencies
- Test edge cases and error states

## Accessibility

- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation
- Add focus management
- Test with screen readers
