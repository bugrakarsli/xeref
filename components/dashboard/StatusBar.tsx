"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface StatusBarProps {
    onOpenCustomizations?: () => void;
    onOpenSettings?: () => void;
    onOpenShortcuts?: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ onOpenCustomizations, onOpenSettings, onOpenShortcuts }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Local state for settings
  const [agentAutoFix, setAgentAutoFix] = useState(true);
  const [autoExecution, setAutoExecution] = useState<'Auto' | 'Manual'>('Auto');
  const [reviewPolicy, setReviewPolicy] = useState<'Request Review' | 'Always Approve'>('Request Review');
  const [tabGitignore, setTabGitignore] = useState(false);
  const [tabSpeed, setTabSpeed] = useState<'Fast' | 'Slow'>('Fast');
  const [tabImport, setTabImport] = useState(true);
  const [tabJump, setTabJump] = useState(true);
  const [snoozeActive, setSnoozeActive] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="text-xs text-gray-600 dark:text-gray-400 select-none">
        <div ref={settingsRef} className="relative">
            <div 
                className={`flex items-center gap-1 px-3 py-1.5 bg-[#18181b] border border-[#2d2d2d] rounded-md shadow-lg cursor-pointer hover:text-gray-900 dark:hover:text-gray-300 ${isSettingsOpen ? 'text-blue-500 dark:text-blue-400' : ''}`}
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
                <span>Xeref.ai - Settings</span>
            </div>
            
            {/* Dropdown rendered inline to avoid focus/state loss issues */}
            {isSettingsOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-[320px] bg-[#18181b] border border-[#2d2d2d] rounded-lg shadow-2xl text-gray-300 text-xs overflow-hidden z-50 animate-fade-in">
                    <div className="max-h-[80vh] overflow-y-auto">
                        {/* Agent Section */}
                        <div className="p-3">
                            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">Agent</div>
                            <DropdownItem 
                                label="Agent Auto-Fix Lints" 
                                value={agentAutoFix ? "On" : "Off"} 
                                onClick={() => setAgentAutoFix(!agentAutoFix)}
                                description="Automatically apply fixes for linting errors without asking."
                            />
                            <DropdownItem 
                                label="Auto Execution" 
                                value={autoExecution} 
                                onClick={() => setAutoExecution(prev => prev === 'Auto' ? 'Manual' : 'Auto')}
                                description="Allow the agent to execute commands without confirmation."
                            />
                            <DropdownItem 
                                label="Review Policy" 
                                value={reviewPolicy} 
                                onClick={() => setReviewPolicy(prev => prev === 'Request Review' ? 'Always Approve' : 'Request Review')}
                                description="Determine when the agent needs human review for changes."
                            />
                            <div 
                                className="flex items-center justify-between py-1.5 hover:bg-[#27272a] rounded px-2 cursor-pointer mt-1 group" 
                                onClick={(e) => { 
                                    e.stopPropagation();
                                    setIsSettingsOpen(false); 
                                    onOpenCustomizations?.(); 
                                }}
                            >
                                <span>Customizations</span>
                                <span className="text-blue-400 group-hover:text-blue-300">Manage</span>
                            </div>
                        </div>

                        <div className="h-px bg-[#2d2d2d] mx-3" />

                        {/* Tab Section */}
                        <div className="p-3">
                            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">Tab</div>
                            <DropdownItem 
                                label="Tab Gitignore Access" 
                                value={tabGitignore ? "On" : "Off"} 
                                onClick={() => setTabGitignore(!tabGitignore)}
                                description="Allow Tab to read files ignored by git."
                            />
                            <DropdownItem 
                                label="Tab Speed" 
                                value={tabSpeed} 
                                onClick={() => setTabSpeed(prev => prev === 'Fast' ? 'Slow' : 'Fast')}
                                description="Adjust the completion speed of the Tab key."
                            />
                            <DropdownItem 
                                label="Tab to Import" 
                                value={tabImport ? "On" : "Off"} 
                                onClick={() => setTabImport(!tabImport)}
                                description="Automatically add imports when accepting completions."
                            />
                            <DropdownItem 
                                label="Tab to Jump" 
                                value={tabJump ? "On" : "Off"} 
                                onClick={() => setTabJump(!tabJump)}
                                description="Tab key jumps to the next edit location."
                            />
                            <div 
                                className="flex items-center justify-between py-1.5 hover:bg-[#27272a] rounded px-2 cursor-pointer mt-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSnoozeActive(!snoozeActive);
                                }}
                            >
                                <span>Snooze</span>
                                <span className={snoozeActive ? "text-orange-400" : "text-blue-400"}>{snoozeActive ? "Stop" : "Start"}</span>
                            </div>
                        </div>

                        <div className="h-px bg-[#2d2d2d] mx-3" />

                        {/* Advanced Settings */}
                        <div className="p-3">
                            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-3">Advanced Settings</div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation();
                                        setIsSettingsOpen(false); 
                                        onOpenSettings?.(); 
                                    }}
                                    className="flex-1 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] rounded border border-[#3f3f46] text-center"
                                >
                                    Settings
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsSettingsOpen(false);
                                        onOpenShortcuts?.();
                                    }}
                                    className="flex-1 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] rounded border border-[#3f3f46] text-center"
                                >
                                    AI Shortcuts
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

const DropdownItem = ({ label, value, onClick, description }: { label: string, value: string, onClick?: () => void, description?: string }) => (
    <div 
        className="flex items-center justify-between py-1.5 hover:bg-[#27272a] rounded px-2 cursor-pointer group"
        onClick={(e) => {
            e.stopPropagation();
            onClick?.();
        }}
        title={description || label}
    >
        <div className="flex items-center gap-1">
            <span>{label}</span>
            <div 
                className="text-[10px] text-gray-500 ml-1 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-600 rounded-full w-3 h-3 flex items-center justify-center hover:bg-gray-700 hover:text-white"
                title={description}
            >i</div>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
            <span>{value}</span>
            <ChevronDown size={10} />
        </div>
    </div>
);

export default StatusBar;
