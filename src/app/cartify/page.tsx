"use client";

import { useState } from "react";
import { useCartifyStore } from "@/store/useCartifyStore";
import { TripSetup } from "@/components/cartify/TripSetup";
import { PlannedListBuilder } from "@/components/cartify/PlannedListBuilder";
import { LiveTripTracker } from "@/components/cartify/LiveTripTracker";
import { ReceiptView } from "@/components/cartify/ReceiptView";
import { MoreHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/utils/animations";
import { useEffect } from "react";

export default function CartifyPage() {
    const [isInitialLoad, setIsInitialLoad] = useState(false);
    useEffect(() => {
        if (!sessionStorage.getItem('hasSeenCartifyAnimation')) {
            setIsInitialLoad(true);
            sessionStorage.setItem('hasSeenCartifyAnimation', 'true');
        }
    }, []);

    const { isActive, isBuildingList, isReceiptView, endTrip } = useCartifyStore();
    const [showCancelPrompt, setShowCancelPrompt] = useState(false);

    return (
        <motion.div 
            key={isInitialLoad ? "animate" : "static"}
            variants={containerVariants}
            initial={isInitialLoad ? "hidden" : false}
            animate="visible"
            className="flex flex-col w-full h-full px-6 pt-12 pb-8 relative"
        >
            
            {/* Header Area */}
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-8 relative z-20 shrink-0">
                <h1 className="text-3xl text-white font-light tracking-tight">Cartify</h1>
                {isActive && !isReceiptView && (
                    <button 
                        onClick={() => setShowCancelPrompt(true)}
                        className="w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.08] transition-colors"
                        title="Cancel Trip"
                    >
                        <X className="w-5 h-5 text-white/70" />
                    </button>
                )}
            </motion.div>

            {/* Smart Container Rendering */}
            <motion.div variants={itemVariants} className="flex-1 overflow-hidden flex flex-col relative z-20">
                {isReceiptView ? (
                    <ReceiptView />
                ) : !isActive ? (
                    <TripSetup />
                ) : isBuildingList ? (
                    <PlannedListBuilder />
                ) : (
                    <LiveTripTracker />
                )}
            </motion.div>

            <AnimatePresence>
                {showCancelPrompt && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCancelPrompt(false)}
                            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="absolute z-50 left-6 right-6 top-[30%] bg-[#1C1C1E] border border-white/10 p-6 rounded-3xl shadow-2xl"
                        >
                            <h3 className="text-xl font-medium text-white mb-2 tracking-tight">End Trip?</h3>
                            <p className="text-white/50 text-sm mb-6 leading-relaxed">
                                Are you sure you want to end this trip? You'll lose this active session and return to the setup screen.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowCancelPrompt(false)}
                                    className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                                >
                                    Keep Shopping
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowCancelPrompt(false);
                                        endTrip();
                                    }}
                                    className="flex-1 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium transition-colors border border-red-500/20"
                                >
                                    End Trip
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
