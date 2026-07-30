"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronDown, MessageSquare, ScanLine } from 'lucide-react';
import { createPortal } from 'react-dom';
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

    const overlayContent = (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center"
        >
            <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-xl h-[95dvh] sm:h-[90dvh] bg-[#050505] rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col relative shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border border-white/[0.05]"
            >
                {/* Header Strip with Close Button */}
                <div className="flex items-center justify-between p-4 border-b border-white/[0.05] bg-[#0A0A0A]">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                        >
                            <ChevronDown className="w-6 h-6 text-white" />
                        </button>
                        <h1 className="text-lg font-medium text-white ml-2">AI Corner</h1>
                    </div>
                    
                    {/* Tab Switcher using shared PillTabRow */}
                    <div className="w-48">
                        <PillTabRow 
                            tabs={tabs}
                            activeTab={activeTab}
                            onSelect={(id: string) => {
                                if (id) setActiveTab(id as 'chat' | 'scanner');
                            }}
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative overflow-hidden bg-[#050505]">
                    {activeTab === 'chat' ? <AIChatView /> : <AIScannerView />}
                </div>
            </motion.div>
        </motion.div>
    );

    // Use Portal to ensure it renders above everything else as per spec
    if (!mounted) return null;
    return createPortal(overlayContent, document.body);
}
