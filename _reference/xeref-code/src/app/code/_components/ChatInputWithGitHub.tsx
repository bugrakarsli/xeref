'use client';
// Thin wrapper around your existing <ChatInput/>. Replace the placeholder import
// below with your real path, and pass the GitHub button into its toolbar slot.
import { GitHubRepoButton } from './GitHubRepoButton';

// Example: import { ChatInput } from '@/components/chat/ChatInput';

export function ChatInputWithGitHub({ sessionId }: { sessionId: string }) {
  // Preferred:
  // return <ChatInput sessionId={sessionId} leadingToolbar={<GitHubRepoButton sessionId={sessionId} />} />;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-2 flex">
        <GitHubRepoButton sessionId={sessionId} />
      </div>
      {/* <ChatInput sessionId={sessionId} /> */}
      <div className="rounded-xl border border-black/10 dark:border-white/10 p-3 text-sm opacity-60">
        (existing ChatInput goes here)
      </div>
    </div>
  );
}
