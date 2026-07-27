"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, BookOpen, Search, ShoppingBag, ClipboardList } from "lucide-react";

import { MyPlansTab } from "./MyPlansTab";
import { BenefitsReaderTab } from "./BenefitsReaderTab";
import { ExploreTab } from "./ExploreTab";
import { WhatToGetTab } from "./WhatToGetTab";
import { MedicalLogTab } from "./MedicalLogTab";

interface TabItem {
    id: string;
    icon: React.ReactNode;
    label: string;
}

const TABS: TabItem[] = [
    { 
        id: 'my-plans', 
        icon: <Shield className="w-5 h-5" />, 
        label: 'My Plans'
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
        label: 'What to Get'
    },
    { 
        id: 'medical-log', 
        icon: <ClipboardList className="w-5 h-5" />, 
        label: 'Medical Log'
    }
];

export function InsuranceModule() {
    const [activeTab, setActiveTab] = useState<string>('my-plans');

    return (
        <div className="flex flex-col gap-6 w-full relative z-20 pb-24">
            <div className="w-full relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'my-plans' && (
                        <motion.div key="my-plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            <MyPlansTab />
                        </motion.div>
                    )}
                    {activeTab === 'benefits' && (
                        <motion.div key="benefits" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            <BenefitsReaderTab />
                        </motion.div>
                    )}
                    {activeTab === 'explore' && (
                        <motion.div key="explore" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            <ExploreTab />
                        </motion.div>
                    )}
                    {activeTab === 'what-to-get' && (
                        <motion.div key="what-to-get" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            <WhatToGetTab />
                        </motion.div>
                    )}
                    {activeTab === 'medical-log' && (
                        <motion.div key="medical-log" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            <MedicalLogTab />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Premium Insurance Bottom Navigation */}
            <div className="fixed bottom-6 left-4 right-4 z-50 will-change-transform">
                <div className="bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden relative">
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
        </div>
    );
}
