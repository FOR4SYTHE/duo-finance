"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check, ChevronRight, Phone, Calendar } from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatCurrency } from "@/lib/format";
import { useDualCurrency } from "@/hooks/useDualCurrency";

interface ManualInputSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (policyData: any) => void;
}

const POLICY_TYPES = ['HMO', 'Medical Insurance', 'Life Insurance', 'Critical Illness', 'Accident', 'Dental'];
const STATUS_OPTIONS = ['Active', 'Expiring Soon', 'Expired', 'Cancelled'];
const PAYMENT_FREQUENCIES = ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'];
const ROOM_CATEGORIES = ['Ward', 'Semi-Private', 'Private', 'Large Private', 'Executive Suite'];
const MEMBER_OPTIONS = ['Me', 'Partner', 'Son', 'Daughter', 'Mother', 'Father'];

// Floating Label Input Component
const FloatingInput = ({ label, value, onChange, type = "text", prefix = "", suffix = "", ...props }: any) => {
    const [focused, setFocused] = useState(false);
    const active = focused || String(value).length > 0;
    
    return (
        <div className={`relative w-full bg-[#1A1A1A] rounded-[20px] px-5 border transition-colors ${focused ? 'border-[#D4AF37]/50' : 'border-white/5'}`}>
            <label className={`absolute left-5 transition-all duration-200 pointer-events-none font-medium ${active ? 'top-2 text-[11px] text-[#D4AF37]' : 'top-1/2 -translate-y-1/2 text-[16px] text-white/40'}`}>
                {label}
            </label>
            <div className={`w-full flex items-center transition-all duration-200 ${active ? 'pt-6 pb-2' : 'py-4 opacity-0'}`}>
                {prefix && <span className="text-white/50 font-bold mr-1">{prefix}</span>}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="w-full bg-transparent text-[17px] font-semibold text-white outline-none"
                    {...props}
                />
                {suffix && <span className="text-white/50 text-[13px] ml-2">{suffix}</span>}
            </div>
        </div>
    );
};

