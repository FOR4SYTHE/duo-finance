"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Layers, ShoppingCart, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { useCartifyStore, SavedTrip } from "@/store/useCartifyStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";

interface SavedTripsSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SavedTripsSheet({ isOpen, onClose }: SavedTripsSheetProps) {
    const [mounted, setMounted] = useState(false);
    const { savedTrips, resumeSpecificTrip, deleteSavedTrip } = useCartifyStore();
    const { primaryCurrency, exchangeRate } = useCurrencyStore();

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center pointer-events-auto">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full sm:w-[400px] bg-gradient-to-b from-[#1C1C1E] to-[#151516] border-t sm:border border-white/10 sm:rounded-[32px] rounded-t-[32px] p-6 shadow-[0_-20px_48px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]"
                    >
                        {/* Drag Handle */}
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 shrink-0" />

                        <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0">
                            <X className="w-4 h-4 text-white/70" />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6 shrink-0">
                            <div className="w-10 h-10 rounded-full bg-[#30D158]/10 flex items-center justify-center border border-[#30D158]/20 shadow-[0_0_15px_rgba(48,209,88,0.15)]">
                                <Layers className="w-5 h-5 text-[#30D158]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-white tracking-tight">Saved Trips</h3>
                                <p className="text-white/50 text-xs">Resume where you left off</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar pb-6 flex-1">
                            {savedTrips.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <ShoppingCart className="w-12 h-12 text-white/10 mb-4" />
                                    <p className="text-white/40 text-sm">No saved trips found</p>
                                </div>
                            ) : (
                                savedTrips.map((trip: SavedTrip) => {
                                    const date = new Date(trip.date);
                                    const isPhpPrimary = primaryCurrency === 'PHP';
                                    const displayBudget = isPhpPrimary 
                                        ? `₱${trip.budget.toLocaleString()}` 
                                        : `R${(trip.budget / exchangeRate).toFixed(2)}`;
                                    const secondaryBudget = isPhpPrimary 
                                        ? `R${(trip.budget / exchangeRate).toFixed(2)}` 
                                        : `₱${trip.budget.toLocaleString()}`;

                                    return (
                                        <div key={trip.id} className="relative group bg-white/5 border border-white/5 rounded-[20px] p-4 flex flex-col gap-4 overflow-hidden">
                                            {/* Top info */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium text-[15px] mb-1">
                                                        {trip.mode === 'planned' ? 'Planned List' : 'Quick Trip'}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-white/40 text-[11px] font-bold uppercase tracking-wider">
                                                        <CalendarIcon className="w-3 h-3" />
                                                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end text-right">
                                                    <span className="text-[#30D158] font-bold text-[15px]">{displayBudget}</span>
                                                    <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{secondaryBudget}</span>
                                                </div>
                                            </div>

                                            {/* Bottom row (items & actions) */}
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="bg-white/5 px-2.5 py-1 rounded border border-white/5 flex items-center gap-1.5">
                                                    <ShoppingCart className="w-3 h-3 text-white/60" />
                                                    <span className="text-white/70 text-[11px] font-medium">{trip.items.length} items</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => deleteSavedTrip(trip.id)}
                                                        className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20 active:scale-95 transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            resumeSpecificTrip(trip.id);
                                                            onClose();
                                                        }}
                                                        className="px-5 py-1.5 rounded-full bg-[#30D158] text-black text-[12px] font-bold tracking-wide active:scale-95 transition-all hover:bg-[#30D158]/90"
                                                    >
                                                        Resume
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
