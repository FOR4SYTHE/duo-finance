"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useHouseholdStore } from "@/store/useHouseholdStore";
import { useCartifyStore } from "@/store/useCartifyStore";
import { X, FileText, CheckCircle2 } from "lucide-react";

interface SaveTemplatePromptProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmFinish: () => void; // This will trigger the actual `endTrip()`
}

export function SaveTemplatePrompt({ isOpen, onClose, onConfirmFinish }: SaveTemplatePromptProps) {
    const [mounted, setMounted] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [isSaved, setIsSaved] = useState(false);
    
    const { items, saveTemplate } = useCartifyStore();

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
            // Reset state when closed
            setTemplateName("");
            setIsSaved(false);
        };
    }, [isOpen]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const finalName = templateName.trim() || "My Saved Trip";
        
        saveTemplate(finalName);
        
        setIsSaved(true);
        
        // Auto-close and finish trip after a short success delay
        setTimeout(() => {
            onConfirmFinish();
        }, 1200);
    };

    const handleSkip = () => {
        onConfirmFinish();
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                        className="relative w-full max-w-[360px] bg-gradient-to-b from-[#1C1C1E] to-[#151516] border border-white/10 rounded-[32px] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.5)] flex flex-col"
                    >
                        {!isSaved ? (
                            <>
                                <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <X className="w-4 h-4 text-white/70" />
                                </button>
                                
                                <div className="w-12 h-12 rounded-full bg-[#30D158]/10 flex items-center justify-center mb-6 border border-[#30D158]/20 shadow-[0_0_15px_rgba(48,209,88,0.15)]">
                                    <FileText className="w-6 h-6 text-[#30D158]" />
                                </div>
                                
                                <h3 className="text-2xl font-medium text-white mb-2 tracking-tight">Save as Template?</h3>
                                <p className="text-white/50 text-sm mb-6 leading-relaxed">
                                    Save this list to quickly start a new trip next time. Great for weekly groceries or monthly restocks!
                                </p>
                                
                                <form onSubmit={handleSave} className="flex flex-col gap-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={templateName}
                                            onChange={(e) => setTemplateName(e.target.value)}
                                            placeholder="e.g. Weekly Groceries"
                                            className="w-full h-14 rounded-2xl pl-4 pr-4 text-white placeholder-white/30 outline-none transition-all duration-300 text-[15px] bg-black/30 border border-white/10 focus:border-[#30D158]/50 focus:bg-black/50"
                                            autoFocus
                                        />
                                    </div>
                                    
                                    <button 
                                        type="submit"
                                        className="w-full h-14 rounded-full bg-[#30D158] text-black font-semibold text-[16px] tracking-wide flex items-center justify-center hover:bg-[#30D158]/90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(48,209,88,0.3)]"
                                    >
                                        Save & Finish Trip
                                    </button>
                                </form>
                                
                                <button 
                                    onClick={handleSkip}
                                    className="w-full mt-4 h-12 rounded-full bg-transparent text-white/40 font-medium text-sm hover:text-white/80 active:scale-[0.98] transition-all"
                                >
                                    Skip & Clear Trip
                                </button>
                            </>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-8 text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-[#30D158]/20 flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-[#30D158]" />
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2">Saved!</h3>
                                <p className="text-white/50 text-sm">Finishing trip...</p>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
