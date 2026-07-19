"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useCartifyStore } from "@/store/useCartifyStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { PriceEntryModal } from "./PriceEntryModal";
import { Activity, Plus, ShoppingCart, Trash2, ArrowUpDown } from "lucide-react";
import { motion, useAnimation, PanInfo } from "framer-motion";

export function LiveTripTracker() {
    const { items, budget, mode, activeCategory, setActiveCategory, updateItemPrice, incrementQuantity, decrementQuantity, removeItem, addItem } = useCartifyStore();
    const { exchangeRate } = useCurrencyStore();
    
    const [sortAsc, setSortAsc] = useState(false);
    const [activeEditId, setActiveEditId] = useState<string | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [isSwitchingCategory, setIsSwitchingCategory] = useState(false);

    const totalSpent = items.reduce((acc, item) => acc + item.amount, 0);
    const remaining = budget - totalSpent;
    const progressPercent = Math.min((totalSpent / budget) * 100, 100);
    const isOverBudget = totalSpent > budget;

    // Haptic feedback trigger
    const prevOverBudget = useRef(isOverBudget);
    useEffect(() => {
        if (isOverBudget && !prevOverBudget.current) {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
        }
        prevOverBudget.current = isOverBudget;
    }, [isOverBudget]);

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            if (a.status === 'still-need' && b.status === 'in-cart') return 1;
            if (a.status === 'in-cart' && b.status === 'still-need') return -1;
            return sortAsc ? a.amount - b.amount : b.amount - a.amount;
        });
    }, [items, sortAsc]);

    const handleConfirmPrice = (price: number) => {
        if (activeEditId) {
            updateItemPrice(activeEditId, price);
            setActiveEditId(null);
        } else if (isAddingNew && newItemName) {
            addItem(newItemName, mode === 'unplanned' ? activeCategory || undefined : undefined, price, 1);
            setIsAddingNew(false);
            setNewItemName("");
        }
    };

    const categories = ["Groceries", "Clothes", "Furniture", "Electronics", "Pharmacy", "Hardware"];

    if (mode === 'unplanned' && (!activeCategory || isSwitchingCategory)) {
        return (
            <div className="flex flex-col w-full h-full relative z-20 pt-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-white text-xl font-medium tracking-tight">Pick a Category</h2>
                    {activeCategory && (
                        <button onClick={() => setIsSwitchingCategory(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <span className="text-white text-xs">✕</span>
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                setActiveCategory(cat);
                                setIsSwitchingCategory(false);
                            }}
                            className="p-6 rounded-[24px] bg-white/[0.03] border border-white/[0.05] flex flex-col items-center justify-center gap-3 hover:bg-white/[0.08] active:scale-95 transition-all"
                        >
                            <span className="text-white text-sm font-medium">{cat}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full relative z-20 overflow-y-auto no-scrollbar pb-24">
            
            {/* Active Trip Hero Card */}
            <div className={`relative w-full rounded-[32px] p-6 mb-4 overflow-hidden border transition-colors duration-500 ${isOverBudget ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_60px_rgba(239,68,68,0.1)]' : 'bg-black/40 border-white/[0.05] shadow-[0_0_60px_rgba(255,255,255,0.02)]'}`}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white/80 font-medium tracking-wide">Live Trip</span>
                    </div>
                    <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-full ${isOverBudget ? 'bg-red-500/10 border-red-500/20' : 'bg-[#30D158]/10 border-[#30D158]/20'}`}>
                        <Activity className={`w-3 h-3 ${isOverBudget ? 'text-red-500' : 'text-[#30D158]'}`} />
                        <span className={`text-xs font-semibold tracking-widest uppercase ${isOverBudget ? 'text-red-500' : 'text-[#30D158]'}`}>
                            {isOverBudget ? 'Over Budget' : 'Live'}
                        </span>
                    </div>
                </div>
                
                <div className="flex flex-col gap-1 mb-6">
                    <span className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-1">Remaining Budget</span>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-5xl font-light tracking-tight ${isOverBudget ? 'text-red-500' : 'text-white'}`}>
                            ₱{Math.abs(remaining).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                    </div>
                    <span className="text-white/60 font-medium tracking-wide">
                        ≈ R{(Math.abs(remaining) * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                </div>
                
                {/* Heat Map Progress */}
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-gradient-to-r from-[#30D158] to-[#E8A33D]'}`} 
                        style={{ width: `${progressPercent}%` }} 
                    />
                </div>
                <div className="flex justify-between items-center mt-3">
                    <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Spent: ₱{totalSpent.toLocaleString()}</span>
                    <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Total: ₱{budget.toLocaleString()}</span>
                </div>
            </div>

            {mode === 'unplanned' && activeCategory && (
                <div className="flex items-center justify-between px-2 mb-4">
                    <span className="text-white/40 text-xs uppercase tracking-widest font-semibold">Active Tag</span>
                    <button 
                        onClick={() => setIsSwitchingCategory(true)}
                        className="bg-[#30D158]/10 border border-[#30D158]/30 px-4 py-1.5 rounded-full flex items-center gap-2 hover:bg-[#30D158]/20 transition-colors"
                    >
                        <span className="text-[#30D158] text-xs font-bold">{activeCategory}</span>
                        <span className="w-4 h-4 rounded-full bg-[#30D158]/20 flex items-center justify-center text-[#30D158] text-[10px]">▼</span>
                    </button>
                </div>
            )}

            {/* Cart Items List */}
            <div className="flex flex-col gap-4 flex-1">
                <div className="flex justify-between items-center mb-2 px-1">
                    <h2 className="text-white/50 text-xs font-semibold tracking-widest uppercase">Scanned Items ({items.length})</h2>
                    <button 
                        onClick={() => setSortAsc(!sortAsc)}
                        className="flex items-center gap-1 bg-white/[0.05] hover:bg-white/[0.1] px-2 py-1 rounded-full transition-colors"
                    >
                        <span className="text-white/70 text-[10px] uppercase tracking-wider font-bold">Sort: Price</span>
                        <ArrowUpDown className="w-3 h-3 text-white/70" />
                    </button>
                </div>

                {sortedItems.map((item) => (
                    <SwipeableCartItem 
                        key={item.id} 
                        item={item} 
                        exchangeRate={exchangeRate}
                        onEdit={() => setActiveEditId(item.id)}
                        onIncrement={() => incrementQuantity(item.id)}
                        onDecrement={() => decrementQuantity(item.id)}
                        onDelete={() => removeItem(item.id)}
                    />
                ))}
                
                {items.length === 0 && (
                    <div className="text-center py-10 opacity-40">
                        <span className="text-sm">List is empty. Tap + to add items.</span>
                    </div>
                )}
            </div>

            {/* Add Item FAB */}
            <div className="sticky bottom-6 flex justify-end px-2 mt-auto pointer-events-none z-40">
                <button 
                    onClick={() => setIsAddingNew(true)}
                    className="w-[60px] h-[60px] rounded-full bg-white text-black shadow-[0_8px_30px_rgba(255,255,255,0.2)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all pointer-events-auto"
                >
                    <Plus className="w-8 h-8" strokeWidth={2} />
                </button>
            </div>

            {/* Modals */}
            <PriceEntryModal 
                isOpen={activeEditId !== null || (isAddingNew && newItemName !== "")} 
                onClose={() => {
                    setActiveEditId(null);
                    if (isAddingNew && newItemName !== "") {
                        setIsAddingNew(false);
                        setNewItemName("");
                    }
                }} 
                onConfirm={handleConfirmPrice}
                title={activeEditId ? "Set Price" : `Price for ${newItemName}`}
            />

            {/* Simple New Item Name Modal */}
            {isAddingNew && !newItemName && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-[#111] border border-white/10 rounded-[32px] p-6 w-full max-w-[360px]">
                        <h3 className="text-white font-medium mb-4">Add Item</h3>
                        <input 
                            autoFocus
                            type="text"
                            placeholder="Item name..."
                            className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-[16px] px-4 text-white outline-none focus:border-white/20 mb-4"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setNewItemName(e.currentTarget.value);
                                }
                            }}
                            onBlur={(e) => {
                                if (!e.target.value) setIsAddingNew(false);
                            }}
                        />
                        <p className="text-white/40 text-xs text-center">Press Enter to continue</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function SwipeableCartItem({ item, exchangeRate, onEdit, onIncrement, onDecrement, onDelete }: any) {
    const controls = useAnimation();
    const isStillNeed = item.status === 'still-need';

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const offset = info.offset.x;
        if (offset < -100) {
            controls.start({ x: -1000, opacity: 0 }).then(() => onDelete());
        } else {
            controls.start({ x: 0 });
        }
    };

    return (
        <div className="relative w-full rounded-[24px] overflow-hidden group">
            {/* Delete Background (Revealed on Swipe) */}
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-end px-6">
                <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.8, right: 0 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                className={`relative w-full border rounded-[24px] p-4 flex items-center justify-between z-10 transition-colors ${
                    isStillNeed 
                        ? 'bg-[#111] border-white/[0.03] opacity-60' 
                        : 'bg-[#1a1a1a] border-white/[0.08]'
                }`}
            >
                <div className="flex items-center gap-4 flex-1" onClick={isStillNeed ? onEdit : undefined}>
                    {!isStillNeed && (
                        <div className="flex flex-col items-center gap-1 bg-white/[0.05] p-1 rounded-full border border-white/[0.02]">
                            <button onClick={onIncrement} className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20">
                                <Plus className="w-3 h-3 text-white" />
                            </button>
                            <span className="text-white text-xs font-bold w-6 text-center">{item.quantity}</span>
                            <button onClick={onDecrement} className="w-6 h-6 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/20">
                                <span className="w-3 h-0.5 bg-white rounded-full" />
                            </button>
                        </div>
                    )}
                    
                    <div className="flex flex-col flex-1" onClick={!isStillNeed ? onEdit : undefined}>
                        <span className={`font-medium mb-0.5 ${isStillNeed ? 'text-white/60' : 'text-white'}`}>{item.name}</span>
                        <span className="text-white/40 text-xs tracking-wide">
                            {isStillNeed ? 'Tap to set price' : `₱${item.unitPrice.toLocaleString()} each`}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end" onClick={onEdit}>
                        <span className={`font-medium ${isStillNeed ? 'text-white/30' : 'text-white'}`}>
                            {isStillNeed ? '--' : `₱${item.amount.toLocaleString()}`}
                        </span>
                        {!isStillNeed && (
                            <span className="text-white/40 text-[10px] uppercase tracking-wider">
                                R{(item.amount * exchangeRate).toFixed(0)}
                            </span>
                        )}
                    </div>
                    {/* Fallback Delete Button */}
                    <button 
                        onClick={onDelete}
                        className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
