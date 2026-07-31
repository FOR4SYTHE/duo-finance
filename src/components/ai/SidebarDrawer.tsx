"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, ScanLine, Plus, MoreVertical, Share, Pin, Edit2, Download, Trash2, Settings, ChevronRight, ChevronDown, PanelLeftClose, PanelLeftOpen, SquarePen, Search, ScanBarcode, FileText } from 'lucide-react';
import { useAIChatStore } from '@/store/useAIChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { DuoAIIcon } from '@/components/ui/DuoAIIcon';
import { AISettingsModal } from './AISettingsModal';

interface SidebarDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
}

export function SidebarDrawer({ isOpen, onClose, onOpen }: SidebarDrawerProps) {
    const { setActiveTab, startNewChat, loadChat, deleteChat, togglePinChat, renameChat, userName, chats, currentChatId } = useAIChatStore();
    const { user } = useAuthStore();
    const router = useRouter();
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [isPinnedExpanded, setIsPinnedExpanded] = useState(true);
    const [isRecentsExpanded, setIsRecentsExpanded] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // Reset drawer state when it closes
    useEffect(() => {
        if (!isOpen) {
            setOpenDropdownId(null);
            setSearchTerm('');
            setIsSearchActive(false);
        }
    }, [isOpen]);

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

    const filteredChats = chats.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const pinnedChats = filteredChats.filter(c => c.isPinned);
    const recentChats = filteredChats.filter(c => !c.isPinned);

    const renderChatRow = (chat: any) => {
        const isActive = chat.id === currentChatId;
        const isEditing = editingId === chat.id;

        return (
            <div 
                key={chat.id}
                onClick={() => {
                    if (!isEditing) {
                        loadChat(chat.id);
                        if (typeof window !== 'undefined' && window.innerWidth < 768) onClose();
                    }
                }}
                className={`relative group flex items-center w-full h-11 md:h-9 rounded-lg transition-colors text-left cursor-pointer ${
                    isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
                }`}
                title={!isOpen ? chat.title : undefined}
            >
                {!isOpen && (
                    <div className="w-9 h-11 md:h-9 flex items-center justify-center shrink-0">
                        {chat.isPinned ? (
                            <Pin className={`w-[18px] h-[18px] md:w-[16px] md:h-[16px] ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`} />
                        ) : (
                            <MessageSquare className={`w-[18px] h-[18px] md:w-[16px] md:h-[16px] ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`} />
                        )}
                    </div>
                )}
                <div className={`flex items-center flex-1 min-w-0 ${isOpen ? 'pl-3' : 'pl-2'}`}>
                    {isEditing ? (
                        <input
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRenameSave(chat.id)}
                            onBlur={() => handleRenameSave(chat.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 min-w-0 bg-black text-white text-[15px] md:text-[13px] font-semibold px-2 py-0.5 rounded outline-none border border-white/20 z-10"
                        />
                    ) : (
                        <span className={`text-[15px] md:text-[13px] truncate flex-1 min-w-0 pr-2 ${isActive ? 'font-semibold text-white' : 'font-medium text-white/70 group-hover:text-white/90'}`}>
                            {chat.title}
                        </span>
                    )}

                    <div className="flex items-center shrink-0 pr-1 gap-[2px]">
                        {chat.isScan && (
                            <div 
                                className="w-6 h-8 md:w-5 md:h-6 flex items-center justify-center opacity-40 hover:opacity-80 transition-opacity cursor-default" 
                                title="Scanned Item Chat"
                            >
                                <ScanBarcode className="w-[15px] h-[15px] md:w-[13px] md:h-[13px] text-emerald-400/80" />
                            </div>
                        )}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                togglePinChat(chat.id);
                            }}
                            className={`w-8 h-8 md:w-6 md:h-6 rounded flex items-center justify-center hover:bg-white/10 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            title={chat.isPinned ? "Unpin" : "Pin"}
                        >
                            <Pin className="w-[16px] h-[16px] md:w-[14px] md:h-[14px] text-white/60" />
                        </button>
                        <button 
                            onClick={(e) => toggleDropdown(chat.id, e)}
                            className="w-8 h-8 md:w-6 md:h-6 rounded flex items-center justify-center hover:bg-white/10 opacity-100"
                        >
                            <MoreVertical className="w-[16px] h-[16px] md:w-[14px] md:h-[14px] text-white/60" />
                        </button>
                    </div>
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
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-[100] md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Drawer Container */}
            <div 
                className={`fixed md:relative top-0 left-0 h-[100dvh] bg-[#0A0A0A] z-[110] md:z-auto flex flex-col shadow-2xl md:shadow-none border-r border-white/5 shrink-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] print:hidden ${
                    isOpen 
                        ? 'w-[280px] md:w-[260px] translate-x-0' 
                        : 'w-[280px] md:w-[40px] -translate-x-full md:translate-x-0'
                }`}
            >
                {/* Inner Fixed-Width Content */}
                <div className="w-[280px] md:w-[260px] h-full flex flex-col">
                    
                    {/* Header */}
                    <div className="h-[52px] flex items-center px-[2px] shrink-0 group/header relative mt-1">
                        <button 
                            onClick={isOpen ? onClose : onOpen}
                            className="w-9 h-9 rounded-lg hover:bg-white/[0.08] flex items-center justify-center shrink-0 transition-colors relative"
                            title={isOpen ? "Close sidebar" : "Open sidebar"}
                        >
                            <div className={`absolute inset-0 flex items-center justify-center ${!isOpen ? 'group-hover/header:hidden' : ''}`}>
                                <DuoAIIcon className="w-[18px] h-[18px] text-white" forceState="star-idle" />
                            </div>
                            {!isOpen && (
                                <div className="absolute inset-0 flex items-center justify-center hidden group-hover/header:flex">
                                    <PanelLeftOpen className="w-[16px] h-[16px] text-white/70" />
                                </div>
                            )}
                        </button>
                        
                        <div className="w-[230px] md:w-[210px] flex items-center justify-between ml-[8px]">
                            <span className="text-[15px] md:text-[14px] font-semibold text-white tracking-wide truncate">DUO AI</span>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 md:w-7 md:h-7 rounded-full hover:bg-white/[0.08] flex items-center justify-center transition-colors mr-1"
                                title="Close sidebar"
                            >
                                <PanelLeftClose className="w-[18px] h-[18px] md:w-[16px] md:h-[16px] text-white/80" />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-[2px] pt-[2px] pb-0 flex flex-col gap-[2px] shrink-0">
                        <button 
                            onClick={() => {
                                startNewChat();
                                setActiveTab('chat');
                                if (typeof window !== 'undefined' && window.innerWidth < 768) onClose();
                            }}
                            className={`h-11 md:h-9 flex items-center rounded-lg hover:bg-white/[0.08] transition-all overflow-hidden text-left group/btn ${isOpen ? 'w-full' : 'w-9'}`}
                            title="New chat"
                        >
                            <div className="w-9 h-11 md:h-9 flex items-center justify-center shrink-0">
                                <SquarePen className="w-[20px] h-[20px] md:w-[16px] md:h-[16px] text-white/80 group-hover/btn:text-white transition-colors" />
                            </div>
                            <span className="text-[15px] md:text-[13px] font-medium pl-1 text-white whitespace-nowrap">New chat</span>
                        </button>
                        
                        <button 
                            onClick={() => {
                                setActiveTab('scanner');
                                if (typeof window !== 'undefined' && window.innerWidth < 768) onClose();
                            }}
                            className={`h-11 md:h-9 flex items-center rounded-lg hover:bg-white/[0.08] transition-all overflow-hidden text-left group/btn ${isOpen ? 'w-full' : 'w-9'}`}
                            title="Shopping Scanner"
                        >
                            <div className="w-9 h-11 md:h-9 flex items-center justify-center shrink-0">
                                <ScanLine className="w-[20px] h-[20px] md:w-[16px] md:h-[16px] text-white/80 group-hover/btn:text-white transition-colors" />
                            </div>
                            <span className="text-[15px] md:text-[13px] font-medium pl-1 text-white/90 whitespace-nowrap">Shopping Scanner</span>
                        </button>

                        {/* Plugins Header */}
                        {isOpen && (
                            <div className="mt-4 mb-1 pl-3 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                                Plugins
                            </div>
                        )}
                        
                        {/* Scratchpad Plugin */}
                        <button 
                            onClick={() => {
                                setActiveTab('scratchpad');
                                if (typeof window !== 'undefined' && window.innerWidth < 768) onClose();
                            }}
                            className={`h-11 md:h-9 flex items-center rounded-lg hover:bg-white/[0.08] transition-all overflow-hidden text-left group/btn ${isOpen ? 'w-full' : 'w-9 mt-4'}`}
                            title="Shared Scratchpad"
                        >
                            <div className="w-9 h-11 md:h-9 flex items-center justify-center shrink-0">
                                <FileText className="w-[18px] h-[18px] md:w-[15px] md:h-[15px] text-emerald-400/80 group-hover/btn:text-emerald-400 transition-colors" />
                            </div>
                            <span className="text-[15px] md:text-[13px] font-medium pl-1 text-white/90 whitespace-nowrap">Shared Scratchpad</span>
                        </button>

                        {/* Search Bar / Button */}
                        <div className="transition-all duration-300">
                            {(!isOpen || (!isSearchActive && !searchTerm)) ? (
                                <button 
                                    onClick={() => {
                                        if (!isOpen) onOpen();
                                        setIsSearchActive(true);
                                    }}
                                    className={`h-11 md:h-9 flex items-center rounded-lg hover:bg-white/[0.08] transition-all overflow-hidden text-left group/searchbtn ${isOpen ? 'w-full' : 'w-9'}`}
                                    title="Search chats"
                                >
                                    <div className="w-9 h-11 md:h-9 flex items-center justify-center shrink-0">
                                        <Search className="w-[20px] h-[20px] md:w-[16px] md:h-[16px] text-white/80 group-hover/searchbtn:text-white transition-colors" />
                                    </div>
                                    <span className="text-[15px] md:text-[13px] font-medium pl-1 text-white/90 whitespace-nowrap">Search Chats</span>
                                </button>
                            ) : (
                                <div className={`transition-all duration-300 ${isOpen ? 'opacity-100 h-11 md:h-9' : 'opacity-0 h-0 overflow-hidden'}`}>
                                    <div className="relative flex items-center w-full h-11 md:h-9 bg-white/[0.05] border border-white/10 rounded-md overflow-hidden focus-within:bg-white/[0.08] focus-within:border-white/20 transition-colors">
                                        <Search className="w-4 h-4 text-white/40 ml-[10px] shrink-0" />
                                        <input 
                                            autoFocus
                                            type="text" 
                                            placeholder="Search chats..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onBlur={() => {
                                                if (!searchTerm) setIsSearchActive(false);
                                            }}
                                            className="w-full h-full bg-transparent border-none outline-none text-[15px] md:text-[13px] text-white placeholder:text-white/40 px-2"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recents */}
                    <div className={`flex-1 overflow-y-auto px-[2px] pb-2 no-scrollbar ${isOpen ? 'pt-2' : 'pt-[2px]'}`} onClick={() => setOpenDropdownId(null)}>
                        {(!isOpen || pinnedChats.length > 0) && (
                            <div className={`${isOpen ? 'mb-4' : 'mb-[2px]'}`}>
                                {isOpen ? (
                                    <div className="h-8 md:h-6 flex items-center mb-1 mt-1 md:mt-0">
                                        <h3 className="text-[12px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest pl-[12px] whitespace-nowrap">Pinned</h3>
                                    </div>
                                ) : (
                                    <button onClick={onOpen} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.08] transition-colors group/btn" title="Pinned Chats">
                                        <Pin className="w-[16px] h-[16px] text-white/80 group-hover/btn:text-white transition-colors" />
                                    </button>
                                )}
                                <div className={`flex flex-col gap-[2px] ${!isOpen ? 'hidden' : ''}`}>
                                    {pinnedChats.map(renderChatRow)}
                                </div>
                            </div>
                        )}

                        {(!isOpen || recentChats.length > 0) && (
                            <div>
                                {isOpen ? (
                                    <div 
                                        onClick={() => setIsRecentsExpanded(!isRecentsExpanded)}
                                        className="h-8 md:h-6 flex items-center mb-1 mt-2 md:mt-1 cursor-pointer group/header"
                                    >
                                        <h3 className="flex items-center gap-1 text-[12px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest pl-[12px] hover:text-white/60 transition-colors select-none whitespace-nowrap">
                                            Recent Chats {isRecentsExpanded ? <ChevronDown className="w-[14px] h-[14px] md:w-3 md:h-3 shrink-0" /> : <ChevronRight className="w-[14px] h-[14px] md:w-3 md:h-3 shrink-0" />}
                                        </h3>
                                    </div>
                                ) : (
                                    <button onClick={onOpen} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.08] transition-colors group/btn" title="Recent Chats">
                                        <MessageSquare className="w-[16px] h-[16px] text-white/80 group-hover/btn:text-white transition-colors" />
                                    </button>
                                )}
                                <AnimatePresence initial={false}>
                                    {isOpen && isRecentsExpanded && (
                                        <motion.div 
                                            key="recents-list"
                                            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                            animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                                            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                            className="flex flex-col gap-[2px]"
                                        >
                                            {recentChats.map(renderChatRow)}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Footer (User Account & Settings) */}
                    <div className={`px-[2px] shrink-0 flex ${isOpen ? 'h-[52px] flex-row items-center mb-1' : 'flex-col items-start justify-end gap-2 pb-3 pt-2'} overflow-hidden transition-all duration-300`}>
                        {!isOpen && (
                            <button onClick={() => setIsSettingsModalOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0">
                                <Settings className="w-[18px] h-[18px]" />
                            </button>
                        )}
                        
                        <div className="w-9 h-9 flex items-center justify-center shrink-0">
                            <div className="w-[22px] h-[22px] rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name || userName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] font-bold text-white leading-none mt-[1px] pt-[1px] block">{(user?.name || userName).charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                        </div>

                        {isOpen && (
                            <div className="w-[230px] md:w-[210px] flex items-center justify-between ml-[8px]">
                                <span className="text-[15px] md:text-[13px] font-medium text-white/90 truncate">{user?.name || userName}</span>
                                <button onClick={() => setIsSettingsModalOpen(true)} className="w-8 h-8 md:w-7 md:h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0 mr-1">
                                    <Settings className="w-[18px] h-[18px] md:w-[16px] md:h-[16px]" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AISettingsModal 
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            />
        </>
    );
}
