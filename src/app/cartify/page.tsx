"use client";

import { useCartifyStore } from "@/store/useCartifyStore";
import { TripSetup } from "@/components/cartify/TripSetup";
import { PlannedListBuilder } from "@/components/cartify/PlannedListBuilder";
import { LiveTripTracker } from "@/components/cartify/LiveTripTracker";
import { MoreHorizontal } from "lucide-react";

export default function CartifyPage() {
    const { isActive, isBuildingList, endTrip } = useCartifyStore();

    return (
        <div className="flex flex-col w-full h-full px-6 pt-12 pb-8 relative">
            
            {/* Header Area */}
            <div className="flex justify-between items-center mb-8 relative z-20 shrink-0">
                <h1 className="text-3xl text-white font-light tracking-tight">Cartify</h1>
                {isActive && (
                    <button 
                        onClick={() => {
                            if (window.confirm("Are you sure you want to end this trip?")) {
                                endTrip();
                            }
                        }}
                        className="w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.08] transition-colors"
                        title="End Trip"
                    >
                        <MoreHorizontal className="w-5 h-5 text-white/70" />
                    </button>
                )}
            </div>

            {/* Smart Container Rendering */}
            <div className="flex-1 overflow-hidden flex flex-col relative z-20">
                {!isActive ? (
                    <TripSetup />
                ) : isBuildingList ? (
                    <PlannedListBuilder />
                ) : (
                    <LiveTripTracker />
                )}
            </div>

        </div>
    );
}
