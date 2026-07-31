"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, ScanLine, Plus, MoreVertical, Share, Pin, Edit2, Download, Trash2, Settings, ChevronRight, ChevronDown } from 'lucide-react';
import { useAIChatStore } from '@/store/useAIChatStore';
import { useRouter } from 'next/navigation';
import { DuoAIIcon } from '@/components/ui/DuoAIIcon';

interface SidebarDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SidebarDrawer({ isOpen, onClose }: SidebarDrawerProps) {
    const { setActiveTab, startNewChat, loadChat, deleteChat, togglePinChat, renameChat, userName, chats, currentChatId } = useAIChatStore();
    const router = useRouter();
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [isPinnedExpanded, setIsPinnedExpanded] = useState(true);
    const [isRecentsExpanded, setIsRecentsExpanded] = useState(true);

    const toggleDropdown = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const handleRenameStart = (id: string, currentTitle: string) => {
        setEditingId(id);
        setEditTitle(currentTitle);
        setOpenDropdownId(null);
    };

    const handleRenameSave = (id: string) => {
        if (editTitle.trim()) {
            renameChat(id, editTitle.trim());
        }
        setEditingId(null);
    };

    const pinnedChats = chats.filter(c => c.isPinned);
    const recentChats = chats.filter(c => !c.isPinned);

    const renderChatRow = (chat: any) => {
        const isActive = chat.id === currentChatId;
        const isEditing = editingId === chat.id;

        return (
            <div 
                key={chat.id}
                onClick={() => {
                    if (!isEditing) {
                        loadChat(chat.id);
                        onClose();
                    }
                }}
                className={`relative group flex items-center w-full px-4 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                    isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
                }`}
            >
                <MessageSquare className={`w-4 h-4 shrink-0 mr-3 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`} />
                
                {isEditing ? (
                    <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSave(chat.id)}
                        onBlur={() => handleRenameSave(chat.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-black text-white text-[13px] font-semibold px-2 py-0.5 rounded outline-none border border-white/20 z-10"
                    />
                ) : (
                    <span className={`text-[13px] truncate flex-1 ${isActive ? 'font-semibold text-white' : 'font-medium text-white/70 group-hover:text-white/90'}`}>
                        {chat.title}
                    </span>
                )}

                <div className="flex items-center shrink-0">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePinChat(chat.id);
                        }}
                        className={`w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        title={chat.isPinned ? "Unpin" : "Pin"}
                    >
                        <Pin className="w-4 h-4 text-white/60" />
                    </button>
                    <button 
                        onClick={(e) => toggleDropdown(chat.id, e)}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 opacity-100"
                    >
                        <MoreVertical className="w-4 h-4 text-white/60" />
                    </button>
                </div>

                <AnimatePresence>
                    {openDropdownId === chat.id && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-10 w-48 bg-[#2C2C2E] border border-white/10 rounded-xl shadow-2xl py-1 z-[120] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="w-full px-3 py-2 text-left text-[13px] text-white hover:bg-white/[0.08] flex items-center gap-2">
                                <Share className="w-4 h-4 text-white/60" /> Share
                            </button>
                            <button 
                                onClick={() => {
                                    togglePinChat(chat.id);
                                    setOpenDropdownId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-[13px] text-white hover:bg-white/[0.08] flex items-center gap-2"
                            >
                                <Pin className="w-4 h-4 text-white/60" /> {chat.isPinned ? 'Unpin' : 'Pin'}
                            </button>
                            <button 
                                onClick={() => handleRenameStart(chat.id, chat.title)}
                                className="w-full px-3 py-2 text-left text-[13px] text-white hover:bg-white/[0.08] flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4 text-white/60" /> Rename
                            </button>
                            <div className="h-[1px] bg-white/5 my-1" />
                            <button 
                                onClick={() => {
                                    deleteChat(chat.id);
                                    setOpenDropdownId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4 text-red-400" /> Delete
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

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
                        className="fixed inset-0 bg-black/60 z-[100] md:hidden"
                    />

                    {/* Drawer */}
                    <motion.div 
                        initial={{ 
                            x: typeof window !== 'undefined' && window.innerWidth >= 768 ? 0 : '-100%', 
                            marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768 ? -280 : 0 
                        }}
                        animate={{ x: 0, marginLeft: 0 }}
                        exit={{ 
                            x: typeof window !== 'undefined' && window.innerWidth >= 768 ? 0 : '-100%', 
                            marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768 ? -280 : 0 
                        }}
                        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                        className="fixed md:relative top-0 left-0 h-[100dvh] w-[280px] bg-[#1C1C1E] z-[110] md:z-auto flex flex-col shadow-2xl md:shadow-none border-r border-white/5 shrink-0"
                    >
                        {/* Header */}
                        <div className="h-16 flex items-center px-4 border-b border-white/5 shrink-0">
                            <button 
                                onClick={onClose}
                                className="w-10 h-10 rounded-full hover:bg-white/[0.08] flex items-center justify-center transition-colors mr-1"
                            >
                                <X className="w-5 h-5 text-white/80" />
                            </button>
                            <DuoAIIcon className="w-5 h-5 text-white mr-2" forceState="star-idle" />
                            <span className="text-[15px] font-semibold text-white tracking-wide">DUO AI</span>
                        </div>

                        {/* Actions */}
                        <div className="p-4 flex flex-col gap-2 shrink-0">
                            <button 
                                onClick={() => {
                                    startNewChat();
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
                        <div className="flex-1 overflow-y-auto px-4 py-2" onClick={() => setOpenDropdownId(null)}>
                            {pinnedChats.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3 pl-2 mt-4">Pinned</h3>
                                    <div className="flex flex-col gap-1">
                                        {pinnedChats.map(renderChatRow)}
                                    </div>
                                </div>
                            )}

                            {recentChats.length > 0 && (
                                <div>
                                    <h3 
                                        onClick={() => setIsRecentsExpanded(!isRecentsExpanded)}
                                        className="flex items-center gap-1 text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3 pl-2 mt-4 cursor-pointer hover:text-white/60 transition-colors select-none w-fit"
                                    >
                                        Recent Chats {isRecentsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                    </h3>
                                    <AnimatePresence initial={false}>
                                        {isRecentsExpanded && (
                                            <motion.div 
                                                key="recents-list"
                                                initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                                animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                                                exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                                className="flex flex-col gap-1"
                                            >
                                                {recentChats.map(renderChatRow)}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer (User Account) */}
                        <div className="p-4 border-t border-white/5 shrink-0 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center">
                                    <span className="text-[12px] font-bold text-white">{userName.charAt(0)}</span>
                                </div>
                                <span className="text-[14px] font-medium text-white/90">{userName}</span>
                            </div>
                            <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                                <Settings className="w-4 h-4 text-white/60" />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
