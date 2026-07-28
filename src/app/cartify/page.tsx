"use client";

import { useState } from "react";
import { useCartifyStore, CartifyMode } from "@/store/useCartifyStore";
import { TripSetup } from "@/components/cartify/TripSetup";
import { PlannedListBuilder } from "@/components/cartify/PlannedListBuilder";
import { LiveTripTracker } from "@/components/cartify/LiveTripTracker";
import { ReceiptView } from "@/components/cartify/ReceiptView";
import { CancelPromptModal } from "@/components/cartify/CancelPromptModal";
import { MoreHorizontal, X, ChevronDown, Zap, ShoppingCart, ListTodo } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { premiumPageVariants } from "@/utils/animations";
import { useEffect } from "react";

export default function CartifyPage() {
    // Always animate on mount for a premium page transition feel

    const { isActive, isBuildingList, isReceiptView, endTrip, mode, setMode } = useCartifyStore();
    const [showCancelPrompt, setShowCancelPrompt] = useState(false);
    const [showModeSelector, setShowModeSelector] = useState(false);

    return (
        <div className="flex flex-col w-full min-h-full px-6 pt-12 pb-32 relative">
            
            {/* Header Area */}
            <div className="flex justify-between items-start mb-8 relative z-30 shrink-0">
                <div className="flex flex-col relative">
                    <div 
                        className="flex items-center gap-2 cursor-pointer group select-none"
                        onClick={() => isActive && !isReceiptView && setShowModeSelector(!showModeSelector)}
                    >
                        <h1 className="text-3xl text-white font-light tracking-tight">Cartify</h1>
                        {isActive && !isReceiptView && (
                            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full group-hover:bg-white/10 transition-colors mt-2">
                                <span className="text-white/70 text-xs font-medium tracking-wide">
                                    {mode === 'simple' ? 'Quick Trip' : 'Planned Trip'}
                                </span>
                                <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${showModeSelector ? 'rotate-180' : ''}`} />
                            </div>
                        )}
                    </div>

                    {/* Mode Dropdown */}
                    <AnimatePresence>
                        {showModeSelector && isActive && !isReceiptView && (
                            <>
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowModeSelector(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    className="absolute top-full left-0 mt-3 w-[200px] bg-[#111] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden z-50 flex flex-col p-1.5"
                                >
                                    {[
                                        { id: 'simple', label: 'Quick Trip', desc: 'Prices only', icon: Zap },
                                        { id: 'planned', label: 'Planned Trip', desc: 'Pre-build list', icon: ListTodo }
                                    ].map(m => {
                                        const Icon = m.icon;
                                        const isSelected = mode === m.id;
                                        return (
                                            <button
                                                key={m.id}
                                                onClick={() => {
                                                    setMode(m.id as CartifyMode);
                                                    setShowModeSelector(false);
                                                }}
                                                className={`flex items-center gap-3 p-3 rounded-[20px] text-left transition-colors ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#30D158]/20 text-[#30D158]' : 'bg-white/5 text-white/40'}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>{m.label}</span>
                                                    <span className="text-[9px] text-white/40 uppercase tracking-widest leading-none mt-0.5">{m.desc}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {isActive && !isReceiptView && (
                    <button 
                        onClick={() => setShowCancelPrompt(true)}
                        className="w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.08] transition-colors shrink-0"
                        title="Cancel Trip"
                    >
                        <X className="w-5 h-5 text-white/70" />
                    </button>
                )}
            </div>

            {/* Smart Container Rendering */}
            <div className="flex-1 flex flex-col relative z-20 min-h-[min-content]">
                {isReceiptView ? (
                    <ReceiptView />
                ) : !isActive ? (
                    <TripSetup />
                ) : isBuildingList ? (
                    <PlannedListBuilder />
                ) : (
                    <LiveTripTracker />
                )}
            </div>

            <CancelPromptModal 
                isOpen={showCancelPrompt}
                onClose={() => setShowCancelPrompt(false)}
                onConfirm={() => {
                    setShowCancelPrompt(false);
                    endTrip();
                }}
                mode={mode}
            />
        </div>
    );
}
