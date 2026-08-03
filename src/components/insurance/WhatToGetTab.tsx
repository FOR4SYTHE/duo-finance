"use client";

import { Shield, TrendingUp, ArrowRight, Info, HeartPulse, Activity, CheckCircle2 } from "lucide-react";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { useInsuranceStore } from "@/store/useInsuranceStore";
import { motion } from "framer-motion";

interface WhatToGetTabProps {
    onExplore?: () => void;
}

export function WhatToGetTab({ onExplore }: WhatToGetTabProps = {}) {
    const { primarySymbol } = useDualCurrency();
    const { policies: allPolicies } = useInsuranceStore();
    
    // Only analyze active/real policies (ignore bookmarks)
    const activePolicies = allPolicies.filter(p => p.status !== 'Bookmarked');
    
    // Simple Rule Engine
    const hasHealth = activePolicies.some(p => p.type.toLowerCase().includes('hmo') || p.type.toLowerCase().includes('medical'));
    const hasLife = activePolicies.some(p => p.type.toLowerCase().includes('life'));
    const hasCritical = activePolicies.some(p => p.type.toLowerCase().includes('critical'));

    const allCovered = hasHealth && hasLife && hasCritical;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl text-white font-black tracking-tight mb-2">For You</h2>
                <p className="text-white/50 text-[13px] font-medium leading-relaxed">
                    Based on your logged active plans, DUO AI analyzes gaps in your coverage to suggest exactly what you and your family might need next.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                
                {allCovered && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#30D158]/10 rounded-[24px] p-6 border border-[#30D158]/20 flex flex-col items-center text-center shadow-[0_8px_30px_rgba(48,209,88,0.15)]"
                    >
                        <div className="w-16 h-16 rounded-full bg-[#30D158]/20 flex items-center justify-center mb-4 border border-[#30D158]/30">
                            <CheckCircle2 className="w-8 h-8 text-[#30D158]" />
                        </div>
                        <h3 className="text-[#30D158] font-bold text-[18px] tracking-tight mb-2">Optimal Protection!</h3>
                        <p className="text-[#30D158]/70 text-[14px] font-medium leading-relaxed max-w-[250px]">
                            Your household has comprehensive Health, Life, and Critical Illness coverage logged. Great job securing your future!
                        </p>
                    </motion.div>
                )}

                {/* Health Insurance Gap */}
                {!hasHealth && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-emerald-500/10 shadow-[0_8px_16px_rgba(0,0,0,0.2)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <Activity className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-widest">
                                    High Priority
                                </div>
                            </div>
                            
                            <h3 className="text-white font-bold text-[17px] tracking-tight mb-2 relative z-10">Primary Health (HMO)</h3>
                            <p className="text-white/50 text-[13px] font-medium leading-relaxed mb-6 relative z-10">
                                You haven't logged any basic HMO or Medical insurance. This is your first line of defense for everyday doctor visits, labs, and basic emergencies.
                            </p>
                            
                            <button 
                                onClick={onExplore}
                                className="w-full py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[13px] transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 relative z-10"
                            >
                                Find HMO Plans
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Life Insurance Gap */}
                {!hasLife && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-[#D4AF37]/10 shadow-[0_8px_16px_rgba(0,0,0,0.2)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                                    <Shield className="w-5 h-5 text-[#D4AF37]" />
                                </div>
                                <div className="px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[11px] font-bold uppercase tracking-widest">
                                    Recommended
                                </div>
                            </div>
                            
                            <h3 className="text-white font-bold text-[17px] tracking-tight mb-2 relative z-10">Life Protection</h3>
                            <p className="text-white/50 text-[13px] font-medium leading-relaxed mb-6 relative z-10">
                                With zero Life Insurance policies logged, your household lacks an income safety net. A basic term plan can provide massive peace of mind for very little cost.
                            </p>
                            
                            <button 
                                onClick={onExplore}
                                className="w-full py-4 rounded-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-[13px] transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2 relative z-10"
                            >
                                Browse Life Plans
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Critical Illness Gap */}
                {!hasCritical && hasHealth && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-rose-500/10 shadow-[0_8px_16px_rgba(0,0,0,0.2)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                                    <HeartPulse className="w-5 h-5 text-rose-400" />
                                </div>
                                <div className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold uppercase tracking-widest">
                                    Smart Addition
                                </div>
                            </div>
                            
                            <h3 className="text-white font-bold text-[17px] tracking-tight mb-2 relative z-10">Critical Illness Gap</h3>
                            <p className="text-white/50 text-[13px] font-medium leading-relaxed mb-6 relative z-10">
                                Your HMO covers everyday visits, but major illnesses (Cancer, Stroke, Heart Attack) often exceed HMO limits instantly. A lump-sum protection plan covers that gap.
                            </p>
                            
                            <button 
                                onClick={onExplore}
                                className="w-full py-4 rounded-full bg-rose-500 hover:bg-rose-400 text-black font-bold text-[13px] transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(244,63,94,0.2)] flex items-center justify-center gap-2 relative z-10"
                            >
                                Find Critical Coverage
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
