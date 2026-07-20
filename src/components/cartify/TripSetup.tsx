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
            <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-white/50 text-xs font-semibold tracking-widest uppercase">Trip Budget</span>
                <button 
                    onClick={toggleCurrency} 
                    className="flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.15] border border-white/10 px-3 py-1.5 rounded-full transition-all group"
                >
                    <ArrowUpDown className="w-3 h-3 text-white/60 group-hover:text-white" />
                    <span className="text-white/80 text-[10px] uppercase font-bold tracking-widest">
                        {primaryCurrency} ⇌ {targetCurrency}
                    </span>
                </button>
            </div>
            
            <div className="flex flex-col items-center justify-center mb-4 min-h-[70px] shrink-0">
                <div className="flex flex-col items-center">
                    <div className="text-[3.5rem] leading-none text-white flex items-baseline justify-center gap-1 font-light tracking-tight">
                        <span className="text-2xl text-white/40">{isPhpPrimary ? '₱' : 'R'}</span>
                        <span>{displayValue || "0"}</span>
                    </div>
                    <span className="text-white/40 font-medium tracking-wide mt-1 text-sm">
                        ≈ {targetCurrency === 'PHP' ? '₱' : 'R'}{convertedAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-1.5 mb-4 shrink-0">
                <span className="text-white/50 text-[10px] font-semibold tracking-widest uppercase mb-0.5 px-1">Mode</span>
                
                {(['simple', 'unplanned', 'planned'] as CartifyMode[]).map(mode => (
                    <button 
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className={`w-full p-3 rounded-[16px] border flex items-center justify-between transition-all active:scale-[0.98] ${
                            selectedMode === mode 
                                ? 'bg-[#30D158]/10 border-[#30D158]/30 shadow-[0_0_20px_rgba(48,209,88,0.05)]' 
                                : 'bg-white/[0.02] border-white/[0.03] hover:bg-white/[0.05]'
                        }`}
                    >
                        <div className="flex flex-col items-start text-left">
                            <span className={`text-sm font-medium capitalize ${selectedMode === mode ? 'text-[#30D158]' : 'text-white'}`}>
                                {mode === 'unplanned' ? 'Organized (On the fly)' : mode === 'planned' ? 'Organized (Pre-planned)' : 'Simple'}
                            </span>
                            <span className={`text-xs mt-0.5 ${selectedMode === mode ? 'text-[#30D158]/70' : 'text-white/40'}`}>
                                {mode === 'simple' && "Fastest way to just log prices."}
                                {mode === 'unplanned' && "Categorize as you shop."}
                                {mode === 'planned' && "Build a list before you go."}
                            </span>
                        </div>
                        {selectedMode === mode && (
                            <motion.div 
                                layoutId="modeCheck"
                                className="w-5 h-5 rounded-full bg-[#30D158] flex items-center justify-center"
                            >
                                <Check className="w-3 h-3 text-black" strokeWidth={3} />
                            </motion.div>
                        )}
                    </button>
                ))}
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
