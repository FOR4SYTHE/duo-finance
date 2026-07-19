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
        { label: "1", type: "num" }, { label: "2", type: "num" }, { label: "3", type: "num" },
        { label: "4", type: "num" }, { label: "5", type: "num" }, { label: "6", type: "num" },
        { label: "7", type: "num" }, { label: "8", type: "num" }, { label: "9", type: "num" },
        { label: ".", type: "num" }, { label: "0", type: "num" }, { label: "⌫", type: "meta" },
    ];

    const isPhpPrimary = primaryCurrency === 'PHP';
    const targetCurrency = isPhpPrimary ? 'ZAR' : 'PHP';
    
    const numericValue = Number(displayValue || 0);
    const convertedAmount = isPhpPrimary 
        ? numericValue * exchangeRate 
        : numericValue / exchangeRate;

    const glowClass = convertedAmount > 10000 ? "glow-danger" : convertedAmount > 5000 ? "glow-warn" : "";
    const statusColor = convertedAmount > 10000 ? "text-status-danger" : convertedAmount > 5000 ? "text-status-warn" : "text-status-good";

    const handleAction = (label: string) => {
        if (label === "AC") clearInput();
        else if (label === "⌫") deleteLast();
        else appendInput(label);
    };

    return (
        <div className={`w-full h-full bg-transparent text-foreground flex flex-col font-sans transition-all duration-700 relative ${glowClass} px-6 pb-10 pt-14 sm:pt-10`}>
            
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
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[220px] z-20">
                
                {/* Secondary Currency (Subtle) */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-1 mb-2 opacity-50 transition-opacity"
                >
                    <span className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">{targetCurrency}</span>
                </motion.div>

                {/* Primary Currency Hero (Ultra-Thin Apple Typography) */}
                <motion.div 
                    layoutId="hero-number"
                    className="text-[5rem] sm:text-[6rem] leading-none text-white flex items-center justify-center gap-2 mb-2 w-full font-light tracking-tight drop-shadow-lg"
                >
                    <span>{displayValue || "0"}</span>
                </motion.div>
                
                {/* Primary Currency Label */}
                <span className="text-sm text-white/60 font-medium tracking-[0.1em] mb-8 uppercase">{primaryCurrency}</span>

                {/* Conversion Toggle Pill */}
                <button 
                    onClick={toggleCurrency} 
                    disabled={isLoadingRate}
                    className="flex items-center gap-3 bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.15] backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-full transition-all duration-300 group cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                >
                    <ArrowUpDown className={`w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors ${isLoadingRate ? 'animate-spin' : ''}`} />
                    <span className="text-white/80 text-sm font-medium tracking-wide">
                        ≈ {convertedAmount.toFixed(2)} {targetCurrency}
                    </span>
                </button>
            </div>

            {/* Glass Operators */}
            <div className="flex justify-between items-center gap-3 mb-6 mt-6 z-20">
                {['+', '-', '×', '÷'].map(op => (
                    <button 
                        key={op}
                        onClick={() => handleAction(op)}
                        className="flex-1 h-14 rounded-full bg-white/[0.03] backdrop-blur-sm border border-white/[0.02] text-xl font-light text-white/70 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all duration-200"
                    >
                        {op}
                    </button>
                ))}
            </div>

            {/* Premium Squircles Numpad */}
            <div className="grid grid-cols-3 gap-4 mb-8 z-20">
                {buttons.map((btn) => (
                    <button
                        key={btn.label}
                        onClick={() => handleAction(btn.label)}
                        className={`
                            h-[72px] rounded-[24px] flex items-center justify-center text-[28px] font-light transition-all duration-200 bg-white/[0.02] hover:bg-white/[0.06] active:scale-[0.96] active:bg-white/[0.1] border border-white/[0.01] shadow-sm backdrop-blur-md
                            ${btn.type === "num" ? "text-white" : "text-white/50"}
                        `}
                    >
                        {btn.label === "⌫" ? <Delete className="w-6 h-6" strokeWidth={1.5} /> : btn.label}
                    </button>
                ))}
            </div>

            {/* Solid Confirm Action (Slide-to-invest style pill) */}
            <div className="relative z-20 w-full flex justify-center">
                <button
                    onClick={executeCalculation}
                    className="w-full h-[68px] rounded-full bg-white text-black font-semibold text-lg tracking-wide flex items-center justify-between px-6 hover:opacity-90 active:scale-[0.98] transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] group"
                >
                    <span className="pl-2">Confirm Amount</span>
                    <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                </button>
            </div>
            
        </div>
    );
}