"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useCartifyStore } from "@/store/useCartifyStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { PriceEntryModal } from "./PriceEntryModal";
import { Activity, Plus, ShoppingCart, Trash2, ArrowUpDown, ReceiptText, Delete } from "lucide-react";
import { motion, useAnimation, PanInfo } from "framer-motion";

export function LiveTripTracker() {
    const { items, budget, mode, activeCategory, setActiveCategory, updateItemPrice, incrementQuantity, decrementQuantity, removeItem, addItem, showReceipt } = useCartifyStore();
    const { exchangeRate } = useCurrencyStore();
    
    const [sortAsc, setSortAsc] = useState(false);
    const [activeEditId, setActiveEditId] = useState<string | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [isSwitchingCategory, setIsSwitchingCategory] = useState(false);
    
    // Simple mode numpad state
    const [simpleDisplayValue, setSimpleDisplayValue] = useState("0");

    const totalSpent = items.reduce((acc, item) => acc + item.amount, 0);
    const remaining = budget - totalSpent;
    const progressPercent = Math.min((totalSpent / budget) * 100, 100);
    const isOverBudget = totalSpent > budget;

    // VAT Math
    const vatableSubtotal = items.filter(i => i.isVatable).reduce((acc, i) => acc + i.amount, 0);
    const vatAmount = vatableSubtotal * (12 / 112);

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

    const HeroCard = () => (
        <div className={`relative shrink-0 w-full rounded-[32px] p-6 mb-4 overflow-hidden border transition-colors duration-500 ${isOverBudget ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_60px_rgba(239,68,68,0.1)]' : 'bg-black/40 border-white/[0.05] shadow-[0_0_60px_rgba(255,255,255,0.02)]'}`}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white/80 font-medium tracking-wide">Live Trip</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={showReceipt} className="flex items-center gap-2 border border-white/10 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                        <ReceiptText className="w-3 h-3 text-white" />
                        <span className="text-xs font-semibold tracking-widest uppercase text-white">Done</span>
                    </button>
                    <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-full ${isOverBudget ? 'bg-red-500/10 border-red-500/20' : 'bg-[#30D158]/10 border-[#30D158]/20'}`}>
                        <Activity className={`w-3 h-3 ${isOverBudget ? 'text-red-500' : 'text-[#30D158]'}`} />
                        <span className={`text-xs font-semibold tracking-widest uppercase ${isOverBudget ? 'text-red-500' : 'text-[#30D158]'}`}>
                            {isOverBudget ? 'Over' : 'Live'}
                        </span>
                    </div>
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
                {vatAmount > 0 && (
                    <span className="text-white/30 text-xs font-medium tracking-wide mt-1">
                        Est. VAT included: ₱{vatAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} / R{(vatAmount * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                )}
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
    );

    if (mode === 'simple') {
        const simpleButtons = [
            { label: "1", type: "num" }, { label: "2", type: "num" }, { label: "3", type: "num" },
            { label: "4", type: "num" }, { label: "5", type: "num" }, { label: "6", type: "num" },
            { label: "7", type: "num" }, { label: "8", type: "num" }, { label: "9", type: "num" },
            { label: ".", type: "num" }, { label: "0", type: "num" }, { label: "⌫", type: "action" },
        ];

        const handleSimpleAdd = () => {
            const val = parseFloat(simpleDisplayValue);
            if (val > 0) {
                addItem(`Item ${items.length + 1}`, undefined, val, 1);
                setSimpleDisplayValue("0");
            }
        };

        const appendSimpleInput = (char: string) => {
            if (char === "." && simpleDisplayValue.includes(".")) return;
            setSimpleDisplayValue(prev => prev === "0" && char !== "." ? char : prev + char);
        };
        const deleteSimpleLast = () => {
            setSimpleDisplayValue(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
        };

        return (
            <div className="flex flex-col w-full h-full relative z-20 pt-2 pb-6 overflow-hidden">
                <HeroCard />
                
                {/* Scrollable List sitting behind/above the keypad dynamically */}
                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2 mb-4 shrink relative rounded-[24px]">
                    <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 py-2 border-b border-white/[0.05]">
                        <h2 className="text-white/50 text-xs font-semibold tracking-widest uppercase px-2">Recent Items</h2>
                    </div>
                    {sortedItems.slice(0, 10).map((item) => (
                        <div key={item.id} className="bg-[#111] border border-white/[0.05] rounded-[16px] p-3 flex justify-between items-center shrink-0">
                            <span className="text-white text-sm">{item.name}</span>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-white font-medium text-sm">₱{item.amount.toLocaleString()}</span>
                                    <span className="text-white/40 text-[10px] uppercase tracking-wider">
                                        ≈ R{(item.amount * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </span>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="text-red-500/50 hover:text-red-500 p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="text-white/20 text-xs text-center py-4">No items yet. Type an amount below.</div>
                    )}
                </div>

                {/* Persistent Keypad Area */}
                <div className="w-full flex flex-col shrink-0">
                    <div className="flex flex-col items-center justify-center gap-1 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl text-white/40">₱</span>
                            <span className="text-5xl text-white font-light tracking-tight">{simpleDisplayValue}</span>
                        </div>
                        <span className="text-white/40 text-sm font-medium tracking-wide">
                            ≈ R{(Number(simpleDisplayValue || 0) * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                    </div>

                    <div className="flex-1 min-h-[220px] grid grid-cols-3 gap-3 mb-4">
                        {simpleButtons.map((btn) => (
                            <button
                                key={btn.label}
                                onClick={() => btn.label === "⌫" ? deleteSimpleLast() : appendSimpleInput(btn.label)}
                                className={`
                                    h-full w-full rounded-[20px] flex items-center justify-center text-[24px] font-light transition-all duration-200 bg-white/[0.05] hover:bg-white/[0.1] active:scale-[0.96] border border-white/[0.02]
                                    ${btn.type === "num" ? "text-white" : "text-white/50"}
                                `}
                            >
                                {btn.label === "⌫" ? <Delete className="w-5 h-5" strokeWidth={1.5} /> : btn.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleSimpleAdd}
                        disabled={parseFloat(simpleDisplayValue) <= 0}
                        className="w-full h-[60px] shrink-0 rounded-full bg-[#30D158] text-black font-semibold text-base tracking-wide flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:bg-white/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add to Trip
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full relative z-20 overflow-y-auto no-scrollbar pb-24">
            
            <HeroCard />

            {mode === 'unplanned' && activeCategory && (
                <div className="flex items-center justify-between px-2 mb-4 shrink-0">
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
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsAddingNew(true)}
                            className="flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.05] active:scale-[0.98] px-3 py-1.5 rounded-full transition-all text-white text-[10px] font-bold uppercase tracking-wider"
                        >
                            <Plus className="w-3.5 h-3.5 text-[#30D158]" />
                            <span>Add Item</span>
                        </button>
                        <button 
                            onClick={() => setSortAsc(!sortAsc)}
                            className="flex items-center gap-1 bg-white/[0.05] hover:bg-white/[0.1] px-2.5 py-1.5 rounded-full transition-colors"
                        >
                            <span className="text-white/70 text-[10px] uppercase tracking-wider font-bold">Sort</span>
                            <ArrowUpDown className="w-3 h-3 text-white/70" />
                        </button>
                    </div>
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
                    <button 
                        onClick={() => setIsAddingNew(true)}
                        className="w-full border-2 border-dashed border-white/10 hover:border-white/20 rounded-[24px] p-6 flex flex-col items-center justify-center gap-2 bg-white/[0.01] hover:bg-white/[0.03] transition-all text-white/40 text-sm font-medium py-10"
                    >
                        <Plus className="w-6 h-6 text-[#30D158]" />
                        <span>Add First Item</span>
                    </button>
                )}
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
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
    const { toggleItemVatable } = useCartifyStore();
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
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-end px-6">
                <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.8, right: 0 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                className={`relative w-full border rounded-[24px] p-4 flex flex-col z-10 transition-colors ${
                    isStillNeed 
                        ? 'bg-[#111] border-white/[0.03] opacity-60' 
                        : 'bg-[#1a1a1a] border-white/[0.08]'
                }`}
            >
                <div className="flex items-center justify-between w-full">
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
                            {/* Manual VAT Toggle Trigger */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleItemVatable(item.id); }}
                                className={`self-start mt-1 px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${item.isVatable ? 'text-[#30D158] border-[#30D158]/20 bg-[#30D158]/10' : 'text-white/40 border-white/10 bg-white/5'}`}
                            >
                                {item.isVatable ? '12% VAT' : 'VAT Exempt'}
                            </button>
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
                        <button 
                            onClick={onDelete}
                            className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
