"use client";

import { useEffect, useState } from 'react';
import { Menu, MoreVertical, Plus, ScanLine, Share, Pin, Edit2, Trash2, Download, ChevronDown } from 'lucide-react';
import { AIChatView } from '@/components/ai/AIChatView';
import { AIScannerView } from '@/components/ai/AIScannerView';
import { useAIChatStore } from '@/store/useAIChatStore';
import { PillTabRow } from '@/components/ui/PillTabRow';
import { SidebarDrawer } from '@/components/ai/SidebarDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AIAppPage() {
    const { activeTab, setActiveTab, clearChat, isScannerHasResults, isScannerExpanded } = useAIChatStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const tabs = [
        { 
            id: 'chat', 
            label: 'Chat', 
            activeClass: 'bg-white text-black border-white',
            hoverClass: 'hover:text-white'
        },
        { 
            id: 'scanner', 
            label: 'Scanner', 
            activeClass: 'bg-white text-black border-white',
            hoverClass: 'hover:text-white'
        }
    ];

    if (!mounted) return null;

    // The chat toggle is ONLY visible in Scanner mode, when the results sheet is NOT expanded
    const showScannerToggle = activeTab === 'scanner' && !isScannerExpanded;

    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col h-[100dvh] w-full overflow-hidden">
            
            <SidebarDrawer 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />

            {/* Header Strip - Gemini Style */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#050505] shrink-0 z-50">
                {/* Left Side: Hamburger & Title */}
                <div className="flex items-center gap-2">
                    {/* Hide Hamburger if we are showing the toggle switch instead */}
                    <AnimatePresence mode="popLayout">
                        {!showScannerToggle && (
                            <motion.button 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => setIsSidebarOpen(true)}
                                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                <Menu className="w-5 h-5 text-white/90" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                    
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/[0.05] group-hover:bg-white/[0.1] flex items-center justify-center transition-colors">
                            <ChevronDown className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col items-start">
                            <h1 className="text-[14px] font-semibold text-white leading-tight">DUO AI</h1>
                            <p className="text-[10px] text-white/50 leading-tight">Household Assistant</p>
                        </div>
                    </button>
                </div>
                
                {/* Right Side: Actions */}
                <div className="flex items-center gap-1 relative">
                    {/* New Chat / New Scan Button */}
                    <AnimatePresence mode="popLayout">
                        {!showScannerToggle && (
                            <motion.button 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => {
                                    if (activeTab === 'chat') {
                                        clearChat();
                                    }
                                }}
                                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-white"
                                title={activeTab === 'chat' ? "New Chat" : "New Scan"}
                            >
                                {activeTab === 'chat' ? <Plus className="w-5 h-5" /> : <ScanLine className="w-5 h-5" />}
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* 3-Dots Menu */}
                    <AnimatePresence mode="popLayout">
                        {!showScannerToggle && (
                            <div className="relative">
                                <motion.button 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5 text-white/90" />
                                </motion.button>
                                
                                {isMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                                        <div className="absolute right-0 top-12 w-56 bg-[#2C2C2E] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
                                            <button className="w-full px-4 py-2.5 text-left text-[14px] text-white hover:bg-white/[0.08] flex items-center gap-3">
                                                <Share className="w-4 h-4 text-white/60" /> Share conversation
                                            </button>
                                            <button className="w-full px-4 py-2.5 text-left text-[14px] text-white hover:bg-white/[0.08] flex items-center gap-3">
                                                <Pin className="w-4 h-4 text-white/60" /> Pin chat
                                            </button>
                                            <button className="w-full px-4 py-2.5 text-left text-[14px] text-white hover:bg-white/[0.08] flex items-center gap-3">
                                                <Edit2 className="w-4 h-4 text-white/60" /> Rename chat
                                            </button>
                                            <div className="h-[1px] bg-white/5 my-1" />
                                            <button className="w-full px-4 py-2.5 text-left text-[14px] text-white hover:bg-white/[0.08] flex items-center gap-3">
                                                <Download className="w-4 h-4 text-white/60" /> Download as PDF
                                            </button>
                                            <div className="h-[1px] bg-white/5 my-1" />
                                            <button className="w-full px-4 py-2.5 text-left text-[14px] text-red-400 hover:bg-red-500/10 flex items-center gap-3">
                                                <Trash2 className="w-4 h-4 text-red-400" /> Delete chat
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-hidden bg-[#050505]">
                {/* Floating Scanner Toggle - only visible in Scanner when NOT expanded */}
                <AnimatePresence>
                    {showScannerToggle && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-6 left-1/2 -translate-x-1/2 z-50 shadow-2xl rounded-full"
                        >
                            <PillTabRow 
                                tabs={tabs}
                                activeTab={activeTab}
                                onSelect={(id: string) => {
                                    if (id) setActiveTab(id as 'chat' | 'scanner');
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {activeTab === 'chat' ? <AIChatView /> : <AIScannerView />}
            </div>
        </div>
    );
}
