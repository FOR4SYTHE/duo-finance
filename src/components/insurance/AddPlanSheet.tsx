"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ScanLine, Keyboard, Sparkles } from "lucide-react";

interface AddPlanSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectManual: () => void;
    onSelectScan?: () => void;
}

export function AddPlanSheet({ isOpen, onClose, onSelectManual, onSelectScan }: AddPlanSheetProps) {
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                        className="absolute inset-0 bg-black/95"
                    />
                    
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0, transition: { type: "spring", damping: 28, stiffness: 300 } }}
                        exit={{ y: "100%", transition: { type: "tween", duration: 0.2, ease: "easeIn" } }}
                        className="w-full max-w-md bg-[#111] sm:rounded-[32px] rounded-t-[32px] border border-white/10 p-6 relative z-10 flex flex-col will-change-transform"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-white font-bold text-xl tracking-tight">Add a Plan</h3>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4 mb-4">
                            {/* Hidden Native Camera/File Input */}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                accept="image/*,application/pdf" 
                                capture="environment" 
                                className="hidden" 
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        if (onSelectScan) {
                                            onSelectScan();
                                        } else {
                                            onClose();
                                        }
                                    }
                                }} 
                            />

                            {/* AI Scan Option (Primary) */}
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full relative overflow-hidden rounded-[24px] p-6 text-left group transition-all active:scale-[0.98]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 border border-[#D4AF37]/30 rounded-[24px]" />
                                
                                <div className="relative z-10 flex gap-5 items-center">
                                    <div className="w-14 h-14 rounded-full bg-[#D4AF37]/20 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                                        <ScanLine className="w-7 h-7 text-[#D4AF37]" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-bold text-[17px]">AI Document Scan</span>
                                            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        </div>
                                        <span className="text-white/50 text-[13px] font-medium leading-relaxed max-w-[200px]">
                                            Take a photo of your policy. We'll extract the details instantly.
                                        </span>
                                    </div>
                                </div>
                            </button>

                            {/* Manual Entry Option (Secondary) */}
                            <button 
                                onClick={() => {
                                    onClose();
                                    setTimeout(onSelectManual, 200); // slight delay to allow closing animation
                                }}
                                className="w-full relative rounded-[24px] p-6 text-left group transition-all active:scale-[0.98] bg-white/5 hover:bg-white/10 border border-white/5"
                            >
                                <div className="relative z-10 flex gap-5 items-center">
                                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                        <Keyboard className="w-7 h-7 text-white/50" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-white font-bold text-[17px]">Manual Input</span>
                                        <span className="text-white/50 text-[13px] font-medium leading-relaxed max-w-[200px]">
                                            Type your coverage limits and provider details by hand.
                                        </span>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
