"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { AmountInputModal } from "./AmountInputModal";

interface CategoryDetailsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    categoryId: string | null;
}

export function CategoryDetailsSheet({ isOpen, onClose, categoryId }: CategoryDetailsSheetProps) {
    const { categories, updateSubCategory, addSubCategory } = useBudgetStore();
    const { primaryCurrency, exchangeRate } = useCurrencyStore();
    
    const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
    const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
    
    const [isAdding, setIsAdding] = useState(false);
    const [newItemName, setNewItemName] = useState('');

    const category = categories.find(c => c.id === categoryId);
    
    // Safety check, though the component shouldn't be opened if null
    if (!category || !isOpen) return null;
    
    const subCategories = category.subCategories || [];
    
    const isPhpPrimary = primaryCurrency === 'PHP';
    const targetCurrency = isPhpPrimary ? 'ZAR' : 'PHP';

    const handleConfirmAmount = (amountPHP: number) => {
        if (selectedSubId && categoryId) {
            updateSubCategory(categoryId, selectedSubId, amountPHP);
        }
        setIsAmountModalOpen(false);
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemName.trim() && categoryId) {
            addSubCategory(categoryId, newItemName.trim());
            setNewItemName('');
            setIsAdding(false);
        }
    };

    const selectedSubItem = subCategories.find(s => s.id === selectedSubId);

    return (
        <>
            <AnimatePresence>
                {isOpen && category && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full sm:max-w-md bg-[#111] sm:rounded-[32px] rounded-t-[32px] border border-white/10 p-6 relative z-10 max-h-[90dvh] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex flex-col">
                                    <h3 className="text-white font-medium text-lg">{category.name} Details</h3>
                                    <span className="text-white/50 text-xs">Total: ₱{category.targetAmount.toLocaleString()}</span>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 pb-6">
                                {subCategories.map((sub) => {
                                    const converted = isPhpPrimary ? sub.amount / exchangeRate : sub.amount * exchangeRate;
                                    return (
                                        <button
                                            key={sub.id}
                                            onClick={() => {
                                                setSelectedSubId(sub.id);
                                                setIsAmountModalOpen(true);
                                            }}
                                            className="flex justify-between items-center w-full p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors text-left"
                                        >
                                            <span className="text-white font-medium text-sm">{sub.name}</span>
                                            <div className="flex flex-col items-end">
                                                <span className="text-white font-semibold">
                                                    {isPhpPrimary ? '₱' : 'R'}{sub.amount.toLocaleString()}
                                                </span>
                                                <span className="text-white/40 text-xs">
                                                    ≈ {targetCurrency === 'PHP' ? '₱' : 'R'}{converted.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}

                                {isAdding ? (
                                    <form onSubmit={handleAddItem} className="flex gap-2 items-center p-2 rounded-2xl bg-white/[0.05] border border-white/10">
                                        <input
                                            type="text"
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            placeholder="Item name..."
                                            className="flex-1 bg-transparent border-none outline-none text-white text-sm px-2"
                                            autoFocus
                                        />
                                        <button type="submit" disabled={!newItemName.trim()} className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-full disabled:opacity-50">
                                            Add
                                        </button>
                                        <button type="button" onClick={() => { setIsAdding(false); setNewItemName(''); }} className="px-4 py-2 bg-white/10 text-white/70 text-xs font-semibold rounded-full">
                                            Cancel
                                        </button>
                                    </form>
                                ) : (
                                    <button 
                                        onClick={() => setIsAdding(true)}
                                        className="flex items-center gap-3 w-full p-4 rounded-2xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/40 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="text-sm font-medium tracking-wide">Add Custom Item</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            {/* Inner Amount Modal for the selected sub-item */}
            <AmountInputModal
                isOpen={isAmountModalOpen}
                onClose={() => setIsAmountModalOpen(false)}
                onConfirm={handleConfirmAmount}
                title={selectedSubItem?.name || ""}
                initialAmount={selectedSubItem?.amount || 0}
            />
        </>
    );
}
