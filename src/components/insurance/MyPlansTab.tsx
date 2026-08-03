"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Shield, Plus, ChevronLeft, Bell, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { useInsuranceStore } from "@/store/useInsuranceStore";

interface MyPlansTabProps {
    hasPolicies?: boolean;
    onAddPlan?: () => void;
    onExplore?: () => void;
    onEditPlan?: (id: string) => void;
}

export function MyPlansTab({ hasPolicies = false, onAddPlan, onExplore, onEditPlan }: MyPlansTabProps) {
    const { exchangeRate } = useCurrencyStore();
    const { primarySymbol, secondarySymbol, getPrimaryValue, getSecondaryValue } = useDualCurrency();
    const { policies: allPolicies, removePolicy } = useInsuranceStore();
    const policies = allPolicies.filter(p => p.status !== 'Bookmarked');
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
                className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a] overflow-hidden"
            >
                {/* Background Watermark Shield */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.05] blur-[2px]">
                    <Shield className="w-[380px] h-[380px] text-white" strokeWidth={1} />
                </div>

                {/* Back button and Bell replicating the header but without title */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="absolute top-12 left-6 right-6 flex justify-between items-center z-50"
                >
                    <button onClick={() => router.push('/')} className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.12] transition-colors">
                        <ChevronLeft className="w-5 h-5 text-white/70" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.12] transition-colors relative">
                        <Bell className="w-5 h-5 text-white/70" />
                    </button>
                </motion.div>

                <motion.header 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    className="absolute top-28 left-0 right-0 flex flex-col items-center z-20"
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
                    <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-2">
                            <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
                            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D4AF37]/80">Insurance Hub</span>
                            <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
                        </div>
                        <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-[8px] font-bold tracking-[0.3em] uppercase text-white/30"
                        >
                            Protect • Understand • Track
                        </motion.span>
                    </div>
                </motion.header>
                
                <motion.main 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center justify-end flex-grow pb-[5dvh] px-6"
                >
                    <motion.h2 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-[17px] text-white/80 font-medium tracking-tight leading-relaxed mb-5 text-center text-balance max-w-[280px] mx-auto relative z-10"
                    >
                        Store your policies, understand your benefits, compare plans, and track medical expenses in one place.
                    </motion.h2>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-wrap justify-center gap-2 mb-6 w-full px-4"
                    >
                        {["Read Benefits", "Compare Plans", "Track Medical Visits", "Never Miss Renewals"].map((bullet, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-white/60 text-[11px] font-bold tracking-wide">
                                • {bullet}
                            </span>
                        ))}
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="flex flex-col gap-2.5 w-full relative z-10 mb-5"
                    >
                        <button 
                            onClick={onAddPlan}
                            className="w-full py-4 rounded-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-[14px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(212,175,55,0.2)]"
                        >
                            <Plus className="w-5 h-5" />
                            Add a Plan
                        </button>
                        <button 
                            onClick={onExplore}
                            className="w-full py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-[14px] transition-all active:scale-[0.98] border border-white/5"
                        >
                            Explore & Compare
                        </button>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="w-full flex flex-col gap-1.5 relative z-10"
                    >
                        {/* Disabled Preview Cards */}
                        <div className="w-full p-3 rounded-[16px] bg-white/[0.02] border border-white/[0.02] opacity-50 select-none flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-white font-bold text-[13px]">Benefits Reader</span>
                                <span className="text-white/40 text-[10.5px] font-medium tracking-wide">Understand exactly what your policy covers.</span>
                            </div>
                        </div>
                        <div className="w-full p-3 rounded-[16px] bg-white/[0.02] border border-white/[0.02] opacity-40 select-none flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-white font-bold text-[13px]">Medical History</span>
                                <span className="text-white/40 text-[10.5px] font-medium tracking-wide">Keep every consultation in one place.</span>
                            </div>
                        </div>
                        <div className="w-full p-3 rounded-[16px] bg-white/[0.02] border border-white/[0.02] opacity-30 select-none flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-white font-bold text-[13px]">Renewal Calendar</span>
                                <span className="text-white/40 text-[10.5px] font-medium tracking-wide">Never forget an upcoming premium.</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.main>
            </motion.div>,
            document.body
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {policies.map(policy => {
                let badgeColor = "bg-[#30D158]";
                let badgeText = policy.status;
                
                if (policy.status === 'Expiring Soon') {
                    badgeColor = "bg-[#E8A33D]";
                } else if (policy.status === 'Expired' || policy.status === 'Cancelled') {
                    badgeColor = "bg-[#FF453A]";
                }

                // Determine Physical Card Style based on Provider
                const providerLower = (policy.provider || '').toLowerCase();
                let cardTheme = {
                    bg: "bg-gradient-to-br from-[#2c3e50] to-[#1a252f]",
                    textPrimary: "text-white",
                    textSecondary: "text-white/70",
                    accent: "bg-white/10",
                    logoFont: "font-sans",
                    pattern: null as React.ReactNode
                };

                if (providerLower.includes('axa')) {
                    cardTheme = {
                        bg: "bg-gradient-to-br from-[#008F9B] to-[#005B63]", // AXA Teal
                        textPrimary: "text-white",
                        textSecondary: "text-white/80",
                        accent: "bg-[#E62828]", // Red slash accent
                        logoFont: "font-serif font-bold italic tracking-tighter",
                        pattern: (
                            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                                <polygon points="30,0 80,0 50,100 0,100" fill="currentColor" />
                                <polygon points="70,0 100,0 100,100 85,100" fill="currentColor" opacity="0.5" />
                            </svg>
                        )
                    };
                } else if (providerLower.includes('maxicare')) {
                    cardTheme = {
                        bg: "bg-gradient-to-br from-[#003B71] to-[#001D38]",
                        textPrimary: "text-white",
                        textSecondary: "text-white/70",
                        accent: "bg-[#FFD100]",
                        logoFont: "font-sans font-black tracking-tight",
                        pattern: (
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#FFD100]/10 rounded-full blur-2xl pointer-events-none" />
                        )
                    };
                } else if (providerLower.includes('sun life') || providerLower.includes('sunlife')) {
                    cardTheme = {
                        bg: "bg-gradient-to-br from-[#FFD100] to-[#E6B800]",
                        textPrimary: "text-[#003B71]",
                        textSecondary: "text-[#003B71]/70",
                        accent: "bg-white",
                        logoFont: "font-serif font-black tracking-tighter",
                        pattern: (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
                        )
                    };
                } else if (providerLower.includes('pru')) {
                    cardTheme = {
                        bg: "bg-gradient-to-br from-[#ED1B2E] to-[#B3000F]",
                        textPrimary: "text-white",
                        textSecondary: "text-white/80",
                        accent: "bg-white",
                        logoFont: "font-serif font-bold tracking-tight",
                        pattern: (
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                        )
                    };
                }

                // Smart Card Chip SVG
                const SmartChip = () => (
                    <svg className="w-10 h-8 opacity-80" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="39" height="29" rx="4.5" fill="#D4AF37" stroke="#B8860B" strokeWidth="1"/>
                        <path d="M12 0.5V29.5" stroke="#B8860B" strokeWidth="0.5"/>
                        <path d="M28 0.5V29.5" stroke="#B8860B" strokeWidth="0.5"/>
                        <path d="M0.5 10H12" stroke="#B8860B" strokeWidth="0.5"/>
                        <path d="M0.5 20H12" stroke="#B8860B" strokeWidth="0.5"/>
                        <path d="M28 10H39.5" stroke="#B8860B" strokeWidth="0.5"/>
                        <path d="M28 20H39.5" stroke="#B8860B" strokeWidth="0.5"/>
                        <rect x="15" y="8" width="10" height="14" rx="2" stroke="#B8860B" strokeWidth="0.5"/>
                    </svg>
                );

                return (
                    <div 
                        key={policy.id} 
                        onClick={() => onEditPlan?.(policy.id)}
                        role="button"
                        className="w-full flex flex-col gap-3 group active:scale-[0.98] transition-transform duration-200"
                    >
                        {/* Physical Card */}
                        <div className={`relative w-full aspect-[1.586/1] rounded-[16px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.4)] ${cardTheme.bg} p-5 flex flex-col justify-between border border-white/10`}>
                            {/* Card Pattern/Texture */}
                            <div className={`absolute inset-0 ${cardTheme.textPrimary} mix-blend-overlay`}>
                                {cardTheme.pattern}
                            </div>
                            
                            {/* Top row: Logo and Name */}
                            <div className="relative z-10 flex justify-between items-start">
                                <div className="flex items-center gap-1.5">
                                    <div className={`text-xl ${cardTheme.logoFont} ${cardTheme.textPrimary} leading-none`}>
                                        {policy.provider}
                                    </div>
                                    {providerLower.includes('axa') && (
                                        <div className="w-0.5 h-4 bg-[#E62828] transform skew-x-[-15deg] ml-0.5" />
                                    )}
                                </div>
                                <div className={`text-[13px] font-bold tracking-tight uppercase max-w-[140px] text-right ${cardTheme.textPrimary}`}>
                                    {policy.policyName}
                                </div>
                            </div>

                            {/* Middle: Chip and Number */}
                            <div className="relative z-10 flex flex-col gap-3 mt-auto mb-2">
                                <SmartChip />
                                <div className={`font-mono text-lg tracking-widest ${cardTheme.textPrimary} drop-shadow-sm`}>
                                    {policy.policyNumber ? policy.policyNumber.toUpperCase() : '•••• •••• •••• ••••'}
                                </div>
                            </div>

                            {/* Bottom: Dates & Member */}
                            <div className={`relative z-10 flex justify-between items-end ${cardTheme.textSecondary}`}>
                                <div className="flex flex-col">
                                    <span className="text-[7px] uppercase tracking-wider font-bold opacity-80 mb-0.5">Policyholder</span>
                                    <span className={`text-[12px] font-bold tracking-widest uppercase ${cardTheme.textPrimary} line-clamp-1 max-w-[150px]`}>
                                        {policy.coveredMembers?.length > 0 ? policy.coveredMembers.join(', ') : 'MEMBER'}
                                    </span>
                                </div>
                                {policy.renewalDate && (
                                    <div className="flex gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[7px] uppercase tracking-wider font-bold opacity-80 mb-0.5">Valid Thru</span>
                                            <span className={`text-[10px] font-mono font-bold ${cardTheme.textPrimary}`}>
                                                {new Date(policy.renewalDate).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Status Badge overlaying the card top right edge slightly */}
                            <div className="absolute top-4 right-4 z-20">
                                {/* Invisible delete button area to catch clicks if needed, but handled below */}
                            </div>
                        </div>

                        {/* Financial Stats Panel (Below Card) */}
                        <div className="w-full bg-[#1A1A1A] rounded-[20px] p-5 border border-white/5 shadow-md relative">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <div className={`px-2 py-1 rounded-md ${badgeColor}/10 border border-${badgeColor}/20 flex items-center gap-1.5`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${badgeColor}`} />
                                    <span className={`${badgeColor.replace('bg-', 'text-')} text-[9px] font-bold uppercase tracking-widest`}>{badgeText}</span>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removePolicy(policy.id);
                                    }} 
                                    className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/5 text-white/40 hover:bg-[#FF453A]/10 hover:text-[#FF453A] hover:border-[#FF453A]/20 transition-all z-10 active:scale-95"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 pr-12">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.1em]">Premium</span>
                                    <div className="flex items-baseline gap-1 mt-0.5">
                                        <span className="text-white font-bold text-[18px] tracking-tight">{primarySymbol}{formatCurrency(getPrimaryValue(policy.premium))}</span>
                                        <span className="text-white/40 text-[11px] font-medium font-mono">/{policy.paymentFrequency === 'Monthly' ? 'mo' : policy.paymentFrequency === 'Quarterly' ? 'qtr' : policy.paymentFrequency === 'Semi-Annual' ? 'half' : 'yr'}</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.1em]">Coverage</span>
                                    <div className="flex items-baseline gap-1 mt-0.5">
                                        <span className="text-white font-bold text-[18px] tracking-tight">{primarySymbol}{formatCurrency(getPrimaryValue(policy.coverage))}</span>
                                    </div>
                                </div>
                                
                                {(policy.outpatientLimit || 0) > 0 && (
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.1em]">OPD Limit</span>
                                        <div className="flex items-baseline gap-1 mt-0.5">
                                            <span className="text-white font-bold text-[14px] tracking-tight">{primarySymbol}{formatCurrency(getPrimaryValue(policy.outpatientLimit || 0))}</span>
                                        </div>
                                    </div>
                                )}
                                {(policy.deductible || 0) > 0 && (
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.1em]">Deductible</span>
                                        <div className="flex items-baseline gap-1 mt-0.5">
                                            <span className="text-white font-bold text-[14px] tracking-tight">{primarySymbol}{formatCurrency(getPrimaryValue(policy.deductible || 0))}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

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
