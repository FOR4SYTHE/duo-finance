"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Info } from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatCurrency } from "@/lib/format";
import { useDualCurrency } from "@/hooks/useDualCurrency";

import { useInsuranceStore } from "@/store/useInsuranceStore";

interface LogVisitSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (visitData: any) => void;
}

const VISIT_TYPES = ['Checkup', 'Dental', 'Specialist', 'ER / Hospital'];
const STATUS_OPTIONS = ['Covered', 'Partial', 'Out-of-Pocket', 'Claim Pending'];

export function LogVisitSheet({ isOpen, onClose, onSave }: LogVisitSheetProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { exchangeRate } = useCurrencyStore();
    const { primarySymbol, secondarySymbol, getPrimaryValue, getSecondaryValue } = useDualCurrency();
    const { policies: allPolicies } = useInsuranceStore();
    const activePolicies = allPolicies.filter(p => p.status !== 'Bookmarked');
    
    const [visitType, setVisitType] = useState('Checkup');
    const [policyId, setPolicyId] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState('Covered');
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    
    const [billStr, setBillStr] = useState('');
    const [coveredStr, setCoveredStr] = useState('');

    const handleSubmit = () => {
        if (!billStr) return;
        
        const totalCost = parseFloat(billStr.replace(/,/g, ''));
        
        let coveredAmount = 0;
        if (status === 'Covered') {
            coveredAmount = totalCost;
        } else if (status === 'Partial') {
            coveredAmount = coveredStr ? parseFloat(coveredStr.replace(/,/g, '')) : 0;
        } else {
            coveredAmount = 0; // Out-of-Pocket or Claim Pending
        }
        
        const uncoveredAmount = Math.max(0, totalCost - coveredAmount);
        
        onSave({
            visitDate: new Date().toISOString().split('T')[0],
            providerName: 'Hospital / Clinic', // User could input this if we added a field, for now default
            reason: visitType,
            totalCost,
            coveredAmount,
            uncoveredAmount,
            policyId,
            status: status === 'Claim Pending' ? 'Pending Claim' : 'Resolved'
        });
        
        // Reset form
        setVisitType('Checkup');
        setPolicyId(undefined);
        setStatus('Covered');
        setBillStr('');
        setCoveredStr('');
        onClose();
    };

    const formatNumberInput = (value: string) => {
        const numbers = value.replace(/[^0-9.]/g, '');
        if (!numbers) return '';
        const parts = numbers.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    const isFormValid = billStr !== '';
    
    const billValue = billStr ? parseFloat(billStr.replace(/,/g, '')) : 0;
    
    let currentCoveredValue = 0;
    if (status === 'Covered') {
        currentCoveredValue = billValue;
    } else if (status === 'Partial') {
        currentCoveredValue = coveredStr ? parseFloat(coveredStr.replace(/,/g, '')) : 0;
    }
    
    const outOfPocketValue = Math.max(0, billValue - currentCoveredValue);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0, transition: { type: "spring", damping: 32, stiffness: 300 } }}
                    exit={{ x: "100%", transition: { type: "tween", duration: 0.2, ease: "easeIn" } }}
                    className="fixed inset-0 z-[110] bg-[#0A0A0A] flex flex-col will-change-transform"
                >
                    <div className="w-full max-w-md mx-auto flex flex-col h-full p-6 pt-8 sm:pt-6 pb-8">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <h3 className="text-white font-bold text-xl tracking-tight">Log Medical Visit</h3>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6 relative z-10 flex-1 *:shrink-0">
                            
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
                            {activePolicies.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-[13px] font-bold text-white/80 ml-1">Policy Used (Optional)</label>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => setPolicyId(undefined)}
                                            className={`py-4 px-5 rounded-[20px] text-[15px] font-semibold transition-colors flex items-center justify-between ${
                                                !policyId
                                                    ? 'bg-white/10 text-white border border-white/20' 
                                                    : 'bg-[#1A1A1A] text-white/50 border border-white/5 hover:bg-white/5 hover:text-white/80'
                                            }`}
                                        >
                                            None / Uncovered
                                            {!policyId && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </button>
                                        {activePolicies.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setPolicyId(p.id)}
                                                className={`py-4 px-5 rounded-[20px] text-[15px] font-semibold transition-colors flex items-center justify-between ${
                                                    policyId === p.id 
                                                        ? 'bg-white/10 text-white border border-white/20' 
                                                        : 'bg-[#1A1A1A] text-white/50 border border-white/5 hover:bg-white/5 hover:text-white/80'
                                                }`}
                                            >
                                                {p.provider} {p.policyName}
                                                {policyId === p.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="bg-[#1A1A1A] border border-white/5 rounded-[16px] p-4 flex flex-col gap-3 mt-2 mb-2">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-[#30D158] mt-1.5 shrink-0" />
                                                    <p className="text-white/60 text-[12px] leading-relaxed">
                                                        <strong className="text-white/90">Covered:</strong> Insurance paid the bill directly. Your out-of-pocket was zero.
                                                    </p>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-[#0A84FF] mt-1.5 shrink-0" />
                                                    <p className="text-white/60 text-[12px] leading-relaxed">
                                                        <strong className="text-white/90">Partial:</strong> Insurance covered a portion, but you still had to pay a remaining balance.
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
                                        if (opt === 'Partial') activeColor = 'bg-[#0A84FF]/20 text-[#0A84FF] border-[#0A84FF]/30';
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

                            <AnimatePresence>
                                {status === 'Partial' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex flex-col gap-2 py-2">
                                            <label className="text-[13px] font-bold text-white/80 ml-1">HMO / Insurance Covered</label>
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#30D158] font-bold text-[17px]">{primarySymbol}</span>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder="0"
                                                    value={coveredStr}
                                                    onChange={(e) => setCoveredStr(formatNumberInput(e.target.value))}
                                                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-[20px] pl-10 pr-5 py-4 text-[17px] font-semibold text-white placeholder-white/30 focus:outline-none focus:border-[#30D158]/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-[#FF453A]/20 flex flex-col gap-1 mb-4 shadow-[inset_0_2px_10px_rgba(255,69,58,0.05)]">
                                <p className="text-[#FF453A]/80 text-[12px] font-bold uppercase tracking-widest">
                                    {status === 'Claim Pending' ? 'Upfront Payment (Pending Claim)' : 'Out of Pocket (You Pay)'}
                                </p>
                                <div className="flex items-end gap-2">
                                    <h4 className="text-[#FF453A] font-black text-2xl tracking-tight">
                                        {primarySymbol}{formatCurrency(outOfPocketValue)}
                                    </h4>
                                    <span className="text-[#FF453A]/50 text-[13px] font-bold mb-1">
                                        ≈ {secondarySymbol}{formatCurrency(getSecondaryValue(outOfPocketValue))}
                                    </span>
                                </div>
                                {outOfPocketValue > 0 && (
                                    <p className="text-white/40 text-[11px] mt-2 leading-relaxed">
                                        {status === 'Claim Pending' 
                                            ? `This ${primarySymbol}${formatCurrency(outOfPocketValue)} will be deducted from your Spend Jar now. When your insurance claim is approved, you can log the reimbursement to refund it.`
                                            : `This ${primarySymbol}${formatCurrency(outOfPocketValue)} will automatically be deducted from your Spend Jar's Health category.`}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 shrink-0 mt-auto pb-4">
                            <button 
                                onClick={handleSubmit}
                                disabled={!isFormValid}
                                className="w-full py-4 rounded-full bg-[#30D158] text-black font-bold text-[15px] transition-all active:scale-[0.98] disabled:opacity-30 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(48,209,88,0.2)]"
                            >
                                Log Visit
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
