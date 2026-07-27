"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check } from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatCurrency } from "@/lib/format";

interface ManualInputSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (policyData: any) => void;
}

const POLICY_TYPES = ['Health / HMO', 'Life Insurance', 'VUL / Investment', 'Property', 'Vehicle'];

export function ManualInputSheet({ isOpen, onClose, onSave }: ManualInputSheetProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { exchangeRate } = useCurrencyStore();
    const [provider, setProvider] = useState('');
    const [policyType, setPolicyType] = useState('Health / HMO');
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    
    // Using string for inputs to handle empty state naturally
    const [premiumStr, setPremiumStr] = useState('');
    const [coverageStr, setCoverageStr] = useState('');

    const handleSubmit = () => {
        if (!provider || !premiumStr || !coverageStr) return;
        
        onSave({
            provider,
            type: policyType,
            premium: parseFloat(premiumStr.replace(/,/g, '')),
            coverage: parseFloat(coverageStr.replace(/,/g, ''))
        });
        
        // Reset form
        setProvider('');
        setPolicyType('Health / HMO');
        setPremiumStr('');
        setCoverageStr('');
        onClose();
    };

    const formatNumberInput = (value: string) => {
        const numbers = value.replace(/[^0-9.]/g, '');
        if (!numbers) return '';
        const parts = numbers.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    const isFormValid = provider.trim() !== '' && premiumStr !== '' && coverageStr !== '';

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                        className="absolute inset-0 bg-black/95"
                    />
                    
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0, transition: { type: "spring", damping: 28, stiffness: 300 } }}
                        exit={{ y: "100%", transition: { type: "tween", duration: 0.2, ease: "easeIn" } }}
                        className="w-full max-w-md bg-[#111] sm:rounded-[32px] rounded-t-[32px] border border-white/10 p-6 relative z-10 flex flex-col max-h-[90dvh] will-change-transform"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-8 relative z-20">
                            <h3 className="text-white font-bold text-xl tracking-tight">Manual Input</h3>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6 relative z-10">
                            
                            {/* Provider Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-white/80 ml-1">Provider Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Sun Life, Maxicare"
                                    value={provider}
                                    onChange={(e) => setProvider(e.target.value)}
                                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-[20px] px-5 py-4 text-[17px] font-semibold text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                />
                            </div>

                            {/* Policy Type Dropdown */}
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-[13px] font-bold text-white/80 ml-1">Policy Type</label>
                                <button
                                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-[20px] px-5 py-4 text-[17px] font-semibold text-white flex justify-between items-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                >
                                    {policyType}
                                    <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isTypeDropdownOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-[88px] left-0 right-0 bg-[#222] border border-white/10 rounded-[20px] p-2 z-30 shadow-2xl"
                                        >
                                            {POLICY_TYPES.map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => { setPolicyType(type); setIsTypeDropdownOpen(false); }}
                                                    className="w-full flex items-center justify-between p-3 rounded-[12px] hover:bg-white/5 transition-colors text-white font-medium text-[15px]"
                                                >
                                                    {type}
                                                    {policyType === type && <Check className="w-4 h-4 text-[#D4AF37]" />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Annual Premium */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-white/80 ml-1">Annual Premium</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 font-bold text-[17px]">₱</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={premiumStr}
                                        onChange={(e) => setPremiumStr(formatNumberInput(e.target.value))}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-[20px] pl-10 pr-5 py-4 text-[17px] font-semibold text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                    />
                                </div>
                                {premiumStr && (
                                    <span className="text-[#D4AF37] text-[11px] font-bold ml-2">
                                        ≈ R{formatCurrency(parseFloat(premiumStr.replace(/,/g, '')) * exchangeRate)}
                                    </span>
                                )}
                            </div>

                            {/* Total Coverage */}
                            <div className="flex flex-col gap-2 mb-4">
                                <label className="text-[13px] font-bold text-white/80 ml-1">Total Coverage / Fund Value</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 font-bold text-[17px]">₱</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={coverageStr}
                                        onChange={(e) => setCoverageStr(formatNumberInput(e.target.value))}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-[20px] pl-10 pr-5 py-4 text-[17px] font-semibold text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                    />
                                </div>
                                {coverageStr && (
                                    <span className="text-[#D4AF37] text-[11px] font-bold ml-2">
                                        ≈ R{formatCurrency(parseFloat(coverageStr.replace(/,/g, '')) * exchangeRate)}
                                    </span>
                                )}
                            </div>

                            <button 
                                onClick={handleSubmit}
                                disabled={!isFormValid}
                                className="w-full py-4 rounded-full bg-[#D4AF37] text-black font-bold text-[15px] transition-all active:scale-[0.98] disabled:opacity-30 disabled:active:scale-100 flex items-center justify-center gap-2 mt-auto shadow-[0_4px_16px_rgba(212,175,55,0.2)]"
                            >
                                Save Policy
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
