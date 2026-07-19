"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Delete, Check } from "lucide-react";
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

    // Ensure we handle client-side hydration correctly for dates
    const [mounted, setMounted] = React.useState(false);
    useEffect(() => setMounted(true), []);

    const buttons = [
        { label: "AC", type: "meta" }, { label: "⌫", type: "meta" }, { label: "%", type: "meta" }, { label: "÷", type: "op" },
        { label: "7", type: "num" }, { label: "8", type: "num" }, { label: "9", type: "num" }, { label: "×", type: "op" },
        { label: "4", type: "num" }, { label: "5", type: "num" }, { label: "6", type: "num" }, { label: "-", type: "op" },
        { label: "1", type: "num" }, { label: "2", type: "num" }, { label: "3", type: "num" }, { label: "+", type: "op" },
        { label: "0", type: "num", colSpan: 2 }, { label: ".", type: "num", colSpan: 2 },
    ];

    const isPhpPrimary = primaryCurrency === 'PHP';
    const targetCurrency = isPhpPrimary ? 'ZAR' : 'PHP';
    
    // Core multiply-vs-divide inversion logic
    const numericValue = Number(displayValue || 0);
    const convertedAmount = isPhpPrimary 
        ? numericValue * exchangeRate 
        : numericValue / exchangeRate;

    // Simulate budget motif on the *converted* ZAR value for consistency
    const glowClass = convertedAmount > 10000 ? "glow-danger" : convertedAmount > 5000 ? "glow-warn" : "";
    const statusColor = convertedAmount > 10000 ? "text-status-danger" : convertedAmount > 5000 ? "text-status-warn" : "text-status-good";

    const timeString = mounted && lastUpdated 
        ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : 'live';

    const handleAction = (label: string) => {
        if (label === "AC") clearInput();
        else if (label === "⌫") deleteLast();
        else appendInput(label);
    };

    return (
        <div className={`w-full h-full bg-background text-foreground flex flex-col font-sans transition-all duration-500 relative overflow-hidden ${glowClass}`}>
            <div className="flex-1 flex flex-col p-8 bg-card m-4 rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.4)] relative z-10">
                
                {/* Premium Header / Status */}
                <div className="flex justify-between items-center mb-8">
                    <div className="text-muted text-sm tracking-wide">Binational Ledger</div>
                    <div className="flex items-center gap-2 bg-black/20 px-4 py-1.5 rounded-full">
                        <div className={`w-1.5 h-1.5 rounded-full bg-current ${statusColor}`} />
                        <span className="text-[10px] uppercase tracking-widest text-muted font-medium">
                            Rate: {exchangeRate.toFixed(4)} <span className="opacity-60 ml-1">({timeString})</span>
                        </span>
                    </div>
                </div>

                {/* Main Balance Display */}
                <div className="flex flex-col items-end mb-12 flex-1 justify-center">
                    <motion.div className="hero-number text-7xl text-foreground mb-3 drop-shadow-sm flex items-baseline gap-3">
                        <span>{displayValue || "0"}</span>
                        <span className="text-3xl text-muted font-normal tracking-wide">{primaryCurrency}</span>
                    </motion.div>
                    <div className="text-muted text-xl tracking-wide flex items-center gap-3">
                        <button 
                            onClick={toggleCurrency} 
                            disabled={isLoadingRate}
                            className="p-1.5 bg-black/20 hover:bg-black/40 rounded-full transition-colors group cursor-pointer"
                        >
                            <ArrowUpDown className={`w-4 h-4 text-muted group-hover:text-foreground ${isLoadingRate ? 'animate-spin' : ''}`} />
                        </button>
                        <span>≈</span>
                        <span className={statusColor}>
                            {convertedAmount.toFixed(2)} {targetCurrency}
                        </span>
                    </div>
                </div>

                {/* Bento-Style Keypad */}
                <div className="grid grid-cols-4 gap-y-6 gap-x-4 mt-auto mb-8">
                    {buttons.map((btn) => (
                        <button
                            key={btn.label}
                            onClick={() => handleAction(btn.label)}
                            className={`
                                h-16 flex items-center justify-center text-2xl transition-all duration-200
                                ${btn.colSpan === 2 ? 'col-span-2' : ''}
                                ${btn.type === "num" ? "text-foreground hover:text-white" :
                                btn.type === "meta" ? "text-muted hover:text-foreground" : "text-accent font-medium"}
                            `}
                        >
                            {btn.label === "⌫" ? <Delete className="w-6 h-6" /> : btn.label}
                        </button>
                    ))}
                </div>

                {/* Primary Action (Circular Icon-Button) */}
                <div className="flex justify-center mt-4">
                    <div className="flex flex-col items-center gap-3">
                        <button
                            onClick={executeCalculation}
                            className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-background shadow-[0_8px_20px_rgba(232,163,61,0.3)] hover:scale-105 hover:shadow-[0_10px_25px_rgba(232,163,61,0.4)] transition-all duration-300"
                        >
                            <Check className="w-7 h-7" strokeWidth={2.5} />
                        </button>
                        <span className="text-muted text-[11px] uppercase tracking-widest font-medium">Confirm</span>
                    </div>
                </div>

            </div>
        </div>
    );
}