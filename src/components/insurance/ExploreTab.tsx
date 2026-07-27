"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { BriefcaseMedical, TrendingUp, Sun } from "lucide-react";

export function ExploreTab() {
    const { exchangeRate } = useCurrencyStore();
    const [filter, setFilter] = useState('All Plans');

    const FILTERS = ['All Plans', 'Life', 'HMO', 'Gen'];

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl text-white font-black tracking-tight mb-2">Explore & Compare</h2>
                <p className="text-white/50 text-[13px] font-medium leading-relaxed">
                    Discover plans tailored to your lifestyle and future goals.
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {FILTERS.map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${
                            filter === f 
                            ? 'bg-white/10 text-white border border-white/20' 
                            : 'bg-white/[0.02] text-white/50 border border-white/5 hover:bg-white/[0.05]'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-4">
                {/* Gold Standard Life */}
                <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                            <Sun className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[11px] font-bold uppercase tracking-widest">
                            Life
                        </div>
                    </div>
                    
                    <h3 className="text-white font-bold text-[17px] tracking-tight mb-2">Gold Standard Life</h3>
                    <p className="text-white/50 text-[13px] font-medium leading-relaxed mb-6">
                        Comprehensive lifetime coverage ensuring generational wealth transfer.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Coverage</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-white font-black text-[22px] tracking-tight">₱1M</span>
                            </div>
                            <span className="text-white/50 text-[11px] font-bold">≈R{formatCurrency(1000000 * exchangeRate)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Deductible</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-white font-black text-[22px] tracking-tight">₱0</span>
                            </div>
                            <span className="text-white/50 text-[11px] font-bold">≈R0</span>
                        </div>
                    </div>
                    
                    <button className="w-full py-4 rounded-xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-[13px] transition-colors shadow-[0_4px_16px_rgba(212,175,55,0.2)]">
                        Log this as mine
                    </button>
                </div>

                {/* Essential Care HMO */}
                <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <BriefcaseMedical className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-widest">
                            HMO
                        </div>
                    </div>
                    
                    <h3 className="text-white font-bold text-[17px] tracking-tight mb-2">Essential Care HMO</h3>
                    <p className="text-white/50 text-[13px] font-medium leading-relaxed mb-6">
                        Broad network coverage for everyday health and wellness needs.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Coverage</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-white font-black text-[22px] tracking-tight">₱500k</span>
                            </div>
                            <span className="text-white/50 text-[11px] font-bold">≈R{formatCurrency(500000 * exchangeRate)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Copay</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-white font-black text-[22px] tracking-tight">₱20</span>
                            </div>
                            <span className="text-white/50 text-[11px] font-bold">≈R{formatCurrency(20 * exchangeRate)}</span>
                        </div>
                    </div>
                    
                    <button className="w-full py-4 rounded-xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-[13px] transition-colors shadow-[0_4px_16px_rgba(212,175,55,0.2)]">
                        Log this as mine
                    </button>
                </div>

                {/* Secure Future VUL */}
                <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-widest">
                            Investment Life
                        </div>
                    </div>
                    
                    <h3 className="text-white font-bold text-[17px] tracking-tight mb-2">Secure Future VUL</h3>
                    <p className="text-white/50 text-[13px] font-medium leading-relaxed mb-6">
                        Combine robust life insurance protection with aggressive market investments.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Coverage</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-white font-black text-[22px] tracking-tight">₱750k</span>
                            </div>
                            <span className="text-white/50 text-[11px] font-bold">≈R{formatCurrency(750000 * exchangeRate)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Est. Return</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-white font-black text-[22px] tracking-tight">6–8%</span>
                                <span className="text-white/50 text-[13px] font-medium ml-1">p.a.</span>
                            </div>
                            <span className="text-white/50 text-[11px] font-bold">Projected</span>
                        </div>
                    </div>
                    
                    <button className="w-full py-4 rounded-xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-[13px] transition-colors shadow-[0_4px_16px_rgba(212,175,55,0.2)]">
                        Log this as mine
                    </button>
                </div>
            </div>
        </div>
    );
}
