"use client";

import { Shield, TrendingUp, ArrowRight, Info } from "lucide-react";

export function WhatToGetTab() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl text-white font-black tracking-tight mb-2">What to Get</h2>
                <p className="text-white/50 text-[13px] font-medium leading-relaxed">
                    Based on your recent logs, we've identified some encouraging ways to enhance your protection. Consider these suggestions for you and your family.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                {/* Life Insurance Gap */}
                <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Shield className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest">
                            Suggestion
                        </div>
                    </div>
                    
                    <h3 className="text-white font-bold text-[17px] tracking-tight mb-2">Life Insurance Gap</h3>
                    <p className="text-white/50 text-[13px] font-medium leading-relaxed mb-6">
                        A basic term plan starting at just ₱500/month can offer great peace of mind and protect your family's future.
                    </p>
                    
                    <button className="w-full py-4 rounded-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-[13px] transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2">
                        Browse Life Plans
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Income Protection */}
                <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                            <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-[11px] font-bold uppercase tracking-widest">
                            Recommended
                        </div>
                    </div>
                    
                    <h3 className="text-white font-bold text-[17px] tracking-tight mb-2">Income Protection</h3>
                    <p className="text-white/50 text-[13px] font-medium leading-relaxed mb-6">
                        Consider Disability Insurance (coverage up to ₱50,000/mo) to safeguard your income during unexpected events.
                    </p>
                    
                    <button className="w-full py-4 rounded-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-[13px] transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2">
                        Learn More
                        <Info className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
