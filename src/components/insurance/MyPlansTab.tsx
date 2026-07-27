"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Shield, Plus, ChevronLeft, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { useCurrencyStore } from "@/store/useCurrencyStore";

interface MyPlansTabProps {
    hasPolicies?: boolean;
    onAddPlan?: () => void;
    onExplore?: () => void;
}

export function MyPlansTab({ hasPolicies = false, onAddPlan, onExplore }: MyPlansTabProps) {
    const { exchangeRate } = useCurrencyStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!hasPolicies) {
        if (!mounted) return null;

        return createPortal(
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]"
            >
                {/* Back button and Bell replicating the header but without title */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="absolute top-12 left-6 right-6 flex justify-between items-center z-50"
                >
                    <button onClick={() => router.push('/')} className="w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.08] transition-colors">
                        <ChevronLeft className="w-5 h-5 text-white/70" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.08] transition-colors relative">
                        <Bell className="w-5 h-5 text-white/70" />
                    </button>
                </motion.div>

                <motion.header 
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    className="absolute top-32 left-0 right-0 flex flex-col items-center z-20"
                >
                    <h1 
                        className="text-[48px] font-extrabold uppercase tracking-[0.2em] relative leading-none mb-1.5"
                        style={{
                            background: "linear-gradient(110deg, #D4AF37 0%, #FFF4D2 25%, #8B7321 50%, #FFF4D2 75%, #D4AF37 100%)",
                            backgroundSize: "200% auto",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            filter: "drop-shadow(0px 4px 12px rgba(212,175,55,0.4))",
                        }}
                    >
                        DUO
                        <span 
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 40%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        />
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
                        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D4AF37]/80">Insurance Hub</span>
                        <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
                    </div>
                </motion.header>
                
                <motion.main 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center justify-end flex-grow pb-[8dvh] px-6"
                >
                    <h2 className="text-[32px] text-white font-black tracking-tighter leading-tight mb-4 text-center">
                        You haven't logged any<br/>insurance yet
                    </h2>
                    
                    <p className="text-white/50 text-[13px] font-medium max-w-[280px] leading-relaxed text-center mb-10 relative z-10">
                        Start tracking your existing coverage or browse options to find the right protection for your household.
                    </p>
                    
                    <div className="flex flex-col gap-3 w-full relative z-10">
                        <button 
                            onClick={onAddPlan}
                            className="w-full py-4 rounded-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-[13px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(212,175,55,0.2)]"
                        >
                            <Plus className="w-4 h-4" />
                            Add a plan
                        </button>
                        <button 
                            onClick={onExplore}
                            className="w-full py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-[13px] transition-all active:scale-[0.98] border border-white/5"
                        >
                            Explore & Compare
                        </button>
                    </div>
                </motion.main>
            </motion.div>,
            document.body
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
                <button 
                    onClick={onAddPlan}
                    className="w-full py-4 rounded-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-[13px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(212,175,55,0.2)]"
                >
                    <Plus className="w-4 h-4" />
                    Add a plan
                </button>
                <button 
                    onClick={onAddPlan}
                    className="w-full py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-[13px] transition-all active:scale-[0.98] border border-white/5"
                >
                    Scan policy document
                </button>
            </div>
        </div>
    );
}
