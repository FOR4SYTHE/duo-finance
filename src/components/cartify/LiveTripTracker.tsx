"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useCartifyStore } from "@/store/useCartifyStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { PriceEntryModal } from "./PriceEntryModal";
import { Activity, Plus, ShoppingCart, Trash2, ArrowUpDown, ReceiptText, Delete, ShoppingBag, Shirt, Armchair, Laptop, Pill, Wrench, Milk, Egg, Croissant, Cookie, Drumstick, Fish, Carrot, Apple, CupSoda, Coffee, Beer, Wine, Pizza, Cake, Banana, Cherry, Grape, Package, Droplets, X } from "lucide-react";
import { motion, useAnimation, PanInfo, AnimatePresence } from "framer-motion";

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

    const categories = [
        { name: "Groceries", image: "/categories/groceries.png", color: "bg-[#8E9B90]" },
        { name: "Clothes", image: "/categories/clothes.png", color: "bg-[#899BB4]" },
        { name: "Furniture", image: "/categories/furniture.png", color: "bg-[#C49C73]" },
        { name: "Electronics", image: "/categories/electronics.png", color: "bg-[#9A8EA6]" },
        { name: "Pharmacy", image: "/categories/pharmacy.png", color: "bg-[#B38382]" },
        { name: "Hardware", image: "/categories/hardware.png", color: "bg-[#8A939A]" },
    ];

    if (mode === 'unplanned' && (!activeCategory || isSwitchingCategory)) {
        return (
            <div className="flex flex-col w-full h-full relative z-20 pt-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-white text-xl font-medium tracking-tight">Pick a Category</h2>
                    {activeCategory && (
                        <button onClick={() => setIsSwitchingCategory(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                            <span className="text-white text-xs">✕</span>
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {categories.map(cat => {
                        return (
                            <button
                                key={cat.name}
                                onClick={() => {
                                    setActiveCategory(cat.name);
                                    setIsSwitchingCategory(false);
                                }}
                                className="relative overflow-hidden p-5 rounded-[24px] bg-[#0A0A0A] border border-white/[0.05] flex flex-col items-start hover:bg-[#111] active:scale-[0.98] transition-all h-[120px] group"
                            >
                                <span className="text-white/90 font-medium text-[15px] relative z-10 tracking-wide drop-shadow-md">{cat.name}</span>
                                
                                {/* Glow Orb */}
                                <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full ${cat.color} opacity-20 blur-[24px] transition-opacity duration-500 group-hover:opacity-40 pointer-events-none`} />
                                
                                {/* 3D Image */}
                                <div className="absolute -right-4 -bottom-4 w-[110px] h-[110px] transition-transform duration-500 group-hover:scale-110 pointer-events-none mix-blend-screen opacity-90 group-hover:opacity-100">
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                                </div>
                            </button>
                        );
                    })}
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

    const [showCalc, setShowCalc] = useState(false);
    const [showList, setShowList] = useState(false);
    const [flyingValue, setFlyingValue] = useState<string | null>(null);

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
                // Trigger flying animation
                setFlyingValue(simpleDisplayValue);
                
                // Add the item to the store
                addItem(`Item ${items.length + 1}`, undefined, val, 1);
                setSimpleDisplayValue("0");
                setShowCalc(false);
                
                // Clear the flying value after animation completes
                setTimeout(() => {
                    setFlyingValue(null);
                }, 600);
            }
        };

        const appendSimpleInput = (char: string) => {
            if (char === "." && simpleDisplayValue.includes(".")) return;
            setSimpleDisplayValue(prev => prev === "0" && char !== "." ? char : prev + char);
        };
        const deleteSimpleLast = () => {
            setSimpleDisplayValue(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
        };

        // Progress ring calculations
        const radius = 90;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

        return (
            <div className="flex flex-col w-full h-full relative z-20 overflow-hidden">
                {/* Top Nav */}
                <div className="flex justify-between items-center px-2 pt-2 mb-8 relative z-30 shrink-0">
                    <button 
                        onClick={() => setShowList(true)}
                        className="flex items-center gap-2 bg-white/[0.04] backdrop-blur-md border border-white/[0.05] px-4 py-2.5 rounded-full hover:bg-white/[0.08] transition-colors"
                    >
                        <ShoppingCart className="w-4 h-4 text-white/70" />
                        <span className="text-white/70 font-medium text-sm tracking-wide">Cart</span>
                        {items.length > 0 && (
                            <span className="bg-[#30D158] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                {items.length}
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={showReceipt}
                        className="bg-[#E5E5E5] text-black font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-white transition-colors tracking-wide"
                    >
                        Done
                    </button>
                </div>

                {/* Remaining Budget Area */}
                <div className="flex flex-col items-center justify-center flex-1 mt-[-60px]">
                    <span className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Remaining Budget</span>
                    
                    <div className="flex items-start">
                        <span className="text-white/40 text-3xl font-light mt-3 mr-1">₱</span>
                        <motion.span 
                            layout
                            className={`text-[96px] leading-none tracking-tighter font-medium ${isOverBudget ? 'text-red-500' : 'text-white'}`}
                        >
                            {Math.abs(remaining).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                        </motion.span>
                    </div>
                    
                    <span className="text-white/40 text-sm font-medium tracking-wide mt-2">
                        ≈ R{(Math.abs(remaining) * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                </div>

                {/* Bottom Circular Progress Add Button */}
                <div className="mt-auto flex justify-center pb-12 shrink-0 relative z-30">
                    <button 
                        onClick={() => setShowCalc(true)}
                        className="relative w-[200px] h-[200px] flex flex-col items-center justify-center rounded-full group active:scale-[0.97] transition-transform duration-300"
                    >
                        {/* Background Circles */}
                        <div className="absolute inset-0 rounded-full bg-[#151516] border border-white/[0.04] shadow-[0_20px_40px_rgba(0,0,0,0.5)]" />
                        <div className="absolute inset-[12px] rounded-full bg-[#111]" />
                        <div className="absolute inset-[24px] rounded-full bg-[#1C1C1E] border border-white/[0.02] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center z-10">
                            {totalSpent === 0 ? (
                                <Plus className="w-10 h-10 text-white/30 group-hover:text-white/60 transition-colors" />
                            ) : (
                                <>
                                    <span className="text-white/40 text-[9px] font-bold tracking-[0.2em] uppercase mb-1">Spent</span>
                                    <span className="text-white text-3xl font-medium tracking-tight">₱{totalSpent.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                                </>
                            )}
                        </div>

                        {/* Progress SVG */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-20">
                            {/* Track */}
                            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                            {/* Progress */}
                            <circle 
                                cx="100" 
                                cy="100" 
                                r="90" 
                                fill="none" 
                                stroke={isOverBudget ? '#ef4444' : '#30D158'} 
                                strokeWidth="6" 
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                    </button>
                </div>

                {/* Flying Animation Layer */}
                <AnimatePresence>
                    {flyingValue && (
                        <motion.div
                            initial={{ top: "50%", left: "50%", x: "-50%", y: "-50%", scale: 1, opacity: 1 }}
                            animate={{ top: 40, left: 60, x: "-50%", y: "-50%", scale: 0.1, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.8 }}
                            className="fixed z-[200] pointer-events-none flex items-center justify-center"
                        >
                            <span className="text-white text-[80px] font-light tracking-tight drop-shadow-2xl">
                                ₱{flyingValue}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Overlays */}
                <AnimatePresence>
                    {showCalc && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setShowCalc(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md z-[100]" 
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className="absolute z-[101] flex flex-col bg-[#111] border border-white/10 inset-6 top-24 bottom-24 rounded-[40px] p-6 shadow-2xl justify-center"
                            >
                                <button onClick={() => setShowCalc(false)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <X className="w-4 h-4 text-white/70" />
                                </button>
                                
                                <div className="flex flex-col items-center justify-center gap-1 mb-8">
                                    <div className="flex items-center gap-2">
                                        <span className="text-4xl text-white/40">₱</span>
                                        <span className="text-[64px] text-white font-light tracking-tight">{simpleDisplayValue}</span>
                                    </div>
                                    <span className="text-white/40 text-sm font-medium tracking-wide">
                                        ≈ R{(Number(simpleDisplayValue || 0) * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 flex-1 max-h-[340px] max-w-[360px] mx-auto w-full">
                                    {simpleButtons.map((btn) => {
                                        let btnClasses = "";
                                        let textClasses = "";
                                        
                                        if (btn.type === "num") {
                                            btnClasses = "bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_20px_rgba(0,0,0,0.5)] hover:from-white/[0.12] hover:to-white/[0.06]";
                                            textClasses = "text-white font-light text-[30px]";
                                        } else if (btn.type === "action") {
                                            btnClasses = "bg-gradient-to-b from-black/40 to-black/60 border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_20px_rgba(0,0,0,0.5)] hover:from-black/30 hover:to-black/50";
                                            textClasses = "text-white/40 font-medium text-[24px] tracking-wide";
                                        }

                                        return (
                                            <button
                                                key={btn.label}
                                                onClick={() => btn.label === "⌫" ? deleteSimpleLast() : appendSimpleInput(btn.label)}
                                                className={`
                                                    relative flex items-center justify-center rounded-[24px] h-[72px] sm:h-[78px] transition-colors duration-300 overflow-hidden group active:scale-[0.92]
                                                    ${btnClasses}
                                                `}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                                <span className={`relative z-10 ${textClasses}`}>
                                                    {btn.label === "⌫" ? <Delete className="w-6 h-6" strokeWidth={1.5} /> : btn.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={handleSimpleAdd}
                                    disabled={parseFloat(simpleDisplayValue) <= 0}
                                    className="w-full h-[72px] shrink-0 rounded-full bg-[#E5E5E5] text-black font-semibold text-[17px] tracking-wide flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50"
                                >
                                    Add Amount
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showList && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setShowList(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md z-[100]" 
                            />
                            <motion.div
                                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className="absolute bottom-0 left-0 right-0 h-[80%] bg-[#111] rounded-t-[40px] pt-8 pb-10 px-6 border-t border-white/10 z-[101] flex flex-col shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
                            >
                                <div className="flex justify-between items-center mb-6 shrink-0">
                                    <h3 className="text-white text-xl font-medium tracking-tight">Recent Items</h3>
                                    <button onClick={() => setShowList(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                        <X className="w-4 h-4 text-white/70" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
                                    {sortedItems.map((item) => (
                                        <div key={item.id} className="bg-white/[0.02] border border-white/[0.05] rounded-[24px] p-4 flex justify-between items-center">
                                            <span className="text-white font-medium pl-2">{item.name}</span>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-white font-medium text-lg tracking-tight">₱{item.amount.toLocaleString()}</span>
                                                    <span className="text-white/40 text-[10px] uppercase tracking-wider">
                                                        ≈ R{(item.amount * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                    </span>
                                                </div>
                                                <button onClick={() => removeItem(item.id)} className="w-10 h-10 rounded-full bg-red-500/10 text-red-500/80 hover:text-red-500 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {items.length === 0 && (
                                        <div className="text-white/20 text-sm text-center py-10">No items logged yet.</div>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
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

const getItemArt = (name: string) => {
    const n = name.toLowerCase();
    
    if (n.match(/milk|dairy|cheese|bear brand|nido|alaska|birch tree|magnolia|eden|cheez whiz|kraft|yakult|dutch mill|chuckie/)) 
        return { icon: Milk, color: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400' };
    
    if (n.includes('egg')) 
        return { icon: Egg, color: 'from-yellow-500/20 to-yellow-500/5', text: 'text-yellow-400' };
    
    if (n.match(/bread|bakery|toast|pastry|gardenia|marby|julies|goldilocks|red ribbon/)) 
        return { icon: Croissant, color: 'from-orange-500/20 to-orange-500/5', text: 'text-orange-400' };
    
    if (n.match(/snack|chip|cookie|biscuit|lays|piattos|nova|roller coaster|oishi|jack n jill|doritos|cheetos|pringles|chippy|vcut|tortillos|boy bawang|chicharron|skyflakes|fita|rebisco|hansel|oreo|nissin/)) 
        return { icon: Cookie, color: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400' };
    
    if (n.match(/meat|chicken|beef|pork|purefoods|tender juicy|hotdog|sausage|cdo|pampanga's best|san miguel|spam|argentina/)) 
        return { icon: Drumstick, color: 'from-red-500/20 to-red-500/5', text: 'text-red-400' };
    
    if (n.match(/fish|seafood|tuna|sardines|century|555|mega|ligo|san marino/)) 
        return { icon: Fish, color: 'from-cyan-500/20 to-cyan-500/5', text: 'text-cyan-400' };
    
    if (n.match(/veg|carrot|salad|cabbage|onion|garlic|tomato|potato|mushroom/)) 
        return { icon: Carrot, color: 'from-green-500/20 to-green-500/5', text: 'text-green-400' };
    
    if (n.match(/fruit|apple|berry|mango|orange|lemon|calamansi/)) 
        return { icon: Apple, color: 'from-rose-500/20 to-rose-500/5', text: 'text-rose-400' };
    
    if (n.match(/soda|drink|juice|water|coke|coca|pepsi|sprite|royal|fanta|mountain dew|7up|rc cola|c2|gatorade|pocari|del monte|zest-o|minute maid|tang|eight o'clock|mineral|nature's spring|absolute|summit/)) 
        return { icon: CupSoda, color: 'from-sky-500/20 to-sky-500/5', text: 'text-sky-400' };
    
    if (n.match(/coffee|tea|nescafe|kopiko|great taste|san mig|lipton|twinings|starbucks/)) 
        return { icon: Coffee, color: 'from-amber-700/20 to-amber-700/5', text: 'text-amber-500' };
    
    if (n.match(/beer|alcohol|san miguel pale|red horse|smb|heineken|tiger|soju/)) 
        return { icon: Beer, color: 'from-yellow-400/20 to-yellow-400/5', text: 'text-yellow-400' };
        
    if (n.match(/wine|liquor|brandy|emperador|tanduay|fundador/)) 
        return { icon: Wine, color: 'from-fuchsia-500/20 to-fuchsia-500/5', text: 'text-fuchsia-400' };
    
    if (n.match(/oil|sauce|liquid|datu puti|silver swan|mang tomas|ufc|heinz|knorr|maggi|golden fiesta|baguio|nutriasia|mama sita|vinegar|soy sauce|ketchup|mayo/)) 
        return { icon: Droplets, color: 'from-amber-400/20 to-amber-400/5', text: 'text-amber-300' };
    
    if (n.match(/pizza|fast food|jollibee|mcdonalds|kfc|chowking|lucky me|payless|pancit canton|noodles/)) 
        return { icon: Pizza, color: 'from-orange-600/20 to-orange-600/5', text: 'text-orange-500' };
    
    if (n.match(/cake|dessert|ice cream|selecta|nestle|dirty ice cream/)) 
        return { icon: Cake, color: 'from-pink-500/20 to-pink-500/5', text: 'text-pink-400' };
        
    if (n.match(/candy|sweet|chocolate|milo|toblerone|cadbury|hershey|goya|maxx|snow mint|cloud 9|flat tops|curly tops|choco mucho|beng beng|stick-o|nutella/)) 
        return { icon: Cookie, color: 'from-purple-500/20 to-purple-500/5', text: 'text-purple-400' };
    
    if (n.includes('banana')) return { icon: Banana, color: 'from-yellow-300/20 to-yellow-300/5', text: 'text-yellow-300' };
    if (n.includes('cherry')) return { icon: Cherry, color: 'from-red-600/20 to-red-600/5', text: 'text-red-500' };
    if (n.includes('grape')) return { icon: Grape, color: 'from-purple-600/20 to-purple-600/5', text: 'text-purple-500' };

    if (n.match(/soap|shampoo|conditioner|safeguard|dove|palmolive|pantene|sunsilk|creamsilk|head & shoulders|rexona|kojiesan|detergent|surf|tide|ariel|pride|downy|champion|zonrox|joy|toothpaste|colgate|close up|tissue|wipes|diaper/))
        return { icon: Droplets, color: 'from-cyan-400/20 to-cyan-400/5', text: 'text-cyan-300' };

    return { icon: Package, color: 'from-gray-500/20 to-gray-500/5', text: 'text-gray-400' };
};

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
                            <div className="flex flex-col items-center gap-1 bg-white/[0.05] p-1 rounded-full border border-white/[0.02] shrink-0">
                                <button onClick={onIncrement} className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                                    <Plus className="w-3 h-3 text-white" />
                                </button>
                                <span className="text-white text-xs font-bold w-6 text-center">{item.quantity}</span>
                                <button onClick={onDecrement} className="w-6 h-6 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/20 transition-colors">
                                    <span className="w-3 h-0.5 bg-white rounded-full" />
                                </button>
                            </div>
                        )}
                        
                        {(() => {
                            const Art = getItemArt(item.name);
                            const Icon = Art.icon;
                            return (
                                <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border border-white/5 relative overflow-hidden bg-gradient-to-br ${Art.color} shadow-lg ml-1`}>
                                    <div className="absolute inset-0 opacity-20 bg-white/10 mix-blend-overlay" />
                                    <Icon className={`w-5 h-5 ${Art.text} drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]`} strokeWidth={1.5} />
                                </div>
                            );
                        })()}

                        <div className="flex flex-col flex-1 pl-1" onClick={!isStillNeed ? onEdit : undefined}>
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
