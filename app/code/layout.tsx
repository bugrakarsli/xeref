import { ReactNode } from 'react';
import { CodeSidebar } from './_components/CodeSidebar';

export default function CodeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)]">
      <CodeSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
