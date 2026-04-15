"use client";

import React, { useState, useEffect } from 'react';
import { 
    CheckSquare, GitMerge, Settings, LogOut, ChevronDown, Rocket, 
    Plus, History, FolderOpen, ChevronRight, MoreHorizontal, Lightbulb, 
    ArrowRight, Mic, X, Image as ImageIcon, AtSign, Code,
    BookOpen, Command, Search, MessageSquare, PenLine, Layers, Info
} from 'lucide-react';
import StatusBar from './StatusBar';

const SlashBoxIcon = ({size=14, className=""}: {size?: number, className?: string}) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="15" x2="15" y2="9" />
    </svg>
);

export type ViewType = 'tasks' | 'workflows' | 'settings' | 'new_conversation' | 'knowledge';

interface AgentManagerViewProps {
    onOpenEditor?: () => void;
    initialView?: ViewType;
}

export const AgentManagerView: React.FC<AgentManagerViewProps> = ({ onOpenEditor, initialView = 'new_conversation' }) => {
    const [activeView, setActiveView] = useState<ViewType>(initialView === 'settings' ? 'new_conversation' : initialView);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(initialView === 'settings');
    const [settingsTab, setSettingsTab] = useState('account');
    const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState('Gemini 3.1 Pro (High)');
    const [telemetry, setTelemetry] = useState(true);
    const [marketing, setMarketing] = useState(true);

    const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState('xeref-claw');
    const [contextDropdownOpen, setContextDropdownOpen] = useState(false);
    const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
    const [selectedMode, setSelectedMode] = useState('Planning');
    const [isListening, setIsListening] = useState(false);
    const [inputText, setInputText] = useState("");
    const recognitionRef = React.useRef<any>(null);
    const [shortcutsOpen, setShortcutsOpen] = useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [sidebarHidden, setSidebarHidden] = useState(false);

    const toggleVoiceInput = () => {
        if (typeof window === 'undefined') return;
        
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        
        if (isListening) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
            return;
        }

        const SpeechRecognitionApi = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognitionApi) return;
        
        const recognition = new SpeechRecognitionApi();
        recognitionRef.current = recognition;
        
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onstart = () => {
            setIsListening(true);
        };
        
        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setInputText(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + finalTranscript);
            }
        };
        
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognition.start();
    };

    // Sync active view
    useEffect(() => {
        if (initialView) {
            if (initialView === 'settings') {
                setSettingsOpen(true);
            } else {
                setActiveView(initialView);
            }
        }
    }, [initialView]);
    
    // Global Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                setSidebarHidden(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const Toggle = ({ active, onChange }: { active: boolean, onChange: () => void }) => (
        <div onClick={onChange} className={`w-10 h-5 rounded-full cursor-pointer p-0.5 transition-colors flex items-center ${active ? 'bg-indigo-600' : 'bg-gray-700'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${active ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
    );

    return (
        <div className="flex h-full w-full font-sans bg-[#09090b] text-[#d4d4d8]">
            {/* Sidebar */}
             <div className={`flex flex-col border-r border-[#2d2d2d]/60 bg-[#09090b] shrink-0 transition-all duration-300 ease-in-out ${sidebarHidden ? 'w-0 opacity-0 overflow-hidden' : 'w-[280px] opacity-100'}`}>
                 {/* Top Header - Xeref AI Logo & Agent Manager */}
                <div className="px-4 py-4 border-b border-[#2d2d2d]/60 bg-[#09090b] select-none sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-2 mb-4">
                        <img src="/xeref.svg" alt="Xeref AI" className="w-6 h-6 object-contain" />
                        <span className="font-bold text-gray-100 tracking-wide text-[15px]">Xeref AI</span>
                    </div>
                    
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Rocket size={16} className="text-blue-500" />
                            <span className="font-semibold text-gray-300 text-sm">Agent Manager</span>
                        </div>

                        <div className="relative">
                            <button 
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-1.5 hover:bg-[#1e1e1e] p-1 rounded-md transition-colors"
                                title="User Menu"
                            >
                                <div className="w-5 h-5 rounded-full bg-blue-600/90 flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-1 ring-white/10 group-hover:ring-[#2d2d2d] transition-all">
                                    BK
                                </div>
                            </button>

                            {showUserMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg shadow-xl py-1 z-50">
                                        <div className="px-3 py-2 border-b border-[#2d2d2d] mb-1">
                                             <p className="text-xs font-medium text-gray-200">Bugra Karsli</p>
                                        </div>
                                        <button 
                                            onClick={() => { setSettingsOpen(true); setShowUserMenu(false); }}
                                            className="w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-[#27272a] flex items-center gap-2"
                                        >
                                            <Settings size={12} /> Settings
                                        </button>
                                        <button 
                                            onClick={() => setShowUserMenu(false)}
                                            className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-[#27272a] flex items-center gap-2"
                                        >
                                            <LogOut size={12} /> Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                 {/* Navigation Area */}
                <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5 custom-scrollbar">
                    {/* Primary actions */}
                    <div className="space-y-0.5">
                        <button 
                            onClick={() => setActiveView('new_conversation')} 
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors group ${activeView === 'new_conversation' ? 'bg-[#1e1e1e] text-gray-100 font-medium border border-[#2d2d2d]/30 shadow-sm' : 'text-gray-400 hover:bg-[#1e1e1e] hover:text-gray-200'}`}
                        >
                            <Plus size={14} className={activeView === 'new_conversation' ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-300'} />
                            <span>New Conversation</span>
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-400 hover:bg-[#1e1e1e] hover:text-gray-200 transition-colors group">
                            <History size={14} className="text-gray-500 group-hover:text-gray-300" />
                            <span>Conversation History</span>
                        </button>
                    </div>

                    {/* Workspaces */}
                    <div>
                        <div className="flex items-center justify-between px-3 py-1 mb-1 text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                            <span>Workspaces</span>
                            <FolderOpen size={12} className="opacity-80" />
                        </div>
                        <div className="space-y-0.5 relative">
                            {['portfolio', 'xeref-claw', 'XerefWhisper-desktop'].map(ws => (
                                <button key={ws} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-gray-400 hover:bg-[#1e1e1e] hover:text-gray-200 transition-colors">
                                    <ChevronRight size={12} className="text-gray-600 ml-1" />
                                    <span className="truncate">{ws}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Bottom Actions */}
                <div className="px-2 py-3 border-t border-[#2d2d2d]/60 bg-[#09090b] space-y-0.5 shrink-0 relative">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-400 hover:bg-[#1e1e1e] hover:text-gray-200 transition-colors">
                        <Lightbulb size={14} className="text-gray-500" />
                        <span>Provide Feedback</span>
                    </button>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${moreMenuOpen ? 'bg-[#1e1e1e] text-gray-200' : 'text-gray-400 hover:bg-[#1e1e1e] hover:text-gray-200'}`}
                        >
                            <MoreHorizontal size={14} className="text-gray-500" />
                            <span>More</span>
                        </button>

                        {moreMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setMoreMenuOpen(false)}></div>
                                <div className="absolute left-0 bottom-full mb-1 w-full bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <button 
                                        onClick={() => { setActiveView('knowledge'); setMoreMenuOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-gray-200 hover:bg-[#27272a] flex items-center gap-2"
                                    >
                                        <BookOpen size={12} /> Knowledge
                                    </button>
                                    <button 
                                        onClick={() => { setShortcutsOpen(true); setMoreMenuOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-gray-200 hover:bg-[#27272a] flex items-center gap-2"
                                    >
                                        <Command size={12} /> Shortcuts
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
             </div>

             {/* Main Content Area */}
             <div className="flex-1 flex flex-col relative overflow-hidden bg-[#09090b]">
                {activeView === 'new_conversation' && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#0a0a0c]">
                        <div className="w-full max-w-3xl flex flex-col gap-3 mt-auto lg:mb-[25vh] md:mb-[15vh]">
                            <div className="flex items-center justify-between text-xs text-gray-500 px-1 relative z-10">
                                <div className="flex items-center gap-1.5">
                                   <span>New conversation in</span>
                                   <div className="relative">
                                       <div 
                                           className="flex items-center gap-1 cursor-pointer transition-colors text-gray-300 hover:text-white font-medium"
                                           onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                                       >
                                          <span>{selectedWorkspace}</span>
                                          <ChevronDown size={12} className="text-gray-500" />
                                       </div>
                                       {workspaceDropdownOpen && (
                                           <>
                                               <div className="fixed inset-0 z-20" onClick={() => setWorkspaceDropdownOpen(false)}></div>
                                               <div className="absolute top-full left-0 mt-2 w-48 bg-[#1a1a1e] border border-[#2d2d30] rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.6)] py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                                                   {['portfolio', 'xeref-claw', 'XerefWhisper-desktop'].map(ws => (
                                                       <div 
                                                           key={ws}
                                                           className={`px-3 py-2 text-xs transition-all cursor-pointer ${selectedWorkspace === ws ? 'text-blue-400 bg-[#27272a]' : 'text-gray-400 hover:text-white hover:bg-[#27272a]/50'}`}
                                                           onClick={() => { setSelectedWorkspace(ws); setWorkspaceDropdownOpen(false); }}
                                                       >
                                                           {ws}
                                                       </div>
                                                   ))}
                                               </div>
                                           </>
                                       )}
                                   </div>
                                </div>
                                <div 
                                    className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md hover:bg-[#1e1e1e] hover:text-gray-300 transition-all active:scale-95 translate-x-1"
                                    onClick={onOpenEditor}
                                >
                                    <Code size={12} className="text-gray-500" />
                                    <span className="font-medium">Open editor</span>
                                </div>
                            </div>
                            
                            <div className="bg-[#18181b] border border-[#27272a] rounded-xl flex flex-col shadow-2xl shadow-black/20 focus-within:border-[#3f3f46] transition-colors duration-200 relative z-0">
                                <textarea 
                                    placeholder="Ask anything, @ to mention, / for workflows"
                                    className="w-full bg-transparent border-none outline-none resize-none px-4 py-5 min-h-[90px] text-gray-200 placeholder:text-gray-600 focus:ring-0 text-[15px]"
                                    rows={1}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            if (inputText.trim()) {
                                                console.log("Sending message:", inputText);
                                                setInputText("");
                                            }
                                        }
                                    }}
                                />
                                
                                <div className="px-3 py-2 flex items-center justify-between border-t border-[#27272a]/80 bg-[#141417] rounded-b-xl">
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <button 
                                                className={`p-1.5 transition-colors rounded-md hover:bg-[#2d2d2d] ${contextDropdownOpen ? 'bg-[#2d2d2d] text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
                                                title="Add context"
                                                onClick={() => setContextDropdownOpen(!contextDropdownOpen)}
                                            >
                                                <Plus size={16} />
                                            </button>
                                            {contextDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setContextDropdownOpen(false); }}></div>
                                                    <div className="absolute top-full left-0 mt-2 w-44 bg-[#141416] border border-[#27272a] rounded-lg shadow-2xl py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                                                        <div className="px-3 py-1.5 mb-1">
                                                            <p className="text-[11px] font-medium text-gray-400">Add context</p>
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <div className="px-3 py-2 hover:bg-[#27272a] cursor-pointer flex items-center gap-2.5 transition-colors group">
                                                                <ImageIcon size={14} className="text-gray-500 group-hover:text-gray-400" />
                                                                <span className="text-[13px] font-medium text-gray-300 group-hover:text-gray-200">Media</span>
                                                            </div>
                                                            <div className="px-3 py-2 hover:bg-[#27272a] cursor-pointer flex items-center gap-2.5 transition-colors group">
                                                                <AtSign size={14} className="text-gray-500 group-hover:text-gray-400" />
                                                                <span className="text-[13px] font-medium text-gray-300 group-hover:text-gray-200">Mentions</span>
                                                            </div>
                                                            <div className="px-3 py-2 hover:bg-[#27272a] cursor-pointer flex items-center gap-2.5 transition-colors group">
                                                                <SlashBoxIcon size={14} className="text-gray-500 group-hover:text-gray-400" />
                                                                <span className="text-[13px] font-medium text-gray-300 group-hover:text-gray-200">Workflows</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center bg-[#1f1f22] rounded-md border border-[#2d2d2d]/80 transition-colors relative">
                                            {/* Planning Button */}
                                            <div 
                                                className={`flex items-center gap-1.5 px-2.5 py-1.5 cursor-pointer rounded-l-md transition-all ${modeDropdownOpen ? 'bg-[#2d2d30] text-gray-200' : 'text-gray-400 hover:bg-[#27272a] hover:text-gray-300'}`}
                                                onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                                            >
                                                <span className="text-[11px] font-semibold tracking-tight uppercase">{selectedMode}</span>
                                                <ChevronDown size={10} className="opacity-60" />
                                            </div>
                                            
                                            {modeDropdownOpen && (
                                              <>
                                                  <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setModeDropdownOpen(false); }}></div>
                                                  <div className="absolute top-full left-0 mt-2 w-[340px] bg-[#1a1a1e] border border-[#2d2d30] rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.6)] py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                                                        <div className="px-3 pb-2 mb-1 border-b border-[#2d2d30]/50">
                                                            <p className="text-[11px] text-gray-400 font-medium tracking-wide">Conversation mode</p>
                                                        </div>
                                                        <div className="space-y-1 px-1.5 pt-1">
                                                            <div onClick={(e) => { setSelectedMode('Planning'); e.stopPropagation(); setModeDropdownOpen(false);}} className={`p-2.5 rounded-md hover:bg-[#27272a] cursor-pointer transition-colors ${selectedMode === 'Planning' ? 'bg-[#27272a]' : ''}`}>
                                                                <p className="text-[13px] font-semibold text-gray-300 mb-0.5">Planning</p>
                                                                <p className="text-[11px] text-gray-500 leading-relaxed">Agent can plan before executing tasks. Use for deep research, complex tasks, or collaborative work</p>
                                                            </div>
                                                            <div onClick={(e) => { setSelectedMode('Fast'); e.stopPropagation(); setModeDropdownOpen(false);}} className={`p-2.5 rounded-md hover:bg-[#27272a] cursor-pointer transition-colors ${selectedMode === 'Fast' ? 'bg-[#27272a]' : ''}`}>
                                                                <p className="text-[13px] font-semibold text-gray-300 mb-0.5">Fast</p>
                                                                <p className="text-[11px] text-gray-500 leading-relaxed">Agent will execute tasks directly. Use for simple tasks that can be completed faster</p>
                                                            </div>
                                                        </div>
                                                  </div>
                                              </>
                                            )}

                                            <div className="w-[1px] h-3.5 bg-[#2d2d30]"></div>

                                            {/* Model Select Button */}
                                            <div 
                                                className={`flex items-center gap-1.5 px-2.5 py-1.5 cursor-pointer rounded-r-md transition-all ${modelDropdownOpen ? 'bg-[#2d2d30] text-gray-200' : 'text-gray-400 hover:bg-[#27272a] hover:text-gray-300'}`}
                                                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                                            >
                                                <span className="text-[11px] font-semibold tracking-tight uppercase truncate max-w-[120px]">{selectedModel}</span>
                                                <ChevronDown size={10} className="opacity-60" />
                                            </div>
                                            
                                            {modelDropdownOpen && (
                                              <>
                                                  <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setModelDropdownOpen(false); }}></div>
                                                  <div className="absolute top-full left-0 ml-4 mt-2 w-72 bg-[#1a1a1e] border border-[#2d2d30] rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.6)] py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                                                       <div className="px-3 py-1.5 mb-1">
                                                            <p className="text-[10px] font-semibold text-gray-500 tracking-wider">Model</p>
                                                       </div>
                                                       <div className="space-y-0.5">
                                                            <div onClick={(e) => { setSelectedModel('Gemini 3.1 Pro (High)'); e.stopPropagation(); setModelDropdownOpen(false);}} className={`px-3 py-2 hover:bg-[#27272a] cursor-pointer flex items-center justify-between transition-colors ${selectedModel === 'Gemini 3.1 Pro (High)' ? 'bg-[#27272a]' : ''}`}>
                                                                <span className="text-xs font-medium text-gray-200">Gemini 3.1 Pro (High)</span>
                                                                <span className="text-[9px] bg-[#27272a] px-1.5 rounded-sm py-0.5 text-gray-400 border border-[#3f3f46]">New</span>
                                                            </div>
                                                            <div onClick={(e) => { setSelectedModel('Gemini 3.1 Pro (Low)'); e.stopPropagation(); setModelDropdownOpen(false);}} className={`px-3 py-2 hover:bg-[#27272a] cursor-pointer flex items-center justify-between transition-colors ${selectedModel === 'Gemini 3.1 Pro (Low)' ? 'bg-[#27272a]' : ''}`}>
                                                                <span className="text-xs font-medium text-gray-200">Gemini 3.1 Pro (Low)</span>
                                                                <span className="text-[9px] bg-[#27272a] px-1.5 rounded-sm py-0.5 text-gray-400 border border-[#3f3f46]">New</span>
                                                            </div>
                                                            <div onClick={(e) => { setSelectedModel('Gemini 3 Flash'); e.stopPropagation(); setModelDropdownOpen(false);}} className={`px-3 py-2 hover:bg-[#27272a] cursor-pointer transition-colors ${selectedModel === 'Gemini 3 Flash' ? 'bg-[#27272a]' : ''}`}>
                                                                <span className="text-xs font-medium text-gray-300">Gemini 3 Flash</span>
                                                            </div>
                                                            <div onClick={(e) => { setSelectedModel('Claude Sonnet 4.6 (Thinking)'); e.stopPropagation(); setModelDropdownOpen(false);}} className={`px-3 py-2 hover:bg-[#27272a] cursor-pointer flex items-center justify-between transition-colors ${selectedModel === 'Claude Sonnet 4.6 (Thinking)' ? 'bg-[#27272a]' : ''}`}>
                                                                <span className="text-xs font-medium text-gray-300">Claude Sonnet 4.6 (Thinking)</span>
                                                                <span className="text-xs text-yellow-500" title="Warning">⚠</span>
                                                            </div>
                                                            <div className="px-3 py-2 flex items-center justify-between opacity-50 cursor-not-allowed group relative pt-3 border-t border-[#27272a] mt-1">
                                                                <span className="text-xs font-medium text-gray-400">Custom</span>
                                                                <div className="relative flex items-center">
                                                                    <span className="text-xs text-yellow-600 peer cursor-help">⚠</span>
                                                                    <div className="absolute right-0 bottom-full mb-3 w-[260px] p-2.5 bg-[#1c1c1f] border border-[#3f3f46] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                                                        <p className="text-[12px] text-gray-300 font-medium leading-relaxed">Custom models are only supported on Cloudtop / Linux machines.</p>
                                                                        <div className="absolute top-full right-2 w-3 h-3 bg-[#1c1c1f] border-r border-b border-[#3f3f46] transform rotate-45 -mt-1.5"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                              </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button 
                                            className={`p-1.5 transition-all rounded-md shadow-sm border ${isListening ? 'bg-[#3f3f46] text-white border-transparent scale-110' : 'text-gray-500 hover:text-gray-300 hover:bg-[#2d2d2d] border-transparent'}`} 
                                            title="Voice input"
                                            onClick={toggleVoiceInput}
                                        >
                                            <Mic size={16} className={isListening ? 'animate-pulse' : ''} />
                                        </button>
                                        <button 
                                            className={`p-1.5 text-gray-400 hover:text-white bg-[#27272a] hover:bg-[#3b3b3f] transition-all rounded-md shadow-sm border border-[#3f3f46]/50 active:scale-95 ${inputText.trim() ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : ''}`} 
                                            title="Send message"
                                            onClick={() => {
                                                if (inputText.trim()) {
                                                    console.log("Sending message:", inputText);
                                                    setInputText("");
                                                }
                                            }}
                                        >
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Legacy Views */}
                {activeView === 'tasks' && (
                    <div className="p-8 h-full flex flex-col bg-[#09090b]">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-200">Tasks</h2>
                        <div className="flex-1 bg-[#1e1e1e] border border-[#2d2d2d] rounded-xl flex items-center justify-center shadow-lg">
                            <div className="text-center">
                                <CheckSquare size={48} className="mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-500">Your AI Agent Tasks will appear here.</p>
                            </div>
                        </div>
                    </div>
                )}
                {activeView === 'workflows' && (
                    <div className="p-8 h-full flex flex-col bg-[#09090b]">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-200">Workflows</h2>
                        <div className="flex-1 bg-[#1e1e1e] border border-[#2d2d2d] rounded-xl flex items-center justify-center shadow-lg">
                            <div className="text-center">
                                <GitMerge size={48} className="mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-500">Configure your automated workflows here.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'knowledge' && (
                    <div className="w-full h-full flex animate-in fade-in duration-300">
                        <div className="w-[300px] border-r border-[#2d2d2d]/60 flex flex-col bg-[#09090b]">
                            <div className="px-5 py-4 border-b border-[#2d2d2d]/60">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-200">Knowledge</span>
                                    <Info size={12} className="text-gray-600 cursor-help" />
                                </div>
                            </div>
                            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                                <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
                                    The agent has not generated any knowledge items yet.
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center bg-[#090a0c]">
                            <p className="text-xs text-gray-600">
                                Open an artifact from the left pane to view its content here.
                            </p>
                        </div>
                    </div>
                )}
             </div>

             {/* Status Bar */}
             <div className="absolute bottom-4 right-6 z-10">
                <StatusBar 
                    onOpenSettings={() => setSettingsOpen(true)}
                    onOpenShortcuts={() => setShortcutsOpen(true)}
                    onOpenCustomizations={() => {
                        setSettingsOpen(true);
                        setSettingsTab('customizations'); // Note: I might need to add this tab logic
                    }}
                />
             </div>

             {/* Keyboard Shortcuts Modal */}
             {shortcutsOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="fixed inset-0" onClick={() => setShortcutsOpen(false)}></div>
                    <div className="w-full max-w-lg bg-[#111113] border border-[#2d2d2d] rounded-xl shadow-2xl relative z-10 overflow-hidden ring-1 ring-white/5">
                        <div className="px-5 py-4 border-b border-[#2d2d2d] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-semibold text-gray-200">Keyboard Shortcuts</h3>
                                <span className="px-1.5 py-0.5 bg-[#1e1e1e] rounded text-[10px] text-gray-500 font-mono border border-[#333]">Ctrl+?</span>
                            </div>
                            <button onClick={() => setShortcutsOpen(false)} className="text-gray-500 hover:text-gray-300 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-600 mb-4">Recommended</h4>
                                <div className="space-y-4">
                                    {[
                                        { icon: <MessageSquare size={14} />, label: "Open Conversation Picker", key: "Ctrl+K" },
                                        { icon: <Search size={14} />, label: "Open File Search", key: "Ctrl+P" },
                                        { icon: <PenLine size={14} />, label: "Focus Input", key: "Ctrl+L" },
                                        { icon: <Layers size={14} />, label: "New Conversation", key: "Ctrl+Shift+O" },
                                        { icon: <GitMerge size={14} />, label: "Open Workspace Selector", key: "Ctrl+Shift+K" },
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3 text-gray-400 group-hover:text-gray-200 transition-colors">
                                                <div className="text-gray-500 group-hover:text-blue-400 transition-colors">
                                                    {s.icon}
                                                </div>
                                                <span className="text-xs">{s.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {s.key.split('+').map((k, ki) => (
                                                    <span key={ki} className="min-w-[40px] text-center px-1.5 py-1 bg-[#1e1e1e] rounded text-[10px] text-gray-400 font-mono border border-[#333] shadow-inner">
                                                        {k}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-[#0a0a0c] border-t border-[#2d2d2d] flex items-center justify-center">
                            <button className="text-[11px] text-gray-500 hover:text-gray-300 flex items-center gap-2 transition-colors">
                                <ChevronDown size={14} /> Expand All
                            </button>
                        </div>
                    </div>
                </div>
             )}

             {/* Settings Modal relative to parent (or fixed screen logic) */}
             {settingsOpen && (
                <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-200" onClick={() => setSettingsOpen(false)}>
                    {/* Modal Window */}
                    <div 
                        className="bg-[#0f0f11] border border-[#27272a] rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] max-h-[850px] flex flex-col overflow-hidden relative" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="h-14 flex items-center justify-center border-b border-[#27272a] bg-[#0f0f11] shrink-0 sticky top-0 z-10 w-full relative">
                            <h3 className="text-sm font-medium text-gray-300 capitalize">Settings - {settingsTab.replace('_', ' ')}</h3>
                            <button onClick={() => setSettingsOpen(false)} className="absolute right-4 p-1 rounded hover:bg-[#27272a] text-gray-400 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        
                        {/* Content Body */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Settings Sidebar */}
                            <div className="w-[240px] bg-[#0f0f11] border-r border-[#27272a] flex flex-col pt-4 overflow-y-auto shrink-0 custom-scrollbar">
                                <div className="px-3 pb-4">
                                    <div className="space-y-0.5 mb-6">
                                        <button 
                                            onClick={() => setSettingsTab('account')}
                                            className={`w-full text-left px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${settingsTab === 'account' ? 'bg-[#18181b] text-blue-400' : 'text-gray-400 hover:text-gray-200 hover:bg-[#18181b]'}`}
                                        >
                                            Account
                                        </button>
                                    </div>

                                    <div className="mb-6">
                                        <p className="px-3 mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global</p>
                                        <div className="space-y-0.5">
                                            {['Agent', 'Notifications', 'Models', 'Customizations', 'Browser', 'Tab', 'Editor'].map(item => {
                                                const tabKey = item.toLowerCase();
                                                return (
                                                    <button 
                                                        key={item} 
                                                        onClick={() => setSettingsTab(tabKey)}
                                                        className={`w-full text-left px-3 py-1.5 rounded-md text-[13px] transition-colors ${settingsTab === tabKey ? 'bg-[#18181b] text-blue-400' : 'text-gray-400 hover:text-gray-200 hover:bg-[#18181b]'}`}
                                                    >
                                                        {item}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <p className="px-3 mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Workspaces</p>
                                        <div className="space-y-0.5">
                                            {['portfolio', 'xeref-claw', 'XerefWhisper-desktop'].map(item => (
                                                <button 
                                                    key={item} 
                                                    onClick={() => setSettingsTab(`workspace_${item.toLowerCase()}`)}
                                                    className={`w-full text-left px-3 py-1.5 rounded-md text-[13px] transition-colors truncate ${settingsTab === `workspace_${item.toLowerCase()}` ? 'bg-[#18181b] text-blue-400' : 'text-gray-400 hover:text-gray-200 hover:bg-[#18181b]'}`}
                                                >
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-auto px-3 pb-6">
                                     <button className="w-full text-left px-3 py-1.5 rounded-md text-[13px] text-gray-400 hover:text-gray-200 hover:bg-[#18181b] transition-colors">
                                        Provide Feedback
                                    </button>
                                </div>
                            </div>

                            {/* Settings Main Content */}
                            <div className="flex-1 bg-[#121214] overflow-y-auto px-10 py-10 lg:px-20 lg:py-12 custom-scrollbar">
                               <div className="max-w-3xl">
                                   {settingsTab === 'account' ? (
                                       <>
                                   
                                   {/* General Section */}
                                   <div className="mb-10">
                                       <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">General</h4>
                                       
                                       <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden divide-y divide-[#27272a]">
                                            <div className="p-5 flex items-center justify-between gap-8">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-200 mb-1">Enable Telemetry</p>
                                                    <p className="text-xs text-gray-500 leading-relaxed">
                                                        When toggled on, Xeref collects usage data to help BugraKarsli enhance performance and features.
                                                    </p>
                                                </div>
                                                <div className="shrink-0">
                                                    <Toggle active={telemetry} onChange={() => setTelemetry(!telemetry)} />
                                                </div>
                                            </div>
                                            
                                            <div className="p-5 flex items-center justify-between gap-8">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-200 mb-1">Marketing Emails</p>
                                                    <p className="text-xs text-gray-500 leading-relaxed">
                                                        Receive product updates, tips, and promotions from BugraKarsli Xeref via email.
                                                    </p>
                                                </div>
                                                <div className="shrink-0">
                                                    <Toggle active={marketing} onChange={() => setMarketing(!marketing)} />
                                                </div>
                                            </div>
                                       </div>
                                   </div>

                                   {/* Account Section */}
                                   <div className="mb-8">
                                       <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Account</h4>
                                       
                                       <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-200 mb-0.5">Email</p>
                                                <p className="text-sm text-gray-500">bugra@xeref.ai</p>
                                            </div>
                                            <button className="px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-gray-200 text-sm font-medium rounded-lg transition-colors border border-[#3f3f46]/50 shadow-sm">
                                                Sign out
                                            </button>
                                       </div>
                                   </div>
                                   </>
                                   ) : (
                                       <div className="py-20 flex flex-col items-center justify-center text-center">
                                           <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                                               <Settings className="text-blue-500" size={28} />
                                           </div>
                                           <h4 className="text-2xl font-bold text-white mb-3 tracking-tight capitalize">{settingsTab.replace('_', ' ')} Settings</h4>
                                           <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">
                                               This configuration module is currently being optimized. Enhanced controls for <span className="text-blue-400 font-medium">{settingsTab}</span> will be available in the next release.
                                           </p>
                                           <button 
                                               onClick={() => setSettingsTab('account')}
                                               className="mt-8 text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1.5"
                                           >
                                               <ArrowRight size={14} className="rotate-180" /> Back to Account Settings
                                           </button>
                                       </div>
                                   )}

                                   {/* Footer Link */}
                                   <div>
                                        <p className="text-xs text-gray-500">
                                            By using this app, you agree to its{' '}
                                            <a href="https://xeref.ai/terms" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 hover:underline transition-colors">
                                                Terms of Service
                                            </a>
                                        </p>
                                   </div>

                               </div>
                            </div>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

// Exported as named export above
