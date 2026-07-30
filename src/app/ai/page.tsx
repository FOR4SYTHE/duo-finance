"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, MessageSquare, ScanLine } from 'lucide-react';
import { AIChatView } from '@/components/ai/AIChatView';
import { AIScannerView } from '@/components/ai/AIScannerView';
import { useAIChatStore } from '@/store/useAIChatStore';
import { PillTabRow } from '@/components/ui/PillTabRow';

export default function AIAppPage() {
    const router = useRouter();
    const { activeTab, setActiveTab } = useAIChatStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Lock body scroll when this overlay is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleClose = () => {
        router.back();
    };

    const tabs = [
        { 
            id: 'chat', 
            label: 'Chat', 
            icon: <MessageSquare className="w-4 h-4" />,
            activeClass: 'bg-white text-black border-white',
            hoverClass: 'hover:text-white'
        },
        { 
            id: 'scanner', 
            label: 'Scanner', 
            icon: <ScanLine className="w-4 h-4" />,
            activeClass: 'bg-white text-black border-white',
            hoverClass: 'hover:text-white'
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col h-[100dvh] w-full overflow-hidden">
            {/* Header Strip with Close Button */}
            <div className="flex items-center justify-between p-4 bg-[#0A0A0A] shrink-0 z-50">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                    >
                        <ChevronDown className="w-6 h-6 text-white" />
                    </button>
                    <div className="flex flex-col ml-1">
                        <h1 className="text-[15px] font-semibold text-white leading-tight">DUO AI</h1>
                        <p className="text-[11px] text-white/50 leading-tight">Household Assistant</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-hidden bg-[#050505]">
                {/* Floating Premium Toggle */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 shadow-2xl rounded-full">
                    <PillTabRow 
                        tabs={tabs}
                        activeTab={activeTab}
                        onSelect={(id: string) => {
                            if (id) setActiveTab(id as 'chat' | 'scanner');
                        }}
                    />
                </div>

                {activeTab === 'chat' ? <AIChatView /> : <AIScannerView />}
            </div>
        </div>
    );
}
