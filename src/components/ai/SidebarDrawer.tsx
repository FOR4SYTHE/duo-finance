"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, ScanLine, Settings, Plus, ArrowLeft } from 'lucide-react';
import { useAIChatStore } from '@/store/useAIChatStore';
import { useRouter } from 'next/navigation';

interface SidebarDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SidebarDrawer({ isOpen, onClose }: SidebarDrawerProps) {
    const { setActiveTab, clearChat } = useAIChatStore();
    const router = useRouter();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 h-[100dvh] w-[280px] bg-[#1C1C1E] z-[110] flex flex-col shadow-2xl border-r border-white/5"
                    >
                        {/* Header */}
                        <div className="h-16 flex items-center px-4 border-b border-white/5 shrink-0">
                            <button 
                                onClick={onClose}
                                className="w-10 h-10 rounded-full hover:bg-white/[0.08] flex items-center justify-center transition-colors mr-2"
                            >
                                <X className="w-5 h-5 text-white/80" />
                            </button>
                            <span className="text-[15px] font-semibold text-white tracking-wide">DUO AI</span>
                        </div>

                        {/* Actions */}
                        <div className="p-4 flex flex-col gap-2 shrink-0">
                            <button 
                                onClick={() => {
                                    clearChat();
                                    setActiveTab('chat');
                                    onClose();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] transition-colors text-left"
                            >
                                <Plus className="w-5 h-5 text-white" />
                                <span className="text-[14px] font-medium text-white">New chat</span>
                            </button>
                            
                            <button 
                                onClick={() => {
                                    setActiveTab('scanner');
                                    onClose();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/[0.05] transition-colors text-left"
                            >
                                <ScanLine className="w-5 h-5 text-white/70" />
                                <span className="text-[14px] font-medium text-white/90">Shopping Scanner</span>
                            </button>
                        </div>

                        {/* Recents */}
                        <div className="flex-1 overflow-y-auto px-4 py-2">
                            <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3 pl-2 mt-4">Recent Chats</h3>
                            <div className="flex flex-col gap-1">
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors text-left group">
                                    <MessageSquare className="w-4 h-4 text-white/40 group-hover:text-white/70" />
                                    <span className="text-[13px] font-medium text-white/70 group-hover:text-white/90 truncate">PHP vs ZAR Trends</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors text-left group">
                                    <MessageSquare className="w-4 h-4 text-white/40 group-hover:text-white/70" />
                                    <span className="text-[13px] font-medium text-white/70 group-hover:text-white/90 truncate">Budget Check-in</span>
                                </button>
                            </div>
                        </div>

                        {/* Footer (Exit App) */}
                        <div className="p-4 border-t border-white/5 shrink-0">
                            <button 
                                onClick={() => router.back()}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-left group"
                            >
                                <ArrowLeft className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                                <span className="text-[14px] font-medium text-red-400 group-hover:text-red-300">Exit AI Corner</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
