"use client";

import { useState } from "react";
import { useCartifyStore, CartifyMode } from "@/store/useCartifyStore";
import { Delete, ChevronRight, Check } from "lucide-react";

export function TripSetup() {
    const { startTrip } = useCartifyStore();
    const [displayValue, setDisplayValue] = useState("0");
    const [selectedMode, setSelectedMode] = useState<CartifyMode>("simple");

    const appendInput = (char: string) => {
        if (displayValue === "0" && char !== ".") {
            setDisplayValue(char);
        } else {
            setDisplayValue(prev => prev + char);
        }
    };

    const deleteLast = () => {
        if (displayValue.length <= 1) {
            setDisplayValue("0");
        } else {
            setDisplayValue(prev => prev.slice(0, -1));
        }
    };

    const handleConfirm = () => {
        const budget = parseFloat(displayValue);
        if (budget > 0) {
            startTrip(budget, selectedMode);
        }
    };

    const buttons = [
        { label: "1", type: "num" }, { label: "2", type: "num" }, { label: "3", type: "num" },
        { label: "4", type: "num" }, { label: "5", type: "num" }, { label: "6", type: "num" },
        { label: "7", type: "num" }, { label: "8", type: "num" }, { label: "9", type: "num" },
        { label: ".", type: "num" }, { label: "0", type: "num" }, { label: "⌫", type: "meta" },
    ];

    return (
        <div className="flex flex-col w-full h-full relative z-20 overflow-y-auto no-scrollbar pb-10">
            <h2 className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-4 text-center">Set Trip Budget</h2>
            
            <div className="flex flex-col items-center justify-center mb-6">
                <div className="text-[4rem] leading-none text-white flex items-center justify-center gap-2 mb-2 font-light tracking-tight">
                    <span className="text-3xl text-white/40 mr-1">₱</span>
                    <span>{displayValue || "0"}</span>
                </div>
            </div>

            <div className="flex flex-col gap-2 mb-8">
                <span className="text-white/50 text-[10px] font-semibold tracking-widest uppercase mb-1 px-1">Mode</span>
                
                {(['simple', 'unplanned', 'planned'] as CartifyMode[]).map(mode => (
                    <button 
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                            selectedMode === mode 
                                ? 'bg-white/10 border-white/20' 
                                : 'bg-white/[0.02] border-white/[0.03] hover:bg-white/[0.05]'
                        }`}
                    >
                        <div className="flex flex-col items-start text-left">
                            <span className="text-white text-sm font-medium capitalize">
                                {mode === 'unplanned' ? 'Organized (On the fly)' : mode === 'planned' ? 'Organized (Pre-planned)' : 'Simple'}
                            </span>
                            <span className="text-white/50 text-xs mt-0.5">
                                {mode === 'simple' && "Fastest way to just log prices."}
                                {mode === 'unplanned' && "Categorize as you shop."}
                                {mode === 'planned' && "Build a list before you go."}
                            </span>
                        </div>
                        {selectedMode === mode && (
                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                <Check className="w-4 h-4 text-black" strokeWidth={3} />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {buttons.map((btn) => (
                    <button
                        key={btn.label}
                        onClick={() => btn.label === "⌫" ? deleteLast() : appendInput(btn.label)}
                        className={`
                            h-[64px] rounded-[20px] flex items-center justify-center text-[24px] font-light transition-all duration-200 bg-white/[0.03] hover:bg-white/[0.08] active:scale-[0.96] border border-white/[0.02] backdrop-blur-md
                            ${btn.type === "num" ? "text-white" : "text-white/50"}
                        `}
                    >
                        {btn.label === "⌫" ? <Delete className="w-5 h-5" strokeWidth={1.5} /> : btn.label}
                    </button>
                ))}
            </div>

            <button
                onClick={handleConfirm}
                disabled={parseFloat(displayValue) <= 0}
                className="w-full h-[60px] rounded-full bg-white text-black font-semibold text-base tracking-wide flex items-center justify-between px-6 hover:opacity-90 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:scale-100 group"
            >
                <span className="pl-2">Start Trip</span>
                <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                </div>
            </button>
        </div>
    );
}
