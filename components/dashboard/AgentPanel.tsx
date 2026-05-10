"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquarePlus, History, Settings, Copy, Play, Trash2, Save,
  FileText, Code, Plus, Pencil, ThumbsUp, ThumbsDown, Check, X
} from 'lucide-react';
import ChatInput from './ChatInput';
import { createChatSession, sendMessageToGemini, OpenRouterChatSession } from '@/lib/apiService';
import { AVAILABLE_MODELS, DEFAULT_MODEL } from '@/lib/models-config';
import { ScrollToBottomButton } from '@/components/ui/ScrollToBottomButton';
import { ChatState, Message, AgentSettings, ChatSession, Theme } from '@/types/agent-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AgentPanelProps {
  onClose: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
  theme: Theme;
  activeView?: 'chat' | 'customizations';
  onViewChange?: (view: 'chat' | 'customizations') => void;
}

const DEFAULT_SETTINGS: AgentSettings = {
  modelName: DEFAULT_MODEL,
  temperature: 0.7,
  systemInstruction: "You are Xeref.ai, an advanced AI coding assistant embedded in an IDE. You are helpful, concise, and expert in React, TypeScript, and modern web development. When providing code, use Markdown code blocks.",
  enableSynthID: false,
};

export const AgentPanel: React.FC<AgentPanelProps> = ({
    onMinimize, isMinimized, theme,
    activeView = 'chat', onViewChange
}) => {
  // State
  const [chatState, setChatState] = useState<ChatState>({ messages: [], isLoading: false });
  const [settings, setSettings] = useState<AgentSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [planningMode, setPlanningMode] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: Message } | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [attachedImage, setAttachedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [messageFeedback, setMessageFeedback] = useState<Record<string, 'up' | 'down' | null>>({});
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  // Customizations State
  const [customizationTab, setCustomizationTab] = useState<'rules' | 'workflows'>('rules');
  const [rules, setRules] = useState<{id: string, type: 'global' | 'workspace', content: string}[]>([
      { id: '1', type: 'global', content: 'Always use TypeScript strict mode.' },
  ]);
  const [workflows, setWorkflows] = useState([
      { id: '1', name: 'Automated Code Review', description: 'Analyze PRs for style violations and potential bugs.', active: true },
  ]);

  const chatSessionRef = useRef<OpenRouterChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Initialization & Local Storage
  useEffect(() => {
    const savedHistory = localStorage.getItem('antigravity_chat_history');
    if (savedHistory) {
      try { setSessions(JSON.parse(savedHistory)); } catch (e) { console.error("Failed to load history", e); }
    }
    const savedSettings = localStorage.getItem('antigravity_agent_settings');
    if (savedSettings) {
      try { 
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed }); 
      } catch (e) { console.error("Failed to load settings", e); }
    }
  }, []);

  // Update session ref when settings change
  useEffect(() => {
    if (!activeSessionId) {
        chatSessionRef.current = createChatSession(settings.modelName, settings.systemInstruction, settings.enableSynthID);
    }
  }, [settings, activeSessionId]);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('antigravity_chat_history', JSON.stringify(sessions));
    }
  }, [sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isMinimized && activeView === 'chat') {
      scrollToBottom();
    }
  }, [chatState.messages, isMinimized, activeView]);

  // Close context/export menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate suggestions based on current input
  useEffect(() => {
    const newSuggestions = generateSuggestions(currentInput);
    setSuggestions(newSuggestions);
  }, [currentInput]);

  const generateSuggestions = (inputText: string): string[] => {
    const lowerInput = inputText.toLowerCase();
    const newSuggestions: string[] = [];
  
    if (lowerInput.includes('git')) {
      if (!lowerInput.includes('commit')) newSuggestions.push('git commit -m ""');
      if (!lowerInput.includes('status')) newSuggestions.push('git status');
      if (!lowerInput.includes('diff')) newSuggestions.push('git diff');
    }
    if (lowerInput.includes('react') || lowerInput.includes('component')) {
      if (!lowerInput.includes('create component')) newSuggestions.push('Create a new React component');
      if (!lowerInput.includes('fix bug')) newSuggestions.push('Fix bug in React component');
    }
    if (lowerInput.includes('test')) {
      newSuggestions.push('Write unit tests for current file');
      newSuggestions.push('Generate integration tests');
    }
    if (lowerInput.includes('refactor')) {
      newSuggestions.push('Refactor this code for better readability');
    }
    if (lowerInput.includes('explain')) {
      newSuggestions.push('Explain this code');
    }
    return newSuggestions.slice(0, 3);
  };

  // Handlers
  const startNewChat = () => {
    if (chatState.messages.length > 0 && !activeSessionId) {
       saveCurrentSession();
    }
    setChatState({ messages: [], isLoading: false });
    setActiveSessionId(null);
    setAttachedImage(null);
    chatSessionRef.current = createChatSession(settings.modelName, settings.systemInstruction, settings.enableSynthID);
  };

  const saveCurrentSession = () => {
    if (chatState.messages.length === 0) return;
    const newSession: ChatSession = {
      id: activeSessionId || Date.now().toString(),
      title: chatState.messages[0].text.slice(0, 30) + (chatState.messages[0].text.length > 30 ? '...' : ''),
      messages: chatState.messages,
      timestamp: Date.now(),
    };
    if (activeSessionId) {
      setSessions(prev => prev.map(s => s.id === activeSessionId ? newSession : s));
    } else {
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
    }
  };

  const loadSession = (session: ChatSession) => {
    setChatState({ messages: session.messages, isLoading: false });
    setActiveSessionId(session.id);
    setAttachedImage(null);
    setShowHistory(false);
    chatSessionRef.current = createChatSession(settings.modelName, settings.systemInstruction, settings.enableSynthID);
  };

  const handleSendMessage = async () => {
    const messageText = currentInput.trim();
    if (!messageText && !attachedImage) return;

    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession(settings.modelName, settings.systemInstruction, settings.enableSynthID);
    }
    
    const effectiveText = planningMode ? `[Planning Mode Active] ${messageText}` : messageText;

    type ApiContentPart = { type: string; text?: string; source?: { type: string; url: string } };
    // Prepare contents for API
    let apiContents: string | ApiContentPart[] = effectiveText;
    if (attachedImage) {
        apiContents = [
            { type: "text", text: effectiveText },
            { type: "image_url", source: { type: "base64", url: `data:${attachedImage.mimeType};base64,${attachedImage.data}` } }
        ];
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText + (attachedImage ? (messageText ? " [Image]" : "[Image]") : ""),
      timestamp: Date.now(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isLoading: true,
    }));
    setCurrentInput('');
    setAttachedImage(null); // Clear attached image after sending

    // --- Session Handling Logic ---
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
        currentSessionId = Date.now().toString();
        setActiveSessionId(currentSessionId);
        
        // Initialize session in history
        const newSession: ChatSession = {
            id: currentSessionId,
            title: messageText.slice(0, 30) + (messageText.length > 30 ? '...' : '') || 'Image Query',
            messages: [userMsg], 
            timestamp: Date.now(),
        };
        setSessions(prev => [newSession, ...prev]);
    } else {
        // Update existing session
        setSessions(prev => prev.map(s => s.id === currentSessionId ? {
            ...s,
            messages: [...s.messages, userMsg],
            timestamp: Date.now()
        } : s));
    }
    // ------------------------------

    const modelMsgId = (Date.now() + 1).toString();
    const modelMsg: Message = {
      id: modelMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
    };

    setChatState((prev) => ({ ...prev, messages: [...prev.messages, modelMsg] }));
    let accumulatedText = "";

    try {
      await sendMessageToGemini(chatSessionRef.current, apiContents, (chunkText) => {
          accumulatedText += chunkText;
          setChatState((prev) => {
              const newMessages = prev.messages.map(msg => 
                  msg.id === modelMsgId ? { ...msg, text: accumulatedText } : msg
              );
              // Update session history in real-time
              if (currentSessionId) {
                  setSessions(sessions => sessions.map(s => s.id === currentSessionId ? { ...s, messages: newMessages } : s));
              }
              return { ...prev, messages: newMessages };
          });
      }, settings.modelName);
    } catch (error) {
        console.error("Error during message streaming:", error);
        setChatState((prev) => {
            const newMessages = prev.messages.map(msg => 
                msg.id === modelMsgId ? { ...msg, text: accumulatedText + "\n\n[Error: Failed to get full response. Please try again.]" } : msg
            );
            return { ...prev, messages: newMessages };
        });
    } finally {
        setChatState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleRunCode = (code: string) => {
      alert("Code execution simulated.\n\n" + code.slice(0, 50) + "...");
  };

  const handleExportChat = (format: 'text' | 'json') => {
    let content = '';
    let filename = '';
    if (format === 'text') {
        content = chatState.messages.map(msg => 
            `${msg.role === 'user' ? 'You' : 'Xeref.ai'} (${new Date(msg.timestamp).toLocaleString()}):\n${msg.text}`
        ).join('\n\n---\n\n');
        filename = `chat_history_${Date.now()}.txt`;
    } else { // json
        content = JSON.stringify(chatState.messages, null, 2);
        filename = `chat_history_${Date.now()}.json`;
    }

    const blob = new Blob([content], { type: format === 'text' ? 'text/plain' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleCopyAllMessages = () => {
    const allText = chatState.messages.map(msg => 
        `${msg.role === 'user' ? 'You' : 'Xeref.ai'}:\n${msg.text}`
    ).join('\n\n---\n\n');
    navigator.clipboard.writeText(allText);
  };

  const handleMessageContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, message });
  };

  const handleDeleteMessage = (id: string) => {
    setChatState(prev => {
        const newMessages = prev.messages.filter(msg => msg.id !== id);
        if (activeSessionId) {
            setSessions(sessions => sessions.map(s => s.id === activeSessionId ? { ...s, messages: newMessages } : s));
        }
        return { ...prev, messages: newMessages };
    });
    setContextMenu(null);
  };

  const handleEditMessage = (msg: Message) => {
    setCurrentInput(msg.text);
    setChatState(prev => {
      const newMessages = prev.messages.filter(m => m.timestamp < msg.timestamp);
      if (activeSessionId) {
        setSessions(sessions => sessions.map(s => s.id === activeSessionId ? { ...s, messages: newMessages } : s));
      }
      return { ...prev, messages: newMessages };
    });
  };

  const handleMessageFeedback = (msgId: string, type: 'up' | 'down') => {
    setMessageFeedback(prev => ({ ...prev, [msgId]: prev[msgId] === type ? null : type }));
  };

  // Customization Handlers
  const addRule = (type: 'global' | 'workspace') => {
      setRules([...rules, { id: Date.now().toString(), type, content: `New ${type} rule` }]);
  };
  
  const updateRule = (id: string, content: string) => {
      setRules(rules.map(r => r.id === id ? { ...r, content } : r));
  };
  
  const deleteRule = (id: string) => {
      setRules(rules.filter(r => r.id !== id));
  };

  const toggleWorkflow = (id: string) => {
      setWorkflows(workflows.map(w => w.id === id ? { ...w, active: !w.active } : w));
  };

  const bgClass = theme === 'dark' ? 'bg-[#1e1e1e] text-gray-200' : 'bg-white text-gray-900';
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const hoverClass = theme === 'dark' ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700';

  const currentModelMessage = chatState.messages.length > 0 && chatState.messages[chatState.messages.length - 1].role === 'model' 
                             ? chatState.messages[chatState.messages.length - 1] : null;

  const isTypingIndicatorVisible = chatState.isLoading && currentModelMessage && currentModelMessage.text === '';
  const isStreamingIndicatorVisible = chatState.isLoading && currentModelMessage && currentModelMessage.text !== '';

  if (isMinimized) {
    return (
        <div className={`h-full w-12 flex flex-col items-center pt-4 gap-4 ${bgClass}`}>
            <button 
                onClick={onMinimize} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-blue-600"
                title="Expand Agent"
            >
                <MessageSquarePlus size={20} />
            </button>
        </div>
    );
  }

  return (
    <div className={`flex flex-col h-full w-full relative ${bgClass}`}>
      {/* Header */}
      <div className={`h-12 border-b flex items-center justify-between px-4 shrink-0 ${borderClass} ${bgClass}`}>
        {activeView === 'customizations' ? (
             <button 
                onClick={() => onViewChange?.('chat')} 
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 font-medium"
             >
                 <span>&larr; Back to Agent</span>
             </button>
        ) : (
             <span className="font-medium text-sm">Agent</span>
        )}
        
        <div className="flex items-center gap-1">
            {activeView === 'chat' && (
                <>
                <button className={`p-1 rounded ${hoverClass}`} title="New Chat" onClick={startNewChat}>
                    <MessageSquarePlus size={16} />
                </button>
                <button 
                    className={`p-1 rounded ${hoverClass} ${showHistory ? 'text-blue-500' : ''}`} 
                    title="History" 
                    onClick={() => setShowHistory(!showHistory)}
                >
                    <History size={16} />
                </button>
                <div ref={exportMenuRef} className="relative">
                    <button 
                        className={`p-1 rounded ${hoverClass} ${showExportMenu ? 'text-blue-500' : ''}`} 
                        title="Export Chat" 
                        onClick={() => setShowExportMenu(!showExportMenu)}
                    >
                        <Save size={16} />
                    </button>
                    {showExportMenu && (
                        <div className="absolute top-full mt-2 right-0 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-1 z-30">
                            <button 
                                onClick={() => handleExportChat('text')} 
                                className="flex items-center gap-2 w-full px-2 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                            >
                                <FileText size={14} /> As Text
                            </button>
                            <button 
                                onClick={() => handleExportChat('json')} 
                                className="flex items-center gap-2 w-full px-2 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                            >
                                <Code size={14} /> As JSON
                            </button>
                        </div>
                    )}
                </div>
                <button 
                    className={`p-1 rounded ${hoverClass} ${showSettings ? 'text-blue-500' : ''}`} 
                    title="Settings"
                    onClick={() => setShowSettings(!showSettings)}
                >
                    <Settings size={16} />
                </button>
                </>
            )}
            
        </div>
      </div>

      {/* Main Content Area Switched by View */}
      {activeView === 'customizations' ? (
          <div className="flex-1 flex flex-col p-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-1 text-gray-200">Customizations</h2>
              <p className="text-xs text-gray-500 mb-6">Customize Agent to get a better, more personalized experience.</p>
              
              <div className="flex border-b border-gray-700 mb-4">
                  <button 
                    onClick={() => setCustomizationTab('rules')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${customizationTab === 'rules' ? 'border-blue-500 text-gray-200' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                  >
                      Rules
                  </button>
                  <button 
                    onClick={() => setCustomizationTab('workflows')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${customizationTab === 'workflows' ? 'border-blue-500 text-gray-200' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                  >
                      Workflows
                  </button>
              </div>

              {customizationTab === 'rules' && (
                  <div className="flex-1 overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">Rules <span className="text-gray-600"><History size={12}/></span></h3>
                          <div className="flex gap-2">
                              <button 
                                onClick={() => addRule('global')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#2d2d2d] hover:bg-[#3d3d3d] rounded text-xs text-gray-300 transition-colors"
                              >
                                  <Plus size={12} /> Global
                              </button>
                              <button 
                                onClick={() => addRule('workspace')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#2d2d2d] hover:bg-[#3d3d3d] rounded text-xs text-gray-300 transition-colors"
                              >
                                  <Plus size={12} /> Workspace
                              </button>
                          </div>
                      </div>
                      
                      {rules.length === 0 ? (
                          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm mt-12">
                              Rules help guide the behavior of Agent. Add one to get started.
                          </div>
                      ) : (
                          <div className="space-y-3">
                              {rules.map(rule => (
                                  <div key={rule.id} className="bg-[#252526] p-3 rounded border border-gray-700 flex gap-3 group">
                                      <div className={`mt-1 ${rule.type === 'global' ? 'text-blue-400' : 'text-orange-400'}`}>
                                          <div className="w-3 h-3 rounded-full bg-current" />
                                      </div>
                                      <div className="flex-1">
                                          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">{rule.type} Rule</div>
                                          <input 
                                              value={rule.content}
                                              onChange={(e) => updateRule(rule.id, e.target.value)}
                                              className="w-full bg-transparent text-sm text-gray-300 outline-none placeholder-gray-600"
                                              placeholder="Enter rule..."
                                          />
                                      </div>
                                      <button onClick={() => deleteRule(rule.id)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity">
                                          <Trash2 size={14} />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}
              {customizationTab === 'workflows' && (
                  <div className="flex-1 overflow-y-auto">
                      <div className="space-y-3 mt-4">
                          {workflows.map(workflow => (
                              <div key={workflow.id} className="bg-[#252526] p-4 rounded border border-gray-700 flex items-start justify-between">
                                  <div>
                                      <h4 className="text-sm font-medium text-gray-200">{workflow.name}</h4>
                                      <p className="text-xs text-gray-500 mt-1">{workflow.description}</p>
                                  </div>
                                  <button 
                                    onClick={() => toggleWorkflow(workflow.id)}
                                    className={`w-8 h-4 rounded-full relative transition-colors ${workflow.active ? 'bg-blue-600' : 'bg-gray-600'}`}
                                  >
                                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${workflow.active ? 'left-4.5' : 'left-0.5'}`} style={{ left: workflow.active ? '18px' : '2px' }} />
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      ) : (
          <div className="flex-1 relative overflow-hidden flex flex-col">
            <div ref={messagesScrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Existing Chat Content */}
                {chatState.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 pb-20 select-none">
                        <h2 className="text-xl font-medium mb-2 opacity-50">Xeref.ai</h2>
                        <p className="text-sm opacity-50">Start a conversation with the agent</p>
                    </div>
                ) : (
                    <>
                    <div className="flex justify-end pr-2">
                        <button 
                            onClick={handleCopyAllMessages}
                            className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            title="Copy all messages"
                        >
                            <Copy size={12} /> Copy All
                        </button>
                    </div>
                    {chatState.messages.map((msg) => (
                    <div
                    key={msg.id}
                    className={`group flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    onContextMenu={(e) => handleMessageContextMenu(e, msg)}
                    title={new Date(msg.timestamp).toLocaleString()}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${msg.role === 'user' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
                                {msg.role === 'user' ? 'You' : 'Xeref.ai'}
                            </span>
                        </div>
                        <div className={`text-sm leading-relaxed max-w-[95%] ${msg.role === 'user' ? (theme === 'dark' ? 'text-gray-200' : 'text-gray-800') : (theme === 'dark' ? 'text-gray-300' : 'text-gray-700')}`}>
                        {msg.role === 'user' ? (
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                        ) : (
                            <div className={`markdown-body prose prose-sm max-w-none ${theme === 'dark' ? 'prose-invert' : 'prose-slate'}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                    code({className, children, ...props}) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        const codeString = String(children).replace(/\n$/, '');
                                        return match ? (
                                            <div className={`relative group my-4 rounded-md border ${theme === 'dark' ? 'border-gray-700 bg-[#1e1e1e]' : 'border-gray-200 bg-gray-50'}`}>
                                                <div className={`flex items-center justify-between px-3 py-1.5 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-100/50'}`}>
                                                    <span className="text-[10px] text-gray-500 font-mono">{match[1]}</span>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleCopyCode(codeString)} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-blue-500 transition-colors"><Copy size={12} /> Copy</button>
                                                        <button onClick={() => handleRunCode(codeString)} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-green-500 transition-colors"><Play size={12} /> Run</button>
                                                    </div>
                                                </div>
                                                <pre className="p-3 overflow-x-auto !bg-transparent !m-0 !border-0"><code className={className} {...props}>{children}</code></pre>
                                            </div>
                                        ) : (<code className={`px-1 py-0.5 rounded font-mono text-xs ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'}`} {...props}>{children}</code>)
                                    }
                                }}>{msg.text}</ReactMarkdown>
                            </div>
                        )}
                        </div>
                        {/* Timestamp */}
                        <div className={`text-xs text-gray-400 dark:text-gray-600 ${msg.role === 'user' ? 'mr-1' : 'ml-1'} mt-0.5`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {/* Message action buttons */}
                        {msg.text && (
                          <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 mt-0.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(msg.text);
                                setCopiedMessageId(msg.id);
                                setTimeout(() => setCopiedMessageId(null), 2000);
                              }}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              title="Copy message"
                            >
                              {copiedMessageId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                            {msg.role === 'user' ? (
                              <button
                                onClick={() => handleEditMessage(msg)}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                title="Edit message"
                              >
                                <Pencil size={12} />
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleMessageFeedback(msg.id, 'up')}
                                  className={`p-1 rounded transition-colors ${messageFeedback[msg.id] === 'up' ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                  title="Good response"
                                >
                                  <ThumbsUp size={12} />
                                </button>
                                <button
                                  onClick={() => handleMessageFeedback(msg.id, 'down')}
                                  className={`p-1 rounded transition-colors ${messageFeedback[msg.id] === 'down' ? 'text-red-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                  title="Poor response"
                                >
                                  <ThumbsDown size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                    </div>
                    ))}
                    </>
                )}
                {/* Thinking Indicator */}
                {isTypingIndicatorVisible && (
                    <>
                        <style>{`
                            @keyframes rainbow-wave {
                                0%   { background-position: 0% 50%; }
                                100% { background-position: 300% 50%; }
                            }
                            @keyframes rainbow-dot {
                                0%   { background-position: 0% 50%; }
                                100% { background-position: 300% 50%; }
                            }
                            .rainbow-thinking {
                                background: linear-gradient(
                                    90deg,
                                    #ff6b6b, #ff9f43, #ffd32a,
                                    #0be881, #17c0eb, #a29bfe,
                                    #fd79a8, #ff6b6b, #ff9f43, #ffd32a
                                );
                                background-size: 300% auto;
                                -webkit-background-clip: text;
                                background-clip: text;
                                -webkit-text-fill-color: transparent;
                                animation: rainbow-wave 8s linear infinite;
                            }
                            .rainbow-dot {
                                background: linear-gradient(
                                    90deg,
                                    #ff6b6b, #ff9f43, #ffd32a,
                                    #0be881, #17c0eb, #a29bfe,
                                    #fd79a8, #ff6b6b
                                );
                                background-size: 300% auto;
                                animation: rainbow-dot 8s linear infinite;
                            }
                        `}</style>
                        <div className="flex items-center gap-2 mt-4 ml-2">
                            <span className="text-xs font-semibold tracking-wide rainbow-thinking">Thinking</span>
                            <div className="flex items-end space-x-0.5">
                                <span className="w-1 h-1 rounded-full rainbow-dot animate-bounce-delay-1" />
                                <span className="w-1 h-1 rounded-full rainbow-dot animate-bounce-delay-2" />
                                <span className="w-1 h-1 rounded-full rainbow-dot animate-bounce-delay-3" />
                            </div>
                        </div>
                    </>
                )}
                {/* Streaming Indicator */}
                {isStreamingIndicatorVisible && (
                    <div className="flex items-center gap-2 mt-4 ml-2">
                        <span className={`text-xs font-medium text-purple-600 dark:text-purple-400`}>Xeref.ai is streaming</span>
                        <div className="relative flex items-center justify-center w-3 h-3">
                        <span className="absolute w-2 h-2 bg-blue-500 rounded-full animate-pulse-fade" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && !attachedImage && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
                {suggestions.map((s, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentInput(s)}
                    className={`text-xs px-3 py-1 rounded-full border ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    {s}
                </button>
                ))}
            </div>
            )}

            {/* Image Preview */}
            {attachedImage && (
                <div className="px-4 pb-2 flex gap-2 animate-fade-in">
                    <div className="relative group/image">
                        <div className={`w-16 h-16 rounded-lg overflow-hidden border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`data:${attachedImage.mimeType};base64,${attachedImage.data}`} alt="Attached" className="w-full h-full object-cover" />
                        </div>
                        <button 
                            onClick={() => setAttachedImage(null)}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/image:opacity-100 transition-opacity shadow-sm"
                        >
                            <X size={10} />
                        </button>
                    </div>
                </div>
            )}

            <div className="relative">
              <ScrollToBottomButton scrollContainerRef={messagesScrollRef} />
            </div>
            <ChatInput
                onSend={handleSendMessage}
                isLoading={chatState.isLoading}
                selectedModel={settings.modelName}
                onSelectModel={(m) => setSettings(s => ({...s, modelName: m}))}
                planningMode={planningMode}
                onTogglePlanning={setPlanningMode}
                value={currentInput}
                onChange={setCurrentInput}
                onImageSelect={(base64, mimeType) => setAttachedImage({ data: base64, mimeType })}
            />
          </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-lg shadow-2xl p-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Agent Settings</h3>
                    <button onClick={() => setShowSettings(false)}><X size={16} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Model</label>
                        <select value={settings.modelName} onChange={(e) => setSettings({...settings, modelName: e.target.value})} className={`w-full p-2 rounded text-sm border ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                            {AVAILABLE_MODELS.map(model => (
                                <option key={model.id} value={model.id}>{model.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* SynthID Integration */}
                    <div className="flex items-center justify-between py-2 border-t border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className={settings.enableSynthID ? "text-green-500" : "text-gray-400"}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Enable SynthID</label>
                                <p className="text-[10px] text-gray-500">Watermark AI-generated content</p>
                            </div>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={settings.enableSynthID ?? false} 
                            onChange={(e) => setSettings({...settings, enableSynthID: e.target.checked})}
                            className="accent-blue-600 w-4 h-4 rounded"
                        />
                    </div>

                    <button onClick={() => { localStorage.setItem('antigravity_agent_settings', JSON.stringify(settings)); setShowSettings(false); }} className="w-full bg-black dark:bg-blue-600 text-white rounded py-2 text-sm hover:opacity-90">Save Settings</button>
                </div>
            </div>
        </div>
      )}
      
      {/* History Overlay */}
      {showHistory && (
             <div className={`absolute inset-y-0 right-0 w-64 border-l z-20 shadow-xl flex flex-col ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-gray-500">History</span>
                    <button onClick={() => setShowHistory(false)}><X size={14} className="text-gray-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sessions.map(session => (
                        <button 
                            key={session.id}
                            onClick={() => loadSession(session)}
                            className={`w-full text-left p-2 rounded-md text-sm truncate transition-colors ${
                                activeSessionId === session.id 
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            {session.title}
                            <div className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(session.timestamp).toLocaleDateString()}
                            </div>
                        </button>
                    ))}
                </div>
             </div>
        )}

      {/* Message Context Menu */}
      {contextMenu && (
          <div 
            ref={contextMenuRef}
            className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg py-1 min-w-[140px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
              <button 
                  onClick={() => { handleCopyCode(contextMenu.message.text); setContextMenu(null); }} 
                  className="w-full text-left px-4 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                  <Copy size={12} /> Copy Message
              </button>
              <button 
                  onClick={() => handleDeleteMessage(contextMenu.message.id)} 
                  className="w-full text-left px-4 py-1.5 text-xs hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 flex items-center gap-2"
              >
                  <Trash2 size={12} /> Delete Message
              </button>
          </div>
      )}
    </div>
  );
};

// Exported as named export above
