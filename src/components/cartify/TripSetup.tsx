"use client";

import { useState, useRef, useEffect } from "react";
import { useCartifyStore, CartifyMode } from "@/store/useCartifyStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { Delete, ChevronRight, Check, ArrowUpDown, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TripSetup() {
    const { startTrip } = useCartifyStore();
    const { primaryCurrency, exchangeRate, toggleCurrency } = useCurrencyStore();
    const [displayValue, setDisplayValue] = useState("0");
    const [selectedMode, setSelectedMode] = useState<CartifyMode>("simple");
    const bottomRef = useRef<HTMLDivElement>(null);

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
                bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
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

            <div ref={bottomRef} className="mt-auto relative z-30 pb-2 flex justify-center w-full min-h-[96px] items-center">
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
                                initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
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
                                        src="/cart_3d.png" 
                                        alt="3D Cart" 
                                        style={{ 
                                            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 65%)',
                                            maskImage: 'radial-gradient(circle at center, black 40%, transparent 65%)'
                                        }}
                                        className="w-[140%] h-[140%] max-w-none object-cover mix-blend-screen drop-shadow-2xl absolute" 
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
                                    <ChevronRight className="w-4 h-4 text-white/20" strokeWidth={2.5} />
                                    Set Budget
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </div>
    );
}
