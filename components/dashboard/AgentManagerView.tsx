"use client";

import React, { useState, useEffect } from 'react';
import { 
    CheckSquare, GitMerge, Settings, LogOut, ChevronDown, Rocket, Inbox, Plus
} from 'lucide-react';

export type ViewType = 'tasks' | 'workflows' | 'settings';

interface AgentManagerViewProps {
    onOpenEditor?: () => void;
    initialView?: ViewType;
}

const AgentManagerView: React.FC<AgentManagerViewProps> = ({ onOpenEditor, initialView = 'tasks' }) => {
    const [activeView, setActiveView] = useState<ViewType>(initialView);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Sync active view with initialView prop if provided
    useEffect(() => {
        if (initialView) {
            setActiveView(initialView);
        }
    }, [initialView]);

    const navItems = [
        { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
        { id: 'workflows', icon: GitMerge, label: 'Workflows' }
    ];

    return (
        <div className="flex h-full w-full font-sans bg-[#09090b] text-[#d4d4d8]">
            {/* Sidebar */}
             <div className="w-[280px] flex flex-col border-r border-[#2d2d2d] bg-[#09090b]">
                 {/* Header */}
                <div className="h-14 flex items-center justify-between px-3 border-b border-[#2d2d2d] bg-[#09090b] select-none">
                    <div className="flex items-center gap-2 cursor-pointer">
                        <Rocket size={18} className="text-blue-500" />
                        <span className="font-semibold text-gray-200">Agent Manager</span>
                    </div>

                    <div className="relative">
                        <button 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-1.5 hover:bg-[#1e1e1e] p-1 rounded-md transition-colors group"
                            title="User Menu"
                        >
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-2 ring-[#09090b] group-hover:ring-[#2d2d2d] transition-all">
                                BK
                            </div>
                            <ChevronDown size={10} className="text-gray-500 group-hover:text-gray-300" />
                        </button>

                        {showUserMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                                <div className="absolute right-0 top-full mt-1 w-48 bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg shadow-xl py-1 z-50">
                                    <div className="px-3 py-2 border-b border-[#2d2d2d] mb-1">
                                         <p className="text-xs font-medium text-gray-200">Bugra Karsli</p>
                                    </div>
                                    <button 
                                        onClick={() => { setActiveView('settings'); setShowUserMenu(false); }}
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
                
                 {/* Navigation */}
                <div className="flex-1 px-2 py-4 space-y-1">
                    {navItems.map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveView(item.id as ViewType)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${activeView === item.id ? 'bg-[#1e1e1e] text-gray-200 border border-[#2d2d2d]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1e1e1e]'}`}
                            title={item.label}
                        >
                            <item.icon size={16} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
             </div>

             {/* Main Content */}
             <div className="flex-1 flex flex-col relative overflow-hidden bg-[#09090b]">
                {activeView === 'tasks' && (
                    <div className="p-8 h-full flex flex-col">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-200">Tasks</h2>
                        <div className="flex-1 bg-[#1e1e1e] border border-[#2d2d2d] rounded-xl flex items-center justify-center">
                            <div className="text-center">
                                <CheckSquare size={48} className="mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-500">Your AI Agent Tasks will appear here.</p>
                            </div>
                        </div>
                    </div>
                )}
                {activeView === 'workflows' && (
                    <div className="p-8 h-full flex flex-col">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-200">Workflows</h2>
                        <div className="flex-1 bg-[#1e1e1e] border border-[#2d2d2d] rounded-xl flex items-center justify-center">
                            <div className="text-center">
                                <GitMerge size={48} className="mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-500">Configure your automated workflows here.</p>
                            </div>
                        </div>
                    </div>
                )}
                {activeView === 'settings' && (
                    <div className="p-8 h-full flex flex-col">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-200">Settings</h2>
                        <div className="flex-1 bg-[#1e1e1e] border border-[#2d2d2d] rounded-xl flex items-center justify-center">
                             <div className="text-center">
                                <Settings size={48} className="mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-500">Settings configuration panel.</p>
                            </div>
                        </div>
                    </div>
                )}
             </div>
        </div>
    );
};

export default AgentManagerView;
