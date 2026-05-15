'use client';
import { useState } from 'react';
import { GitHubRepoButton } from './GitHubRepoButton';
import { ChatInput, type ModelId } from '@/components/dashboard/chat/chat-input';

export function ChatInputWithGitHub({
  sessionId,
  input: externalInput,
  onInputChange: externalOnInputChange,
  onSubmit: externalOnSubmit,
  isLoading: externalIsLoading,
  onStop,
  selectedRepo: externalSelectedRepo,
  onRepoSelect: externalOnRepoSelect,
  selectedModel: externalModel,
  onModelSelect: externalOnModelSelect,
}: {
  sessionId?: string;
  input?: string;
  onInputChange?: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  isLoading?: boolean;
  onStop?: () => void;
  selectedRepo?: string | null;
  onRepoSelect?: (repo: string) => void;
  selectedModel?: ModelId;
  onModelSelect?: (model: ModelId) => void;
}) {
  const [internalInput, setInternalInput] = useState('');
  const [internalModel, setInternalModel] = useState<ModelId>('xeref-free');
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [internalSelectedRepo, setInternalSelectedRepo] = useState<string | null>(null);
  const [repoError, setRepoError] = useState(false);

  const selectedRepo = externalSelectedRepo !== undefined ? externalSelectedRepo : internalSelectedRepo;
  const model = externalModel !== undefined ? externalModel : internalModel;
  const setModel = externalOnModelSelect ?? setInternalModel;

  const input = externalInput ?? internalInput;
  const isLoading = externalIsLoading ?? internalIsLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block if no repo selected
    if (!selectedRepo) {
      setRepoError(true);
      setTimeout(() => setRepoError(false), 3000);
      return;
    }

    setRepoError(false);

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
        body: JSON.stringify({ content, model, repo: selectedRepo }),
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setInternalIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Repo required warning */}
      {repoError && (
        <div className="mb-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium animate-in fade-in slide-in-from-bottom-1 duration-200">
          ⚠ Select a repo first before sending a message.
        </div>
      )}
      <ChatInput 
        input={input}
        onInputChange={(val) => {
          if (externalOnInputChange) {
            externalOnInputChange(val);
          } else {
            setInternalInput(val);
          }
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onStop={onStop}
        projects={[]}
        selectedAgent={null}
        onAgentSelect={() => {}}
        selectedModel={model}
        onModelSelect={(m) => setModel(m)}
        userPlan="ultra"
        attachments={[]}
        onFileSelect={() => {}}
        onRemoveAttachment={() => {}}
        webSearchEnabled={webSearchEnabled}
        onWebSearchToggle={() => setWebSearchEnabled(!webSearchEnabled)}
        leadingToolbar={
          <GitHubRepoButton
            sessionId={sessionId || 'new'}
            selectedRepo={selectedRepo}
            onRepoSelect={(repo) => {
              if (externalOnRepoSelect) {
                externalOnRepoSelect(repo);
              } else {
                setInternalSelectedRepo(repo);
              }
              setRepoError(false);
            }}
          />
        }
        hideAgentSelector={true}
      />
    </div>
  );
}
