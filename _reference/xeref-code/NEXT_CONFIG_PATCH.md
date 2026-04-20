# next.config.ts — rewrite patch

Merge this `rewrites()` block into your existing `next.config.ts`. Keep all
other existing config unchanged.

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ...existing config
  async rewrites() {
    return [
      { source: '/code/session_:id', destination: '/code/session/:id' },
    ];
  },
};

export default nextConfig;
```

Why:
- Next.js App Router dynamic segments cannot start with a literal prefix like `session_`.
- We keep the internal route folder as `src/app/code/session/[sessionId]/page.tsx`
  and expose the public URL shape `/code/session_<ULID>` via the rewrite.
- Routine URLs like `/code/routines/trig_01<ULID>` work natively because the
  whole `trig_01...` string is captured as the dynamic parameter.
