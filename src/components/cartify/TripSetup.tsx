"use client";

import { useState, useRef, useEffect, useEffect as useIsomorphicLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useCartifyStore, CartifyMode, SavedTrip } from "@/store/useCartifyStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { Delete, ChevronRight, Check, ArrowUpDown, ShoppingCart, Zap, ListTodo, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { SavedTripsSheet } from "./SavedTripsSheet";
import { useDualCurrency } from "@/hooks/useDualCurrency";

export function TripSetup() {
    const { startTrip, items, budget, mode, resumeTrip, endTrip, savedTrips, resumeSpecificTrip, deleteSavedTrip } = useCartifyStore();
    const { primaryCurrency, exchangeRate, toggleCurrency } = useCurrencyStore();
    const { primarySymbol, secondarySymbol, getPrimaryValue, getSecondaryValue } = useDualCurrency();
    const [displayValue, setDisplayValue] = useState("0");
    const [selectedMode, setSelectedMode] = useState<CartifyMode>("simple");
    const [isSavedTripsOpen, setIsSavedTripsOpen] = useState(false);
    const [showStartPrompt, setShowStartPrompt] = useState(false);
    const [mounted, setMounted] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isPhpPrimary = primaryCurrency === 'PHP';
    const targetCurrency = isPhpPrimary ? 'ZAR' : 'PHP';
    
    const numericValue = Number(displayValue || 0);
    const convertedAmount = isPhpPrimary 
        ? numericValue * exchangeRate 
        : numericValue / exchangeRate;

    // Auto-scroll when budget is set
    useEffect(() => {
        if (numericValue > 0 && bottomRef.current) {
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100); // Small delay to allow framer-motion layout to start expanding
        }
    }, [numericValue > 0]); // Only trigger when we cross the 0 threshold

    // Convert displayValue back to PHP for the store if ZAR is primary
    const phpBudget = isPhpPrimary ? numericValue : convertedAmount;

    const appendInput = (char: string) => {
        if (displayValue === "0" && char !== ".") {
            setDisplayValue(char);
        } else {
            setDisplayValue(prev => prev + char);
        }
    };

    const deleteLast = () => {
        if (displayValue.length <= 1) {
            setDisplayValue("0");
        } else {
            setDisplayValue(prev => prev.slice(0, -1));
        }
    };

    const handleConfirm = () => {
        if (phpBudget > 0) {
            if (savedTrips && savedTrips.length > 0) {
                setShowStartPrompt(true);
            } else {
                startTrip(phpBudget, selectedMode);
            }
        }
    };

    const proceedWithNewTrip = () => {
        setShowStartPrompt(false);
        startTrip(phpBudget, selectedMode);
    };

    const buttons = [
        { label: "1", type: "num" }, { label: "2", type: "num" }, { label: "3", type: "num" },
        { label: "4", type: "num" }, { label: "5", type: "num" }, { label: "6", type: "num" },
        { label: "7", type: "num" }, { label: "8", type: "num" }, { label: "9", type: "num" },
        { label: ".", type: "num" }, { label: "0", type: "num" }, { label: "⌫", type: "meta" },
    ];

    const hasSavedTrip = savedTrips && savedTrips.length > 0;
    const isMultipleSaved = savedTrips && savedTrips.length > 1;

    return (
        <div className="flex flex-col w-full min-h-full relative z-20 flex-1 pb-32 pt-2">
            
            <AnimatePresence>
                {hasSavedTrip && !isMultipleSaved && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        className="px-4 mb-4"
                    >
                            <div className="relative w-full bg-gradient-to-b from-[#1C1C1E] to-[#111112] border border-white/5 rounded-[24px] p-4 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                                
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-[#30D158]/10 flex items-center justify-center border border-[#30D158]/20 shadow-[0_0_15px_rgba(48,209,88,0.1)]">
                                        <ShoppingCart className="w-5 h-5 text-[#30D158]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white/90 text-[14px] font-medium tracking-tight">Saved Trip Available</span>
                                        <span className="text-white/50 text-[12px] font-medium tracking-wide">
                                            {primarySymbol}{getPrimaryValue(savedTrips[0].budget).toLocaleString()} • {savedTrips[0].items.length} items
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 relative z-10">
                                    <button 
                                        onClick={() => resumeSpecificTrip(savedTrips[0].id)}
                                        className="px-4 py-2 bg-[#30D158]/10 text-[#30D158] text-[13px] font-bold tracking-wide rounded-full border border-[#30D158]/20 active:scale-95 transition-all hover:bg-[#30D158]/20"
                                    >
                                        Resume
                                    </button>
                                    <button 
                                        onClick={() => deleteSavedTrip(savedTrips[0].id)}
                                        className="w-9 h-9 flex items-center justify-center bg-white/5 border border-white/10 text-white/40 rounded-full active:scale-95 hover:bg-white/10 hover:text-white transition-all"
                                        title="Discard Saved Trip"
                                    >
                                        <Delete className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                    </motion.div>
                )}

                {isMultipleSaved && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        className="px-4 mb-4 relative"
                    >
                        {/* Visual Stack Elements */}
                        <div className="absolute top-0 left-6 right-6 h-full bg-[#1C1C1E]/50 border border-white/5 rounded-[24px] translate-y-2 scale-[0.96] shadow-lg pointer-events-none" />
                        <div className="absolute top-0 left-8 right-8 h-full bg-[#1C1C1E]/30 border border-white/5 rounded-[24px] translate-y-4 scale-[0.92] shadow-sm pointer-events-none" />

                            <button 
                                onClick={() => setIsSavedTripsOpen(true)}
                                className="relative w-full bg-gradient-to-b from-[#1C1C1E] to-[#111112] border border-white/5 rounded-[24px] p-4 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-left group active:scale-[0.98] transition-all"
                            >
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors rounded-[24px]" />
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-[#30D158]/10 flex items-center justify-center border border-[#30D158]/20 shadow-[0_0_15px_rgba(48,209,88,0.1)]">
                                        <Layers className="w-5 h-5 text-[#30D158]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white/90 text-[14px] font-medium tracking-tight">{savedTrips.length} Saved Trips Available</span>
                                        <span className="text-[#30D158] text-[12px] font-medium tracking-wide">
                                            Tap to view and resume
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center relative z-10 group-hover:bg-white/10 transition-colors">
                                    <ChevronRight className="w-4 h-4 text-white/50" />
                                </div>
                            </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Top Island */}
            <div className="relative z-20 shrink-0 bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.08] rounded-[40px] p-6 mx-4 mb-6 shadow-[0_16px_40px_rgba(0,0,0,0.3)] overflow-hidden">
                {/* Elegant glow inside the card */}
                <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#30D158]/20 rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-[#30D158]/10 rounded-full blur-[60px] pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-white/50 text-[11px] font-semibold tracking-[0.2em] uppercase">Trip Budget</span>
                        <button 
                            onClick={toggleCurrency} 
                            className="flex items-center gap-1.5 bg-black/20 hover:bg-black/40 border border-white/10 px-3 py-1.5 rounded-full transition-all group"
                        >
                            <ArrowUpDown className="w-3 h-3 text-white/60 group-hover:text-white transition-colors" />
                            <span className="text-white/80 text-[10px] uppercase font-bold tracking-widest">
                                {primaryCurrency} ⇌ {targetCurrency}
                            </span>
                        </button>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center mb-10">
                        <div className="flex flex-col items-center">
                            <div className="text-[4rem] leading-none text-white flex items-baseline justify-center gap-1.5 font-light tracking-tight drop-shadow-lg">
                                <span className="text-3xl text-white/40 font-medium">{primarySymbol}</span>
                                <span>{displayValue || "0"}</span>
                            </div>
                            <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-black/20 border border-white/5">
                                <span className="text-white/50 font-medium tracking-wide text-sm">
                                    ≈ {secondarySymbol}{convertedAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#30D158] shadow-[0_0_8px_#30D158]" />
                                <span className="text-white/50 text-[10px] font-bold tracking-[0.2em] uppercase">Shopping Mode</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {(['simple', 'planned'] as CartifyMode[]).map(mode => (
                                <button 
                                    key={mode}
                                    onClick={() => setSelectedMode(mode)}
                                    className="relative p-3 rounded-[24px] flex flex-col items-center justify-center overflow-hidden group active:scale-[0.95] transition-transform duration-200"
                                    style={{ WebkitTapHighlightColor: 'transparent' }}
                                >
                                    {/* Active Background - Framer Motion slide */}
                                    {selectedMode === mode && (
                                        <motion.div 
                                            layoutId="activeModeBackgroundCartify"
                                            className="absolute inset-0 bg-gradient-to-b from-[#30D158]/10 to-transparent border-[1.5px] border-[#30D158]/50 shadow-[0_8px_32px_rgba(48,209,88,0.15),inset_0_1px_1px_rgba(255,255,255,0.2)] rounded-[24px]"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 35, mass: 1 }}
                                        />
                                    )}
                                    
                                    {/* Active Green Glow */}
                                    {selectedMode === mode && (
                                        <motion.div 
                                            layoutId="activeModeGlowCartify"
                                            className="absolute inset-0 bg-[#30D158]/20 blur-2xl pointer-events-none rounded-[24px]"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 35, mass: 1 }}
                                        />
                                    )}
                                    
                                    {/* Base background for unselected (to give it shape) */}
                                    {selectedMode !== mode && (
                                        <div className="absolute inset-0 bg-white/[0.02] border border-white/[0.04] rounded-[24px] transition-colors duration-200 group-hover:bg-white/[0.04] shadow-sm" />
                                    )}

                                    {/* Icon (No circle, just icon, with micro-animations) */}
                                    <div className={`relative z-10 transition-colors duration-200 mt-2 mb-1 origin-center ${
                                        selectedMode === mode 
                                            ? 'text-[#30D158] drop-shadow-[0_0_12px_rgba(48,209,88,0.8)]' 
                                            : 'text-white/40 group-hover:text-white/60'
                                    }`}>
                                        {mode === 'simple' && (
                                            <motion.div
                                                animate={selectedMode === 'simple' ? { 
                                                    scale: [1, 1.3, 0.85, 1],
                                                    rotate: [0, -15, 15, 0] 
                                                } : { scale: 1, rotate: 0 }}
                                                transition={{ duration: 0.4, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
                                            >
                                                <Zap className="w-6 h-6" strokeWidth={1.5} />
                                            </motion.div>
                                        )}

                                        {mode === 'planned' && (
                                            <motion.div
                                                animate={selectedMode === 'planned' ? { 
                                                    scale: [1, 0.8, 1.15, 1],
                                                    rotate: [0, 10, -5, 0]
                                                } : { scale: 1, rotate: 0 }}
                                                transition={{ duration: 0.4, times: [0, 0.3, 0.7, 1], ease: "backOut" }}
                                            >
                                                <ListTodo className="w-6 h-6" strokeWidth={1.5} />
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-center text-center relative z-10 w-full mb-1">
                                        <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 mb-0.5 ${selectedMode === mode ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
                                            {mode === 'planned' ? 'Planned Trip' : 'Quick Trip'}
                                        </span>
                                        <span className={`text-[9px] leading-tight transition-colors duration-200 ${selectedMode === mode ? 'text-white/70' : 'text-white/30'}`}>
                                            {mode === 'simple' && "Prices only"}
                                            {mode === 'planned' && "Pre-build list"}
                                        </span>
                                    </div>
                                    
                                    {/* Subtle gloss effect on the glass card */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 mx-auto w-full max-w-[360px]">
                {buttons.map((btn) => {
                    let btnClasses = "";
                    let textClasses = "";
                    
                    if (btn.type === "num") {
                        btnClasses = "bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_20px_rgba(0,0,0,0.5)] hover:from-white/[0.12] hover:to-white/[0.06]";
                        textClasses = "text-white font-light text-[30px]";
                    } else if (btn.type === "meta") {
                        btnClasses = "bg-gradient-to-b from-black/40 to-black/60 border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_20px_rgba(0,0,0,0.5)] hover:from-black/30 hover:to-black/50";
                        textClasses = "text-white/40 font-medium text-[24px] tracking-wide";
                    }

                    return (
                        <button
                            key={btn.label}
                            onClick={() => btn.label === "⌫" ? deleteLast() : appendInput(btn.label)}
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

            <div ref={bottomRef} className="mt-auto relative z-30 pb-12 flex justify-center w-full min-h-[96px] items-center">
                <motion.button
                    layout
                    whileTap={{ scale: 0.97 }}
                    onClick={handleConfirm}
                    disabled={parseFloat(displayValue) <= 0}
                    initial={false}
                    animate={{
                        width: parseFloat(displayValue) > 0 ? "100%" : 160,
                        height: parseFloat(displayValue) > 0 ? 96 : 56,
                        borderRadius: parseFloat(displayValue) > 0 ? 40 : 28,
                        backgroundColor: parseFloat(displayValue) > 0 ? "#000000" : "#151516",
                        borderColor: parseFloat(displayValue) > 0 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)"
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 28, mass: 0.8 }}
                    className="border shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center justify-center p-4 overflow-hidden relative group"
                    style={{ WebkitTransform: "translateZ(0)" }} // Force GPU acceleration for buttery smooth animation
                >
                    {/* Ambient glow inside the island - only visible when active */}
                    <motion.div 
                        animate={{ opacity: parseFloat(displayValue) > 0 ? 0.5 : 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 bg-gradient-to-r from-[#30D158]/15 via-transparent to-transparent pointer-events-none" 
                    />
                    
                    {/* Glossy sweep effect */}
                    {parseFloat(displayValue) > 0 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-700 ease-out -skew-x-12 pointer-events-none" />
                    )}
                    
                    <AnimatePresence mode="popLayout">
                        {parseFloat(displayValue) > 0 ? (
                            <motion.div 
                                key="active-content"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.05 }}
                                className="flex items-center justify-between w-full h-full"
                            >
                                <div className="flex flex-col items-start text-left pl-2 z-10">
                                    <span className="text-[#30D158] text-[10px] font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse shadow-[0_0_8px_#30D158]" />
                                        Budget Set
                                    </span>
                                    <span className="text-white text-[17px] font-semibold leading-tight tracking-tight">Start your shopping trip</span>
                                    <span className="text-white/30 text-[9px] font-semibold mt-1 tracking-[0.2em] uppercase">powered by Cartify DF</span>
                                </div>
                                
                                <div className="w-[84px] h-[84px] relative -mr-2 shrink-0 z-10 flex items-center justify-center pointer-events-none">
                                    <img 
                                        src="/cart_3d.webp" 
                                        alt="3D Cart" 
                                        style={{ 
                                            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 65%)',
                                            maskImage: 'radial-gradient(circle at center, black 40%, transparent 65%)'
                                        }}
                                        className="w-[140%] h-[140%] max-w-none object-cover opacity-90 absolute" 
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="inactive-content"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className="flex items-center justify-center w-full h-full absolute inset-0"
                            >
                                <span className="text-white/40 font-medium text-[15px] tracking-wide relative z-10 flex items-center gap-2">
                                    <ChevronRight className="w-5 h-5 text-black/40 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                                    Set Budget
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>

            <SavedTripsSheet 
                isOpen={isSavedTripsOpen}
                onClose={() => setIsSavedTripsOpen(false)}
            />

            {/* Start New Trip Prompt Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {showStartPrompt && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto p-4">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowStartPrompt(false)}
                                className="absolute inset-0 bg-[#0A0A0A]/95" 
                            />
                            
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                                className="relative w-full max-w-[340px] bg-[#1C1C1E] border border-white/10 rounded-[32px] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.5)] overflow-hidden"
                            >
                                {/* Glow */}
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#30D158]/20 rounded-full blur-[40px] pointer-events-none" />

                                <div className="w-12 h-12 rounded-full bg-[#30D158]/10 flex items-center justify-center border border-[#30D158]/20 mb-5 shadow-[0_0_15px_rgba(48,209,88,0.15)] relative z-10">
                                    <Layers className="w-6 h-6 text-[#30D158]" />
                                </div>
                                
                                <h3 className="text-xl font-bold text-white tracking-tight mb-2 relative z-10">Saved Trips Available</h3>
                                <p className="text-white/60 text-[14px] leading-relaxed mb-8 relative z-10">
                                    You still have trips saved for later. Would you like to start a new trip or visit your saved list?
                                </p>
                                
                                <div className="flex flex-col gap-3 relative z-10">
                                    <button 
                                        onClick={() => {
                                            setShowStartPrompt(false);
                                            setIsSavedTripsOpen(true);
                                        }}
                                        className="w-full py-4 rounded-[18px] bg-white/5 border border-white/10 text-white font-semibold tracking-wide active:scale-[0.98] transition-all hover:bg-white/10"
                                    >
                                        View Saved Trips
                                    </button>
                                    <button 
                                        onClick={proceedWithNewTrip}
                                        className="w-full py-4 rounded-[18px] bg-[#30D158] text-black font-bold tracking-wide active:scale-[0.98] transition-all hover:bg-[#30D158]/90 shadow-[0_0_20px_rgba(48,209,88,0.2)]"
                                    >
                                        Start New Trip
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
