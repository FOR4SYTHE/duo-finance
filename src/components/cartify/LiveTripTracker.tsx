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
    const [showCalc, setShowCalc] = useState(false);
    const [showList, setShowList] = useState(false);
    const [flyingValue, setFlyingValue] = useState<string | null>(null);

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

    const HeroCard = () => {
        let status = 'safe';
        if (progressPercent >= 90) status = 'danger';
        else if (progressPercent >= 50) status = 'warning';

        // Safe: Blue pathway -> Green Orb
        // Warning: Yellow pathway -> Orange Orb
        // Danger: Red pathway -> Red Orb
        const getOrbColor = () => {
            if (status === 'danger') return 'rgba(255, 30, 30, 1)'; 
            if (status === 'warning') return 'rgba(255, 140, 0, 1)'; 
            return 'rgba(20, 230, 90, 1)'; 
        };

        const getPathwayColor = () => {
            if (status === 'danger') return 'rgba(230, 20, 20, 1)';
            if (status === 'warning') return 'rgba(230, 120, 0, 1)';
            return 'rgba(20, 80, 255, 1)'; 
        };

        return (
            <div className="sticky top-2 z-40 shrink-0 w-full mb-6 flex flex-col">
                <motion.div 
                    layout
                    className="w-full rounded-[48px] overflow-hidden bg-black flex flex-col border border-white/[0.03] pt-3 pb-5"
                    style={{
                        boxShadow: "0 30px 60px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05)"
                    }}
                >
                    {/* Top Section: Card, Beam, Orb, Values */}
                    <div className="relative w-full h-[96px] flex items-center justify-between overflow-hidden">
                    
                    {/* The Premium Volumetric Q-Tip Beam */}
                    <div className="absolute left-[70px] right-[70px] top-0 bottom-0 pointer-events-none z-10 flex items-center justify-center">
                        
                        {/* Central Beam (Solid, crisp core, stays solid longer to support text, then fades out) */}
                        <div className="absolute left-[-20px] right-[0px] h-[36px] blur-[3px] opacity-100"
                             style={{ background: `linear-gradient(to right, ${getPathwayColor()} 75%, transparent 100%)` }} />
                             
                        {/* Central Beam (Soft backing) */}
                        <div className="absolute left-[-20px] right-[0px] h-[46px] blur-[6px] opacity-80"
                             style={{ background: `linear-gradient(to right, ${getPathwayColor()} 75%, transparent 100%)` }} />

                        {/* Left Fishtail Flare (Mirrors the right side, subtle blue arms wrapping the beam from behind the card) */}
                        <div className="absolute left-[0px] w-[110px] h-[56px] blur-[10px] opacity-60 flex items-center justify-center">
                            <div className="w-full h-full"
                                 style={{ 
                                     background: `linear-gradient(to right, ${getPathwayColor()} 0%, transparent 110%)`,
                                     clipPath: 'polygon(0 0, 100% 15%, 45% 50%, 100% 85%, 0 100%)'
                                 }} />
                        </div>
                             
                        {/* Right Fishtail Flare (Wraps the top and bottom of the blue beam like two gentle arms, perfectly matching the sketch) */}
                        <div className="absolute right-[0px] w-[110px] h-[56px] blur-[10px] opacity-60 flex items-center justify-center">
                            <div className="w-full h-full"
                                 style={{ 
                                     background: `linear-gradient(to right, transparent -10%, ${getOrbColor()} 100%)`,
                                     clipPath: 'polygon(100% 0, 0 15%, 55% 50%, 0 85%, 100% 100%)'
                                 }} />
                        </div>
                    </div>

                    {/* Left: 3D Virtual Card (Seamlessly emerging from darkness) */}
                    <div className="relative z-20 w-[80px] h-full flex items-center shrink-0">
                        {/* The actual card (Gradient from black ensures it dissolves on the left) */}
                        <div className="relative w-[100px] h-[76px] rounded-r-[16px] bg-gradient-to-r from-black via-[#0a0a0a] to-[#181818] border-y border-r border-white/10 shadow-[12px_0_24px_rgba(0,0,0,0.9)] flex flex-col justify-end p-3 -ml-[20px] overflow-hidden">
                            <div className="self-end text-white/90 font-black italic text-[14px] tracking-tighter pr-0.5">DF</div>
                            {/* Card Right Edge Highlight */}
                            <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-white/50 to-transparent mix-blend-screen" />
                        </div>
                        {/* Extra dark portal fade just to guarantee blending */}
                        <div className="absolute inset-y-0 left-0 w-[35px] bg-gradient-to-r from-black to-transparent pointer-events-none z-30" />
                    </div>

                    {/* Center: Text Content (Crisp, perfectly aligned with the beam core) */}
                    <div className="relative z-30 flex flex-col items-center justify-center flex-1 h-full px-2">
                        <span className="text-white/70 text-[11px] font-light tracking-wide mb-[1px]">
                            Remaining Budget
                        </span>
                        <motion.span 
                            key={remaining}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="text-white text-[32px] leading-none font-medium tracking-tight"
                        >
                            ₱{Math.abs(remaining).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                        </motion.span>
                        <div className="flex items-center justify-center gap-2 mt-1 text-white/50 text-[10px] font-light tracking-wide">
                            <span>≈ R{(Math.abs(remaining) * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            {vatAmount > 0 && (
                                <>
                                    <span className="w-[1px] h-2.5 bg-white/20" />
                                    <span>Est. VAT ₱{vatAmount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Glowing Orb (Ultra-premium volumetric bloom effect) */}
                    <div className="relative z-20 w-[80px] h-full flex items-center justify-center shrink-0 -translate-x-[12px]">
                        {/* Controlled diffuse aura (Tightened to wrap closely around the atom) */}
                        <div 
                            className="absolute w-[56px] h-[44px] rounded-[100px] blur-[8px] opacity-80"
                            style={{ backgroundColor: getOrbColor() }}
                        />
                        {/* Subtle atmospheric spill (Contained so it drops to black exactly at the spikey red lines) */}
                        <div 
                            className="absolute w-[76px] h-[54px] rounded-[100px] blur-[12px] opacity-40 -translate-x-[4px]"
                            style={{ backgroundColor: getOrbColor() }}
                        />
                        
                        {/* Orb Core (A soft hazy energy cloud) */}
                        <motion.div 
                            key={`orb-${status}-${items.length}`}
                            initial={{ scale: 1.5 }}
                            animate={{ scale: 1 }}
                            className="w-[32px] h-[32px] rounded-full relative z-20 blur-[12px] opacity-90 mix-blend-screen"
                            style={{ backgroundColor: getOrbColor() }}
                        />
                        
                        {/* Soft Glowing Atom Rings (Pure volumetric mist, flat X shape) */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 m-auto flex items-center justify-center pointer-events-none"
                        >
                            {/* Loop 1 (Flatter angle: 25deg, restored high opacity core to punch through) */}
                            <div className="absolute w-[56px] h-[16px] rounded-[50%] border-[5px] opacity-90 mix-blend-screen blur-[2.5px]" style={{ borderColor: getOrbColor(), transform: 'rotate(25deg)' }} />
                            <div className="absolute w-[56px] h-[16px] rounded-[50%] border-[5px] opacity-60 mix-blend-screen blur-[6px]" style={{ borderColor: getOrbColor(), transform: 'rotate(25deg)' }} />
                            <div className="absolute w-[56px] h-[16px] rounded-[50%] border-[5px] opacity-30 mix-blend-screen blur-[12px]" style={{ borderColor: getOrbColor(), transform: 'rotate(25deg)' }} />
                            
                            {/* Loop 2 (Flatter angle: 155deg, restored high opacity core to punch through) */}
                            <div className="absolute w-[56px] h-[16px] rounded-[50%] border-[5px] opacity-90 mix-blend-screen blur-[2.5px]" style={{ borderColor: getOrbColor(), transform: 'rotate(155deg)' }} />
                            <div className="absolute w-[56px] h-[16px] rounded-[50%] border-[5px] opacity-60 mix-blend-screen blur-[6px]" style={{ borderColor: getOrbColor(), transform: 'rotate(155deg)' }} />
                            <div className="absolute w-[56px] h-[16px] rounded-[50%] border-[5px] opacity-30 mix-blend-screen blur-[12px]" style={{ borderColor: getOrbColor(), transform: 'rotate(155deg)' }} />
                        </motion.div>
                    </div>
                </div>

                    {/* Bottom Section: Supplementary Text (Centered directly under the beam text, exact font match) */}
                    <div className="w-full pt-1 flex justify-center items-center gap-10 relative z-20 bg-black">
                        <span className="text-[#888] text-[13px] font-light tracking-[0.03em] flex items-center gap-2">
                            SPENT <span className="text-[#aaa] tracking-normal">₱{totalSpent.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                        </span>
                        <span className="text-[#888] text-[13px] font-light tracking-[0.03em] flex items-center gap-2">
                            TOTAL <span className="text-[#aaa] tracking-normal">₱{budget.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                        </span>
                    </div>
                </motion.div>
            </div>
        );
    };

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
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 shrink-0 snap-x">
                    {categories.map(cat => (
                        <button
                            key={cat.name}
                            onClick={() => setActiveCategory(cat.name)}
                            className={`snap-start shrink-0 px-4 py-2 rounded-full border transition-all duration-300 flex items-center gap-2 ${
                                activeCategory === cat.name 
                                    ? 'bg-[#30D158]/10 border-[#30D158]/30 shadow-[0_4px_16px_rgba(48,209,88,0.1)]' 
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                            }`}
                        >
                            <img src={cat.image} alt={cat.name} className="w-5 h-5 object-contain" />
                            <span className={`text-[11px] font-bold tracking-wide ${activeCategory === cat.name ? 'text-[#30D158]' : 'text-white/60'}`}>
                                {cat.name}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Cart Items List */}
            <div className="flex flex-col flex-1 pb-32">
                <div className="flex justify-between items-center mb-4 px-2">
                    <h2 className="text-white/50 text-xs font-semibold tracking-widest uppercase">Scanned Items ({items.length})</h2>
                    <button 
                        onClick={() => setSortAsc(!sortAsc)}
                        className="flex items-center gap-1 bg-white/[0.05] hover:bg-white/[0.1] px-2.5 py-1.5 rounded-full transition-colors"
                    >
                        <span className="text-white/70 text-[10px] uppercase tracking-wider font-bold">Sort</span>
                        <ArrowUpDown className="w-3 h-3 text-white/70" />
                    </button>
                </div>

                <AnimatePresence mode="popLayout">
                    {sortedItems.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30, delay: i * 0.05 }}
                        >
                            <SwipeableCartItem 
                                item={item} 
                                exchangeRate={exchangeRate}
                                onEdit={() => setActiveEditId(item.id)}
                                onIncrement={() => incrementQuantity(item.id)}
                                onDecrement={() => decrementQuantity(item.id)}
                                onDelete={() => removeItem(item.id)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {items.length === 0 && (
                    <motion.button 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setIsAddingNew(true)}
                        className="w-full border border-dashed border-white/10 hover:border-white/20 rounded-[32px] p-6 flex flex-col items-center justify-center gap-3 bg-white/[0.01] hover:bg-white/[0.03] transition-all text-white/40 text-sm font-medium py-12"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#30D158]/10 flex items-center justify-center border border-[#30D158]/20">
                            <Plus className="w-6 h-6 text-[#30D158]" />
                        </div>
                        <span>Scan your first item</span>
                    </motion.button>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-24 left-0 right-0 flex justify-center z-50 pointer-events-none px-6">
                <button 
                    onClick={() => setIsAddingNew(true)}
                    className="pointer-events-auto bg-gradient-to-r from-[#30D158] to-[#25A645] text-black border border-white/20 shadow-[0_8px_32px_rgba(48,209,88,0.4)] px-6 py-3.5 rounded-full flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all w-full max-w-[200px]"
                >
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                    <span className="font-bold tracking-wide text-[15px]">Add Item</span>
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
        <div className="relative w-full rounded-[32px] overflow-hidden group mb-4 shadow-[0_16px_32px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-8">
                <Trash2 className="w-7 h-7 text-white" />
            </div>
            
            <motion.div
                layout
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.8, right: 0 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                className={`relative w-full rounded-[32px] p-3 flex z-10 transition-colors backdrop-blur-3xl border ${
                    isStillNeed 
                        ? 'bg-black/80 border-white/[0.03] opacity-60' 
                        : 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                }`}
            >
                {/* Unified Quantity Adjuster */}
                {!isStillNeed && (
                    <div className="flex flex-col items-center justify-between w-10 bg-black/40 rounded-[20px] py-2 shrink-0 border border-white/5 mr-3">
                        <button onClick={onIncrement} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full active:scale-90 transition-all text-white/70">
                            <Plus className="w-4 h-4" />
                        </button>
                        <span className="text-white text-xs font-bold my-1">{item.quantity}</span>
                        <button onClick={onDecrement} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full active:scale-90 transition-all text-white/70">
                            <span className="w-3 h-0.5 bg-current rounded-full" />
                        </button>
                    </div>
                )}
                
                <div className="flex items-center justify-between w-full py-1 pr-2">
                    <div className="flex items-center gap-4 flex-1" onClick={isStillNeed ? onEdit : undefined}>
                        {(() => {
                            const Art = getItemArt(item.name);
                            const Icon = Art.icon;
                            return (
                                <div className={`w-14 h-14 shrink-0 rounded-[22px] flex items-center justify-center border border-white/10 relative overflow-hidden bg-gradient-to-br ${Art.color} shadow-lg ml-1`}>
                                    <div className="absolute inset-0 opacity-20 bg-white/20 mix-blend-overlay" />
                                    <Icon className={`w-6 h-6 ${Art.text} drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]`} strokeWidth={1.5} />
                                </div>
                            );
                        })()}

                        <div className="flex flex-col flex-1 pl-1" onClick={!isStillNeed ? onEdit : undefined}>
                            <span className={`font-semibold text-[16px] leading-tight tracking-tight mb-1 ${isStillNeed ? 'text-white/60' : 'text-white'}`}>{item.name}</span>
                            <span className="text-white/40 text-[11px] font-medium tracking-wide">
                                {isStillNeed ? 'Tap to set price' : `₱${item.unitPrice.toLocaleString()} each`}
                            </span>
                            
                            {/* Premium glowing VAT Badge */}
                            {!isStillNeed && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleItemVatable(item.id); }}
                                    className={`self-start mt-1.5 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-widest border transition-all ${
                                        item.isVatable 
                                            ? 'text-[#30D158] border-[#30D158]/30 bg-[#30D158]/10 shadow-[0_0_8px_rgba(48,209,88,0.2)]' 
                                            : 'text-white/30 border-white/5 bg-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    {item.isVatable ? '12% VAT' : 'VAT Exempt'}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end justify-center" onClick={onEdit}>
                        <span className={`font-medium text-[19px] tracking-tight ${isStillNeed ? 'text-white/30' : 'text-white'}`}>
                            {isStillNeed ? '--' : `₱${item.amount.toLocaleString()}`}
                        </span>
                        {!isStillNeed && (
                            <span className="text-white/30 text-[10px] uppercase font-bold tracking-wider mt-1">
                                ≈ R{(item.amount * exchangeRate).toFixed(0)}
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
