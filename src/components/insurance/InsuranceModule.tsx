"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PillTabRow, TabItem } from "@/components/ui/PillTabRow";
import { Shield, BookOpen, Search, ShoppingBag, ClipboardList } from "lucide-react";

import { MyPlansTab } from "./MyPlansTab";
import { BenefitsReaderTab } from "./BenefitsReaderTab";
import { ExploreTab } from "./ExploreTab";
import { WhatToGetTab } from "./WhatToGetTab";
import { MedicalLogTab } from "./MedicalLogTab";

const TABS: TabItem[] = [
    { 
        id: 'my-plans', 
        icon: <Shield className="w-4 h-4" />, 
        label: 'My Plans',
        activeClass: 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30',
        hoverClass: 'hover:text-[#D4AF37] hover:border-[#D4AF37]/30'
    },
    { 
        id: 'benefits', 
        icon: <BookOpen className="w-4 h-4" />, 
        label: 'Benefits Reader',
        activeClass: 'bg-white/10 text-white border-white/30',
        hoverClass: 'hover:text-white hover:border-white/30'
    },
    { 
        id: 'explore', 
        icon: <Search className="w-4 h-4" />, 
        label: 'Explore & Compare',
        activeClass: 'bg-white/10 text-white border-white/30',
        hoverClass: 'hover:text-white hover:border-white/30'
    },
    { 
        id: 'what-to-get', 
        icon: <ShoppingBag className="w-4 h-4" />, 
        label: 'What to Get',
        activeClass: 'bg-white/10 text-white border-white/30',
        hoverClass: 'hover:text-white hover:border-white/30'
    },
    { 
        id: 'medical-log', 
        icon: <ClipboardList className="w-4 h-4" />, 
        label: 'Medical Log',
        activeClass: 'bg-[#30D158]/10 text-[#30D158] border-[#30D158]/30',
        hoverClass: 'hover:text-[#30D158] hover:border-[#30D158]/30'
    }
];

export function InsuranceModule() {
    const [activeTab, setActiveTab] = useState<string>('my-plans');

    // Handle clicking the active tab (don't unselect it)
    const handleSelect = (id: string) => {
        if (id !== '') {
            setActiveTab(id);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full relative z-20">
            <PillTabRow tabs={TABS} activeTab={activeTab} onSelect={handleSelect} />

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
        </div>
    );
}
