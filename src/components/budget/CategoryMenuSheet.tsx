"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, History, CalendarClock } from "lucide-react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { BudgetCategory } from "@/types/finance";
import { useState } from "react";

interface CategoryMenuSheetProps {
    isOpen: boolean;
    onClose: () => void;
    category: BudgetCategory | null;
    onViewHistory?: () => void;
}

export function CategoryMenuSheet({ isOpen, onClose, category, onViewHistory }: CategoryMenuSheetProps) {
    const { removeCategory } = useBudgetStore();
    const [isConfirming, setIsConfirming] = useState(false);

    if (!category || !isOpen) return null;

    const handleRemove = () => {
        removeCategory(category.id);
        setIsConfirming(false);
        onClose();
    };

    const toggleFixedObligation = () => {
        useBudgetStore.getState().updateCategory(category.id, {
            isFixedObligation: !category.isFixedObligation
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0, transition: { type: "spring", damping: 28, stiffness: 300 } }}
                        exit={{ y: "100%", transition: { type: "tween", duration: 0.2, ease: "easeIn" } }}
                        className="w-full max-w-md bg-[#111] sm:rounded-[32px] rounded-t-[32px] border border-white/10 p-6 relative z-10 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-medium">{category.name}</h3>
                            <button 
                                onClick={() => { setIsConfirming(false); onClose(); }}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {!isConfirming ? (
                            <div className="flex flex-col gap-2">
                                {onViewHistory && (
                                    <button 
                                        onClick={() => {
                                            onClose();
                                            onViewHistory();
                                        }}
                                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/5 font-medium text-white/80"
                                    >
                                        <History className="w-5 h-5 text-white/50" />
                                        View History
                                    </button>
                                )}
                                
                                <button 
                                    onClick={toggleFixedObligation}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/5 font-medium text-white/80"
                                >
                                    <div className="flex items-center gap-3">
                                        <CalendarClock className={`w-5 h-5 ${category.isFixedObligation ? 'text-[#30D158]' : 'text-white/50'}`} />
                                        <div className="flex flex-col items-start">
                                            <span>Fixed Recurring Bill</span>
                                            <span className="text-[10px] text-white/40 font-normal">Track by due date instead of budget ratio</span>
                                        </div>
                                    </div>
                                    <div 
                                        className={`w-11 h-6 shrink-0 rounded-full transition-colors duration-300 flex items-center p-0.5 shadow-inner ${category.isFixedObligation ? 'bg-[#30D158] justify-end' : 'bg-white/15 justify-start'}`}
                                    >
                                        <motion.div 
                                            layout
                                            className="w-5 h-5 shrink-0 bg-white rounded-full shadow-sm"
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    </div>
                                </button>

                                <button 
                                    onClick={() => setIsConfirming(true)}
                                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#FF453A]/10 text-[#FF453A] hover:bg-[#FF453A]/20 transition-colors border border-[#FF453A]/10 font-medium mt-2"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Remove Category
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <p className="text-white/70 text-sm">Are you sure you want to remove this category? It will be moved back to the preset list.</p>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setIsConfirming(false)}
                                        className="flex-1 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.05] text-white/70 text-sm font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleRemove}
                                        className="flex-1 py-3.5 rounded-xl bg-[#FF453A] hover:bg-[#FF453A]/90 text-white text-sm font-semibold transition-colors shadow-[0_0_15px_rgba(255,69,58,0.3)]"
                                    >
                                        Yes, Remove
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
