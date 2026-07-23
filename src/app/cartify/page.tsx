"use client";

import { useState } from "react";
import { useCartifyStore } from "@/store/useCartifyStore";
import { TripSetup } from "@/components/cartify/TripSetup";
import { PlannedListBuilder } from "@/components/cartify/PlannedListBuilder";
import { LiveTripTracker } from "@/components/cartify/LiveTripTracker";
import { ReceiptView } from "@/components/cartify/ReceiptView";
import { CancelPromptModal } from "@/components/cartify/CancelPromptModal";
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

    const { isActive, isBuildingList, isReceiptView, endTrip, mode } = useCartifyStore();
    const [showCancelPrompt, setShowCancelPrompt] = useState(false);

    return (
        <motion.div 
            key={isInitialLoad ? "animate" : "static"}
            variants={containerVariants}
            initial={isInitialLoad ? "hidden" : false}
            animate="visible"
            className="flex flex-col w-full min-h-full px-6 pt-12 pb-32 relative"
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
            <motion.div variants={itemVariants} className="flex-1 flex flex-col relative z-20 min-h-[min-content]">
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

            <CancelPromptModal 
                isOpen={showCancelPrompt}
                onClose={() => setShowCancelPrompt(false)}
                onConfirm={() => {
                    setShowCancelPrompt(false);
                    endTrip();
                }}
                mode={mode}
            />
        </motion.div>
    );
}
