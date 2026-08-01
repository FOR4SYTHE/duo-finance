"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, History } from "lucide-react";
import { BudgetCategory } from "@/types/finance";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { computeCategoryStatus } from "@/utils/budgetPulse";
import { createPortal } from "react-dom";
import { format, parse } from "date-fns";

interface CategoryHistorySheetProps {
    isOpen: boolean;
    onClose: () => void;
    category: BudgetCategory | null;
}

export function CategoryHistorySheet({ isOpen, onClose, category }: CategoryHistorySheetProps) {
    const { primarySymbol, secondarySymbol, getPrimaryValue, getSecondaryValue } = useDualCurrency();

    if (!category || !isOpen) return null;

    const historyEntries = Object.entries(category.spendHistory || {}).sort((a, b) => b[0].localeCompare(a[0]));
    const hasHistory = historyEntries.length > 0;

    const content = (
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
                        className="w-full max-w-md bg-[#111] sm:rounded-[32px] rounded-t-[32px] border border-white/10 p-6 relative z-10 flex flex-col max-h-[85dvh]"
                    >
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <div>
                                <h3 className="text-white font-medium text-lg">{category.name}</h3>
                                <p className="text-white/40 text-xs tracking-wide">Spend History</p>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar pb-4 flex flex-col gap-3">
                            {!hasHistory ? (
                                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4 border border-white/[0.05]">
                                        <History className="w-6 h-6 text-white/20" />
                                    </div>
                                    <p className="text-white/70 font-medium tracking-wide">No history yet</p>
                                    <p className="text-white/30 text-xs mt-2 max-w-[200px]">
                                        Past months will appear here once snapshots are generated.
                                    </p>
                                </div>
                            ) : (
                                historyEntries.map(([monthKey, spent]) => {
                                    const target = category.targetHistory?.[monthKey] ?? category.targetAmount;
                                    const status = computeCategoryStatus(spent, target);
                                    
                                    const diff = spent - target;
                                    const isOver = diff > 0;
                                    const deltaText = isOver ? 'Over by' : 'Left';
                                    const deltaAbs = Math.abs(diff);

                                    let formattedMonth = monthKey;
                                    try {
                                        const date = parse(monthKey, 'yyyy-MM', new Date());
                                        formattedMonth = format(date, 'MMMM yyyy');
                                    } catch (e) {
                                        // Ignore parse errors, use raw key
                                    }

                                    return (
                                        <div key={monthKey} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 flex flex-col gap-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white/80 font-medium text-sm tracking-wide">{formattedMonth}</span>
                                                <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-sm border ${status.color} ${status.bg}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col">
                                                    <span className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">Spent</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-white font-medium">
                                                            {primarySymbol}{getPrimaryValue(spent).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                        </span>
                                                        <span className="text-white/30 text-[9px] font-medium tracking-wider">
                                                            ≈ {secondarySymbol}{getSecondaryValue(spent).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col items-end text-right">
                                                    <span className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">{deltaText}</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className={isOver ? 'text-[#FF453A] font-medium' : 'text-white/70 font-medium'}>
                                                            {primarySymbol}{getPrimaryValue(deltaAbs).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (typeof document !== 'undefined') {
        return createPortal(content, document.body);
    }
    return null;
}
