"use client";

import { formatCurrency } from "@/lib/format";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { Info, Shield, Plus } from "lucide-react";
import { useInsuranceStore } from "@/store/useInsuranceStore";

interface BenefitsReaderTabProps {
    onAddPlan?: () => void;
}

export function BenefitsReaderTab({ onAddPlan }: BenefitsReaderTabProps) {
    const { policies: allPolicies } = useInsuranceStore();
    const policies = allPolicies.filter(p => p.status !== 'Bookmarked');
    const { primarySymbol, secondarySymbol, getPrimaryValue, getSecondaryValue } = useDualCurrency();

    if (policies.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center px-6 py-12 h-full">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <Shield className="w-10 h-10 text-white/30" />
                </div>
                <h3 className="text-white font-bold text-xl tracking-tight mb-2">No Policies Yet</h3>
                <p className="text-white/50 text-[14px] font-medium leading-relaxed max-w-[260px] mb-8">
                    Add a policy to unlock your benefits reader and see exactly what's covered.
                </p>
                <button 
                    onClick={onAddPlan}
                    className="w-full max-w-[240px] py-4 rounded-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-[14px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(212,175,55,0.2)]"
                >
                    <Plus className="w-5 h-5" />
                    Add a Plan
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl text-white font-black tracking-tight mb-2">Benefits Reader</h2>
                <p className="text-white/50 text-[13px] font-medium leading-relaxed">
                    A simple breakdown of what's covered by your active policies.
                </p>
            </div>

            {policies.map((policy) => (
                <div key={policy.id} className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-bold text-[17px] tracking-tight">{policy.policyName || 'Unnamed Plan'}</h3>
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] font-bold uppercase tracking-widest text-right max-w-[120px] truncate">
                            {policy.provider}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* Overall Coverage / MBL */}
                        <div className="flex justify-between items-start border-b border-white/5 pb-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-white font-bold text-[15px]">Max Benefit Limit</span>
                                <span className="text-white/50 text-[12px] font-medium">Overall coverage per year/illness</span>
                            </div>
                            <div className="flex flex-col items-end text-right">
                                <div className="flex items-baseline gap-1.5 mb-1 mt-0.5">
                                    <span className="text-white font-black text-[22px] tracking-tight">{primarySymbol}{formatCurrency(getPrimaryValue(policy.coverage))}</span>
                                </div>
                                <span className="text-white/50 text-[11px] font-bold">≈ {secondarySymbol}{formatCurrency(getSecondaryValue(policy.coverage))}</span>
                                <div className="px-2.5 py-1 mt-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                                    <span className="text-[#30D158] text-[10px] font-bold uppercase tracking-widest">Covered</span>
                                </div>
                            </div>
                        </div>

                        {/* Room Category */}
                        {policy.roomCategory && policy.roomCategory !== 'N/A' && (
                            <div className="flex justify-between items-start border-b border-white/5 pb-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-white font-bold text-[15px]">Room & Board</span>
                                    <span className="text-white/50 text-[12px] font-medium">Inpatient hospital stays</span>
                                </div>
                                <div className="flex flex-col items-end text-right">
                                    <div className="flex items-baseline gap-1.5 mb-1 mt-0.5">
                                        <span className="text-white font-black text-[18px] tracking-tight">{policy.roomCategory}</span>
                                    </div>
                                    <div className="px-2.5 py-1 mt-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                                        <span className="text-[#30D158] text-[10px] font-bold uppercase tracking-widest">Covered</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Outpatient Care */}
                        {(policy.outpatientLimit || 0) > 0 && (
                            <div className="flex justify-between items-start border-b border-white/5 pb-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-white font-bold text-[15px]">Outpatient Care</span>
                                    <span className="text-white/50 text-[12px] font-medium">Consultations, Lab tests</span>
                                </div>
                                <div className="flex flex-col items-end text-right">
                                    <div className="flex items-baseline gap-1.5 mb-1 mt-0.5">
                                        <span className="text-white font-black text-[22px] tracking-tight">{primarySymbol}{formatCurrency(getPrimaryValue(policy.outpatientLimit || 0))}</span>
                                    </div>
                                    <span className="text-white/50 text-[11px] font-bold">≈ {secondarySymbol}{formatCurrency(getSecondaryValue(policy.outpatientLimit || 0))}</span>
                                    <div className="px-2.5 py-1 mt-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                                        <span className="text-[#30D158] text-[10px] font-bold uppercase tracking-widest">Covered</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Deductible */}
                        {(policy.deductible || 0) > 0 && (
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                    <span className="text-white font-bold text-[15px]">Deductible / Co-pay</span>
                                    <span className="text-white/50 text-[12px] font-medium">Amount you pay out of pocket</span>
                                </div>
                                <div className="flex flex-col items-end text-right">
                                    <div className="flex items-baseline gap-1.5 mb-1 mt-0.5">
                                        <span className="text-white font-black text-[22px] tracking-tight">{primarySymbol}{formatCurrency(getPrimaryValue(policy.deductible || 0))}</span>
                                    </div>
                                    <span className="text-white/50 text-[11px] font-bold">≈ {secondarySymbol}{formatCurrency(getSecondaryValue(policy.deductible || 0))}</span>
                                    <div className="px-2.5 py-1 mt-1 rounded-full bg-[#E8A33D]/10 border border-[#E8A33D]/20 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#E8A33D]" />
                                        <span className="text-[#E8A33D] text-[10px] font-bold uppercase tracking-widest">Out of Pocket</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-start gap-2 bg-white/[0.03] border border-white/5 p-4 rounded-xl mt-6">
                        <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                        <p className="text-white/50 text-[11px] font-medium leading-relaxed">
                            This is a simplified summary based on your policy data. For exact terms and exclusions, refer to your official policy document.
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
