'use client';
import { useState } from 'react';
import { GitHubRepoButton } from './GitHubRepoButton';
import { ChatInput } from '@/components/dashboard/chat/chat-input';

export function ChatInputWithGitHub({ 
  sessionId, 
  input: externalInput,
  onInputChange: externalOnInputChange,
  onSubmit: externalOnSubmit,
  isLoading: externalIsLoading
}: { 
  sessionId?: string;
  input?: string;
  onInputChange?: (e: any) => void;
  onSubmit?: (e: any) => void;
  isLoading?: boolean;
}) {
  const [internalInput, setInternalInput] = useState('');
  const [model, setModel] = useState('xeref-free');
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  const input = externalInput ?? internalInput;
  const onInputChange = externalOnInputChange ?? ((val: string) => setInternalInput(val));
  const isLoading = externalIsLoading ?? internalIsLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (externalOnSubmit) {
      externalOnSubmit(e);
      return;
    }

    if (!input.trim() || !sessionId || isLoading) return;
    setInternalIsLoading(true);
    const content = input;
    setInternalInput('');

    try {
      await fetch(`/api/sessions/${sessionId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, model }),
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setInternalIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <ChatInput 
        input={input}
        onInputChange={(val) => {
          if (externalOnInputChange) {
            // handleInputChange from useChat expects a ChangeEvent or string
            externalOnInputChange(val);
          } else {
            setInternalInput(val);
          }
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
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

