"use client";

import { Plus, Stethoscope, Hospital, Building2, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { useInsuranceStore } from "@/store/useInsuranceStore";
import { useState } from "react";

interface MedicalLogTabProps {
    onLogVisit?: () => void;
}

export function MedicalLogTab({ onLogVisit }: MedicalLogTabProps) {
    const { exchangeRate } = useCurrencyStore();
    const { primarySymbol, secondarySymbol, getPrimaryValue, getSecondaryValue } = useDualCurrency();
    const { medicalEvents, policies, resolveMedicalClaim, resetMedicalEvents } = useInsuranceStore();
    
    const [resolvingClaimId, setResolvingClaimId] = useState<string | null>(null);
    const [refundAmountStr, setRefundAmountStr] = useState<string>('');
    const [isResolving, setIsResolving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);

    const handleResolveSubmit = async (eventId: string) => {
        const amount = refundAmountStr ? parseFloat(refundAmountStr.replace(/,/g, '')) : 0;
        if (amount <= 0) return;
        setIsResolving(true);
        await resolveMedicalClaim(eventId, amount);
        setIsResolving(false);
        setResolvingClaimId(null);
        setRefundAmountStr('');
    };

    const formatNumberInput = (value: string) => {
        const numbers = value.replace(/[^0-9.]/g, '');
        if (!numbers) return '';
        const parts = numbers.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    // Calculate total out of pocket for the current year (or all time depending on spec, using all time for now)
    const totalOutOfPocket = medicalEvents.reduce((acc, event) => acc + event.uncoveredAmount, 0);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <p className="text-white/50 text-[13px] font-medium leading-relaxed mb-6">
                    Track your consultations and out-of-pocket spending.
                </p>

                {/* Out of Pocket Portal / Tracker Hero Card */}
                <div className="w-full bg-gradient-to-br from-[#1A1A1A] to-[#111] rounded-[32px] p-6 mb-6 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
                    {/* Subtle red glow indicating personal spending */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF453A]/10 rounded-full blur-[40px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
                    
                    <div className="relative z-10 flex flex-col gap-1">
                        <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Total Out-of-Pocket</span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-white font-black text-[36px] tracking-tight leading-none">{primarySymbol}{formatCurrency(getPrimaryValue(totalOutOfPocket))}</span>
                        </div>
                        <span className="text-[#FF453A] text-[13px] font-bold mt-1">
                            ≈ {secondarySymbol}{formatCurrency(getSecondaryValue(totalOutOfPocket))}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={onLogVisit}
                        className="flex-1 py-4 rounded-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-[13px] transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Log Medical Visit
                    </button>
                    {medicalEvents.length > 0 && (
                        confirmReset ? (
                            <button
                                disabled={isResetting}
                                onClick={async () => {
                                    setIsResetting(true);
                                    await resetMedicalEvents();
                                    setIsResetting(false);
                                    setConfirmReset(false);
                                }}
                                className="w-[120px] py-4 rounded-full bg-[#FF453A] hover:bg-[#FF453A]/90 text-white font-bold text-[13px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 shadow-[0_4px_16px_rgba(255,69,58,0.2)]"
                            >
                                {isResetting ? "..." : "Confirm"}
                            </button>
                        ) : (
                            <button
                                onClick={() => setConfirmReset(true)}
                                className="px-5 py-4 shrink-0 rounded-full bg-[#1C1C1E] border border-white/10 hover:bg-white/10 text-white/50 hover:text-[#FF453A] font-bold text-[13px] transition-colors flex items-center justify-center shadow-sm"
                            >
                                Reset
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {medicalEvents.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center border border-white/5 border-dashed rounded-[32px] bg-white/[0.02]">
                        <Hospital className="w-12 h-12 text-white/10 mb-4" />
                        <h3 className="text-white/60 font-semibold mb-1">No medical visits logged</h3>
                        <p className="text-white/40 text-[13px] text-center max-w-[200px]">Keep track of your consultations and out of pocket expenses.</p>
                    </div>
                ) : (
                    medicalEvents.map((event) => {
                        const policy = policies.find(p => p.id === event.policyId);
                        const isFullyCovered = event.coveredAmount > 0 && event.uncoveredAmount === 0;
                        const isPartialCovered = event.coveredAmount > 0 && event.uncoveredAmount > 0;
                        const isOutOfPocket = event.coveredAmount === 0 && event.uncoveredAmount > 0;
                        
                        // Parse date for display
                        const dateObj = new Date(event.visitDate);
                        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        
                        return (
                            <div key={event.id} className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)] relative overflow-hidden group">
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border ${
                                        isFullyCovered ? 'bg-[#30D158]/10 border-[#30D158]/20 text-[#30D158]' :
                                        isPartialCovered ? 'bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]' :
                                        'bg-[#E8A33D]/10 border-[#E8A33D]/20 text-[#E8A33D]'
                                    }`}>
                                        <Stethoscope className="w-6 h-6 currentColor" />
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-white/40 text-[11px] font-bold tracking-widest uppercase">{dateStr}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/20" />
                                            <div className={`px-2 py-1 rounded-md border flex items-center gap-1.5 ${
                                                event.status === 'Pending Claim' ? 'bg-[#FF453A]/10 border-[#FF453A]/20' :
                                                event.status === 'Claimed' ? 'bg-[#32ADE6]/10 border-[#32ADE6]/20' :
                                                isFullyCovered ? 'bg-[#30D158]/10 border-[#30D158]/20' :
                                                isPartialCovered ? 'bg-[#D4AF37]/10 border-[#D4AF37]/20' :
                                                'bg-white/5 border-white/10'
                                            }`}>
                                                {isFullyCovered && event.status !== 'Claimed' && <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />}
                                                {event.status === 'Claimed' && <div className="w-1.5 h-1.5 rounded-full bg-[#32ADE6]" />}
                                                {isPartialCovered && event.status !== 'Claimed' && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
                                                {event.status === 'Pending Claim' && <div className="w-1.5 h-1.5 rounded-full bg-[#FF453A]" />}
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                                    event.status === 'Pending Claim' ? 'text-[#FF453A]' :
                                                    event.status === 'Claimed' ? 'text-[#32ADE6]' :
                                                    isFullyCovered ? 'text-[#30D158]' :
                                                    isPartialCovered ? 'text-[#D4AF37]' :
                                                    'text-white/60'
                                                }`}>
                                                    {event.status === 'Pending Claim' ? 'Pending Claim' : event.status === 'Claimed' ? 'Claimed' : isFullyCovered ? 'Covered' : isPartialCovered ? 'Partial' : 'Out-of-Pocket'}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="text-white font-bold text-[17px] tracking-tight mb-1">{event.reason}</h3>
                                        <div className="flex items-center gap-1.5 text-white/50 text-[13px] font-medium mb-4">
                                            <Hospital className="w-4 h-4" />
                                            <span>{event.providerName}</span>
                                        </div>
                                        
                                        
                                        <div className="flex flex-col items-end w-full border-t border-white/5 pt-3">
                                            <div className="flex items-baseline gap-1 mt-0.5">
                                                <span className="text-white font-black text-[22px] tracking-tight">{primarySymbol}{formatCurrency(getPrimaryValue(event.totalCost))}</span>
                                            </div>
                                            <span className="text-white/50 text-[11px] font-bold mt-0.5">≈ {secondarySymbol}{formatCurrency(getSecondaryValue(event.totalCost))}</span>
                                            <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest mt-1">{policy ? policy.policyName : 'Personal Fund'}</span>
                                        </div>

                                        {event.status === 'Pending Claim' && (
                                            <div className="w-full mt-4 pt-4 border-t border-[#FF453A]/20">
                                                {resolvingClaimId === event.id ? (
                                                    <div className="flex flex-col gap-3">
                                                        <label className="text-[12px] font-bold text-white/80">Amount Refunded by HMO</label>
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#30D158] font-bold text-[14px]">{primarySymbol}</span>
                                                                <input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    placeholder="0"
                                                                    value={refundAmountStr}
                                                                    onChange={(e) => setRefundAmountStr(formatNumberInput(e.target.value))}
                                                                    className="w-full bg-[#111] border border-white/10 rounded-[12px] pl-8 pr-3 py-2 text-[14px] font-bold text-white placeholder-white/30 focus:outline-none focus:border-[#30D158]/50"
                                                                />
                                                            </div>
                                                            <button 
                                                                onClick={() => handleResolveSubmit(event.id)}
                                                                disabled={isResolving || !refundAmountStr}
                                                                className="px-4 rounded-[12px] bg-[#30D158] text-black font-bold text-[13px] disabled:opacity-50"
                                                            >
                                                                {isResolving ? '...' : 'Confirm'}
                                                            </button>
                                                        </div>
                                                        <button onClick={() => setResolvingClaimId(null)} className="text-white/40 text-[11px] font-bold uppercase hover:text-white mt-1 text-center">Cancel</button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => {
                                                            setResolvingClaimId(event.id);
                                                            setRefundAmountStr(formatNumberInput(event.uncoveredAmount.toString()));
                                                        }}
                                                        className="w-full py-3 rounded-[16px] bg-[#FF453A]/10 text-[#FF453A] border border-[#FF453A]/20 font-bold text-[13px] flex items-center justify-center gap-2 transition-colors hover:bg-[#FF453A]/20"
                                                    >
                                                        Resolve Pending Claim
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
