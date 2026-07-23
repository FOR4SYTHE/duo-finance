"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, X } from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";

interface QuickLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amountPHP: number, note: string) => void;
}

export function QuickLogModal({ isOpen, onClose, onConfirm }: QuickLogModalProps) {
    const { primaryCurrency, exchangeRate } = useCurrencyStore();
    const [displayValue, setDisplayValue] = useState("0");
    const [note, setNote] = useState("");

    const isPhpPrimary = primaryCurrency === 'PHP';
    const targetCurrency = isPhpPrimary ? 'ZAR' : 'PHP';
    
    const numericValue = Number(displayValue || 0);
    const convertedAmount = isPhpPrimary 
        ? numericValue * exchangeRate 
        : numericValue / exchangeRate;
        
    const phpAmount = isPhpPrimary ? numericValue : convertedAmount;

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
        if (phpAmount > 0) {
            onConfirm(phpAmount, note);
            setDisplayValue("0");
            setNote("");
        }
    };

    const buttons = [
        { label: "1", type: "num" }, { label: "2", type: "num" }, { label: "3", type: "num" },
        { label: "4", type: "num" }, { label: "5", type: "num" }, { label: "6", type: "num" },
        { label: "7", type: "num" }, { label: "8", type: "num" }, { label: "9", type: "num" },
        { label: ".", type: "num" }, { label: "0", type: "num" }, { label: "⌫", type: "meta" },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90"
                    />
                    
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0, transition: { type: "spring", damping: 28, stiffness: 300 } }}
                        exit={{ y: "100%", transition: { type: "tween", duration: 0.2, ease: "easeIn" } }}
                        className="w-full max-w-md bg-[#111] sm:rounded-[32px] rounded-t-[32px] border border-white/10 p-6 relative z-10 flex flex-col max-h-[90dvh]"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-medium">Quick Log Spend</h3>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center justify-center mb-6">
                            <div className="text-[3.5rem] leading-none text-white flex items-baseline justify-center gap-1 font-light tracking-tight">
                                <span className="text-2xl text-white/40">{isPhpPrimary ? '₱' : 'R'}</span>
                                <span>{displayValue || "0"}</span>
                            </div>
                            <span className="text-white/40 font-medium tracking-wide mt-1 text-sm">
                                ≈ {targetCurrency === 'PHP' ? '₱' : 'R'}{convertedAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </span>
                        </div>

                        <input 
                            type="text"
                            placeholder="Note (Optional)"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-[16px] px-4 text-white outline-none focus:border-white/20 mb-6 placeholder:text-white/30 text-sm"
                        />

                        {/* Numpad */}
                        <div className="flex-1 grid grid-cols-3 gap-3 mb-6 min-h-[250px]">
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

                        <button
                            onClick={handleConfirm}
                            disabled={phpAmount <= 0}
                            className="w-full h-[64px] rounded-full bg-white text-black font-semibold text-base tracking-wide flex items-center justify-center gap-2 hover:bg-gray-100 disabled:opacity-50 disabled:bg-white/10 disabled:text-white/40 transition-all duration-300 active:scale-[0.98]"
                        >
                            Log ₱{phpAmount.toLocaleString()}
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
