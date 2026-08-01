"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useHouseholdStore } from "@/store/useHouseholdStore";
import { useCartifyStore } from "@/store/useCartifyStore";
import { X, Calendar as CalendarIcon, Store } from "lucide-react";

interface ScheduleTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveComplete?: () => void;
}

export function ScheduleTripModal({ isOpen, onClose, onSaveComplete }: ScheduleTripModalProps) {
    const [mounted, setMounted] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [storeName, setStoreName] = useState("");
    
    const { scheduleTrip } = useHouseholdStore();
    const { items, budget } = useCartifyStore();

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
            setStoreName("");
            setSelectedDate(new Date());
        };
    }, [isOpen]);

    // Generate next 14 days
    const next14Days = Array.from({ length: 14 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        scheduleTrip({
            id: `scheduled-${Date.now()}`,
            date: selectedDate.toISOString(),
            // Only tracking the estimated budget for now based on what's in their planned cart
            estimatedBudgetPHP: budget > 0 ? budget : undefined,
        });
        
        onClose();
        if (onSaveComplete) onSaveComplete();
    };

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
                        className="absolute inset-0 bg-[#0A0A0A]/95" 
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full sm:w-[400px] bg-gradient-to-b from-[#1C1C1E] to-[#151516] border-t sm:border border-white/10 sm:rounded-[32px] rounded-t-[32px] p-6 shadow-[0_-20px_48px_rgba(0,0,0,0.5)] flex flex-col pb-10 sm:pb-6"
                    >
                        <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                            <X className="w-4 h-4 text-white/70" />
                        </button>
                        
                        <div className="w-12 h-12 rounded-full bg-[#30D158]/10 flex items-center justify-center mb-6 border border-[#30D158]/20 shadow-[0_0_15px_rgba(48,209,88,0.15)]">
                            <CalendarIcon className="w-6 h-6 text-[#30D158]" />
                        </div>
                        
                        <h3 className="text-2xl font-medium text-white mb-1 tracking-tight">Schedule Trip</h3>
                        <p className="text-white/50 text-sm mb-6 leading-relaxed">
                            Set a date for this trip. It will appear on your Home Screen calendar.
                        </p>
                        
                        <form onSubmit={handleSave} className="flex flex-col gap-6">
                            
                            {/* Horizontal Date Picker */}
                            <div className="flex flex-col gap-3">
                                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest pl-1">Select Date</span>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1 -mx-1 snap-x">
                                    {next14Days.map((date, i) => {
                                        const isSelected = date.toDateString() === selectedDate.toDateString();
                                        const isToday = i === 0;
                                        
                                        return (
                                            <button
                                                key={date.toISOString()}
                                                type="button"
                                                onClick={() => setSelectedDate(date)}
                                                className={`snap-start shrink-0 flex flex-col items-center justify-center w-[60px] h-[72px] rounded-2xl border transition-all active:scale-[0.92] ${
                                                    isSelected 
                                                        ? 'bg-[#30D158] border-[#30D158] shadow-[0_0_15px_rgba(48,209,88,0.3)] text-black' 
                                                        : 'bg-black/30 border-white/10 text-white hover:bg-black/50'
                                                }`}
                                            >
                                                <span className={`text-[10px] font-medium tracking-wide uppercase mb-1 ${isSelected ? 'text-black/60' : 'text-white/40'}`}>
                                                    {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                </span>
                                                <span className="text-xl font-medium">
                                                    {date.getDate()}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Optional Store Name */}
                            <div className="flex flex-col gap-3">
                                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest pl-1">Store Name (Optional)</span>
                                <div className="relative flex items-center">
                                    <Store className="absolute left-4 w-4 h-4 text-white/40" />
                                    <input
                                        type="text"
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        placeholder="e.g. S&R, Landers, SM"
                                        className="w-full h-14 rounded-2xl pl-11 pr-4 text-white placeholder-white/30 outline-none transition-all duration-300 text-[15px] bg-black/30 border border-white/10 focus:border-[#30D158]/50 focus:bg-black/50"
                                    />
                                </div>
                            </div>
                            
                            <button 
                                type="submit"
                                className="w-full mt-2 h-14 rounded-full bg-white text-black font-semibold text-[16px] tracking-wide flex items-center justify-center hover:bg-white/90 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
                            >
                                Save Scheduled Trip
                            </button>
                        </form>
                        
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
