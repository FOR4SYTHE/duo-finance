"use client";

import { formatCurrency } from "@/lib/format";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { Info } from "lucide-react";

export function BenefitsReaderTab() {
    const { exchangeRate } = useCurrencyStore();
    const { primarySymbol, secondarySymbol, getPrimaryValue, getSecondaryValue } = useDualCurrency();

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl text-white font-black tracking-tight mb-2">Benefits Reader</h2>
                <p className="text-white/50 text-[13px] font-medium leading-relaxed">
                    A simple breakdown of what's covered by your active policies.
                </p>
            </div>

            <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-bold text-[17px] tracking-tight">Silver Care HMO</h3>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] font-bold uppercase tracking-widest">
                        MediTrust
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Inpatient Care */}
                    <div className="flex justify-between items-start border-b border-white/5 pb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-white font-bold text-[15px]">Inpatient Care</span>
                            <span className="text-white/50 text-[12px] font-medium">Room & Board, Surgery</span>
                        </div>
                        <div className="flex flex-col items-end text-right">
                            <div className="flex items-baseline gap-1.5 mb-1 mt-0.5">
                                <span className="text-white font-black text-[22px] tracking-tight">{primarySymbol}{formatCurrency(getPrimaryValue(50000))}</span>
                                <span className="text-white/40 text-[13px] font-medium">/illness</span>
                            </div>
                            <span className="text-white/50 text-[11px] font-bold">≈ {secondarySymbol}{formatCurrency(getSecondaryValue(50000))}/illness</span>
                            <div className="px-2.5 py-1 mt-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                                <span className="text-[#30D158] text-[10px] font-bold uppercase tracking-widest">Covered</span>
                            </div>
                        </div>
                    </div>

                    {/* Outpatient Care */}
                    <div className="flex justify-between items-start border-b border-white/5 pb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-white font-bold text-[15px]">Outpatient Care</span>
                            <span className="text-white/50 text-[12px] font-medium">Consultations, Lab tests</span>
                        </div>
                        <div className="flex flex-col items-end text-right">
                            <div className="flex items-baseline gap-1.5 mb-1 mt-0.5">
                                <span className="text-white font-black text-[22px] tracking-tight">{primarySymbol}{formatCurrency(getPrimaryValue(500))}</span>
                                <span className="text-white/40 text-[13px] font-medium">/visit</span>
                            </div>
                            <span className="text-white/50 text-[11px] font-bold">≈ {secondarySymbol}{formatCurrency(getSecondaryValue(500))}/visit</span>
                            <div className="px-2.5 py-1 mt-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                                <span className="text-[#30D158] text-[10px] font-bold uppercase tracking-widest">Covered</span>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Room */}
                    <div className="flex justify-between items-start border-b border-white/5 pb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-white font-bold text-[15px]">Emergency Room</span>
                            <span className="text-white/50 text-[12px] font-medium">Accidents, sudden illness</span>
                        </div>
                        <div className="flex flex-col items-end text-right">
                            <div className="flex items-baseline gap-1.5 mb-1 mt-0.5">
                                <span className="text-white font-black text-[22px] tracking-tight">100%</span>
                            </div>
                            <div className="px-2.5 py-1 mt-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                                <span className="text-[#30D158] text-[10px] font-bold uppercase tracking-widest">Covered</span>
                            </div>
                        </div>
                    </div>

                    {/* Maternity */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <span className="text-white/50 font-bold text-[15px]">Maternity</span>
                            <span className="text-white/40 text-[12px] font-medium">Prenatal, delivery</span>
                        </div>
                        <div className="flex flex-col items-end text-right">
                            <div className="px-2.5 py-1 mt-1 rounded-full bg-[#FF453A]/10 border border-[#FF453A]/20 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#FF453A]" />
                                <span className="text-[#FF453A] text-[10px] font-bold uppercase tracking-widest">Not Covered</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-2 bg-white/[0.03] border border-white/5 p-4 rounded-xl mt-6">
                    <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <p className="text-white/50 text-[11px] font-medium leading-relaxed">
                        This is a simplified summary based on your selected template. For exact terms and exclusions, refer to your official policy document.
                    </p>
                </div>
            </div>
        </div>
    );
}
