"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useHouseholdStore } from "@/store/useHouseholdStore";
import { useCartifyStore } from "@/store/useCartifyStore";
import { X, FileText, ChevronRight } from "lucide-react";

interface TemplatePickerSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TemplatePickerSheet({ isOpen, onClose }: TemplatePickerSheetProps) {
    const [mounted, setMounted] = useState(false);
    const { tripTemplates } = useHouseholdStore();
    const { addPlannedItem } = useCartifyStore();

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleSelectTemplate = (items: string[]) => {
        // Add all items from the template to the current planned trip
        items.forEach(item => {
            addPlannedItem(item);
        });
        onClose();
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 z-[9999] pointer-events-auto" 
                    />
                    
                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                        className="fixed bottom-0 left-0 right-0 max-h-[85dvh] bg-gradient-to-b from-[#1C1C1E] to-[#151516] rounded-t-[40px] pt-8 pb-10 px-6 border-t border-white/10 z-[10000] flex flex-col shadow-[0_-20px_40px_rgba(0,0,0,0.5)] pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <div>
                                <h3 className="text-white text-xl font-medium tracking-tight">Use a Template</h3>
                                <p className="text-white/40 text-sm mt-0.5">Quickly start with a saved list.</p>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform">
                                <X className="w-4 h-4 text-white/70" />
                            </button>
                        </div>
                        
                        {/* List */}
                        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
                            {tripTemplates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-4">
                                        <FileText className="w-8 h-8 text-white/20" />
                                    </div>
                                    <p className="text-white/60 text-sm font-medium">No templates yet</p>
                                    <p className="text-white/30 text-xs mt-1 max-w-[220px]">
                                        Finish a planned trip to save it as a reusable template.
                                    </p>
                                </div>
                            ) : (
                                tripTemplates.map((template) => (
                                    <button 
                                        key={template.id}
                                        onClick={() => handleSelectTemplate(template.items)}
                                        className="group w-full bg-white/[0.03] border border-white/[0.06] rounded-[24px] p-4 flex items-center gap-4 hover:bg-white/[0.06] active:scale-[0.98] transition-all text-left"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#30D158]/10 flex items-center justify-center border border-[#30D158]/20 shrink-0">
                                            <FileText className="w-5 h-5 text-[#30D158]" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-white text-[16px] font-medium tracking-wide block">{template.name}</span>
                                            <span className="text-white/40 text-[12px] font-medium tracking-wide">
                                                {template.items.length} items
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                                            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
