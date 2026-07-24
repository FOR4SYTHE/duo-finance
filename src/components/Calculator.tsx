"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { containerVariants, itemVariants } from "@/utils/animations";
import { ArrowUpDown, Delete, ChevronRight, History } from "lucide-react";

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
        lastUpdated,
        history,
        clearHistory
    } = useCurrencyStore();

    const [mounted, setMounted] = React.useState(false);
    const [isInitialLoad, setIsInitialLoad] = React.useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

    useEffect(() => {
        setMounted(true);
        if (!sessionStorage.getItem('hasSeenCalculatorAnimation')) {
            setIsInitialLoad(true);
            sessionStorage.setItem('hasSeenCalculatorAnimation', 'true');
        }
        
        // Clear input when user leaves the calculator page
        return () => clearInput();
    }, [clearInput]);

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
        <motion.div 
            key={isInitialLoad ? "animate" : "static"}
            variants={containerVariants}
            initial={isInitialLoad ? "hidden" : false}
            animate="visible"
            className={`w-full h-full min-h-0 bg-transparent text-foreground flex flex-col justify-between font-sans transition-all duration-700 relative px-5 pb-4 pt-6`}
        >
            
            {/* Header: Minimal Apple-style */}
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-4 relative z-20 shrink-0">
                <div className="flex items-center gap-3">
                    {history.length > 0 ? (
                        <button 
                            onClick={() => setIsHistoryOpen(true)}
                            className="w-9 h-9 rounded-full bg-white/[0.08] backdrop-blur-md flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.12] transition-colors active:scale-95"
                        >
                            <History className="w-4 h-4 text-white/70" strokeWidth={2.5} />
                        </button>
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-white/[0.08] backdrop-blur-md flex items-center justify-center border border-white/[0.05]">
                            <span className="font-semibold text-[11px] tracking-wider text-white/70">DF</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 bg-white/[0.04] backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.03]">
                    <div className={`w-1.5 h-1.5 rounded-full bg-current ${statusColor} shadow-[0_0_8px_currentColor]`} />
                    <span className="text-[11px] font-medium text-white/70 tracking-widest uppercase">
                        Rate {exchangeRate.toFixed(2)}
                    </span>
                </div>
            </motion.div>

            {/* Display Area */}
            <motion.div variants={itemVariants} className="flex-1 flex flex-col items-center justify-center relative min-h-0 z-20 w-full mb-2">
                
                {/* Huge Primary Currency */}
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 justify-center mb-1">
                        <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center text-[10px] bg-white/5 border border-white/10 shadow-inner">
                            {isPhpPrimary ? '🇵🇭' : '🇿🇦'}
                        </div>
                        <span className="text-white/40 font-medium tracking-widest text-[10px] uppercase">{primaryCurrency}</span>
                    </div>
                    <div className="flex items-baseline gap-2 justify-center">
                        <span className="text-3xl text-white/30 font-light">
                            {isPhpPrimary ? '₱' : 'R'}
                        </span>
                        <div className="text-[clamp(3.5rem,10vh,5.5rem)] leading-none text-white font-light tracking-tight drop-shadow-2xl flex items-center">
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
                <div className="relative flex items-center justify-center w-full my-3 shrink-0">
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
                        <span className="text-xl text-white/30 font-light">
                            {isPhpPrimary ? 'R' : '₱'}
                        </span>
                        <span className="text-[clamp(2.25rem,6vh,3rem)] leading-none text-white font-light tracking-tight flex items-center min-h-[40px] sm:min-h-[56px]">
                            {Number.isNaN(convertedAmount) ? (
                                <div className="relative w-8 h-8 opacity-60 ml-2">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute inset-0 flex justify-center"
                                            style={{ transform: `rotate(${i * 45}deg)` }}
                                        >
                                            <motion.div
                                                className="w-1.5 h-1.5 rounded-full bg-white mt-1"
                                                animate={{ opacity: [1, 0.2] }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    delay: (i * 1) / 8,
                                                    ease: "linear",
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                Array.from(convertedAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})).map((char, index) => (
                                    <motion.span
                                        key={`${index}-${char}`}
                                        initial={{ y: 10, opacity: 0, scale: 0.95 }}
                                        animate={{ y: 0, opacity: 1, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.5 }}
                                        className="inline-block"
                                    >
                                        {char}
                                    </motion.span>
                                ))
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center mt-2">
                        <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center text-[8px] bg-white/5 border border-white/10">
                            {isPhpPrimary ? '🇿🇦' : '🇵🇭'}
                        </div>
                        <span className="text-white/30 font-medium tracking-widest text-[9px] uppercase">{targetCurrency}</span>
                    </div>
                </div>
                
            </motion.div>

            {/* Premium Duo-Finance Glassmorphic Numpad */}
            <motion.div variants={itemVariants} className="grid grid-cols-4 grid-rows-5 gap-2 sm:gap-3 z-20 max-w-[420px] mx-auto w-full flex-[1.2] min-h-[280px] max-h-[50vh]">
                {buttons.map((btn) => {
                    let btnClasses = "";
                    let textClasses = "";
                    
                    if (btn.type === "num") {
                        btnClasses = "bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_20px_rgba(0,0,0,0.5)] hover:from-white/[0.12] hover:to-white/[0.06]";
                        textClasses = "text-white font-light text-[30px]";
                    } else if (btn.type === "op") {
                        btnClasses = "bg-gradient-to-b from-[#D4AF37]/15 to-[#D4AF37]/5 border border-[#D4AF37]/20 shadow-[inset_0_1px_1px_rgba(212,175,55,0.25),0_8px_20px_rgba(0,0,0,0.5)] hover:from-[#D4AF37]/25 hover:to-[#D4AF37]/10";
                        textClasses = "text-[#D4AF37] font-normal text-[30px]";
                    } else if (btn.type === "meta") {
                        btnClasses = "bg-gradient-to-b from-black/40 to-black/60 border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_20px_rgba(0,0,0,0.5)] hover:from-black/30 hover:to-black/50";
                        textClasses = "text-white/40 font-medium text-[20px] tracking-wide";
                    } else if (btn.type === "action") {
                        btnClasses = "bg-gradient-to-br from-[#D4AF37] to-[#B5952F] border border-[#F2D77D]/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_8px_24px_rgba(212,175,55,0.4)] hover:brightness-110";
                        textClasses = "text-black font-medium text-[30px]";
                    }

                    return (
                        <motion.button
                            key={btn.label}
                            onClick={() => handleAction(btn.label)}
                            whileTap={{ scale: 0.9, y: 2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={`
                                relative flex items-center justify-center rounded-[22px] sm:rounded-[26px] h-full w-full transition-colors duration-300 overflow-hidden group
                                ${btn.cols ? 'col-span-2' : ''}
                                ${btnClasses}
                            `}
                        >
                            {/* Dynamic Liquid Sheen on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            
                            <span className={`relative z-10 ${textClasses}`}>
                                {btn.label === "⌫" ? <Delete className="w-6 h-6" strokeWidth={1.5} /> : btn.label}
                            </span>
                        </motion.button>
                    )
                })}
            </motion.div>

            {/* History Sheet Modal */}
            <AnimatePresence>
                {isHistoryOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end"
                        onClick={() => setIsHistoryOpen(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-[#111112] rounded-t-[32px] w-full max-h-[75vh] flex flex-col border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.8)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-full flex justify-center py-4">
                                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                            </div>
                            <div className="px-6 pb-4 flex justify-between items-center">
                                <h3 className="text-white text-lg font-medium tracking-wide">Session History</h3>
                                <button onClick={clearHistory} className="text-[#FF453A] hover:bg-[#FF453A]/10 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors uppercase tracking-widest">
                                    Clear
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-6 pb-12 flex flex-col gap-3">
                                {history.length === 0 ? (
                                    <div className="text-white/40 text-center py-10 text-sm">No history yet</div>
                                ) : (
                                    history.map((item, idx) => (
                                        <button 
                                            key={`${item.timestamp}-${idx}`}
                                            onClick={() => {
                                                useCurrencyStore.setState({ displayValue: item.result });
                                                setIsHistoryOpen(false);
                                            }}
                                            className="flex flex-col gap-1 p-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl active:bg-white/10 transition-colors text-left group hover:border-white/10"
                                        >
                                            <div className="flex justify-between items-center w-full">
                                                <span className="text-white/40 text-[13px] font-medium tracking-wider">{item.expression.replace(/\*/g, '×').replace(/\//g, '÷')}</span>
                                                <span className="text-white/30 text-[10px] tracking-widest uppercase font-semibold">
                                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <span className="text-white text-2xl font-light tracking-tight group-hover:text-[#D4AF37] transition-colors">={item.result}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}