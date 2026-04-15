"use client";

import React, { useState, useEffect } from 'react';
import { AgentManagerView } from './AgentManagerView';
import { AgentPanel } from './AgentPanel';
import StatusBar from './StatusBar';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AgentGlobalShortcuts() {
    const [managerOpen, setManagerOpen] = useState(false);
    const [panelOpen, setPanelOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeView, setActiveView] = useState('home');
    const pathname = usePathname();

    useEffect(() => {
        const supabase = createClient();
        
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setIsLoggedIn(!!session);
        });

        // Listen for active view changes
        const handleViewChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            setActiveView(customEvent.detail);
        };
        window.addEventListener('xeref_active_view_changed', handleViewChange);
        
        // Check local storage initial
        const savedView = localStorage.getItem('xeref_active_view');
        if (savedView) setActiveView(savedView);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('xeref_active_view_changed', handleViewChange);
        };
    }, []);

    useEffect(() => {
        if (!isLoggedIn || pathname === '/login') return;

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
    }, [isLoggedIn, pathname]);

    const showSettingsButton = isLoggedIn && activeView === 'settings';

    return (
        <>
            {/* Settings Button fixed at bottom right */}
            {showSettingsButton && (
                <div className="fixed bottom-4 right-4 z-50">
                   <StatusBar 
                       onOpenCustomizations={() => { setPanelOpen(true); setIsMinimized(false); }}
                       onOpenSettings={() => { setManagerOpen(true); }}
                   />
                </div>
            )}

            {/* AgentManagerView Fullscreen Overlay */}
            {managerOpen && (
                <div className="fixed inset-0 z-40 bg-[#09090b] animate-fade-in flex flex-col pb-6">
                    <button 
                        className="fixed top-4 right-4 z-50 px-4 py-1.5 text-xs font-semibold text-white bg-red-600/80 hover:bg-red-600 rounded transition-colors" 
                        onClick={() => setManagerOpen(false)}
                    >
                        Close Manager (Ctrl+E)
                    </button>
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
