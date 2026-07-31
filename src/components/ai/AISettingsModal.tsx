import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Database, Trash2, Download } from 'lucide-react';
import { useAIChatStore } from '@/store/useAIChatStore';

interface AISettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'personalization' | 'data'>('personalization');
    
    const { aiSettings, updateAISettings, clearAllHistory } = useAIChatStore();

    useEffect(() => {
        setMounted(true);
        
        // Lock body scroll when open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted) return null;

    const personalities = [
        { id: 'general', label: 'General Household Assistant', description: 'Your default all-around assistant for finance, budgeting, and household planning.' },
        { id: 'strict', label: 'Strict Financial Advisor', description: 'No-nonsense financial math, tight budget enforcement, and strict advice.' },
        { id: 'shopper', label: 'Shopping Expert', description: 'Focuses on deal hunting, price comparisons, and grocery list optimization.' },
        { id: 'custom', label: 'Custom Personality', description: 'Define your own rules and instructions for DUO AI.' },
    ];

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 font-hanken">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-[800px] h-[600px] max-h-[85vh] sm:max-h-[700px] bg-[#111111] rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row overflow-hidden border border-white/[0.08]"
                    >
                        {/* Sidebar */}
                        <div className="w-full sm:w-[240px] shrink-0 bg-[#0A0A0A] border-b sm:border-b-0 sm:border-r border-white/[0.05] p-4 flex flex-col sm:block hidden sm:flex">
                            <div className="flex items-center justify-between mb-6 px-2">
                                <h2 className="text-[15px] font-semibold text-white">Settings</h2>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                <button 
                                    onClick={() => setActiveTab('personalization')}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${activeTab === 'personalization' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white/90 hover:bg-white/5'}`}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Personalization
                                </button>
                                <button 
                                    onClick={() => setActiveTab('data')}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${activeTab === 'data' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white/90 hover:bg-white/5'}`}
                                >
                                    <Database className="w-4 h-4" />
                                    Data controls
                                </button>
                            </div>
                        </div>

                        {/* Mobile Header */}
                        <div className="sm:hidden shrink-0 h-14 border-b border-white/[0.05] flex items-center justify-between px-4 bg-[#111111] relative z-10">
                             <h2 className="text-[15px] font-semibold text-white">Settings</h2>
                             <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative no-scrollbar">
                            {/* Close button desktop */}
                            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 hidden sm:flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>

                            {/* Mobile Tabs */}
                            <div className="flex sm:hidden gap-2 mb-6 border-b border-white/10 pb-4">
                                <button 
                                    onClick={() => setActiveTab('personalization')}
                                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${activeTab === 'personalization' ? 'bg-white/10 text-white' : 'text-white/50 bg-white/5'}`}
                                >
                                    Personalization
                                </button>
                                <button 
                                    onClick={() => setActiveTab('data')}
                                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${activeTab === 'data' ? 'bg-white/10 text-white' : 'text-white/50 bg-white/5'}`}
                                >
                                    Data controls
                                </button>
                            </div>

                            {activeTab === 'personalization' && (
                                <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-8">
                                    <div className="space-y-1">
                                        <h3 className="text-[20px] font-semibold tracking-tight text-white/90">AI Personality</h3>
                                        <p className="text-[14px] text-white/50">Choose how DUO AI responds to you. This affects its tone, strictness, and expertise focus.</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {personalities.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => updateAISettings({ personality: p.id as any })}
                                                className={`flex items-start text-left p-4 rounded-xl border transition-all duration-300 ${
                                                    aiSettings.personality === p.id 
                                                        ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/20 shadow-[0_2px_10px_rgba(255,255,255,0.02)]' 
                                                        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10'
                                                }`}
                                            >
                                                <div className={`mt-0.5 w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-300 ${
                                                    aiSettings.personality === p.id ? 'border-emerald-400 bg-emerald-400/10' : 'border-white/20'
                                                }`}>
                                                    {aiSettings.personality === p.id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-[15px] font-medium text-white/90">{p.label}</div>
                                                    <div className="text-[13px] text-white/40 mt-1">{p.description}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {aiSettings.personality === 'custom' && (
                                        <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <h4 className="text-[14px] font-medium text-white/80 mb-2">Custom Instructions</h4>
                                            <textarea
                                                value={aiSettings.customInstructions}
                                                onChange={(e) => updateAISettings({ customInstructions: e.target.value })}
                                                placeholder="e.g., We are vegetarian, we shop at Dali, always prioritize saving money over convenience..."
                                                className="w-full h-32 bg-black/40 border border-white/[0.08] rounded-xl p-3 text-[14px] text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-white/20 focus:bg-black/60 transition-colors"
                                            />
                                            <p className="text-[12px] text-white/40 mt-2">These instructions are appended to every message you send to DUO AI.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'data' && (
                                <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-8">
                                    <div className="space-y-1">
                                        <h3 className="text-[20px] font-semibold tracking-tight text-white/90">Data Controls</h3>
                                        <p className="text-[14px] text-white/50">Manage your conversation history and exports.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] gap-4">
                                            <div>
                                                <div className="text-[15px] font-medium text-white/90">Export Chat History</div>
                                                <div className="text-[13px] text-white/40 mt-1">Download all your conversations as a ZIP file.</div>
                                            </div>
                                            <button className="h-9 px-4 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.05] transition-colors text-white/90 text-[13px] font-medium flex items-center justify-center gap-2 whitespace-nowrap">
                                                <Download className="w-4 h-4" />
                                                Export
                                            </button>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10 gap-4">
                                            <div>
                                                <div className="text-[15px] font-medium text-red-400">Clear All History</div>
                                                <div className="text-[13px] text-red-400/50 mt-1">Permanently delete all your AI chats. This cannot be undone.</div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm("Are you sure you want to permanently delete all your chats?")) {
                                                        clearAllHistory();
                                                        onClose();
                                                    }
                                                }}
                                                className="h-9 px-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 transition-colors text-red-400 hover:text-red-300 text-[13px] font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Clear
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
