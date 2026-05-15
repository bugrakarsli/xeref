"use client";

import React, { useRef, useEffect } from 'react';
import { Plus, ChevronDown, ArrowUp, File, Image as ImageIcon, Code, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AVAILABLE_MODELS } from '@/lib/models-config';
import { MicButton } from '@/components/dashboard/MicButton';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  planningMode: boolean;
  onTogglePlanning: (enabled: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  onImageSelect?: (base64: string, mimeType: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
    onSend, isLoading, selectedModel, onSelectModel, planningMode, onTogglePlanning,
    value, onChange, onImageSelect
}) => {
  const [showModelMenu, setShowModelMenu] = React.useState(false);
  const [showAttachMenu, setShowAttachMenu] = React.useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
              setShowModelMenu(false);
          }
          if (attachRef.current && !attachRef.current.contains(event.target as Node)) {
              setShowAttachMenu(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items || !onImageSelect) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) continue;
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result as string;
          const base64 = result.split(',')[1];
          onImageSelect(base64, file.type);
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleSubmit = () => {
    const safeValue = value || '';
    if ((safeValue.trim() || onImageSelect) && !isLoading) { 
      onSend(safeValue);
      onChange(''); 
    }
  };

  const handleAddCodeSnippet = () => {
      const snippet = "\n```typescript\n\n```\n";
      onChange((value || '') + snippet);
      setShowAttachMenu(false);
      setTimeout(() => {
          textareaRef.current?.focus();
      }, 100);
  };

  const handleUploadFile = () => {
      fileInputRef.current?.click();
      setShowAttachMenu(false);
  };

  const handleAddImage = () => {
      imageInputRef.current?.click();
      setShowAttachMenu(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (ev) => {
          const content = ev.target?.result as string;
          const fileContext = `\n\n--- File: ${file.name} ---\n${content}\n---\n`;
          onChange((value || '') + fileContext);
      };
      reader.readAsText(file);
      e.target.value = ''; 
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onImageSelect) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
          const result = ev.target?.result as string;
          const base64 = result.split(',')[1];
          const mimeType = file.type;
          onImageSelect(base64, mimeType);
      };
      reader.readAsDataURL(file);
      e.target.value = ''; 
  };

  // models moved to lib/models-config.ts

  return (
    <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1e1e1e]">
      <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={onFileChange} 
          accept=".txt,.md,.js,.ts,.tsx,.json,.css,.html,.py,.java,.c,.cpp,.h"
      />
      <input 
          type="file" 
          ref={imageInputRef} 
          className="hidden" 
          onChange={onImageChange} 
          accept="image/*"
      />

      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-gray-300 dark:focus-within:border-gray-600 focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-gray-600 transition-all">
        <textarea
          data-id="agent-chat-input"
          ref={textareaRef}
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Ask anything (⌘L), @ to mention, / for workflows"
          className="w-full bg-transparent p-3 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none resize-none min-h-[48px] max-h-[200px]"
          rows={1}
        />
        
        <div className="flex items-center justify-between px-2 pb-2">
          <div className="flex items-center gap-2 relative">
            <div ref={attachRef} className="relative">
                <button 
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 transition-colors"
                    title="Attach Context or Files"
                >
                    <Plus size={16} />
                </button>
                {showAttachMenu && (
                    <div className="absolute bottom-full mb-2 left-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-1 z-20">
                        <button 
                            onClick={handleUploadFile}
                            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                        >
                            <File size={14} /> Upload File
                        </button>
                        <button 
                            onClick={handleAddImage}
                            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                        >
                            <ImageIcon size={14} /> Add Image
                        </button>
                        <button 
                            onClick={handleAddCodeSnippet}
                            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                        >
                            <Code size={14} /> Add Code Snippet
                        </button>
                    </div>
                )}
            </div>
            
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
            
            <button 
                onClick={() => onTogglePlanning(!planningMode)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors font-medium ${
                    planningMode 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                title="Toggle Planning Mode (Reasoning)"
            >
              {planningMode && <Check size={10} />}
              Planning
            </button>
            
            <MicButton
              onTranscribed={(text) => onChange((value ?? '') + (value ? ' ' : '') + text)}
              disabled={isLoading}
            />

            <div ref={menuRef} className="relative">
                <button
                    onClick={() => setShowModelMenu(!showModelMenu)}
                    className="flex items-center gap-1 px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-xs text-gray-600 dark:text-gray-400 transition-colors font-medium"
                    title="Select AI Model"
                >
                    {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'Select Model'}
                    <ChevronDown size={12} />
                </button>
                
                {showModelMenu && (
                  <div className="absolute bottom-full mb-2 left-0 w-72 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-1.5 z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex flex-col gap-1">
                      {AVAILABLE_MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            onSelectModel(model.id)
                            setShowModelMenu(false)
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                            selectedModel === model.id
                              ? 'bg-blue-50/50 dark:bg-blue-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-sm font-semibold ${
                              selectedModel === model.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {model.name}
                            </span>
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded font-bold tracking-tight",
                              model.tier === 'BASIC' && "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
                              model.tier === 'PRO' && "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
                              model.tier === 'ULTRA' && "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-500"
                            )}>
                              {model.tier}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                            {model.description}
                          </p>
                          {selectedModel === model.id && (
                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-blue-500 rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={(!(value || '').trim() && !onImageSelect) || isLoading} 
            className={`p-1.5 rounded-full transition-all ${
              ((value || '').trim() || onImageSelect) && !isLoading 
                ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90 shadow-sm'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
            }`}
            title="Send Message"
          >
            <ArrowUp size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
      
      <div className="text-center mt-2">
        <p className="text-[10px] text-gray-400 dark:text-gray-600">
          AI may make mistakes. Double-check all generated code.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
