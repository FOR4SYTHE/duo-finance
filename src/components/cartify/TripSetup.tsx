"use client";

import { useState } from "react";
import { useCartifyStore, CartifyMode } from "@/store/useCartifyStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { Delete, ChevronRight, Check, ArrowUpDown, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TripSetup() {
    const { startTrip } = useCartifyStore();
    const { primaryCurrency, exchangeRate, toggleCurrency } = useCurrencyStore();
    const [displayValue, setDisplayValue] = useState("0");
    const [selectedMode, setSelectedMode] = useState<CartifyMode>("simple");

    const isPhpPrimary = primaryCurrency === 'PHP';
    const targetCurrency = isPhpPrimary ? 'ZAR' : 'PHP';
    
    const numericValue = Number(displayValue || 0);
    const convertedAmount = isPhpPrimary 
        ? numericValue * exchangeRate 
        : numericValue / exchangeRate;

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
            startTrip(phpBudget, selectedMode);
        }
    };

    const buttons = [
        { label: "1", type: "num" }, { label: "2", type: "num" }, { label: "3", type: "num" },
        { label: "4", type: "num" }, { label: "5", type: "num" }, { label: "6", type: "num" },
        { label: "7", type: "num" }, { label: "8", type: "num" }, { label: "9", type: "num" },
        { label: ".", type: "num" }, { label: "0", type: "num" }, { label: "⌫", type: "meta" },
    ];

    return (
        <div className="flex flex-col w-full h-full relative z-20 flex-1 overflow-y-auto no-scrollbar pb-24 pt-2">
            
            {/* Premium Top Island */}
            <div className="relative z-20 shrink-0 bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.08] rounded-[40px] p-6 mb-6 shadow-[0_16px_40px_rgba(0,0,0,0.3)] overflow-hidden">
                {/* Elegant glow inside the card */}
                <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#30D158]/20 rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-[#30D158]/10 rounded-full blur-[60px] pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-white/50 text-[11px] font-semibold tracking-[0.2em] uppercase">Trip Budget</span>
                        <button 
                            onClick={toggleCurrency} 
                            className="flex items-center gap-1.5 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full transition-all group"
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
                                <span className="text-3xl text-white/40 font-medium">{isPhpPrimary ? '₱' : 'R'}</span>
                                <span>{displayValue || "0"}</span>
                            </div>
                            <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/5">
                                <span className="text-white/50 font-medium tracking-wide text-sm">
                                    ≈ {targetCurrency === 'PHP' ? '₱' : 'R'}{convertedAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-1 px-1">
                            <div className="w-1 h-1 rounded-full bg-[#30D158]/50" />
                            <span className="text-white/40 text-[10px] font-semibold tracking-widest uppercase">Shopping Mode</span>
                        </div>
                        
                        {(['simple', 'unplanned', 'planned'] as CartifyMode[]).map(mode => (
                            <button 
                                key={mode}
                                onClick={() => setSelectedMode(mode)}
                                className={`w-full p-3.5 rounded-[20px] flex items-center justify-between transition-all duration-300 active:scale-[0.98] ${
                                    selectedMode === mode 
                                        ? 'bg-black/40 border border-[#30D158]/30 shadow-[0_0_20px_rgba(48,209,88,0.05)] backdrop-blur-md' 
                                        : 'bg-black/10 border border-transparent hover:bg-black/20'
                                }`}
                            >
                                <div className="flex flex-col items-start text-left">
                                    <span className={`text-sm font-medium capitalize tracking-wide transition-colors ${selectedMode === mode ? 'text-[#30D158]' : 'text-white/80'}`}>
                                        {mode === 'unplanned' ? 'Organized (On the fly)' : mode === 'planned' ? 'Organized (Pre-planned)' : 'Simple & Fast'}
                                    </span>
                                    <span className={`text-[11px] mt-0.5 transition-colors ${selectedMode === mode ? 'text-[#30D158]/60' : 'text-white/40'}`}>
                                        {mode === 'simple' && "Just log prices as you go."}
                                        {mode === 'unplanned' && "Categorize items in store."}
                                        {mode === 'planned' && "Build a list before leaving."}
                                    </span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 ${
                                    selectedMode === mode ? 'border-[#30D158] bg-[#30D158]/20' : 'border-white/20'
                                }`}>
                                    {selectedMode === mode && (
                                        <motion.div 
                                            layoutId="modeCheckCartify"
                                            className="w-2.5 h-2.5 rounded-full bg-[#30D158]"
                                        />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Numpad */}
            <div className="flex-1 grid grid-cols-3 gap-2 mb-4 min-h-[200px]">
                {buttons.map((btn) => (
                    <button
                        key={btn.label}
                        onClick={() => btn.label === "⌫" ? deleteLast() : appendInput(btn.label)}
                        className={`
                            h-full w-full rounded-[20px] flex items-center justify-center text-[24px] font-light transition-all duration-200 bg-white/[0.05] hover:bg-white/[0.1] active:scale-[0.96] border border-white/[0.02]
                            ${btn.type === "num" ? "text-white" : "text-white/50"}
                        `}
                    >
                        {btn.label === "⌫" ? <Delete className="w-5 h-5" strokeWidth={1.5} /> : btn.label}
                    </button>
                ))}
            </div>

            <div className="mt-auto">
                <motion.button
                    whileTap={{ scale: parseFloat(displayValue) > 0 ? 0.96 : 1 }}
                    onClick={handleConfirm}
                    disabled={parseFloat(displayValue) <= 0}
                    className={`w-full h-[64px] rounded-full font-semibold text-base tracking-wide flex items-center justify-between px-6 transition-all duration-500 group overflow-hidden relative ${
                        parseFloat(displayValue) > 0 
                            ? 'bg-white text-black hover:bg-gray-100 shadow-[0_8px_30px_rgba(255,255,255,0.15)] border-none' 
                            : 'bg-white/5 text-white/40 border border-white/10'
                    }`}
                >
                    {/* Glossy sheen effect on hover when active */}
                    {parseFloat(displayValue) > 0 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-50 group-hover:translate-x-full transition-all duration-700 ease-out -skew-x-12" />
                    )}
                    
                    <div className="pl-2 relative overflow-hidden h-[24px] w-48 flex items-center">
                        <AnimatePresence mode="wait">
                            {parseFloat(displayValue) > 0 ? (
                                <motion.span
                                    key="active-text"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="absolute inset-0 flex items-center"
                                >
                                    Start Trip
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="disabled-text"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="absolute inset-0 flex items-center"
                                >
                                    Set Budget
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 relative overflow-hidden ${
                        parseFloat(displayValue) > 0 ? 'bg-black/5 group-hover:bg-black/10' : 'bg-white/5'
                    }`}>
                        <AnimatePresence mode="wait">
                            {parseFloat(displayValue) > 0 ? (
                                <motion.div
                                    key="cart-icon"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    {/* The Adhamuxi-style double-icon rolling trick */}
                                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-10">
                                        <ShoppingCart className="w-4 h-4 text-black" strokeWidth={2.5} />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center -translate-x-10 transition-transform duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-0">
                                        <ShoppingCart className="w-4 h-4 text-black" strokeWidth={2.5} />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="arrow-icon"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 20, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="absolute"
                                >
                                    <ChevronRight className="w-4 h-4 text-white/40" strokeWidth={2.5} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.button>
            </div>
        </div>
    );
}
