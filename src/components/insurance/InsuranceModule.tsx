"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, BookOpen, Search, ShoppingBag, ClipboardList, Umbrella, Check } from "lucide-react";

import { MyPlansTab } from "./MyPlansTab";
import { BenefitsReaderTab } from "./BenefitsReaderTab";
import { ExploreTab } from "./ExploreTab";
import { WhatToGetTab } from "./WhatToGetTab";
import { MedicalLogTab } from "./MedicalLogTab";
import { AddPlanSheet } from "./AddPlanSheet";
import { ManualInputSheet } from "./ManualInputSheet";
import { LogVisitSheet } from "./LogVisitSheet";
import { useInsuranceStore } from "@/store/useInsuranceStore";

interface TabItem {
    id: string;
    icon: React.ReactNode;
    label: string;
}

const TABS: TabItem[] = [
    { 
        id: 'my-plans', 
        icon: <Shield className="w-5 h-5" />, 
        label: 'Plans'
    },
    { 
        id: 'benefits', 
        icon: <BookOpen className="w-5 h-5" />, 
        label: 'Benefits'
    },
    { 
        id: 'explore', 
        icon: <Search className="w-5 h-5" />, 
        label: 'Explore'
    },
    { 
        id: 'what-to-get', 
        icon: <ShoppingBag className="w-5 h-5" />, 
        label: 'For You'
    },
    { 
        id: 'medical-log', 
        icon: <ClipboardList className="w-5 h-5" />, 
        label: 'History'
    }
];

