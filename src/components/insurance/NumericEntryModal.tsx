"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, X } from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useDualCurrency } from "@/hooks/useDualCurrency";

interface NumericEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
    title: string;
    initialValue?: number;
}

export function NumericEntryModal({ isOpen, onClose, onConfirm, title, initialValue = 0 }: NumericEntryModalProps) {
    const [displayValue, setDisplayValue] = useState(initialValue ? initialValue.toString() : "0");
    const { exchangeRate, primaryCurrency } = useCurrencyStore();
    const { primarySymbol, secondarySymbol } = useDualCurrency();
    
    const isPhpPrimary = primaryCurrency === 'PHP';

    const numericValue = parseFloat(displayValue || "0") || 0;
    const convertedAmount = isPhpPrimary ? numericValue * exchangeRate : numericValue / exchangeRate;

    useEffect(() => {
        if (isOpen) {
            setDisplayValue(initialValue ? initialValue.toString() : "0");
        }
    }, [isOpen, initialValue]);

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
        const amount = parseFloat(displayValue);
        onConfirm(amount);
        onClose();
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
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/95 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "tween", duration: 0.15, ease: "easeOut" } }}
                        exit={{ opacity: 0, scale: 0.95, y: 10, transition: { type: "tween", duration: 0.15, ease: "easeIn" } }}
                        className="w-full max-w-md bg-[#111] rounded-[32px] border border-white/10 p-6 relative z-10 flex flex-col max-h-[90dvh] overflow-hidden will-change-transform shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[#D4AF37] font-bold text-[13px] uppercase tracking-widest">{title}</span>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10">
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center mb-8">
                            <div className="text-[4rem] leading-none text-white flex items-center justify-center gap-2 font-light tracking-tight">
                                <span className="text-3xl text-white/40 mr-1">{primarySymbol}</span>
                                <span>{displayValue || "0"}</span>
                            </div>
                            <div className="text-white/40 text-[13px] font-medium mt-2 flex items-center gap-1 tracking-wider">
                                <span>≈</span>
                                <span>{secondarySymbol}</span>
                                <span>{convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>

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
                            className="w-full h-[60px] rounded-full bg-[#D4AF37] text-black font-semibold text-base tracking-wide flex items-center justify-center px-6 hover:opacity-90 active:scale-[0.98] transition-all duration-300"
                        >
                            Confirm Amount
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
