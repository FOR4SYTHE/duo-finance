"use client";

import { useState } from "react";
import { Shield, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useCurrencyStore } from "@/store/useCurrencyStore";

export function MyPlansTab() {
    // Scaffold state: change this to true to see the populated list
    const [hasPolicies, setHasPolicies] = useState(false);
    const { exchangeRate } = useCurrencyStore();

    if (!hasPolicies) {
        return (
            <div className="bg-[#1A1A1A] rounded-[28px] p-8 flex flex-col items-center justify-center text-center min-h-[400px] border border-white/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_12px_24px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#D4AF37]/10 blur-[40px] rounded-full pointer-events-none" />
                
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 shadow-lg backdrop-blur-md">
                    <Shield className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                
                <h2 className="text-3xl text-white font-black tracking-tighter leading-tight mb-3 relative z-10">
                    You haven't logged any<br/>insurance yet
                </h2>
                
                <p className="text-white/50 text-sm max-w-[260px] leading-relaxed mb-8 relative z-10">
                    Start tracking your existing coverage or browse options to find the right protection for your household.
                </p>
                
                <div className="flex flex-col gap-3 w-full max-w-[280px] relative z-10">
                    <button className="w-full py-4 rounded-2xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(212,175,55,0.2)]">
                        <Plus className="w-4 h-4" />
                        Add a plan
                    </button>
                    <button className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors border border-white/5">
                        Explore & Compare
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Populated state (Mock data matching Stitch UI design + Dual currency) */}
            
            {/* Silver Care HMO */}
            <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Shield className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-[17px] tracking-tight">{`Silver Care HMO`}</h3>
                            <p className="text-white/50 text-[13px] font-medium mt-0.5">MediTrust</p>
                        </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20 flex items-center gap-1.5 h-fit mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                        <span className="text-[#30D158] text-[10px] font-bold uppercase tracking-widest">Active</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Premium</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-white font-black text-[22px] tracking-tight">₱1,200</span>
                            <span className="text-white/50 text-[13px] font-medium">/yr</span>
                        </div>
                        <span className="text-white/50 text-[11px] font-bold">≈R{formatCurrency(1200 * exchangeRate)}/yr</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">MBL</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-white font-black text-[22px] tracking-tight">₱50,000</span>
                        </div>
                        <span className="text-white/50 text-[11px] font-bold">≈R{formatCurrency(50000 * exchangeRate)}</span>
                    </div>
                    <div className="flex flex-col gap-1 mt-3">
                        <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">OPD Limit</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-white font-black text-[22px] tracking-tight">₱500</span>
                        </div>
                        <span className="text-white/50 text-[11px] font-bold">≈R{formatCurrency(500 * exchangeRate)}</span>
                    </div>
                </div>
            </div>

            {/* Infinity Life */}
            <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Shield className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-[17px] tracking-tight">{`Infinity Life`}</h3>
                            <p className="text-white/50 text-[13px] font-medium mt-0.5">SafeGuard</p>
                        </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-[#E8A33D]/10 border border-[#E8A33D]/20 flex items-center gap-1.5 h-fit mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E8A33D]" />
                        <span className="text-[#E8A33D] text-[10px] font-bold uppercase tracking-widest">Renewal in 12 days</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Premium</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-white font-black text-[22px] tracking-tight">₱2,500</span>
                            <span className="text-white/50 text-[13px] font-medium">/yr</span>
                        </div>
                        <span className="text-white/50 text-[11px] font-bold">≈R{formatCurrency(2500 * exchangeRate)}/yr</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Fund Value</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-[#D4AF37] font-black text-[22px] tracking-tight">₱12,450</span>
                        </div>
                        <span className="text-white/50 text-[11px] font-bold">≈R{formatCurrency(12450 * exchangeRate)}</span>
                    </div>
                    <div className="flex flex-col gap-1 mt-3">
                        <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Life Cover</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-white font-black text-[22px] tracking-tight">₱500,000</span>
                        </div>
                        <span className="text-white/50 text-[11px] font-bold">≈R{formatCurrency(500000 * exchangeRate)}</span>
                    </div>
                </div>
            </div>

            {/* Public Health Plus */}
            <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Shield className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-[17px] tracking-tight">{`Public Health Plus`}</h3>
                            <p className="text-white/50 text-[13px] font-medium mt-0.5">GovHealth</p>
                        </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20 flex items-center gap-1.5 h-fit mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                        <span className="text-[#30D158] text-[10px] font-bold uppercase tracking-widest">Active</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Premium</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-white font-black text-[22px] tracking-tight">₱300</span>
                            <span className="text-white/50 text-[13px] font-medium">/yr</span>
                        </div>
                        <span className="text-white/50 text-[11px] font-bold">≈R{formatCurrency(300 * exchangeRate)}/yr</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Coverage</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-white font-black text-[22px] tracking-tight">100%</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 mt-3">
                        <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Deductible</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-white font-black text-[22px] tracking-tight">₱0</span>
                        </div>
                        <span className="text-white/50 text-[11px] font-bold">≈R0</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-4">
                <button className="w-full py-4 rounded-2xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(212,175,55,0.2)]">
                    <Plus className="w-4 h-4" />
                    Add a plan
                </button>
                <button className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors border border-white/5">
                    Scan policy document
                </button>
            </div>
        </div>
    );
}