export function InsuranceModule() {
    const { policies: allPolicies, addPolicy, updatePolicy, addMedicalEvent } = useInsuranceStore();
    const policies = allPolicies.filter(p => p.status !== 'Bookmarked');
    const [activeTab, setActiveTab] = useState<string>('my-plans');
    const hasPolicies = policies.length > 0;
    
    // Modal states
    const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
    const [isManualInputOpen, setIsManualInputOpen] = useState(false);
    const [isLogVisitOpen, setIsLogVisitOpen] = useState(false);
    const [successPolicy, setSuccessPolicy] = useState<{ provider: string, name: string } | null>(null);
    const [scannedData, setScannedData] = useState<any>(null);
    const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);

    // Only hide nav if we're on the default tab AND have no policies (the true onboarding state)
    const showNav = hasPolicies || activeTab !== 'my-plans';

    return (
        <div className="flex flex-col gap-6 w-full relative z-20 pb-48">
            <div className="w-full relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'my-plans' && (
                        <motion.div key="my-plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            <MyPlansTab 
                                hasPolicies={hasPolicies} 
                                onAddPlan={() => setIsAddPlanOpen(true)} 
                                onExplore={() => setActiveTab('explore')} 
                                onEditPlan={(id) => {
                                    const p = policies.find(x => x.id === id);
                                    if (p) {
                                        setScannedData(p);
                                        setEditingPolicyId(p.id);
                                        setIsManualInputOpen(true);
                                    }
                                }}
                                onLogVisit={() => setIsLogVisitOpen(true)}
                            />
                        </motion.div>
                    )}
                    {activeTab === 'benefits' && (
                        <motion.div key="benefits" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            <BenefitsReaderTab onAddPlan={() => setIsAddPlanOpen(true)} />
                        </motion.div>
                    )}
                    {activeTab === 'explore' && (
                        <motion.div key="explore" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            <ExploreTab 
                                onLogPlan={(plan) => {
                                    if (plan) {
                                        setScannedData({
                                            provider: plan.provider,
                                            policyName: plan.name || plan.policyName,
                                            type: plan.type,
                                            premium: plan.premiumEst || plan.premium,
                                            coverage: plan.coverage,
                                        });
                                        setIsManualInputOpen(true);
                                    } else {
                                        setIsAddPlanOpen(true);
                                    }
                                }}
                            />
                        </motion.div>
                    )}
                    {activeTab === 'what-to-get' && (
                        <motion.div key="what-to-get" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            <WhatToGetTab onExplore={() => setActiveTab('explore')} />
                        </motion.div>
                    )}
                    {activeTab === 'medical-log' && (
                        <motion.div key="medical-log" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            <MedicalLogTab 
                                onLogVisit={() => setIsLogVisitOpen(true)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Premium Insurance Bottom Navigation */}
            {showNav && (
                <div className="fixed bottom-6 left-4 right-4 z-50 will-change-transform">
                <div className="bg-[#121212]/95 border border-white/10 rounded-[32px] p-2 flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden relative">
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    <div className="flex flex-1 justify-around items-center gap-1">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="relative flex flex-col items-center justify-center flex-1 h-[52px] rounded-full transition-all active:scale-[0.92] group"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-insurance-tab"
                                            className="absolute inset-0 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/20 shadow-sm"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <div className="relative z-10 flex flex-col items-center gap-1">
                                        <div className={`transition-colors duration-300 ${isActive ? 'text-[#D4AF37]' : 'text-white/40 group-hover:text-white/70'}`}>
                                            {tab.icon}
                                        </div>
                                        <span
                                            className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${
                                                isActive ? "text-[#D4AF37] drop-shadow-sm" : "text-white/40 group-hover:text-white/70"
                                            }`}
                                        >
                                            {tab.label}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            )}

            {/* Premium Data Entry Sheets */}
            <AddPlanSheet 
                isOpen={isAddPlanOpen}
                onClose={() => setIsAddPlanOpen(false)}
                onSelectManual={() => {
                    setScannedData(null);
                    setIsManualInputOpen(true);
                }}
                onSelectScan={(data) => {
                    setIsAddPlanOpen(false);
                    setScannedData(data);
                    setIsManualInputOpen(true);
                }}
            />

            <ManualInputSheet 
                isOpen={isManualInputOpen}
                onClose={() => {
                    setIsManualInputOpen(false);
                    setScannedData(null);
                    setEditingPolicyId(null);
                }}
                initialData={scannedData}
                onSave={(data) => {
                    if (editingPolicyId) {
                        updatePolicy(editingPolicyId, data);
                    } else {
                        addPolicy(data);
                    }
                    setSuccessPolicy({ provider: data.provider, name: data.policyName || 'New Policy' });
                    setEditingPolicyId(null);
                }}
            />

            <LogVisitSheet 
                isOpen={isLogVisitOpen}
                onClose={() => setIsLogVisitOpen(false)}
                onSave={async (data) => {
                    try {
                        await addMedicalEvent(data);
                    } catch (err) {
                        console.error(err);
                    }
                }}
            />

            {/* Success Screen Overlay */}
            <AnimatePresence>
                {successPolicy && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-xl px-6"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 20, stiffness: 200 }}
                            className="flex flex-col items-center w-full"
                        >
                            <div className="w-20 h-20 rounded-full bg-[#30D158]/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(48,209,88,0.3)]">
                                <Check className="w-10 h-10 text-[#30D158]" />
                            </div>
                            <h2 className="text-white font-black text-[32px] tracking-tight mb-2 text-center">Policy Added</h2>
                            
                            <div className="bg-[#1A1A1A] border border-white/5 rounded-[20px] p-6 flex flex-col items-center gap-1 w-full max-w-sm mb-10 text-center">
                                <span className="text-white/50 text-[11px] font-bold uppercase tracking-widest">{successPolicy.provider}</span>
                                <span className="text-white font-bold text-[18px]">{successPolicy.name}</span>
                            </div>

                            <p className="text-white/60 text-[14px] font-medium mb-8 text-center max-w-[260px]">
                                Your policy is now securely stored and ready to use.
                            </p>

                            <div className="flex flex-col gap-3 w-full max-w-sm">
                                <button 
                                    onClick={() => {
                                        setSuccessPolicy(null);
                                        setActiveTab('benefits');
                                    }}
                                    className="w-full py-4 rounded-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-[15px] transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(212,175,55,0.2)]"
                                >
                                    Read My Benefits
                                </button>
                                <button 
                                    onClick={() => {
                                        setSuccessPolicy(null);
                                    }}
                                    className="w-full py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-[15px] transition-all active:scale-[0.98] border border-white/5"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
