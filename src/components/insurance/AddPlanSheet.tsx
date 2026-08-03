"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ScanLine, Keyboard, Sparkles, DownloadCloud } from "lucide-react";
import { BorderBeam } from "border-beam";

interface AddPlanSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectManual: () => void;
    onSelectScan: (scannedData: any) => void;
}

export function AddPlanSheet({ isOpen, onClose, onSelectManual, onSelectScan }: AddPlanSheetProps) {
    const [mounted, setMounted] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setScanError(null);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                try {
                    const base64Data = (reader.result as string).split(',')[1];
                    const response = await fetch('/api/ai/scan-insurance', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            image: base64Data,
                            mimeType: file.type
                        })
                    });

                    if (!response.ok) {
                        const err = await response.json();
                        throw new Error(err.error || 'Failed to scan document');
                    }

                    const data = await response.json();
                    setIsScanning(false);
                    onSelectScan(data);
                } catch (error: any) {
                    setIsScanning(false);
                    setScanError(error.message || 'Could not read the policy document.');
                    const { useBudgetStore } = await import('@/store/useBudgetStore');
                    useBudgetStore.getState().addNotification({
                        title: 'Scan Failed',
                        message: error.message || 'Could not read the policy document.',
                        read: false,
                        type: 'alert'
                    });
                }
            };
        } catch (error: any) {
            setIsScanning(false);
            setScanError('Failed to process image.');
            const { useBudgetStore } = await import('@/store/useBudgetStore');
            useBudgetStore.getState().addNotification({
                title: 'Scan Error',
                message: 'Failed to process image.',
                read: false,
                type: 'alert'
            });
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                        className="absolute inset-0 bg-black/95"
                    />
                    
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0, transition: { type: "spring", damping: 28, stiffness: 300 } }}
                        exit={{ y: "100%", transition: { type: "tween", duration: 0.2, ease: "easeIn" } }}
                        className="w-full max-w-md bg-[#111] sm:rounded-[32px] rounded-t-[32px] border border-white/10 p-6 relative z-10 flex flex-col will-change-transform"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-white font-bold text-xl tracking-tight">Add a Plan</h3>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {scanError && (
                            <div className="mb-6 p-4 rounded-[16px] bg-[#FF453A]/10 border border-[#FF453A]/20 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#FF453A]/20 flex items-center justify-center flex-shrink-0">
                                    <X className="w-4 h-4 text-[#FF453A]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[#FF453A] font-bold text-[14px]">Scan Failed</span>
                                    <span className="text-white/60 text-[12px] font-medium leading-snug">{scanError}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-4 mb-4">
                            {/* Hidden Native Camera/File Input */}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                accept="image/*,application/pdf" 
                                capture="environment" 
                                className="hidden" 
                                onChange={handleFileSelect} 
                            />

                            {/* AI Scan Option (Primary) */}
                            <div className="w-full relative rounded-[24px]">
                                <BorderBeam size="md" colorVariant="sunset" strength={0.7}>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full relative overflow-hidden rounded-[24px] p-6 text-left group transition-all active:scale-[0.98]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 border border-white/5 rounded-[24px]" />
                                
                                <div className="relative z-10 flex gap-5 items-center">
                                    <div className="w-14 h-14 rounded-full bg-[#D4AF37]/20 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                                        <ScanLine className={`w-7 h-7 text-[#D4AF37] ${isScanning ? 'animate-pulse' : ''}`} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[17px] text-white">
                                                {isScanning ? 'Scanning...' : 'Scan Insurance Policy'}
                                            </span>
                                            {!isScanning && (
                                                <div className="px-1.5 py-0.5 rounded bg-white/10 border border-white/5 flex items-center justify-center">
                                                    <span className="text-[9px] font-black uppercase tracking-wider bg-[linear-gradient(110deg,#D4AF37,#E5E4E2,#D4AF37)] text-transparent bg-clip-text">AI</span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-white/50 text-[13px] font-medium leading-relaxed max-w-[200px]">
                                            {isScanning ? 'Extracting policy details. This takes a moment.' : 'Take a photo of your policy. We\'ll extract the details instantly.'}
                                        </span>
                                    </div>
                                </div>
                                    </button>
                                </BorderBeam>
                            </div>

                            {/* Manual Entry Option (Secondary) */}
                            <button 
                                onClick={() => {
                                    onClose();
                                    setTimeout(onSelectManual, 200); // slight delay to allow closing animation
                                }}
                                className="w-full relative rounded-[24px] p-6 text-left group transition-all active:scale-[0.98] bg-white/5 hover:bg-white/10 border border-white/5"
                            >
                                <div className="relative z-10 flex gap-5 items-center">
                                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                        <Keyboard className="w-7 h-7 text-white/50" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-white font-bold text-[17px]">Manual Entry</span>
                                        <span className="text-white/50 text-[13px] font-medium leading-relaxed max-w-[200px]">
                                            Add your policy details yourself in just a few minutes.
                                        </span>
                                    </div>
                                </div>
                            </button>

                            {/* Import Existing (Coming Soon) */}
                            <div className="w-full relative rounded-[24px] p-6 text-left bg-white/[0.02] border border-white/[0.02] opacity-40 select-none">
                                <div className="relative z-10 flex gap-5 items-center">
                                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                        <DownloadCloud className="w-7 h-7 text-white/30" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-bold text-[17px]">Import Existing</span>
                                            <div className="px-1.5 py-0.5 rounded bg-white/10 flex items-center justify-center">
                                                <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Coming Soon</span>
                                            </div>
                                        </div>
                                        <span className="text-white/40 text-[13px] font-medium leading-relaxed max-w-[200px]">
                                            Import your insurance details automatically from supported providers.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
