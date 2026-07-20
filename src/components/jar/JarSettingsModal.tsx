"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings2, Sparkles } from "lucide-react";
import { useBudgetStore } from "@/store/useBudgetStore";

interface JarSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function JarSettingsModal({ isOpen, onClose }: JarSettingsModalProps) {
    const { config, setJarPercentage } = useBudgetStore();
    const [percentage, setPercentage] = useState<string>("");

    useEffect(() => {
        if (isOpen) {
            setPercentage((config.jarAllowedPercentage || 20).toString());
        }
    }, [isOpen, config.jarAllowedPercentage]);

    const handleConfirm = () => {
        const parsed = parseInt(percentage);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
            setJarPercentage(parsed);
            onClose();
        }
    };

    // Calculate smart suggestion (e.g., 20% of the target amount)
    const suggestedPercentage = 20;
    const suggestedAmount = config.targetAmount * (suggestedPercentage / 100);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 28, stiffness: 300 } }}
                        exit={{ opacity: 0, scale: 0.95, y: 20, transition: { type: "tween", duration: 0.2, ease: "easeIn" } }}
                        className="w-full max-w-md bg-[#1a1a1a] rounded-[32px] p-6 border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative z-10"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center">
                                        <Settings2 className="w-5 h-5 text-white/70" />
                                    </div>
                                    <h2 className="text-xl font-medium text-white tracking-tight">Jar Settings</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                                >
                                    <X className="w-4 h-4 text-white/50" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-6">
                                {/* Percentage Input */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-white/50 text-xs font-bold uppercase tracking-widest pl-2">
                                        Allowed Extra Spend (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={percentage}
                                            onChange={(e) => setPercentage(e.target.value)}
                                            className="w-full bg-black/50 border border-white/[0.08] rounded-2xl px-6 py-4 text-2xl font-light text-white focus:outline-none focus:border-white/20 transition-colors"
                                            placeholder="20"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 text-2xl font-light">
                                            %
                                        </div>
                                    </div>
                                </div>

                                {/* Smart Suggestion */}
                                <button 
                                    onClick={() => setPercentage(suggestedPercentage.toString())}
                                    className="w-full bg-[#30D158]/10 border border-[#30D158]/20 rounded-2xl p-4 flex flex-col gap-1 items-start hover:bg-[#30D158]/20 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="w-4 h-4 text-[#30D158]" />
                                        <span className="text-[#30D158] text-xs font-bold uppercase tracking-widest">Smart Suggestion</span>
                                    </div>
                                    <span className="text-white/80 text-sm leading-relaxed">
                                        Set to <span className="font-bold text-white">{suggestedPercentage}%</span> of your {config.period} budget.
                                    </span>
                                    <span className="text-white/40 text-xs mt-1">
                                        (₱{suggestedAmount.toLocaleString()} allowed)
                                    </span>
                                </button>

                                {/* Action Button */}
                                <button
                                    onClick={handleConfirm}
                                    disabled={!percentage}
                                    className="w-full h-[60px] rounded-full bg-white text-black font-semibold text-lg tracking-wide flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                >
                                    Save Settings
                                </button>
                            </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
