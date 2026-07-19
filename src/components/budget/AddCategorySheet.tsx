"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Pencil, Loader2 } from "lucide-react";
import * as Icons from "lucide-react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { BudgetCategory } from "@/types/finance";
import { AmountInputModal } from "./AmountInputModal";

interface AddCategorySheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const PRESETS = [
    { name: 'Transportation', icon: 'Car', color: '#0A84FF' },
    { name: 'Insurance', icon: 'Shield', color: '#30D158' },
    { name: 'Health & Medical', icon: 'HeartPulse', color: '#FF453A' },
    { name: 'Internet & Phone', icon: 'Wifi', color: '#BF5AF2' },
    { name: 'Entertainment', icon: 'Popcorn', color: '#E8A33D' },
    { name: 'Savings', icon: 'PiggyBank', color: '#30D158' },
];

export function AddCategorySheet({ isOpen, onClose }: AddCategorySheetProps) {
    const { categories, addCategory, config } = useBudgetStore();
    const [view, setView] = useState<'presets' | 'ai' | 'manual'>('presets');
    const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const [selectedDraft, setSelectedDraft] = useState<any | null>(null);

    const handleSuggestAI = async () => {
        setView('ai');
        setIsAiLoading(true);
        setAiSuggestions([]);
        try {
            const res = await fetch('/api/suggest-categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentCategories: categories })
            });
            if (!res.ok) throw new Error('API failed');
            const data = await res.json();
            if (data.suggestions) {
                setAiSuggestions(data.suggestions);
            } else {
                throw new Error('Invalid response');
            }
        } catch (error) {
            console.error(error);
            // Fallback gracefully
            alert("AI suggestion failed. Falling back to presets.");
            setView('presets');
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSelectDraft = (draft: any) => {
        setSelectedDraft(draft);
    };

    const handleSaveAmount = (amount: number) => {
        if (selectedDraft) {
            addCategory({
                name: selectedDraft.name,
                icon: selectedDraft.icon,
                color: selectedDraft.color || '#30D158',
                targetAmount: amount // We assume canonical monthly logic is handled here or caller side. 
                // Wait, if amount is typed, it's relative to the active period. 
                // In page.tsx, we converted to canonical monthly before saving. 
                // We should do that here as well if AmountInputModal returns the active period amount.
            });
            setSelectedDraft(null);
            onClose();
            // reset view for next time
            setTimeout(() => setView('presets'), 300);
        }
    };

    const renderList = (items: any[]) => (
        <div className="flex flex-col gap-2 mt-4">
            {items.map((item, idx) => {
                const Icon = (Icons as any)[item.icon] || Icons.HelpCircle;
                return (
                    <button 
                        key={idx}
                        onClick={() => handleSelectDraft(item)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.02] transition-colors text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${item.color}1A` }}>
                                <Icon className="w-5 h-5" style={{ color: item.color }} />
                            </div>
                            <span className="text-white font-medium">{item.name}</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );

    return (
        <>
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-full max-w-md bg-[#111] sm:rounded-[32px] rounded-t-[32px] border border-white/10 p-6 relative z-10 flex flex-col max-h-[90dvh]"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-medium">Add Category</h3>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {view === 'presets' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 overflow-y-auto no-scrollbar">
                                <button 
                                    onClick={handleSuggestAI}
                                    className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/20 text-white font-medium transition-all"
                                >
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    <span>✨ Suggest with AI</span>
                                </button>
                                
                                <div className="mt-2">
                                    <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">Common Categories</span>
                                    {renderList(PRESETS)}
                                </div>
                            </motion.div>
                        )}

                        {view === 'ai' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col flex-1">
                                {isAiLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                                        <span className="text-white/50 text-sm">Analyzing budget gaps...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <button 
                                            onClick={() => setView('presets')}
                                            className="text-white/50 text-sm self-start hover:text-white mb-2"
                                        >
                                            ← Back to presets
                                        </button>
                                        <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">AI Suggestions</span>
                                        {renderList(aiSuggestions)}
                                    </div>
                                )}
                            </motion.div>
                        )}

                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Manual Amount Entry for selected draft */}
        <AmountInputModal 
            isOpen={!!selectedDraft}
            onClose={() => setSelectedDraft(null)}
            onConfirm={handleSaveAmount}
            title={selectedDraft?.name || "Category"}
            initialAmount={0}
        />
        </>
    );
}
