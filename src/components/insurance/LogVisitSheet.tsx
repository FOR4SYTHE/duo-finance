"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Info } from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatCurrency } from "@/lib/format";
import { useDualCurrency } from "@/hooks/useDualCurrency";

interface LogVisitSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (visitData: any) => void;
}

const VISIT_TYPES = ['Checkup', 'Dental', 'Specialist', 'ER / Hospital'];
const MOCK_POLICIES = ['Silver Care HMO', 'Public Health Plus'];
const STATUS_OPTIONS = ['Covered', 'Out-of-Pocket', 'Claim Pending'];

export function LogVisitSheet({ isOpen, onClose, onSave }: LogVisitSheetProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { exchangeRate } = useCurrencyStore();
    const { primarySymbol, secondarySymbol, getPrimaryValue, getSecondaryValue } = useDualCurrency();
    const [visitType, setVisitType] = useState('Checkup');
    const [policy, setPolicy] = useState('Silver Care HMO');
    const [status, setStatus] = useState('Covered');
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    
    const [billStr, setBillStr] = useState('');
    const [outOfPocketStr, setOutOfPocketStr] = useState('');

    const handleSubmit = () => {
        if (!billStr || !outOfPocketStr) return;
        
        onSave({
            type: visitType,
            policy,
            status,
            totalBill: parseFloat(billStr.replace(/,/g, '')),
            outOfPocket: parseFloat(outOfPocketStr.replace(/,/g, ''))
        });
        
        // Reset form
        setVisitType('Checkup');
        setPolicy('Silver Care HMO');
        setStatus('Covered');
        setBillStr('');
        setOutOfPocketStr('');
        onClose();
    };

    const formatNumberInput = (value: string) => {
        const numbers = value.replace(/[^0-9.]/g, '');
        if (!numbers) return '';
        const parts = numbers.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    const isFormValid = billStr !== '' && outOfPocketStr !== '';

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
                            <h3 className="text-white font-bold text-xl tracking-tight">Log Medical Visit</h3>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6 relative z-10">
                            
                            {/* Visit Type Segmented Control */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-white/80 ml-1">Visit Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {VISIT_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setVisitType(type)}
                                            className={`py-3 px-4 rounded-[16px] text-[14px] font-semibold transition-colors flex items-center justify-between ${
                                                visitType === type 
                                                    ? 'bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/30' 
                                                    : 'bg-[#1A1A1A] text-white/60 border border-white/5 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            {type}
                                            {visitType === type && <Check className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Policy Used */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-white/80 ml-1">Policy Used</label>
                                <div className="flex flex-col gap-2">
                                    {MOCK_POLICIES.map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPolicy(p)}
                                            className={`py-4 px-5 rounded-[20px] text-[15px] font-semibold transition-colors flex items-center justify-between ${
                                                policy === p 
                                                    ? 'bg-white/10 text-white border border-white/20' 
                                                    : 'bg-[#1A1A1A] text-white/50 border border-white/5 hover:bg-white/5 hover:text-white/80'
                                            }`}
                                        >
                                            {p}
                                            {policy === p && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Coverage Status */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 ml-1">
                                    <label className="text-[13px] font-bold text-white/80">Coverage Status</label>
                                    <button 
                                        onClick={() => setIsInfoOpen(!isInfoOpen)}
                                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                            isInfoOpen ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-white/50 hover:text-white hover:bg-white/20'
                                        }`}
                                    >
                                        <Info className="w-3 h-3" />
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {isInfoOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginTop: -8 }}
                                            animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                                            exit={{ opacity: 0, height: 0, marginTop: -8 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="bg-[#1A1A1A] border border-white/5 rounded-[16px] p-4 flex flex-col gap-3 mb-1">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-[#30D158] mt-1.5 shrink-0" />
                                                    <p className="text-white/60 text-[12px] leading-relaxed">
                                                        <strong className="text-white/90">Covered:</strong> Insurance paid the bill directly. Your out-of-pocket was zero.
                                                    </p>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-white/40 mt-1.5 shrink-0" />
                                                    <p className="text-white/60 text-[12px] leading-relaxed">
                                                        <strong className="text-white/90">Out-of-Pocket:</strong> You paid this entirely yourself and are not claiming it back.
                                                    </p>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                                                    <p className="text-white/60 text-[12px] leading-relaxed">
                                                        <strong className="text-white/90">Claim Pending:</strong> You paid upfront but are filing a claim to get reimbursed later.
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex flex-wrap gap-2">
                                    {STATUS_OPTIONS.map(opt => {
                                        // Color mapping for active states
                                        let activeColor = 'bg-white/10 text-white border-white/20';
                                        if (opt === 'Covered') activeColor = 'bg-[#30D158]/20 text-[#30D158] border-[#30D158]/30';
                                        if (opt === 'Claim Pending') activeColor = 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30';

                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => setStatus(opt)}
                                                className={`py-3 px-4 rounded-[16px] text-[13px] font-semibold transition-colors border ${
                                                    status === opt 
                                                        ? activeColor 
                                                        : 'bg-[#1A1A1A] text-white/50 border-white/5 hover:bg-white/5 hover:text-white/80'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-white/80 ml-1">Total Hospital Bill</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 font-bold text-[17px]">{primarySymbol}</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={billStr}
                                        onChange={(e) => setBillStr(formatNumberInput(e.target.value))}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-[20px] pl-10 pr-5 py-4 text-[17px] font-semibold text-white placeholder-white/30 focus:outline-none focus:border-[#30D158]/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                    />
                                </div>
                                {billStr && (
                                    <span className="text-[#30D158] text-[11px] font-bold ml-2">
                                        ≈ {secondarySymbol}{formatCurrency(getSecondaryValue(parseFloat(billStr.replace(/,/g, ''))))}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 mb-4">
                                <label className="text-[13px] font-bold text-white/80 ml-1">Out of Pocket (You Paid)</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 font-bold text-[17px]">{primarySymbol}</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={outOfPocketStr}
                                        onChange={(e) => setOutOfPocketStr(formatNumberInput(e.target.value))}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-[20px] pl-10 pr-5 py-4 text-[17px] font-semibold text-white placeholder-white/30 focus:outline-none focus:border-[#FF453A]/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                    />
                                </div>
                                {outOfPocketStr && (
                                    <span className="text-[#FF453A] text-[11px] font-bold ml-2">
                                        ≈ {secondarySymbol}{formatCurrency(getSecondaryValue(parseFloat(outOfPocketStr.replace(/,/g, ''))))}
                                    </span>
                                )}
                            </div>

                            <button 
                                onClick={handleSubmit}
                                disabled={!isFormValid}
                                className="w-full py-4 rounded-full bg-[#30D158] text-black font-bold text-[15px] transition-all active:scale-[0.98] disabled:opacity-30 disabled:active:scale-100 flex items-center justify-center gap-2 mt-auto shadow-[0_4px_16px_rgba(48,209,88,0.2)]"
                            >
                                Log Visit
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
