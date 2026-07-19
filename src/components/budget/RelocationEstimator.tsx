"use client";
import { useState } from "react";
import { ChevronDown, MapPin, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COST_DATA = {
    'Makati / BGC': { baseRent: 15000, rentPerExtraAdult: 5000, baseUtilities: 3000, utilPerExtraAdult: 1000 },
    'Quezon City': { baseRent: 10000, rentPerExtraAdult: 4000, baseUtilities: 2500, utilPerExtraAdult: 800 },
    'Ortigas': { baseRent: 12000, rentPerExtraAdult: 4500, baseUtilities: 2800, utilPerExtraAdult: 900 },
    'Provincial': { baseRent: 6000, rentPerExtraAdult: 2000, baseUtilities: 1500, utilPerExtraAdult: 500 },
} as const;

type Area = keyof typeof COST_DATA;
const AREAS = Object.keys(COST_DATA) as Area[];

interface RelocationEstimatorProps {
    onUseEstimate: (rent: number, utilities: number) => void;
}

export function RelocationEstimator({ onUseEstimate }: RelocationEstimatorProps) {
    const [adults, setAdults] = useState(2);
    const [area, setArea] = useState<Area>('Makati / BGC');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const [estimate, setEstimate] = useState<{ rent: number, utilities: number } | null>(null);

    const handleCalculate = () => {
        const data = COST_DATA[area];
        const extraAdults = Math.max(0, adults - 1);
        
        const rent = data.baseRent + (data.rentPerExtraAdult * extraAdults);
        const utilities = data.baseUtilities + (data.utilPerExtraAdult * extraAdults);
        
        setEstimate({ rent, utilities });
    };

    return (
        <div className="w-full rounded-[32px] p-6 mb-8 bg-white/[0.02] border border-white/[0.03] relative z-20 overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                    <span className="text-white font-medium">Relocation Estimator</span>
                    <span className="text-white/50 text-xs tracking-wide">Plan initial setup costs</span>
                </div>
            </div>

            <div className="flex flex-col gap-4 relative">
                <div className="flex justify-between items-center bg-black/40 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-white/40" />
                        <span className="text-white/70 text-sm">Adults</span>
                    </div>

                    {/* Abstract Illustrated Row */}
                    <div className="flex flex-1 items-end gap-1.5 px-4 justify-end opacity-40">
                        <AnimatePresence mode="popLayout">
                            {Array.from({ length: adults }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, height: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, height: i % 2 === 0 ? 20 : 16, scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.5 }}
                                    className="w-2.5 bg-white rounded-full flex-shrink-0"
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-4 ml-auto shrink-0">
                        <button 
                            onClick={() => { setAdults(Math.max(1, adults - 1)); setEstimate(null); }}
                            className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/50 hover:bg-white/[0.1] hover:text-white transition-colors shrink-0"
                        >-</button>
                        <span className="text-white font-medium w-4 text-center shrink-0">{adults}</span>
                        <button 
                            onClick={() => { setAdults(adults + 1); setEstimate(null); }}
                            className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center text-white hover:bg-white/[0.15] transition-colors shrink-0"
                        >+</button>
                    </div>
                </div>

                <div className="relative">
                    <div 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex justify-between items-center bg-black/40 rounded-2xl p-4 cursor-pointer hover:bg-black/60 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-white/40" />
                            <span className="text-white/70 text-sm">Target Area</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <span className="font-medium text-sm">{area}</span>
                            <ChevronDown className="w-4 h-4 text-white/50" />
                        </div>
                    </div>
                    
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden z-30"
                            >
                                {AREAS.map(a => (
                                    <button 
                                        key={a}
                                        onClick={() => { setArea(a); setIsDropdownOpen(false); setEstimate(null); }}
                                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${a === area ? 'bg-white/10 text-white font-medium' : 'text-white/70 hover:bg-white/5'}`}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <AnimatePresence mode="wait">
                    {!estimate ? (
                        <motion.button 
                            key="calc-btn"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCalculate}
                            className="w-full mt-2 h-14 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.05] text-white font-medium transition-all text-sm"
                        >
                            Calculate Estimate
                        </motion.button>
                    ) : (
                        <motion.div 
                            key="result"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-4 pt-4 border-t border-white/[0.05] flex flex-col gap-4"
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-white/50 text-xs uppercase tracking-wider font-bold">Suggested Base Rent</span>
                                <span className="text-white font-medium">₱{estimate.rent.toLocaleString()} / mo</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/50 text-xs uppercase tracking-wider font-bold">Est. Utilities</span>
                                <span className="text-white font-medium">₱{estimate.utilities.toLocaleString()} / mo</span>
                            </div>
                            
                            <button 
                                onClick={() => {
                                    onUseEstimate(estimate.rent, estimate.utilities);
                                    setEstimate(null); // Reset after using
                                }}
                                className="w-full mt-2 h-14 rounded-full bg-white text-black hover:bg-gray-200 font-semibold transition-all text-sm"
                            >
                                Use this estimate
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
