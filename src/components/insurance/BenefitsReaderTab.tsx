"use client";

import { formatCurrency } from "@/lib/format";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { Info } from "lucide-react";

export function BenefitsReaderTab() {
    const { exchangeRate } = useCurrencyStore();

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl text-white font-semibold tracking-tight mb-2">Benefits Reader</h2>
                <p className="text-white/50 text-sm leading-relaxed">
                    A simple breakdown of what's covered by your active policies.
                </p>
            </div>

            <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-semibold text-lg tracking-tight">Silver Care HMO</h3>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium">
                        MediTrust
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Inpatient Care */}
                    <div className="flex justify-between items-start border-b border-white/5 pb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-white font-medium text-sm">Inpatient Care</span>
                            <span className="text-white/50 text-xs">Room & Board, Surgery</span>
                        </div>
                        <div className="flex flex-col items-end text-right">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-semibold">₱50,000</span>
                                <span className="text-white/40 text-xs">/illness</span>
                            </div>
                            <span className="text-white/40 text-[10px]">≈ R{formatCurrency(50000 * exchangeRate)}/illness</span>
                            <div className="px-2 py-0.5 mt-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                                <span className="text-[#30D158] text-[9px] font-bold uppercase tracking-wider">Covered</span>
                            </div>
                        </div>
                    </div>

                    {/* Outpatient Care */}
                    <div className="flex justify-between items-start border-b border-white/5 pb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-white font-medium text-sm">Outpatient Care</span>
                            <span className="text-white/50 text-xs">Consultations, Lab tests</span>
                        </div>
                        <div className="flex flex-col items-end text-right">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-semibold">₱500</span>
                                <span className="text-white/40 text-xs">/visit</span>
                            </div>
                            <span className="text-white/40 text-[10px]">≈ R{formatCurrency(500 * exchangeRate)}/visit</span>
                            <div className="px-2 py-0.5 mt-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                                <span className="text-[#30D158] text-[9px] font-bold uppercase tracking-wider">Covered</span>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Room */}
                    <div className="flex justify-between items-start border-b border-white/5 pb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-white font-medium text-sm">Emergency Room</span>
                            <span className="text-white/50 text-xs">Accidents, sudden illness</span>
                        </div>
                        <div className="flex flex-col items-end text-right">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-semibold">100%</span>
                            </div>
                            <div className="px-2 py-0.5 mt-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                                <span className="text-[#30D158] text-[9px] font-bold uppercase tracking-wider">Covered</span>
                            </div>
                        </div>
                    </div>

                    {/* Maternity */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <span className="text-white/50 font-medium text-sm">Maternity</span>
                            <span className="text-white/40 text-xs">Prenatal, delivery</span>
                        </div>
                        <div className="flex flex-col items-end text-right">
                            <div className="px-2 py-0.5 mt-1 rounded-full bg-[#FF453A]/10 border border-[#FF453A]/20 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#FF453A]" />
                                <span className="text-[#FF453A] text-[9px] font-bold uppercase tracking-wider">Not Covered</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-2 bg-white/[0.03] border border-white/5 p-3.5 rounded-xl mt-6">
                    <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <p className="text-white/50 text-[10px] leading-relaxed">
                        This is a simplified summary based on your selected template. For exact terms and exclusions, refer to your official policy document.
                    </p>
                </div>
            </div>
        </div>
    );
}
