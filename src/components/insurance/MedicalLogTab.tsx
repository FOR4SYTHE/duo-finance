"use client";

import { Plus, Stethoscope, Hospital, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useCurrencyStore } from "@/store/useCurrencyStore";

export function MedicalLogTab() {
    const { exchangeRate } = useCurrencyStore();

    return (
        <div className="flex flex-col gap-6">
            <div>
                <p className="text-white/50 text-[13px] font-medium leading-relaxed mb-4">
                    Track your consultations and coverage status.
                </p>
                <button className="w-[200px] py-4 rounded-2xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-[13px] transition-colors shadow-[0_4px_16px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Log Medical Visit
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {/* Annual Checkup (Covered) */}
                <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)] relative overflow-hidden group">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Stethoscope className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex flex-col w-full">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-white/40 text-[11px] font-bold tracking-widest uppercase">Oct 24, 2023</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <div className="px-2.5 py-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                                    <span className="text-[#30D158] text-[10px] font-bold uppercase tracking-widest">Covered</span>
                                </div>
                            </div>
                            <h3 className="text-white font-bold text-[17px] tracking-tight mb-1">Annual Checkup</h3>
                            <div className="flex items-center gap-1.5 text-white/50 text-[13px] font-medium mb-4">
                                <Hospital className="w-4 h-4" />
                                <span>Dr. Cruz - St. Luke's Medical Center</span>
                            </div>
                            
                            <div className="flex flex-col items-end w-full border-t border-white/5 pt-3">
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-white font-black text-[22px] tracking-tight">₱2,500.00</span>
                                </div>
                                <span className="text-white/50 text-[11px] font-bold mt-0.5">≈ R{formatCurrency(2500 * exchangeRate)}</span>
                                <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest mt-1">Maxicare HMO</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dental Cleaning (Out of Pocket) */}
                <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)] relative overflow-hidden group">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#E8A33D]/10 flex items-center justify-center border border-[#E8A33D]/20">
                            {/* using a simple icon since lucide doesn't have a tooth */}
                            <Building2 className="w-6 h-6 text-[#E8A33D]" />
                        </div>
                        <div className="flex flex-col w-full">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-white/40 text-[11px] font-bold tracking-widest uppercase">Sep 12, 2023</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 flex items-center">
                                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Out-of-Pocket</span>
                                </div>
                            </div>
                            <h3 className="text-white font-bold text-[17px] tracking-tight mb-1">Dental Cleaning</h3>
                            <div className="flex items-center gap-1.5 text-white/50 text-[13px] font-medium mb-4">
                                <Hospital className="w-4 h-4" />
                                <span>Dr. Santos - Smiles Clinic</span>
                            </div>
                            
                            <div className="flex flex-col items-end w-full border-t border-white/5 pt-3">
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-white font-black text-[22px] tracking-tight">₱1,800.00</span>
                                </div>
                                <span className="text-white/50 text-[11px] font-bold mt-0.5">≈ R{formatCurrency(1800 * exchangeRate)}</span>
                                <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest mt-1">Personal Fund</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specialist Consultation (Claim Pending) */}
                <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)] relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]" />
                    <div className="flex gap-4">
                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                            <Stethoscope className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <div className="flex flex-col w-full">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-white/40 text-[11px] font-bold tracking-widest uppercase">Aug 05, 2023</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <div className="px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                    <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">Claim Pending</span>
                                </div>
                            </div>
                            <h3 className="text-white font-bold text-[17px] tracking-tight mb-1">Specialist Consultation</h3>
                            <div className="flex items-center gap-1.5 text-white/50 text-[13px] font-medium mb-4">
                                <Hospital className="w-4 h-4" />
                                <span>Dr. Reyes - Makati Med</span>
                            </div>
                            
                            <div className="flex flex-col items-end w-full border-t border-white/5 pt-3">
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-white font-black text-[22px] tracking-tight">₱4,000.00</span>
                                </div>
                                <span className="text-white/50 text-[11px] font-bold mt-0.5">≈ R{formatCurrency(4000 * exchangeRate)}</span>
                                <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest mt-1">Pacific Cross</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button className="w-full py-4 mt-2 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-[13px] transition-colors border border-white/5">
                    Load More History
                </button>
            </div>
        </div>
    );
}
