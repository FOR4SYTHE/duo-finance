"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, X } from "lucide-react";

interface PriceEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (price: number) => void;
    title: string;
}

export function PriceEntryModal({ isOpen, onClose, onConfirm, title }: PriceEntryModalProps) {
    const [displayValue, setDisplayValue] = useState("0");

    useEffect(() => {
        if (isOpen) setDisplayValue("0");
    }, [isOpen]);

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
        const price = parseFloat(displayValue);
        if (price > 0) {
            onConfirm(price);
            onClose();
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
                <div className="absolute inset-0 z-[100] flex flex-col justify-end pointer-events-none">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                    />
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full bg-[#111] rounded-t-[32px] p-6 border-t border-white/10 pointer-events-auto mt-auto flex flex-col pb-[calc(env(safe-area-inset-bottom)+24px)]"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-white/70 font-medium">{title}</span>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center mb-8">
                            <div className="text-[4rem] leading-none text-white flex items-center justify-center gap-2 font-light tracking-tight">
                                <span className="text-3xl text-white/40 mr-1">₱</span>
                                <span>{displayValue || "0"}</span>
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
                            disabled={parseFloat(displayValue) <= 0}
                            className="w-full h-[60px] rounded-full bg-[#30D158] text-black font-semibold text-base tracking-wide flex items-center justify-center px-6 hover:opacity-90 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:bg-white/20"
                        >
                            Confirm Price
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