// Dropdown Component
const SelectDropdown = ({ label, value, options, onChange }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="relative w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full text-left bg-[#1A1A1A] rounded-[20px] px-5 py-4 border transition-colors flex justify-between items-center ${isOpen ? 'border-[#D4AF37]/50' : 'border-white/5'}`}
            >
                <div className="flex flex-col">
                    <span className="text-[11px] text-[#D4AF37] font-medium mb-1">{label}</span>
                    <span className="text-[17px] font-semibold text-white">{value || "Select..."}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#222] border border-white/10 rounded-[20px] p-2 z-50 shadow-2xl"
                    >
                        {options.map((opt: string) => (
                            <button
                                key={opt}
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className="w-full flex items-center justify-between p-3 rounded-[12px] hover:bg-white/5 transition-colors text-white font-medium text-[15px]"
                            >
                                {opt}
                                {value === opt && <Check className="w-4 h-4 text-[#D4AF37]" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export function ManualInputSheet({ isOpen, onClose, onSave }: ManualInputSheetProps) {
    const [mounted, setMounted] = useState(false);
    const { exchangeRate } = useCurrencyStore();
    const { primarySymbol } = useDualCurrency();
    
    useEffect(() => { setMounted(true); }, []);

    // Form State
    const [provider, setProvider] = useState('');
    const [policyName, setPolicyName] = useState('');
    const [policyType, setPolicyType] = useState('HMO');
    const [policyNumber, setPolicyNumber] = useState('');
    const [coveredMembers, setCoveredMembers] = useState<string[]>(['Me']);
    const [status, setStatus] = useState('Active');
    
    const [premiumStr, setPremiumStr] = useState('');
    const [paymentFreq, setPaymentFreq] = useState('Annual');
    const [dueDate, setDueDate] = useState('');
    const [coverageStr, setCoverageStr] = useState('');
    const [startDate, setStartDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    
    // Advanced / More Details
    const [showMore, setShowMore] = useState(false);
    const [roomCategory, setRoomCategory] = useState('Ward');
    const [outpatientLimit, setOutpatientLimit] = useState('');
    const [deductible, setDeductible] = useState('');
    const [hotline, setHotline] = useState('');
    const [agentName, setAgentName] = useState('');
    const [agentNumber, setAgentNumber] = useState('');
    const [notes, setNotes] = useState('');

    const formatNumberInput = (value: string) => {
        const numbers = value.replace(/[^0-9.]/g, '');
        if (!numbers) return '';
        const parts = numbers.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    const handleDateMask = (val: string) => {
        let v = val.replace(/\D/g, '');
        if (v.length >= 3 && v.length <= 4) v = v.slice(0, 2) + '/' + v.slice(2);
        else if (v.length >= 5) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4, 8);
        return v;
    };

    const toggleMember = (member: string) => {
        if (coveredMembers.includes(member)) {
            if (coveredMembers.length > 1) {
                setCoveredMembers(coveredMembers.filter(m => m !== member));
            }
        } else {
            setCoveredMembers([...coveredMembers, member]);
        }
    };

    const handleSubmit = () => {
        onSave({
            provider,
            policyName,
            type: policyType,
            policyNumber,
            coveredMembers,
            status,
            premium: parseFloat(premiumStr.replace(/,/g, '') || '0'),
            paymentFrequency: paymentFreq,
            dueDate,
            coverage: parseFloat(coverageStr.replace(/,/g, '') || '0'),
            startDate,
            expiryDate,
            roomCategory,
            outpatientLimit: parseFloat(outpatientLimit.replace(/,/g, '') || '0'),
            deductible: parseFloat(deductible.replace(/,/g, '') || '0'),
            hotline,
            agentName,
            agentNumber,
            notes
        });
        onClose();
    };

    // Smart UX Logic
    const coverageLabel = policyType === 'HMO' ? 'Maximum Benefit Limit (MBL)' : 
                          policyType === 'Medical Insurance' ? 'Annual Benefit Limit (ABL)' : 
                          'Face Amount / Coverage Limit';

    // Summary Card Theme
    const getThemeColor = () => {
        switch(policyType) {
            case 'Life Insurance': return 'from-[#D4AF37]/30 to-[#D4AF37]/5 border-[#D4AF37]/30 text-[#D4AF37]';
            case 'Critical Illness': return 'from-[#E74C3C]/30 to-[#E74C3C]/5 border-[#E74C3C]/30 text-[#E74C3C]';
            case 'Accident': return 'from-[#E67E22]/30 to-[#E67E22]/5 border-[#E67E22]/30 text-[#E67E22]';
            case 'Dental': return 'from-[#9B59B6]/30 to-[#9B59B6]/5 border-[#9B59B6]/30 text-[#9B59B6]';
            default: return 'from-[#3498DB]/30 to-[#3498DB]/5 border-[#3498DB]/30 text-[#3498DB]'; // Health/HMO
        }
    };
    const themeColor = getThemeColor();

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex justify-center bg-[#050505]">
                    <motion.div
                        initial={{ y: "100dvh" }}
                        animate={{ y: 0, transition: { type: "spring", damping: 28, stiffness: 300 } }}
                        exit={{ y: "100dvh", transition: { type: "tween", duration: 0.2, ease: "easeIn" } }}
                        className="w-full h-[100dvh] max-w-[480px] mx-auto bg-[#050505] relative z-10 flex flex-col will-change-transform"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 pt-10 pb-4 relative z-20 bg-[#050505]">
                            <h3 className="text-white font-bold text-xl tracking-tight">Add Policy</h3>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Scrollable Form */}
                        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32">
                            
                            {/* Live Summary Card (Hero) */}
                            <div className={`w-full rounded-[24px] bg-gradient-to-br ${themeColor.split(' text-')[0]} p-6 mb-8 relative overflow-hidden backdrop-blur-xl border shadow-2xl`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
                                
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-white/60 text-[11px] font-bold uppercase tracking-wider mb-1">{provider || 'PROVIDER'}</span>
                                        <span className="text-white font-bold text-[20px] leading-tight">{policyName || 'Policy Name'}</span>
                                        <span className={`text-[13px] font-medium mt-1 ${themeColor.split(' ').pop()}`}>{policyType}</span>
                                    </div>
                                    <div className="px-3 py-1 bg-black/40 rounded-full text-[11px] font-bold text-white border border-white/10">
                                        {status}
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-white/50 text-[11px] font-medium">Coverage Limit</span>
                                        <span className="text-white font-bold text-[18px]">{primarySymbol}{coverageStr || '0'}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-right">
                                        <span className="text-white/50 text-[11px] font-medium">{paymentFreq} Premium</span>
                                        <span className="text-white font-bold text-[18px]">{primarySymbol}{premiumStr || '0'}</span>
                                    </div>
                                </div>
                                
                                {coveredMembers.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">{coveredMembers.length}</div>
                                        <span className="text-white/70 text-[12px] font-medium">Member{coveredMembers.length > 1 ? 's' : ''} Covered</span>
                                    </div>
                                )}
                            </div>

                            {/* Policy Information Section */}
                            <div className="flex flex-col gap-4 mb-8">
                                <h4 className="text-white/40 text-[13px] font-bold uppercase tracking-wider mb-2">Policy Information</h4>
                                
                                <FloatingInput label="Provider Name" value={provider} onChange={(e: any) => setProvider(e.target.value)} placeholder="e.g., AXA, Maxicare" />
                                <FloatingInput label="Plan Name" value={policyName} onChange={(e: any) => setPolicyName(e.target.value)} placeholder="e.g., Health Care Access Prime" />
                                
                                <SelectDropdown label="Policy Type" value={policyType} options={POLICY_TYPES} onChange={setPolicyType} />
                                <SelectDropdown label="Status" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
                                
                                <FloatingInput label="Policy / Member ID" value={policyNumber} onChange={(e: any) => setPolicyNumber(e.target.value)} />

                                {/* Covered Members Chips */}
                                <div className="bg-[#1A1A1A] rounded-[20px] p-5 border border-white/5">
                                    <label className="text-[11px] text-[#D4AF37] font-medium block mb-3">Covered Members</label>
                                    <div className="flex flex-wrap gap-2">
                                        {MEMBER_OPTIONS.map(member => (
                                            <button
                                                key={member}
                                                onClick={() => toggleMember(member)}
                                                className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all border ${
                                                    coveredMembers.includes(member)
                                                    ? `bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#D4AF37]`
                                                    : `bg-white/5 border-transparent text-white/50 hover:text-white`
                                                }`}
                                            >
                                                {member}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Coverage & Premium Section */}
                            <div className="flex flex-col gap-4 mb-8">
                                <h4 className="text-white/40 text-[13px] font-bold uppercase tracking-wider mb-2">Coverage & Premium</h4>
                                
                                <FloatingInput label={coverageLabel} value={coverageStr} onChange={(e: any) => setCoverageStr(formatNumberInput(e.target.value))} prefix={primarySymbol} inputMode="decimal" />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <FloatingInput label="Premium Amount" value={premiumStr} onChange={(e: any) => setPremiumStr(formatNumberInput(e.target.value))} prefix={primarySymbol} inputMode="decimal" />
                                    <SelectDropdown label="Frequency" value={paymentFreq} options={PAYMENT_FREQUENCIES} onChange={setPaymentFreq} />
                                </div>

                                {/* Smart Calculation Hint */}
                                {premiumStr && paymentFreq !== 'Monthly' && (
                                    <div className="px-5 text-white/40 text-[12px] font-medium -mt-2">
                                        ≈ {primarySymbol}{formatNumberInput((parseFloat(premiumStr.replace(/,/g, '')) / (paymentFreq === 'Annual' ? 12 : paymentFreq === 'Semi-Annual' ? 6 : 3)).toFixed(0))} / month
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <FloatingInput label="Start Date" value={startDate} onChange={(e: any) => setStartDate(handleDateMask(e.target.value))} placeholder="MM/DD/YYYY" maxLength={10} />
                                    <FloatingInput label="Expiry Date" value={expiryDate} onChange={(e: any) => setExpiryDate(handleDateMask(e.target.value))} placeholder="MM/DD/YYYY" maxLength={10} />
                                </div>
                                <FloatingInput label="Next Premium Due Date" value={dueDate} onChange={(e: any) => setDueDate(handleDateMask(e.target.value))} placeholder="MM/DD/YYYY" maxLength={10} />
                            </div>

                            {/* More Details (Collapsible) */}
                            <div className="mb-10">
                                <button 
                                    onClick={() => setShowMore(!showMore)}
                                    className="w-full flex items-center justify-between p-5 bg-white/5 rounded-[20px] border border-white/5"
                                >
                                    <span className="text-white font-bold text-[15px]">Advanced Details (Optional)</span>
                                    <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${showMore ? 'rotate-180' : ''}`} />
                                </button>
                                
                                <AnimatePresence>
                                    {showMore && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden flex flex-col gap-4 mt-4"
                                        >
                                            {policyType === 'HMO' && (
                                                <>
                                                    <SelectDropdown label="Room Category" value={roomCategory} options={ROOM_CATEGORIES} onChange={setRoomCategory} />
                                                    <FloatingInput label="Outpatient Limit" value={outpatientLimit} onChange={(e: any) => setOutpatientLimit(formatNumberInput(e.target.value))} prefix={primarySymbol} />
                                                </>
                                            )}
                                            <FloatingInput label="Deductible / Co-pay" value={deductible} onChange={(e: any) => setDeductible(formatNumberInput(e.target.value))} prefix={primarySymbol} />
                                            
                                            <div className="w-full h-px bg-white/5 my-2" />
                                            
                                            <FloatingInput label="Emergency Hotline" value={hotline} onChange={(e: any) => setHotline(e.target.value)} type="tel" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FloatingInput label="Agent Name" value={agentName} onChange={(e: any) => setAgentName(e.target.value)} />
                                                <FloatingInput label="Agent Number" value={agentNumber} onChange={(e: any) => setAgentNumber(e.target.value)} type="tel" />
                                            </div>
                                            
                                            <div className="relative w-full bg-[#1A1A1A] rounded-[20px] px-5 py-4 border border-white/5">
                                                <label className="text-[11px] text-[#D4AF37] font-medium block mb-2">Policy Notes</label>
                                                <textarea 
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="e.g. Waiting period until July 2028, covers spouse after marriage"
                                                    className="w-full bg-transparent text-[15px] font-medium text-white outline-none min-h-[80px] resize-none"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Sticky Bottom Save Button */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pointer-events-none">
                            <div className="pointer-events-auto">
                                <button 
                                    onClick={handleSubmit}
                                    disabled={!provider || !premiumStr}
                                    className="w-full py-4 rounded-full bg-[#D4AF37] text-black font-bold text-[17px] shadow-[0_8px_32px_rgba(212,175,55,0.3)] transition-all active:scale-[0.98] disabled:opacity-30 disabled:active:scale-100 flex justify-center items-center gap-2"
                                >
                                    Save Policy
                                    <Check className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
