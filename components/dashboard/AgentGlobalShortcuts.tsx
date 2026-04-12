"use client";

import React, { useState, useEffect } from 'react';
import AgentManagerView from './AgentManagerView';
import AgentPanel from './AgentPanel';
import StatusBar from './StatusBar';

export default function AgentGlobalShortcuts() {
    const [managerOpen, setManagerOpen] = useState(false);
    const [panelOpen, setPanelOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl + E -> AgentManagerView
            if (e.ctrlKey && e.key.toLowerCase() === 'e') {
                e.preventDefault();
                setManagerOpen(prev => !prev);
            }
            // Ctrl + L -> AgentPanel
            if (e.ctrlKey && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                setPanelOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            {/* Status Bar fixed at bottom */}
            <div className="fixed bottom-0 w-full z-50">
               <StatusBar 
                   onOpenCustomizations={() => { setPanelOpen(true); setIsMinimized(false); }}
                   onOpenSettings={() => { setManagerOpen(true); }}
               />
            </div>

            {/* AgentManagerView Fullscreen Overlay */}
            {managerOpen && (
                <div className="fixed inset-0 z-40 bg-[#09090b] animate-fade-in flex flex-col pb-6">
                    <div className="flex justify-end p-2 bg-[#09090b]">
                         <button 
                            className="px-4 py-1 text-xs font-semibold text-white bg-red-600/80 hover:bg-red-600 rounded transition-colors" 
                            onClick={() => setManagerOpen(false)}
                        >
                            Close Manager (Ctrl+E)
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                         <AgentManagerView onOpenEditor={() => setManagerOpen(false)} />
                    </div>
                </div>
            )}

            {/* AgentPanel Side Overlay */}
            {panelOpen && (
                <div className={`fixed inset-y-0 right-0 z-40 shadow-2xl transition-all duration-300 pb-6 bg-[#1e1e1e] border-l border-gray-800 ${isMinimized ? 'w-12' : 'w-[450px]'}`}>
                    <AgentPanel 
                        onClose={() => setPanelOpen(false)}
                        onMinimize={() => setIsMinimized(!isMinimized)}
                        isMinimized={isMinimized}
                        theme="dark"
                    />
                </div>
            )}
        </>
    );
}
