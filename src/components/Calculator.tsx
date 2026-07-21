"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, Delete, ChevronRight } from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";

export function Calculator() {
    const { 
        displayValue, 
        exchangeRate, 
        appendInput, 
        clearInput, 
        deleteLast, 
        executeCalculation,
        primaryCurrency,
        toggleCurrency,
        isLoadingRate,
        lastUpdated
    } = useCurrencyStore();

    const [mounted, setMounted] = React.useState(false);
    useEffect(() => setMounted(true), []);

    const buttons = [
        { label: "AC", type: "meta" }, { label: "⌫", type: "meta" }, { label: "%", type: "meta" }, { label: "÷", type: "op" },
        { label: "7", type: "num" }, { label: "8", type: "num" }, { label: "9", type: "num" }, { label: "×", type: "op" },
        { label: "4", type: "num" }, { label: "5", type: "num" }, { label: "6", type: "num" }, { label: "-", type: "op" },
        { label: "1", type: "num" }, { label: "2", type: "num" }, { label: "3", type: "num" }, { label: "+", type: "op" },
        { label: "0", type: "num", cols: 2 }, { label: ".", type: "num" }, { label: "=", type: "action" }
    ];

    const isPhpPrimary = primaryCurrency === 'PHP';
    const targetCurrency = isPhpPrimary ? 'ZAR' : 'PHP';
    
    const numericValue = Number(displayValue || 0);
    const convertedAmount = isPhpPrimary 
        ? numericValue * exchangeRate 
        : numericValue / exchangeRate;
    const statusColor = isLoadingRate ? "text-status-warn animate-pulse" : "text-status-good";

    const handleAction = (label: string) => {
        if (label === "AC") clearInput();
        else if (label === "⌫") deleteLast();
        else if (label === "=") executeCalculation();
        else if (label === "×") appendInput("*");
        else if (label === "÷") appendInput("/");
        else appendInput(label);
    };

    return (
        <div className={`w-full h-full bg-transparent text-foreground flex flex-col font-sans transition-all duration-700 relative px-6 pb-10 pt-14 sm:pt-10`}>
            
            {/* Header: Minimal Apple-style */}
            <div className="flex justify-between items-center mb-8 relative z-20">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/[0.08] backdrop-blur-md flex items-center justify-center border border-white/[0.05]">
                        <span className="font-semibold text-[11px] tracking-wider">DF</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.04] backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.03]">
                    <div className={`w-1.5 h-1.5 rounded-full bg-current ${statusColor} shadow-[0_0_8px_currentColor]`} />
                    <span className="text-[11px] font-medium text-white/70 tracking-widest uppercase">
                        Rate {exchangeRate.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Display Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[220px] z-20 w-full mb-4">
                
                {/* Huge Primary Currency */}
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 justify-center mb-1">
                        <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center text-[10px] bg-white/5 border border-white/10 shadow-inner">
                            {isPhpPrimary ? '🇵🇭' : '🇿🇦'}
                        </div>
                        <span className="text-white/40 font-medium tracking-widest text-[10px] uppercase">{primaryCurrency}</span>
                    </div>
                    <div className="flex items-baseline gap-2 justify-center">
                        <span className="text-3xl text-white/30 font-light">{isPhpPrimary ? '₱' : 'R'}</span>
                        <div className="text-[4.5rem] sm:text-[5.5rem] leading-none text-white font-light tracking-tight drop-shadow-2xl flex items-center">
                            {Array.from(displayValue || "0").map((char, index) => (
                                <motion.span
                                    key={`${index}-${char}`}
                                    initial={{ y: 15, opacity: 0, scale: 0.9 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.5 }}
                                    className="inline-block"
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Beautiful Swap Pill */}
                <div className="relative flex items-center justify-center w-full my-6">
                    {/* Subtle glowing line behind */}
                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    
                    <button 
                        onClick={toggleCurrency} 
                        disabled={isLoadingRate}
                        className="relative z-10 flex items-center gap-2 bg-[#141415] border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,0,0,0.6)] group"
                    >
                        <ArrowUpDown className={`w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors ${isLoadingRate ? 'animate-spin' : ''}`} />
                        <span className="text-white/60 group-hover:text-white transition-colors text-[9px] font-bold tracking-[0.2em] uppercase">Swap</span>
                    </button>
                </div>

                {/* Converted Currency */}
                <div className="flex flex-col items-center opacity-80 mt-1">
                    <div className="flex items-baseline gap-2 justify-center">
                        <span className="text-xl text-white/30 font-light">{isPhpPrimary ? 'R' : '₱'}</span>
                        <span className="text-[2.5rem] sm:text-[3rem] leading-none text-white font-light tracking-tight flex items-center">
                            {Array.from(convertedAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})).map((char, index) => (
                                <motion.span
                                    key={`${index}-${char}`}
                                    initial={{ y: 10, opacity: 0, scale: 0.95 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.5 }}
                                    className="inline-block"
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center mt-2">
                        <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center text-[8px] bg-white/5 border border-white/10">
                            {isPhpPrimary ? '🇿🇦' : '🇵🇭'}
                        </div>
                        <span className="text-white/30 font-medium tracking-widest text-[9px] uppercase">{targetCurrency}</span>
                    </div>
                </div>
                
            </div>

            {/* Premium Squircles Numpad */}
            <div className="grid grid-cols-4 gap-3 mb-6 z-20">
                {buttons.map((btn) => (
                    <button
                        key={btn.label}
                        onClick={() => handleAction(btn.label)}
                        className={`
                            h-[68px] sm:h-[72px] rounded-[24px] flex items-center justify-center text-[26px] font-light transition-all duration-200 active:scale-[0.92] shadow-sm backdrop-blur-md
                            ${btn.cols ? 'col-span-2' : ''}
                            ${btn.type === "num" 
                                ? "bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] text-white border border-white/[0.02]" 
                                : btn.type === "op" 
                                    ? "bg-orange-500/10 hover:bg-orange-500/20 active:bg-orange-500/30 text-orange-400 border border-orange-500/20" 
                                    : btn.type === "action"
                                        ? "bg-white text-black hover:bg-gray-200 active:bg-gray-300 border-none shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                        : "bg-white/[0.08] hover:bg-white/[0.12] active:bg-white/[0.16] text-white/80 border border-white/[0.05]"
                            }
                        `}
                    >
                        {btn.label === "⌫" ? <Delete className="w-6 h-6" strokeWidth={1.5} /> : btn.label}
                    </button>
                ))}
            </div>
            
        </div>
    );
}