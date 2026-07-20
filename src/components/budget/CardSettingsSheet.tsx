"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useState, useEffect } from "react";

interface CardSettingsSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const SKINS = [
    { id: 'default-dark', name: 'Standard Dark' },
    { id: 'apple-titanium', name: 'Apple Titanium' },
    { id: 'revolut-metal', name: 'Revolut Metal' },
    { id: 'amex-platinum', name: 'Amex Platinum' }
];

export function CardSettingsSheet({ isOpen, onClose }: CardSettingsSheetProps) {
    const { config, setCardSkin, setCardName } = useBudgetStore();
    const [tempName, setTempName] = useState(config.cardName || 'BL');

    useEffect(() => {
        if (isOpen) {
            setTempName(config.cardName || 'BL');
        }
    }, [isOpen, config.cardName]);

    const handleSave = () => {
        setCardName(tempName.trim() || 'BL');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0, transition: { type: "spring", damping: 28, stiffness: 300 } }}
                        exit={{ y: "100%", transition: { type: "tween", duration: 0.2, ease: "easeIn" } }}
                        className="w-full max-w-md bg-[#111] sm:rounded-[32px] rounded-t-[32px] border border-white/10 p-6 relative z-10 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-medium">Card Customization</h3>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-white/50 text-xs font-semibold tracking-widest uppercase">Card Name</label>
                                <input 
                                    type="text"
                                    maxLength={20}
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value.toUpperCase())}
                                    placeholder="E.g. BL"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-white/30 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-1">Premium Skin</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {SKINS.map(skin => (
                                        <button
                                            key={skin.id}
                                            onClick={() => setCardSkin(skin.id)}
                                            className={`relative h-20 rounded-xl border flex items-end p-3 transition-all ${
                                                config.cardSkin === skin.id 
                                                    ? 'border-white/50 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                            }`}
                                        >
                                            <span className={`text-sm font-medium ${config.cardSkin === skin.id ? 'text-white' : 'text-white/60'}`}>
                                                {skin.name}
                                            </span>
                                            {config.cardSkin === skin.id && (
                                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white text-black flex items-center justify-center">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleSave}
                                className="w-full py-4 mt-2 rounded-xl bg-white text-black font-semibold tracking-wide hover:bg-white/90 transition-colors"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
