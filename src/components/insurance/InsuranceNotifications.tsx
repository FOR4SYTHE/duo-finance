"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, AlertCircle, FileWarning, ArrowRight } from "lucide-react";
import { useInsuranceStore } from "@/store/useInsuranceStore";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { formatCurrency } from "@/lib/format";

export function InsuranceNotifications() {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const { medicalEvents, policies } = useInsuranceStore();
    const { primarySymbol, getPrimaryValue } = useDualCurrency();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Derive Pending Claims
    const pendingClaims = medicalEvents.filter(e => e.status === 'Pending Claim');

    // Derive Expiring Policies (within 30 days or expired)
    const expiringPolicies = policies.filter(p => {
        if (!p.renewalDate) return false;
        const renewal = new Date(p.renewalDate).getTime();
        const now = new Date().getTime();
        const daysUntil = (renewal - now) / (1000 * 60 * 60 * 24);
        return daysUntil <= 30;
    });

    const totalNotifications = pendingClaims.length + expiringPolicies.length;

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    if (!mounted) return null;

    return (
        <>
            {/* The Bell Button */}
            <button 
                onClick={handleOpen}
                className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.12] transition-colors relative"
            >
                <Bell className="w-5 h-5 text-white/70" />
                {totalNotifications > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF453A] shadow-[0_0_8px_rgba(255,69,58,0.8)] animate-pulse" />
                )}
            </button>

            {/* The Notifications Sheet */}
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handleClose}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                            />
                            
                            <motion.div
                                initial={{ opacity: 0, x: "100%" }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: "100%" }}
                                transition={{ type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.3 }}
                                className="fixed inset-y-0 right-0 w-full max-w-sm z-[110] bg-[#0A0A0C] border-l border-white/5 flex flex-col shadow-2xl will-change-transform"
                            >
                                <div className="flex items-center justify-between p-6 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                            <Bell className="w-5 h-5 text-white/70" />
                                        </div>
                                        <h2 className="text-xl font-medium text-white tracking-tight">Alerts</h2>
                                    </div>
                                    <button 
                                        onClick={handleClose}
                                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto no-scrollbar p-6">
                                    <div className="flex flex-col gap-4">
                                        
                                        {totalNotifications === 0 && (
                                            <div className="flex flex-col items-center justify-center py-12 opacity-40">
                                                <div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-4">
                                                    <Bell className="w-6 h-6 text-white/50" />
                                                </div>
                                                <span className="text-xs font-bold tracking-widest uppercase">You're all caught up!</span>
                                            </div>
                                        )}

                                        {/* Expiring Policies Section */}
                                        {expiringPolicies.length > 0 && (
                                            <div className="flex flex-col gap-3">
                                                <h3 className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase px-1">Expiring Soon</h3>
                                                {expiringPolicies.map(policy => {
                                                    const daysUntil = Math.ceil((new Date(policy.renewalDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                                    const isExpired = daysUntil < 0;
                                                    
                                                    return (
                                                        <div key={policy.id} className="w-full bg-[#1A1A1A] rounded-[20px] p-4 border border-[#FF9F0A]/20 flex items-start gap-3 relative overflow-hidden group">
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9F0A]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                                            
                                                            <div className="w-10 h-10 rounded-xl bg-[#FF9F0A]/10 flex items-center justify-center shrink-0 border border-[#FF9F0A]/20">
                                                                <FileWarning className="w-5 h-5 text-[#FF9F0A]" />
                                                            </div>
                                                            <div className="flex flex-col flex-1 min-w-0 pr-4">
                                                                <span className="text-white/90 font-bold text-sm truncate">{policy.policyName}</span>
                                                                <span className="text-white/50 text-xs mt-0.5 leading-snug">
                                                                    {isExpired 
                                                                        ? `This policy expired ${Math.abs(daysUntil)} days ago. Tap to update renewal.` 
                                                                        : `Renews in ${daysUntil} days. Prepare your budget.`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {/* Pending Claims Section */}
                                        {pendingClaims.length > 0 && (
                                            <div className="flex flex-col gap-3 mt-2">
                                                <h3 className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase px-1">Pending Reimbursements</h3>
                                                {pendingClaims.map(claim => (
                                                    <div key={claim.id} className="w-full bg-[#1A1A1A] rounded-[20px] p-4 border border-[#FF453A]/20 flex items-start gap-3 relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF453A]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                                        
                                                        <div className="w-10 h-10 rounded-xl bg-[#FF453A]/10 flex items-center justify-center shrink-0 border border-[#FF453A]/20">
                                                            <AlertCircle className="w-5 h-5 text-[#FF453A]" />
                                                        </div>
                                                        <div className="flex flex-col flex-1 min-w-0 pr-2">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <span className="text-white/90 font-bold text-sm truncate">{claim.reason}</span>
                                                                <span className="text-[#FF453A] font-bold text-sm shrink-0">{primarySymbol}{formatCurrency(getPrimaryValue(claim.uncoveredAmount))}</span>
                                                            </div>
                                                            <span className="text-white/50 text-xs mt-0.5 line-clamp-2 leading-snug">
                                                                You paid out of pocket at {claim.providerName}. Don't forget to resolve this when your HMO refunds you.
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
