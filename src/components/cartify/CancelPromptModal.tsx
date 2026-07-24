"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCartifyStore, CartifyMode } from "@/store/useCartifyStore";

interface CancelPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    mode: CartifyMode;
}

export function CancelPromptModal({ isOpen, onClose, onConfirm, mode }: CancelPromptModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Lock body scroll when modal is open
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    if (!mounted) return null;

    // Determine the mascot image based on the mode
    const getMascotImage = () => {
        switch (mode) {
            case 'simple':
                return "/mascot/flat/difu-leaving-simple.webp";
            case 'unplanned':
                return "/mascot/flat/difu-leaving-unplanned.webp";
            case 'planned':
                return "/mascot/flat/difu-leaving-planned.webp";
            default:
                return "/mascot/flat/difu-leaving-simple.webp";
        }
    };

    const getModeText = () => {
        switch (mode) {
            case 'simple':
                return "You are ending a Simple Logging session.";
            case 'unplanned':
                return "You are ending an On-the-fly tracking session.";
            case 'planned':
                return "You are ending your Pre-planned trip.";
            default:
                return "You are ending this session.";
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80" 
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
                        className="relative w-full max-w-[340px] mx-6 bg-gradient-to-b from-[#1C1C1E] to-[#151516] border border-white/10 rounded-[32px] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center text-center"
                    >
                    {/* Ambient glow */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-[50px] pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#30D158]/5 rounded-full blur-[50px] pointer-events-none" />

                    <div className="relative w-32 h-32 mb-4 drop-shadow-xl z-10 flex items-center justify-center">
                        {/* 
                          Since the images are not generated yet, we use an img tag with an onError handler 
                          that falls back to a div if the image doesn't exist to avoid ugly broken images.
                          Or just rely on the user generating them shortly.
                        */}
                        <img 
                            src={getMascotImage()} 
                            alt={`Difu waving goodbye from ${mode} mode`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                // Fallback to safe state if leaving state isn't generated yet
                                (e.target as HTMLImageElement).src = "/mascot/difu-safe.webp";
                            }}
                        />
                    </div>

                    <h3 className="text-2xl font-light text-white mb-2 tracking-tight relative z-10">End Trip?</h3>
                    <p className="text-white/50 text-sm mb-1 leading-relaxed relative z-10">
                        {getModeText()}
                    </p>
                    <p className="text-white/40 text-xs mb-8 leading-relaxed relative z-10 max-w-[260px]">
                        Are you sure you want to leave? Your current cart and budget progress will be lost.
                    </p>
                    
                    <div className="flex flex-col gap-3 w-full relative z-10">
                        {mode === 'unplanned' && (
                            <button 
                                onClick={() => {
                                    useCartifyStore.getState().setActiveCategory(null);
                                    onClose();
                                }}
                                className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium transition-colors border border-white/10 shadow-[0_4px_12px_rgba(255,255,255,0.05)] active:scale-[0.98]"
                            >
                                Change Category
                            </button>
                        )}
                        {mode === 'planned' && (
                            <button 
                                onClick={() => {
                                    useCartifyStore.getState().resumeBuildingList();
                                    onClose();
                                }}
                                className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium transition-colors border border-white/10 shadow-[0_4px_12px_rgba(255,255,255,0.05)] active:scale-[0.98]"
                            >
                                Edit Shopping List
                            </button>
                        )}
                        <button 
                            onClick={() => {
                                onClose();
                                onConfirm();
                            }}
                            className="w-full py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium transition-colors border border-red-500/20 shadow-[0_4px_12px_rgba(239,68,68,0.1)] active:scale-[0.98]"
                        >
                            Yes, End Trip
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full py-4 rounded-2xl bg-transparent hover:bg-white/5 text-white/50 hover:text-white font-medium transition-colors active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
