'use client';
import { useState } from 'react';
import { GitHubRepoButton } from './GitHubRepoButton';
import { ChatInput } from '@/components/dashboard/chat/chat-input';

export function ChatInputWithGitHub({ sessionId }: { sessionId?: string }) {
  const [input, setInput] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    console.log('Sending message:', input);
    setInput('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <ChatInput 
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        isLoading={false}
        projects={[]}
        selectedAgent={null}
        onAgentSelect={() => {}}
        selectedModel={model as any}
        onModelSelect={(m) => setModel(m)}
        userPlan="ultra"
        attachments={[]}
        onFileSelect={() => {}}
        onRemoveAttachment={() => {}}
        webSearchEnabled={webSearchEnabled}
        onWebSearchToggle={() => setWebSearchEnabled(!webSearchEnabled)}
        leadingToolbar={<GitHubRepoButton sessionId={sessionId || 'new'} />}
      />
    </div>
  );
}
