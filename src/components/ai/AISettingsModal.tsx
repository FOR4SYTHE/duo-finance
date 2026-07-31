import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Download } from 'lucide-react';
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
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-[800px] h-[600px] max-h-[85vh] sm:max-h-[700px] bg-[#0A0A0A] rounded-[20px] shadow-2xl flex flex-col sm:flex-row overflow-hidden border border-white/[0.08]"
                    >
                        {/* Sidebar */}
                        <div className="w-full sm:w-[240px] shrink-0 bg-[#0A0A0A] border-b sm:border-b-0 sm:border-r border-white/[0.05] flex flex-col hidden sm:flex">
                            <div className="h-[68px] flex items-center px-6">
                                <h2 className="text-[17px] font-semibold text-white tracking-tight">Settings</h2>
                            </div>
                            
                            <div className="flex flex-col gap-[2px] px-3">
                                <button 
                                    onClick={() => setActiveTab('personalization')}
                                    className={`w-full flex items-center px-3 py-2 rounded-[8px] text-[15px] tracking-tight transition-colors ${activeTab === 'personalization' ? 'bg-[#1C1C1E] text-white font-medium' : 'text-[#8E8E93] hover:bg-[#1C1C1E]/50'}`}
                                >
                                    Personalization
                                </button>
                                <button 
                                    onClick={() => setActiveTab('data')}
                                    className={`w-full flex items-center px-3 py-2 rounded-[8px] text-[15px] tracking-tight transition-colors ${activeTab === 'data' ? 'bg-[#1C1C1E] text-white font-medium' : 'text-[#8E8E93] hover:bg-[#1C1C1E]/50'}`}
                                >
                                    Data controls
                                </button>
                            </div>
                        </div>

                        {/* Mobile Header */}
                        <div className="sm:hidden shrink-0 h-14 border-b border-white/[0.05] flex items-center justify-between px-4 bg-[#0A0A0A] relative z-10">
                             <h2 className="text-[17px] font-semibold text-white tracking-tight">Settings</h2>
                             <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1C1C1E] text-[#8E8E93] hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto bg-[#0A0A0A] relative no-scrollbar">
                            {/* Close button desktop */}
                            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 hidden sm:flex items-center justify-center rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-[#8E8E93] hover:text-white transition-colors z-20">
                                <X className="w-4 h-4" />
                            </button>

                            <div className="p-4 sm:p-8 sm:pt-[52px]">
                                {/* Mobile Tabs */}
                                <div className="flex sm:hidden gap-2 mb-6 border-b border-white/[0.05] pb-4">
                                    <button 
                                        onClick={() => setActiveTab('personalization')}
                                        className={`px-4 py-1.5 rounded-full text-[13px] tracking-tight transition-colors ${activeTab === 'personalization' ? 'bg-[#1C1C1E] text-white font-medium' : 'text-[#8E8E93] bg-white/5'}`}
                                    >
                                        Personalization
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('data')}
                                        className={`px-4 py-1.5 rounded-full text-[13px] tracking-tight transition-colors ${activeTab === 'data' ? 'bg-[#1C1C1E] text-white font-medium' : 'text-[#8E8E93] bg-white/5'}`}
                                    >
                                        Data controls
                                    </button>
                                </div>

                                {/* Desktop Title */}
                                <div className="px-4 mb-6 hidden sm:block">
                                    <h3 className="text-[32px] font-bold text-white tracking-tight">
                                        {activeTab === 'personalization' ? 'Personalization' : 'Data Controls'}
                                    </h3>
                                </div>

                                {activeTab === 'personalization' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-8">
                                        <div className="px-4 mb-2 mt-4 sm:mt-0">
                                            <span className="text-[13px] uppercase text-[#8E8E93] font-medium tracking-wider">AI Personality</span>
                                        </div>
                                        <div className="bg-[#1C1C1E] rounded-[10px] overflow-hidden">
                                            {personalities.map((p, index) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => updateAISettings({ personality: p.id as any })}
                                                    className={`w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-white/[0.04] ${
                                                        index !== personalities.length - 1 ? 'border-b border-white/[0.04]' : ''
                                                    }`}
                                                >
                                                    <div className="flex-1 pr-4">
                                                        <div className="text-[17px] text-white tracking-tight">{p.label}</div>
                                                        <div className="text-[15px] text-[#8E8E93] mt-[2px] leading-snug">{p.description}</div>
                                                    </div>
                                                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                                        {aiSettings.personality === p.id && <Check className="w-[18px] h-[18px] text-[#0A84FF]" strokeWidth={2.5} />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="px-4 mt-2 mb-8">
                                            <p className="text-[13px] text-[#8E8E93] leading-relaxed">Choose how DUO AI responds to you. This affects its tone, strictness, and expertise focus.</p>
                                        </div>

                                        {aiSettings.personality === 'custom' && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 mb-2">
                                                    <span className="text-[13px] uppercase text-[#8E8E93] font-medium tracking-wider">Custom Instructions</span>
                                                </div>
                                                <div className="bg-[#1C1C1E] rounded-[10px] overflow-hidden p-3">
                                                    <textarea
                                                        value={aiSettings.customInstructions}
                                                        onChange={(e) => updateAISettings({ customInstructions: e.target.value })}
                                                        placeholder="e.g., We are vegetarian, we shop at Dali, always prioritize saving money over convenience..."
                                                        className="w-full h-32 bg-transparent text-[17px] text-white placeholder:text-[#8E8E93] resize-none focus:outline-none"
                                                    />
                                                </div>
                                                <div className="px-4 mt-2">
                                                    <p className="text-[13px] text-[#8E8E93]">These instructions are appended to every message you send to DUO AI.</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'data' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-8">
                                        <div className="px-4 mb-2 mt-4 sm:mt-0">
                                            <span className="text-[13px] uppercase text-[#8E8E93] font-medium tracking-wider">Data Management</span>
                                        </div>
                                        <div className="bg-[#1C1C1E] rounded-[10px] overflow-hidden">
                                            <button className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-white/[0.04] border-b border-white/[0.04]">
                                                <div className="text-[17px] text-white tracking-tight">Export Chat History</div>
                                                <div className="flex items-center text-[#8E8E93]">
                                                    <Download className="w-5 h-5" />
                                                </div>
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm("Are you sure you want to permanently delete all your chats?")) {
                                                        clearAllHistory();
                                                        onClose();
                                                    }
                                                }}
                                                className="w-full flex items-center p-4 text-left transition-colors hover:bg-white/[0.04]"
                                            >
                                                <div className="text-[17px] text-[#FF453A] tracking-tight">Clear All History</div>
                                            </button>
                                        </div>
                                        <div className="px-4 mt-2">
                                            <p className="text-[13px] text-[#8E8E93] leading-relaxed">Exporting will download a ZIP file. Clearing history will permanently delete all your AI chats. This cannot be undone.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
