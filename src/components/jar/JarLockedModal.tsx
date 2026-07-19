"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon, X } from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";

interface JarLockedModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalSpent: number;
    targetAmount: number;
    period: string;
}

export function JarLockedModal({ isOpen, onClose, totalSpent, targetAmount, period }: JarLockedModalProps) {
    const { exchangeRate } = useCurrencyStore();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-full max-w-md bg-[#111] sm:rounded-[32px] rounded-t-[32px] border border-[#FF453A]/30 p-6 relative z-10 flex flex-col shadow-[0_0_40px_rgba(255,69,58,0.15)]"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#FF453A]/20 flex items-center justify-center border border-[#FF453A]/30">
                                    <AlertOctagon className="w-5 h-5 text-[#FF453A]" />
                                </div>
                                <h3 className="text-white font-medium text-lg">Spend Jar Locked</h3>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="mb-8">
                            <p className="text-white/80 text-[15px] leading-relaxed">
                                You've hit the allowed extra spend limit for this {period}'s budget. Logging is currently locked to prevent further overspending.
                            </p>
                        </div>

                        {/* Totals Summary */}
                        <div className="bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-[20px] p-5 flex flex-col items-center justify-center mb-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#FF453A]/5 to-transparent pointer-events-none" />
                            
                            <span className="text-[#FF453A] font-semibold text-xs tracking-widest uppercase mb-1">Total Quick Logged</span>
                            <span className="text-4xl text-white font-light tracking-tight mb-1">
                                ₱{totalSpent.toLocaleString()}
                            </span>
                            <span className="text-white/50 font-medium tracking-wide text-sm">
                                ≈ R{(totalSpent * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                            </span>
                            <div className="w-full h-[1px] bg-[#FF453A]/20 my-4" />
                            <div className="flex justify-between w-full text-sm">
                                <span className="text-white/50">Base Target</span>
                                <span className="text-white">₱{targetAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Financial Advice */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-[20px] p-5">
                            <span className="block text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Reality Check</span>
                            <p className="text-white/80 text-sm leading-relaxed italic">
                                "Every extra peso spent today is borrowed from your future peace of mind. Pause, step back, and wait for the next budget cycle to refresh."
                            </p>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
