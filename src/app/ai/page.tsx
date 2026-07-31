"use client";

import { useEffect, useState } from 'react';
import { Menu, MoreVertical, Plus, ScanLine, Share, Pin, Edit2, Trash2, Download, ChevronDown } from 'lucide-react';
import { AIChatView } from '@/components/ai/AIChatView';
import { AIScannerView } from '@/components/ai/AIScannerView';
import { useAIChatStore } from '@/store/useAIChatStore';
import { PillTabRow } from '@/components/ui/PillTabRow';
import { SidebarDrawer } from '@/components/ai/SidebarDrawer';
import { PDFExportTemplate } from '@/components/ai/PDFExportTemplate';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { DuoAIIcon } from '@/components/ui/DuoAIIcon';

export default function AIAppPage() {
    const { activeTab, setActiveTab, startNewChat, isScannerHasResults, isScannerExpanded, chats, currentChatId, deleteChat, togglePinChat, renameChat } = useAIChatStore();
    const currentChat = chats.find(c => c.id === currentChatId);
    const messages = currentChat?.messages || [];
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [renameInput, setRenameInput] = useState('');

    useEffect(() => {
        setMounted(true);
        setActiveTab('chat');
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

    const handleShare = async () => {
        setIsMenuOpen(false);
        if (!currentChat) return;
        const shareText = `DUO AI Chat: ${currentChat.title}\n\n` + 
            currentChat.messages.map(m => `${m.role === 'user' ? 'Me' : 'DUO AI'}: ${m.content}`).join('\n\n');
        
        if (navigator.share) {
            try { await navigator.share({ title: currentChat.title, text: shareText }); } 
            catch (e) { navigator.clipboard.writeText(shareText); }
        } else {
            navigator.clipboard.writeText(shareText);
        }
    };

    const handlePrint = () => {
        setIsMenuOpen(false);
        window.print();
    };

    if (!mounted) return null;

    // The chat toggle is ONLY visible in Scanner mode, when the results sheet is NOT expanded
    const showScannerToggle = activeTab === 'scanner' && !isScannerExpanded;

    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] flex h-[100dvh] w-full overflow-hidden print:static print:h-auto print:overflow-visible">
            
            <SidebarDrawer 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                onOpen={() => setIsSidebarOpen(true)}
            />

            {/* Main Column */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative print:h-auto print:overflow-visible">
                {/* Header Strip - Gemini Style */}
                <div className="flex items-center justify-between px-4 h-[60px] bg-[#050505] shrink-0 z-50 print:hidden">
                    {/* Left Side: Hamburger & Title */}
                    <div className="flex items-center gap-2">
                        {/* Hide Hamburger if we are showing the toggle switch instead */}
                        <AnimatePresence mode="popLayout">
                            {!showScannerToggle && !isSidebarOpen && (
                                <motion.button 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors md:hidden"
                                >
                                    <Menu className="w-5 h-5 text-white/90" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                        
                        <button 
                            onClick={() => router.back()}
                            className={`flex items-center group ${isSidebarOpen ? '' : 'gap-2'}`}
                        >
                            {!isSidebarOpen && (
                                <div className="flex flex-col items-start">
                                    <h1 className="text-[14px] font-semibold text-white leading-tight">DUO AI</h1>
                                    <p className="text-[10px] text-white/50 leading-tight">Household Assistant</p>
                                </div>
                            )}
                            <div className="w-8 h-8 rounded-full bg-white/[0.05] group-hover:bg-white/[0.1] flex items-center justify-center transition-colors shrink-0">
                                <ChevronDown className="w-5 h-5 text-white" />
                            </div>
                        </button>
                    </div>
                    
                    {/* Right Side: Actions */}
                    <div className="flex items-center gap-1 relative h-10">
                        <AnimatePresence mode="popLayout">
                            {!showScannerToggle && messages.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center gap-1 absolute right-0"
                                >
                                    {/* New Chat Button */}
                                    <button 
                                        onClick={startNewChat}
                                        className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors shrink-0 mr-2"
                                        title="New Chat"
                                    >
                                        {activeTab === 'chat' ? <Plus className="w-5 h-5" /> : <ScanLine className="w-5 h-5" />}
                                    </button>

                                    {/* 3-Dots Menu */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                                            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                                        >
                                            <MoreVertical className="w-5 h-5 text-white/90" />
                                        </button>
                                            
                                            {isMenuOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                                                    <div className="absolute right-0 top-12 w-56 bg-[#2C2C2E] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
                                                        <button 
                                                            onClick={handleShare}
                                                            className="w-full px-4 py-2.5 text-left text-[14px] text-white hover:bg-white/[0.08] flex items-center gap-3"
                                                        >
                                                            <Share className="w-4 h-4 text-white/60" /> Share conversation
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                if (currentChatId) togglePinChat(currentChatId);
                                                                setIsMenuOpen(false);
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-[14px] text-white hover:bg-white/[0.08] flex items-center gap-3"
                                                        >
                                                            <Pin className="w-4 h-4 text-white/60" /> {currentChat?.isPinned ? 'Unpin chat' : 'Pin chat'}
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                if (currentChat) {
                                                                    setRenameInput(currentChat.title);
                                                                    setShowRenameModal(true);
                                                                }
                                                                setIsMenuOpen(false);
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-[14px] text-white hover:bg-white/[0.08] flex items-center gap-3"
                                                        >
                                                            <Edit2 className="w-4 h-4 text-white/60" /> Rename chat
                                                        </button>
                                                        <div className="h-[1px] bg-white/5 my-1" />
                                                        <button 
                                                            onClick={handlePrint}
                                                            className="w-full px-4 py-2.5 text-left text-[14px] text-white hover:bg-white/[0.08] flex items-center gap-3"
                                                        >
                                                            <Download className="w-4 h-4 text-white/60" /> Download PDF
                                                        </button>
                                                        <button 
                                                            onClick={() => setIsMenuOpen(false)}
                                                            className="w-full px-4 py-2.5 text-left text-[14px] text-white hover:bg-white/[0.08] flex items-center gap-3"
                                                        >
                                                            <Download className="w-4 h-4 text-white/60" /> Export to Docs
                                                        </button>
                                                        <button 
                                                            onClick={() => setIsMenuOpen(false)}
                                                            className="w-full px-4 py-2.5 text-left text-[14px] text-white hover:bg-white/[0.08] flex items-center gap-3"
                                                        >
                                                            <Download className="w-4 h-4 text-white/60" /> Export to Sheets
                                                        </button>
                                                        <div className="h-[1px] bg-white/5 my-1" />
                                                        <button 
                                                            onClick={() => {
                                                                if (currentChatId) {
                                                                    deleteChat(currentChatId);
                                                                    startNewChat();
                                                                }
                                                                setIsMenuOpen(false);
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-[14px] text-red-400 hover:bg-red-500/10 flex items-center gap-3"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-400" /> Delete chat
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                    {/* Duo AI Logo */}
                                    <div className="w-10 h-10 flex items-center justify-center pointer-events-none">
                                        <DuoAIIcon className="w-[18px] h-[18px] text-white/50" forceState="star-idle" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative overflow-hidden bg-[#050505] print:h-auto print:overflow-visible">
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
            {/* Custom Rename Modal */}
            <AnimatePresence>
                {showRenameModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-sm bg-[#1C1C1E] rounded-[24px] border border-white/10 shadow-2xl p-6 flex flex-col gap-4"
                        >
                            <h3 className="text-[16px] font-semibold text-white">Rename Chat</h3>
                            <input 
                                type="text"
                                value={renameInput}
                                onChange={(e) => setRenameInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (currentChatId && renameInput.trim()) {
                                            renameChat(currentChatId, renameInput.trim());
                                        }
                                        setShowRenameModal(false);
                                    }
                                }}
                                autoFocus
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-[15px] focus:outline-none focus:border-white/30 transition-colors"
                            />
                            <div className="flex items-center gap-3 mt-2">
                                <button 
                                    onClick={() => setShowRenameModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        if (currentChatId && renameInput.trim()) {
                                            renameChat(currentChatId, renameInput.trim());
                                        }
                                        setShowRenameModal(false);
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden PDF Export Template */}
            <div className="hidden print:block absolute inset-0 z-[9999] bg-white">
                {currentChat && (
                    <PDFExportTemplate 
                        chatTitle={currentChat.title} 
                        messages={messages} 
                    />
                )}
            </div>
        </div>
    );
}
